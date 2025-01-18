package database

import (
	"context"
	"fmt"
	"log"
	"nba-shots/internal/types"
	"strings"
)

func (s *service) GetPlayerByID(playerID int) (*types.Player, error) {
	log.Println("Querying database for playerId", playerID)
	player := &types.Player{}
	query := `SELECT id, name FROM player WHERE id = $1`
	err := s.db.QueryRow(context.Background(), query, playerID).Scan(&player.ID, &player.Name)
	if err != nil {
		return nil, err
	}
	return player, nil
}

func (s *service) GetPlayersByName(playerName string) ([]types.Player, error) {
	log.Println("Querying database for playerName", playerName)

	players := []types.Player{}
	query := `SELECT id, name FROM player WHERE name ilike $1`

	rows, err := s.db.Query(context.Background(), query, playerName)

	if err != nil {
		return nil, err
	}

	defer rows.Close()

	for rows.Next() {
		var player types.Player
		err := rows.Scan(
			&player.ID,
			&player.Name,
		)

		if err != nil {
			return nil, err
		}

		players = append(players, player)
	}

	log.Printf("Query successful, returning %d players: \n", len(players))

	return players, nil
}

func (s *service) GetPlayersByIDs(playerIDs []int) ([]types.Player, error) {
	log.Println("Querying database for playerIDs", playerIDs)

	args := make([]any, len(playerIDs))
	for i, id := range playerIDs {
		args[i] = id
	}

	// Note: duplicated logic from addWhereLogicForInts in shot.go
	argCount := 0
	placeholders := make([]string, len(playerIDs))

	for i := range playerIDs {
		argCount++
		placeholders[i] = fmt.Sprintf("$%d", argCount)
	}
	whereClause := fmt.Sprintf("WHERE id IN (%s)", strings.Join(placeholders, ","))

	players := []types.Player{}
	query := `SELECT id, name FROM player ` + whereClause
	log.Println("query", query)
	rows, err := s.db.Query(context.Background(), query, args...)

	if err != nil {
		return nil, err
	}

	defer rows.Close()

	for rows.Next() {
		var player types.Player
		err := rows.Scan(
			&player.ID,
			&player.Name,
		)

		if err != nil {
			return nil, err
		}

		players = append(players, player)
	}

	log.Printf("Query successful, returning %d players: \n", len(players))

	return players, nil
}
