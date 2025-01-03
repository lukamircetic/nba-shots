package database

import (
	"context"
	"fmt"
	"log"
	"os"
	"time"

	"nba-shots/internal/types"

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
	InsertPlayerTeams([]types.PlayerTeam) error
	InsertPlayerSeasons([]types.PlayerSeason) error
	InsertPlayerGames([]types.PlayerGame) error
	InsertTeamSeasons([]types.TeamSeason) error
	InsertTeamGames([]types.TeamGame) error
	InsertGameSeasons([]types.GameSeason) error
	QueryShots(string, []interface{}, int) ([]types.ReturnShot, error)

	GetShots(*types.RequestShotParams) ([]types.ReturnShot, error)
	GetPlayerByID(int) (*types.Player, error)
	GetPlayersByName(string) ([]types.Player, error)
	GetTeamByID(int) (*types.Team, error)
	GetAllTeams() ([]types.Team, error)
	GetSeasonByYear(int) (*types.Season, error)
	GetAllSeasons() ([]types.Season, error)
	GetGameByID(int) (*types.Game, error)
	GetLastXGames(int) ([]types.Game, error)

	IsEmptyDatabase() (bool, error)
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
