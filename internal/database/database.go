package database

import (
	"context"
	"fmt"
	"log"
	"os"
	"time"

	"nba-shots/internal/types"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
	_ "github.com/jackc/pgx/v5/stdlib"
	_ "github.com/joho/godotenv/autoload"
)

// Service represents a service that interacts with a database.
type Service interface {
	InsertPlayers([]types.Player) error
	InsertTeams([]types.Team) error
	InsertSeasons([]types.Season) error
	InsertGames([]types.Game) error
	InsertShots([]types.Shot) error

	Health() map[string]string
	Close()
}

type service struct {
	db *pgxpool.Pool
}

var (
	database   = os.Getenv("BLUEPRINT_DB_DATABASE")
	password   = os.Getenv("BLUEPRINT_DB_PASSWORD")
	username   = os.Getenv("BLUEPRINT_DB_USERNAME")
	port       = os.Getenv("BLUEPRINT_DB_PORT")
	host       = os.Getenv("BLUEPRINT_DB_HOST")
	schema     = os.Getenv("BLUEPRINT_DB_SCHEMA")
	dbInstance *service
)

func New() Service {
	// Reuse Connection
	if dbInstance != nil {
		return dbInstance
	}
	connStr := fmt.Sprintf("postgres://%s:%s@%s:%s/%s?sslmode=disable&search_path=%s", username, password, host, port, database, schema)
	config, err := pgxpool.ParseConfig(connStr)

	if err != nil {
		log.Fatal(err)
	}

	db, err := pgxpool.NewWithConfig(context.Background(), config)

	if err != nil {
		log.Fatal(err)
	}

	dbInstance = &service{
		db: db,
	}
	return dbInstance
}

func (s *service) beginTransaction() (pgx.Tx, error) {
	return s.db.Begin(context.Background())
}

func (s *service) commitTransaction(tx pgx.Tx) error {
	return tx.Commit(context.Background())
}

func (s *service) rollbackTransaction(tx pgx.Tx) error {
	return tx.Rollback(context.Background())
}

func (s *service) bulkLoadData(tx pgx.Tx, tableName string, columns []string, data [][]interface{}) error {
	copyCount, err := tx.CopyFrom(
		context.Background(),
		pgx.Identifier{tableName},
		columns,
		pgx.CopyFromRows(data),
	)

	if err != nil {
		return fmt.Errorf("error copying data: %v", err)
	}

	log.Printf("Copied %v rows\n", copyCount)
	return nil
}

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

	query := `INSERT INTO team (id, name) VALUES ($1, $2)`

	for _, team := range teams {
		_, err := s.db.Exec(context.Background(), query, team.ID, team.Name)
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
func (s *service) InsertShots(shots []types.Shot) error {
	tx, err := s.beginTransaction()
	if err != nil {
		return err
	}
	log.Printf("Transaction Started with %v games\n", len(shots))

	columns := types.GetTypeDBColumnNames(types.Shot{})

	// log.Printf("Columns: %v\n", columns)

	data := make([][]any, len(shots))

	for i, shot := range shots {
		data[i] = []any{
			shot.ID,
			shot.PlayerID,
			shot.GameID,
			shot.TeamID,
			shot.SeasonID,
			shot.EventType,
			shot.ShotMade,
			shot.ActionType,
			shot.ShotType,
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

// Health checks the health of the database connection by pinging the database.
// It returns a map with keys indicating various health statistics.
func (s *service) Health() map[string]string {
	ctx, cancel := context.WithTimeout(context.Background(), 1*time.Second)
	defer cancel()

	stats := make(map[string]string)

	// Ping the database
	err := s.db.Ping(ctx)
	if err != nil {
		stats["status"] = "down"
		stats["error"] = fmt.Sprintf("db down: %v", err)
		log.Fatalf("db down: %v", err) // Log the error and terminate the program
		return stats
	}

	// Database is up, add more statistics
	stats["status"] = "up"
	stats["message"] = "It's healthy"

	// // Get database stats (like open connections, in use, idle, etc.)
	// dbStats := s.db.Stats()
	// stats["open_connections"] = strconv.Itoa(dbStats.OpenConnections)
	// stats["in_use"] = strconv.Itoa(dbStats.InUse)
	// stats["idle"] = strconv.Itoa(dbStats.Idle)
	// stats["wait_count"] = strconv.FormatInt(dbStats.WaitCount, 10)
	// stats["wait_duration"] = dbStats.WaitDuration.String()
	// stats["max_idle_closed"] = strconv.FormatInt(dbStats.MaxIdleClosed, 10)
	// stats["max_lifetime_closed"] = strconv.FormatInt(dbStats.MaxLifetimeClosed, 10)

	// // Evaluate stats to provide a health message
	// if dbStats.OpenConnections > 40 { // Assuming 50 is the max for this example
	// 	stats["message"] = "The database is experiencing heavy load."
	// }

	// if dbStats.WaitCount > 1000 {
	// 	stats["message"] = "The database has a high number of wait events, indicating potential bottlenecks."
	// }

	// if dbStats.MaxIdleClosed > int64(dbStats.OpenConnections)/2 {
	// 	stats["message"] = "Many idle connections are being closed, consider revising the connection pool settings."
	// }

	// if dbStats.MaxLifetimeClosed > int64(dbStats.OpenConnections)/2 {
	// 	stats["message"] = "Many connections are being closed due to max lifetime, consider increasing max lifetime or revising the connection usage pattern."
	// }

	return stats
}

// Close closes the database connection.
// It logs a message indicating the disconnection from the specific database.
// If the connection is successfully closed, it returns nil.
// If an error occurs while closing the connection, it returns the error.
func (s *service) Close() {
	log.Printf("Disconnected from database: %s", database)
	s.db.Close()
}
