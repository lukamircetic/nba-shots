package database

import (
	"context"
	"log"
	"nba-shots/internal/types"
)

func (s *service) GetSeasonByYear(year int) (*types.Season, error) {
	log.Println("Querying database for year", year)
	season := &types.Season{}
	query := `SELECT id, season_end_year, season_years FROM season WHERE season_end_year = $1`
	err := s.db.QueryRow(context.Background(), query, year).Scan(&season.ID, &season.SeasonEndYear, &season.SeasonYears)
	if err != nil {
		return nil, err
	}
	return season, nil
}

func (s *service) GetAllSeasons() ([]types.Season, error) {
	log.Println("Querying database for all seasons")
	seasons := []types.Season{}
	query := `SELECT id, season_end_year, season_years FROM season`

	rows, err := s.db.Query(context.Background(), query)

	if err != nil {
		return nil, err
	}

	defer rows.Close()

	for rows.Next() {
		var season types.Season
		err := rows.Scan(
			&season.ID,
			&season.SeasonEndYear,
			&season.SeasonYears,
		)

		if err != nil {
			return nil, err
		}

		seasons = append(seasons, season)
	}

	log.Printf("Query successful, returning %d seasons: \n", len(seasons))

	return seasons, nil
}
