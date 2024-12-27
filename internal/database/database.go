package database

import (
	"context"
	"database/sql"
	"fmt"
	"log"
	"os"
	"strconv"
	"time"

	"nba-shots/internal/types"

	_ "github.com/jackc/pgx/v5/stdlib"
	_ "github.com/joho/godotenv/autoload"
	"github.com/lib/pq"
)

// Service represents a service that interacts with a database.
type Service interface {
	InsertPlayers([]types.Player) error
	// InsertTeams() error
	// InsertSeasons() error
	// InsertGames() error
	// InsertShots() error
	// Health returns a map of health status information.
	// The keys and values in the map are service-specific.
	Health() map[string]string

	// Close terminates the database connection.
	// It returns an error if the connection cannot be closed.
	Close() error
}

type service struct {
	db *sql.DB
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
	db, err := sql.Open("pgx", connStr)
	if err != nil {
		log.Fatal(err)
	}
	dbInstance = &service{
		db: db,
	}
	return dbInstance
}

func (s *service) beginTransaction() (*sql.Tx, error) {
	return s.db.Begin()
}

func (s *service) commitTransaction(tx *sql.Tx) error {
	return tx.Commit()
}

func (s *service) rollbackTransaction(tx *sql.Tx) error {
	return tx.Rollback()
}

func (s *service) bulkLoadData(tx *sql.Tx, tableName string, columns []string, data [][]interface{}) error {
	stmt, err := tx.Prepare(pq.CopyIn(tableName, "id", "name"))
	if err != nil {
		return err
	}
	log.Printf("Statement created: %v\n", stmt)

	defer stmt.Close()

	for _, row := range data {
		log.Printf("row: %v", row)
		_, err = stmt.Exec(row...)
		if err != nil {
			log.Fatalf("row loading error: %v", err)
			return err
		}
	}
	log.Println("Executed statements")

	_, err = stmt.Exec()
	if err != nil {
		return err
	}
	log.Println("Final exec done")

	return stmt.Close()
}

// InsertPlayers - inserts multiple players into the database.
func (s *service) InsertPlayers(players []types.Player) error {
	tx, err := s.beginTransaction()
	if err != nil {
		return err
	}
	log.Printf("Transaction Started with %v players\n", len(players))

	columns := types.GetTypeDBColumnNames(types.Player{})

	log.Printf("Columns: %v\n", columns)

	data := make([][]interface{}, len(players))

	for i, player := range players {
		data[i] = []interface{}{player.ID, player.Name}
	}

	log.Printf("data interface: %v\n", data)

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

// Health checks the health of the database connection by pinging the database.
// It returns a map with keys indicating various health statistics.
func (s *service) Health() map[string]string {
	ctx, cancel := context.WithTimeout(context.Background(), 1*time.Second)
	defer cancel()

	stats := make(map[string]string)

	// Ping the database
	err := s.db.PingContext(ctx)
	if err != nil {
		stats["status"] = "down"
		stats["error"] = fmt.Sprintf("db down: %v", err)
		log.Fatalf("db down: %v", err) // Log the error and terminate the program
		return stats
	}

	// Database is up, add more statistics
	stats["status"] = "up"
	stats["message"] = "It's healthy"

	// Get database stats (like open connections, in use, idle, etc.)
	dbStats := s.db.Stats()
	stats["open_connections"] = strconv.Itoa(dbStats.OpenConnections)
	stats["in_use"] = strconv.Itoa(dbStats.InUse)
	stats["idle"] = strconv.Itoa(dbStats.Idle)
	stats["wait_count"] = strconv.FormatInt(dbStats.WaitCount, 10)
	stats["wait_duration"] = dbStats.WaitDuration.String()
	stats["max_idle_closed"] = strconv.FormatInt(dbStats.MaxIdleClosed, 10)
	stats["max_lifetime_closed"] = strconv.FormatInt(dbStats.MaxLifetimeClosed, 10)

	// Evaluate stats to provide a health message
	if dbStats.OpenConnections > 40 { // Assuming 50 is the max for this example
		stats["message"] = "The database is experiencing heavy load."
	}

	if dbStats.WaitCount > 1000 {
		stats["message"] = "The database has a high number of wait events, indicating potential bottlenecks."
	}

	if dbStats.MaxIdleClosed > int64(dbStats.OpenConnections)/2 {
		stats["message"] = "Many idle connections are being closed, consider revising the connection pool settings."
	}

	if dbStats.MaxLifetimeClosed > int64(dbStats.OpenConnections)/2 {
		stats["message"] = "Many connections are being closed due to max lifetime, consider increasing max lifetime or revising the connection usage pattern."
	}

	return stats
}

// Close closes the database connection.
// It logs a message indicating the disconnection from the specific database.
// If the connection is successfully closed, it returns nil.
// If an error occurs while closing the connection, it returns the error.
func (s *service) Close() error {
	log.Printf("Disconnected from database: %s", database)
	return s.db.Close()
}
