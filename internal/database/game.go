package database

import (
	"context"
	"log"
	"nba-shots/internal/types"
)

func (s *service) GetGameByID(gameID int) (*types.Game, error) {
	log.Println("Querying database for gameID", gameID)
	game := &types.Game{}
	query := `SELECT id, home_team_id, away_team_id, season_year, game_date FROM game WHERE id = $1`
	err := s.db.QueryRow(context.Background(), query, gameID).Scan(&game.ID, &game.HomeTeamID, &game.AwayTeamID, &game.SeasonYear, &game.GameDate)
	if err != nil {
		return nil, err
	}
	return game, nil
}

func (s *service) GetLastXGames(amount int) ([]types.Game, error) {
	log.Println("Querying database for playerName", amount)

	games := []types.Game{}
	query := `SELECT id, home_team_id, away_team_id, season_year, game_date FROM game ORDER BY game_date DESC LIMIT $1`

	rows, err := s.db.Query(context.Background(), query, amount)

	if err != nil {
		return nil, err
	}

	defer rows.Close()

	for rows.Next() {
		var game types.Game
		err := rows.Scan(
			&game.ID,
			&game.HomeTeamID,
			&game.AwayTeamID,
			&game.SeasonYear,
			&game.GameDate,
		)

		if err != nil {
			return nil, err
		}

		games = append(games, game)
	}

	log.Printf("Query successful, returning %d games: \n", len(games))

	return games, nil
}
