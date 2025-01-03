package database

import (
	"fmt"
	"log"
	"nba-shots/internal/types"
	"strings"
)

type ShotQuery struct {
	RequestArgs     *types.RequestShotParams
	Args            []interface{}
	ArgCount        int
	WhereConditions []string
}

func NewShotQuery(args *types.RequestShotParams) *ShotQuery {
	return &ShotQuery{
		RequestArgs:     args,
		Args:            make([]interface{}, 0),
		WhereConditions: make([]string, 0),
	}
}

func (s *service) GetShots(args *types.RequestShotParams) ([]types.ReturnShot, error) {
	shotQuery := NewShotQuery(args)

	query, err := shotQuery.buildQueryString()

	if err != nil {
		return nil, err
	}

	shots, err := s.QueryShots(query, shotQuery.Args, shotQuery.ArgCount)

	if err != nil {
		return nil, err
	}

	return shots, nil
}

func (q *ShotQuery) buildQueryString() (string, error) {
	queryString := `SELECT loc_x, loc_y, shot_made, shot_type FROM shot `

	q.buildWhereClause()

	if len(q.WhereConditions) > 0 {
		queryString += "WHERE " + strings.Join(q.WhereConditions, " AND ")
	}
	log.Println("Query string assembled: ", queryString)
	return queryString, nil
}

func (q *ShotQuery) nextArgNum() int {
	q.ArgCount++
	return q.ArgCount
}

func (q *ShotQuery) buildWhereClause() {
	// log.Println("Building where clause")
	if len(q.RequestArgs.PlayerIDs) > 0 {
		q.addWhereLogicforInts(q.RequestArgs.PlayerIDs, "player_id")
	}
	// log.Println("Finished player where: ", q.WhereConditions, q.Args)

	if len(q.RequestArgs.TeamIDs) > 0 {
		q.addWhereLogicforInts(q.RequestArgs.TeamIDs, "team_id")
	}
	// log.Println("Finished team where: ", q.WhereConditions, q.Args)

	if len(q.RequestArgs.SeasonYears) > 0 {
		q.addWhereLogicforInts(q.RequestArgs.SeasonYears, "season_year")
	}
	// log.Println("Finished season where: ", q.WhereConditions, q.Args)
}

func (q *ShotQuery) addWhereLogicforInts(items []int, column string) {
	var cond string
	if len(items) == 1 {
		cond = fmt.Sprintf("%s = $%d", column, q.nextArgNum())
		q.Args = append(q.Args, items[0])
	} else {
		placeholders := make([]string, len(items))
		for i := range items {
			placeholders[i] = fmt.Sprintf("$%d", q.nextArgNum())
			q.Args = append(q.Args, items[i])
		}
		cond = fmt.Sprintf("%s IN (%s)", column, strings.Join(placeholders, ", "))
	}
	q.WhereConditions = append(q.WhereConditions, cond)
}
