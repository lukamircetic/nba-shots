package database

import (
	"context"
	"fmt"
	"log"
	"nba-shots/internal/types"
)

// InsertPlayers - inserts multiple players into the database.
func (s *service) InsertPlayers(players []types.Player) error {
	tx, err := s.beginTransaction()
	if err != nil {
		return err
	}
	log.Printf("Transaction Started with %v players\n", len(players))

	columns := types.GetTypeDBColumnNames(types.Player{})

	// log.Printf("Columns: %v\n", columns)

	data := make([][]any, len(players))

	for i, player := range players {
		data[i] = []any{player.ID, player.Name}
	}

	// log.Printf("data interface: %v\n", data)

	err = s.bulkLoadData(tx, "player", columns, data)

	if err != nil {
		log.Fatalf("bulk loading error: %v", err)
		err2 := s.rollbackTransaction(tx)
		if err2 != nil {
			return fmt.Errorf("error inserting players and rolling back: %v, %v", err, err2)
		}
		return err
	}

	return s.commitTransaction(tx)

}

// InsertTeams - inserts multiple teams into the database.
func (s *service) InsertTeams(teams []types.Team) error {
	tx, err := s.beginTransaction()
	if err != nil {
		return err
	}
	log.Printf("Transaction Started with %v teams\n", len(teams))

	query := `INSERT INTO team (id, name, abbreviation) VALUES ($1, $2, $3)`

	for _, team := range teams {
		_, err := s.db.Exec(context.Background(), query, team.ID, team.Name, team.Abbreviation)
		if err != nil {
			err2 := s.rollbackTransaction(tx)
			if err2 != nil {
				return fmt.Errorf("error inserting teams and rolling back: %v, %v", err, err2)
			}
			return fmt.Errorf("failed to insert team %s: %v, transaction rolled back", team.Name, err)
		}
	}

	return s.commitTransaction(tx)
}

// InsertSeasons - inserts multiple teams into the database.
func (s *service) InsertSeasons(seasons []types.Season) error {
	tx, err := s.beginTransaction()
	if err != nil {
		return err
	}
	log.Printf("Transaction Started with %v seasons\n", len(seasons))

	query := `INSERT INTO season (id, season_end_year, season_years) VALUES ($1, $2, $3)`

	for _, season := range seasons {
		_, err := s.db.Exec(context.Background(), query, season.ID, season.SeasonEndYear, season.SeasonYears)
		if err != nil {
			err2 := s.rollbackTransaction(tx)
			if err2 != nil {
				log.Printf("error inserting seasons and rolling back: %v, %v", err, err2)
				return fmt.Errorf("error inserting seasons and rolling back: %v, %v", err, err2)
			}
			log.Printf("failed to insert season %v: %v, transaction rolled back", season.SeasonEndYear, err)
			return fmt.Errorf("failed to insert seasons %v: %v, transaction rolled back", season.SeasonEndYear, err)
		}
	}

	return s.commitTransaction(tx)
}

// InsertGames - inserts multiple games into the database.
func (s *service) InsertGames(games []types.Game) error {
	tx, err := s.beginTransaction()
	if err != nil {
		return err
	}
	log.Printf("Transaction Started with %v games\n", len(games))

	columns := types.GetTypeDBColumnNames(types.Game{})

	// log.Printf("Columns: %v\n", columns)

	data := make([][]any, len(games))

	for i, game := range games {
		data[i] = []any{game.ID, game.HomeTeamID, game.AwayTeamID, game.SeasonID, game.GameDate}
	}

	// log.Printf("data interface: %v\n", data)

	err = s.bulkLoadData(tx, "game", columns, data)

	if err != nil {
		log.Fatalf("bulk loading error: %v", err)
		err2 := s.rollbackTransaction(tx)
		if err2 != nil {
			return fmt.Errorf("error inserting games and rolling back: %v, %v", err, err2)
		}
		return err
	}

	return s.commitTransaction(tx)

}

// InsertShots - inserts multiple shots into the database.
// TODO: chunkedBulkUpload (50k rows at a time) - fine for now since only on ingest
func (s *service) InsertShots(shots []types.Shot) error {
	tx, err := s.beginTransaction()
	if err != nil {
		return err
	}
	log.Printf("Transaction Started with %v shots\n", len(shots))

	columns := types.GetTypeDBColumnNames(types.Shot{})

	// log.Printf("Columns: %v\n", columns)

	data := make([][]any, len(shots))

	for i, shot := range shots {
		data[i] = []any{
			shot.PlayerID,
			shot.GameID,
			shot.TeamID,
			shot.HomeTeamID,
			shot.AwayTeamID,
			shot.SeasonID,
			shot.EventType,
			shot.ShotMade,
			shot.ActionType,
			shot.ShotType,
			shot.BasicZone,
			shot.ZoneName,
			shot.ZoneABB,
			shot.ZoneRange,
			shot.LocX,
			shot.LocY,
			shot.ShotDistance,
			shot.Quarter,
			shot.MinsLeft,
			shot.SecsLeft,
			shot.Position,
			shot.PositionGroup,
		}
	}

	// log.Printf("data interface: %v\n", data)

	err = s.bulkLoadData(tx, "shot", columns, data)

	if err != nil {
		log.Fatalf("bulk loading error: %v", err)
		err2 := s.rollbackTransaction(tx)
		if err2 != nil {
			return fmt.Errorf("error inserting shots and rolling back: %v, %v", err, err2)
		}
		return err
	}

	return s.commitTransaction(tx)

}
