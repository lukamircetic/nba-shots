package database

import (
	"context"
	"log"
	"nba-shots/internal/types"
)

// Gets shots from the database given a query string and arguments
func (s *service) QueryShots(queryString string, args []interface{}, argCount int) ([]types.ReturnShot, error) {
	var shots []types.ReturnShot

	log.Println("Initiating shots query with query string and args: ", queryString, args)

	rows, err := s.db.Query(context.Background(), queryString, args...)

	if err != nil {
		return nil, err
	}

	defer rows.Close()

	for rows.Next() {
		var shot types.ReturnShot
		err := rows.Scan(
			&shot.ID,
			&shot.LocX,
			&shot.LocY,
			&shot.ShotMade,
			&shot.ShotType,
		)

		if err != nil {
			return nil, err
		}
		shots = append(shots, shot)
	}

	if err := rows.Err(); err != nil {
		return nil, err
	}

	log.Println("Query successful, returning shots: ", len(shots))

	return shots, nil
}
