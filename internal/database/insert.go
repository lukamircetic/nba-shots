package database

import (
	"context"
	"fmt"
	"log"
	"nba-shots/internal/types"

	"github.com/jackc/pgx/v5"
)

// InsertPlayers - inserts multiple players into the database.
func (s *service) InsertPlayers(players []types.Player) error {
	tx, err := s.beginTransaction()
	if err != nil {
		return err
	}
	log.Printf("Transaction Started with %v players\n", len(players))

	// // bulkUpload version
	// columns := types.GetTypeDBColumnNames(types.Player{})
	// log.Printf("Columns: %v\n", columns)
	// data := make([][]any, len(players))
	// for i, player := range players {
	// 	data[i] = []any{player.ID, player.Name}
	// }
	// // log.Printf("data interface: %v\n", data)
	// err = s.bulkLoadData(tx, "player", columns, data)

	query := `
	INSERT INTO player (id, name)
	VALUES ($1, $2)
	ON CONFLICT (id) DO NOTHING
	`
	batch := &pgx.Batch{}
	for _, p := range players {
		batch.Queue(query, p.ID, p.Name)
	}

	br := tx.SendBatch(context.Background(), batch)
	defer br.Close()

	_, err = br.Exec()

	if err != nil {
		log.Fatalf("bulk loading error: %v", err)
		err2 := s.rollbackTransaction(tx)
		if err2 != nil {
			return fmt.Errorf("error inserting players and rolling back: %v, %v", err, err2)
		}
		return err
	}

	br.Close()

	return s.commitTransaction(tx)

}

// InsertTeams - inserts multiple teams into the database.
func (s *service) InsertTeams(teams []types.Team) error {
	tx, err := s.beginTransaction()
	if err != nil {
		return err
	}
	log.Printf("Transaction Started with %v teams\n", len(teams))

	query := `
	INSERT INTO team (id, name, abbreviation)
	VALUES ($1, $2, $3)
	ON CONFLICT (id) DO NOTHING
	`

	batch := &pgx.Batch{}

	for _, team := range teams {
		batch.Queue(query, team.ID, team.Name, team.Abbreviation)
	}

	br := tx.SendBatch(context.Background(), batch)
	defer br.Close()

	_, err = br.Exec()

	if err != nil {
		err2 := s.rollbackTransaction(tx)
		if err2 != nil {
			return fmt.Errorf("error inserting teams and rolling back: %v, %v", err, err2)
		}
		return fmt.Errorf("failed to insert teams: %v, transaction rolled back", err)
	}

	br.Close()

	return s.commitTransaction(tx)
}

// InsertSeasons - inserts multiple teams into the database.
func (s *service) InsertSeasons(seasons []types.Season) error {
	tx, err := s.beginTransaction()
	if err != nil {
		return err
	}
	log.Printf("Transaction Started with %v seasons\n", len(seasons))

	query := `
	INSERT INTO season (year, season_years)
	VALUES ($1, $2)
	ON CONFLICT (year) DO NOTHING
	`

	batch := &pgx.Batch{}

	for _, season := range seasons {
		batch.Queue(query, season.Year, season.SeasonYears)
	}

	br := tx.SendBatch(context.Background(), batch)
	defer br.Close()

	_, err = br.Exec()

	if err != nil {
		err2 := s.rollbackTransaction(tx)
		if err2 != nil {
			log.Printf("error inserting seasons and rolling back: %v, %v", err, err2)
			return fmt.Errorf("error inserting seasons and rolling back: %v, %v", err, err2)
		}
		log.Printf("failed to insert seasons: %v, transaction rolled back", err)
		return fmt.Errorf("failed to insert seasons: %v, transaction rolled back", err)
	}
	br.Close()
	return s.commitTransaction(tx)
}

// InsertGames - inserts multiple games into the database.
// shouldnt need to worry about conflicts if we're loading in the season csv
func (s *service) InsertGames(games []types.Game) error {
	tx, err := s.beginTransaction()
	if err != nil {
		return err
	}
	log.Printf("Transaction Started with %v games\n", len(games))

	columns := types.GetTypeDBColumnNames(types.Game{})
	data := make([][]any, len(games))
	for i, game := range games {
		data[i] = []any{game.ID, game.HomeTeamID, game.AwayTeamID, game.SeasonYear, game.GameDate}
	}
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
			shot.SeasonYear,
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
			shot.TotalTimeLeftSecs,
			shot.Position,
			shot.PositionGroup,
			shot.GameDate,
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

// InsertPlayerTeams - inserts multiple player teams into the database.
func (s *service) InsertPlayerTeams(playerTeams []types.PlayerTeam) error {
	tx, err := s.beginTransaction()
	if err != nil {
		return err
	}
	log.Printf("Transaction Started with %v players teams\n", len(playerTeams))

	// // old method using bulkUpload
	// columns := types.GetTypeDBColumnNames(types.PlayerTeam{})
	// // log.Printf("Columns: %v\n", columns)
	// data := make([][]any, len(playerTeams))
	// for i, playerTeam := range playerTeams {
	// 	data[i] = []any{playerTeam.PlayerID, playerTeam.TeamID, playerTeam.TeamName}
	// }
	// // log.Printf("data interface: %v\n", data)
	// err = s.bulkLoadData(tx, "player_team", columns, data)

	query := `
	INSERT INTO player_team (player_id, team_id, team_name)
	VALUES ($1, $2, $3)
	ON CONFLICT (player_id, team_id) DO NOTHING
	`

	batch := &pgx.Batch{}

	for _, pt := range playerTeams {
		batch.Queue(query, pt.PlayerID, pt.TeamID, pt.TeamName)
	}

	br := tx.SendBatch(context.Background(), batch)
	defer br.Close()

	_, err = br.Exec()

	if err != nil {
		log.Fatalf("bulk loading error: %v", err)
		err2 := s.rollbackTransaction(tx)
		if err2 != nil {
			return fmt.Errorf("error inserting player teams and rolling back: %v, %v", err, err2)
		}
		return err
	}

	br.Close()

	return s.commitTransaction(tx)

}

func (s *service) InsertPlayerSeasons(playerSeasons []types.PlayerSeason) error {
	tx, err := s.beginTransaction()
	if err != nil {
		return err
	}
	log.Printf("Transaction Started with %v players seasons\n", len(playerSeasons))

	// // old bulkLoad logic
	// columns := types.GetTypeDBColumnNames(types.PlayerSeason{})
	// // log.Printf("Columns: %v\n", columns)
	// data := make([][]any, len(playerSeasons))
	// for i, playerTeam := range playerSeasons {
	// 	data[i] = []any{playerTeam.PlayerID, playerTeam.SeasonYear}
	// }
	// // log.Printf("data interface: %v\n", data)
	// err = s.bulkLoadData(tx, "player_season", columns, data)

	query := `
	INSERT INTO player_season (player_id, season_year)
	VALUES ($1, $2)
	ON CONFLICT (player_id, season_year) DO NOTHING
	`

	batch := &pgx.Batch{}

	for _, ps := range playerSeasons {
		batch.Queue(query, ps.PlayerID, ps.SeasonYear)
	}

	br := tx.SendBatch(context.Background(), batch)
	defer br.Close()

	_, err = br.Exec()

	if err != nil {
		log.Fatalf("bulk loading error: %v", err)
		err2 := s.rollbackTransaction(tx)
		if err2 != nil {
			return fmt.Errorf("error inserting player seasons and rolling back: %v, %v", err, err2)
		}
		return err
	}

	br.Close()

	return s.commitTransaction(tx)

}

func (s *service) InsertPlayerGames(playerGames []types.PlayerGame) error {
	tx, err := s.beginTransaction()
	if err != nil {
		return err
	}
	log.Printf("Transaction Started with %v players games\n", len(playerGames))

	// // old bulkUpload logic
	// columns := types.GetTypeDBColumnNames(types.PlayerGame{})
	// // log.Printf("Columns: %v\n", columns)
	// data := make([][]any, len(playerGames))
	// for i, playerGame := range playerGames {
	// 	data[i] = []any{playerGame.PlayerID, playerGame.GameID, playerGame.GameDate}
	// }
	// // log.Printf("data interface: %v\n", data)
	// err = s.bulkLoadData(tx, "player_game", columns, data)

	query := `
	INSERT INTO player_game (player_id, game_id, game_date)
	VALUES ($1, $2, $3)
	ON CONFLICT (player_id, game_id) DO NOTHING
	`

	batch := &pgx.Batch{}

	for _, pg := range playerGames {
		batch.Queue(query, pg.PlayerID, pg.GameID, pg.GameDate)
	}

	br := tx.SendBatch(context.Background(), batch)
	defer br.Close()

	_, err = br.Exec()

	if err != nil {
		log.Fatalf("bulk loading error: %v", err)
		err2 := s.rollbackTransaction(tx)
		if err2 != nil {
			return fmt.Errorf("error inserting players and rolling back: %v, %v", err, err2)
		}
		return err
	}

	br.Close()

	return s.commitTransaction(tx)

}

func (s *service) InsertTeamSeasons(teamSeasons []types.TeamSeason) error {
	tx, err := s.beginTransaction()
	if err != nil {
		return err
	}
	log.Printf("Transaction Started with %v team seasons\n", len(teamSeasons))

	// // old bulkUpload logic
	// columns := types.GetTypeDBColumnNames(types.TeamSeason{})
	// // log.Printf("Columns: %v\n", columns)
	// data := make([][]any, len(teamSeasons))
	// for i, teamSeason := range teamSeasons {
	// 	data[i] = []any{teamSeason.TeamID, teamSeason.SeasonYear, teamSeason.TeamName}
	// }
	// // log.Printf("data interface: %v\n", data)
	// err = s.bulkLoadData(tx, "team_season", columns, data)

	query := `
	INSERT INTO team_season (team_id, season_year, team_name)
	VALUES ($1, $2, $3)
	ON CONFLICT (team_id, season_year) DO NOTHING
	`

	batch := &pgx.Batch{}

	for _, ts := range teamSeasons {
		batch.Queue(query, ts.TeamID, ts.SeasonYear, ts.TeamName)
	}

	br := tx.SendBatch(context.Background(), batch)
	defer br.Close()

	_, err = br.Exec()

	if err != nil {
		log.Fatalf("bulk loading error: %v", err)
		err2 := s.rollbackTransaction(tx)
		if err2 != nil {
			return fmt.Errorf("error inserting team seasons and rolling back: %v, %v", err, err2)
		}
		return err
	}

	br.Close()

	return s.commitTransaction(tx)

}

func (s *service) InsertTeamGames(teamGames []types.TeamGame) error {
	tx, err := s.beginTransaction()
	if err != nil {
		return err
	}
	log.Printf("Transaction Started with %v team games\n", len(teamGames))

	// // old bulkUpload logic
	// columns := types.GetTypeDBColumnNames(types.TeamGame{})
	// // log.Printf("Columns: %v\n", columns)
	// data := make([][]any, len(teamGames))
	// for i, teamGame := range teamGames {
	// 	data[i] = []any{teamGame.TeamID, teamGame.GameID, teamGame.GameDate}
	// }
	// // log.Printf("data interface: %v\n", data)
	// err = s.bulkLoadData(tx, "team_game", columns, data)

	query := `
	INSERT INTO team_game (team_id, game_id, game_date)
	VALUES ($1, $2, $3)
	ON CONFLICT (team_id, game_id) DO NOTHING
	`

	batch := &pgx.Batch{}

	for _, tg := range teamGames {
		batch.Queue(query, tg.TeamID, tg.GameID, tg.GameDate)
	}

	br := tx.SendBatch(context.Background(), batch)
	defer br.Close()

	_, err = br.Exec()

	if err != nil {
		log.Fatalf("bulk loading error: %v", err)
		err2 := s.rollbackTransaction(tx)
		if err2 != nil {
			return fmt.Errorf("error inserting team games and rolling back: %v, %v", err, err2)
		}
		return err
	}

	br.Close()

	return s.commitTransaction(tx)

}

func (s *service) InsertGameSeasons(gameSeasons []types.GameSeason) error {
	tx, err := s.beginTransaction()
	if err != nil {
		return err
	}
	log.Printf("Transaction Started with %v game seasons\n", len(gameSeasons))

	// // old bulkUpload logic
	// columns := types.GetTypeDBColumnNames(types.GameSeason{})
	// // log.Printf("Columns: %v\n", columns)
	// data := make([][]any, len(gameSeasons))
	// for i, teamGame := range gameSeasons {
	// 	data[i] = []any{teamGame.GameID, teamGame.SeasonYear}
	// }
	// // log.Printf("data interface: %v\n", data)
	// err = s.bulkLoadData(tx, "game_season", columns, data)

	query := `
	INSERT INTO game_season (game_id, season_year)
	VALUES ($1, $2)
	ON CONFLICT (game_id, season_year) DO NOTHING
	`

	batch := &pgx.Batch{}

	for _, gs := range gameSeasons {
		batch.Queue(query, gs.GameID, gs.SeasonYear)
	}

	br := tx.SendBatch(context.Background(), batch)
	defer br.Close()

	_, err = br.Exec()

	if err != nil {
		log.Fatalf("bulk loading error: %v", err)
		err2 := s.rollbackTransaction(tx)
		if err2 != nil {
			return fmt.Errorf("error inserting game seasons and rolling back: %v, %v", err, err2)
		}
		return err
	}

	br.Close()

	return s.commitTransaction(tx)

}

func (s *service) InsertQueryHistory(ctx context.Context, qh *types.QueryHistoryRecord) error {
	tx, err := s.beginTransaction()
	if err != nil {
		return err
	}
	log.Printf("Attempting to insert the queryHistory record for %v shots\n", qh.ReturnedShots)

	query := `
	INSERT INTO query_history (
    player_id,
    team_id,
    season_year,
		opp_team_id,
    quarter,
    start_game_date,
    end_game_date,
    game_location,
    start_time_left,
    end_time_left,
    returned_shots
	)
	VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
	`

	// format the array values
	_, err = s.db.Exec(ctx, query,
		formatPGIntArray(&qh.PlayerIDs),
		formatPGIntArray(&qh.TeamIDs),
		formatPGIntArray(&qh.SeasonYears),
		formatPGIntArray(&qh.OpposingTeamIds),
		formatPGIntArray(&qh.Quarters),
		formatNullableDate(qh.StartGameDate),
		formatNullableDate(qh.EndGameDate),
		formatNullableString(qh.GameLocation),
		formatNullableInt(qh.StartTimeLeftSecs),
		formatNullableInt(qh.EndTimeLeftSecs),
		qh.ReturnedShots,
	)

	if err != nil {
		log.Printf("query log exec: %v\n", err)
		err2 := s.rollbackTransaction(tx)
		if err2 != nil {
			return fmt.Errorf("error inserting game seasons and rolling back: %v, %v", err, err2)
		}
		return err
	}
	return s.commitTransaction(tx)
}
