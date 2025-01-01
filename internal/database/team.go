package database

import (
	"context"
	"log"
	"nba-shots/internal/types"
)

func (s *service) GetTeamByID(teamID int) (*types.Team, error) {
	log.Println("Querying database for teamID", teamID)
	team := &types.Team{}
	query := `SELECT id, name, abbreviation FROM team WHERE id = $1`
	err := s.db.QueryRow(context.Background(), query, teamID).Scan(&team.ID, &team.Name, &team.Abbreviation)
	if err != nil {
		return nil, err
	}
	return team, nil
}

func (s *service) GetAllTeams() ([]types.Team, error) {
	log.Println("Querying database for all teams")
	teams := []types.Team{}
	query := `SELECT id, name, abbreviation FROM team`

	rows, err := s.db.Query(context.Background(), query)

	if err != nil {
		return nil, err
	}

	defer rows.Close()

	for rows.Next() {
		var team types.Team
		err := rows.Scan(
			&team.ID,
			&team.Name,
			&team.Abbreviation,
		)

		if err != nil {
			return nil, err
		}

		teams = append(teams, team)
	}

	log.Printf("Query successful, returning %d teams: \n", len(teams))

	return teams, nil
}
