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
	queryString := `SELECT id, loc_x, loc_y, shot_made, shot_type FROM shot `

	q.buildWhereClause()

	if len(q.WhereConditions) > 0 {
		queryString += "WHERE " + strings.Join(q.WhereConditions, " AND ")
	}
	log.Println("Query string assembled: ", queryString)
	return queryString, nil
}

// simple helper for keeping track of which is the current arg number
func (q *ShotQuery) nextArgNum() int {
	q.ArgCount++
	return q.ArgCount
}

// populates the q.WhereConditions param based on the RequestArgs provided
func (q *ShotQuery) buildWhereClause() {
	if len(q.RequestArgs.PlayerIDs) > 0 {
		pString := q.getWhereLogicforInts(q.RequestArgs.PlayerIDs, "player_id")
		q.WhereConditions = append(q.WhereConditions, pString)
	}

	if len(q.RequestArgs.TeamIDs) > 0 {
		tString := q.getWhereLogicforInts(q.RequestArgs.TeamIDs, "team_id")
		q.WhereConditions = append(q.WhereConditions, tString)
	}

	if len(q.RequestArgs.SeasonYears) > 0 {
		sString := q.getWhereLogicforInts(q.RequestArgs.SeasonYears, "season_year")
		q.WhereConditions = append(q.WhereConditions, sString)
	}

	if len(q.RequestArgs.OpposingTeamIds) > 0 {
		opposingTeamAwayString := q.getWhereLogicforInts(q.RequestArgs.OpposingTeamIds, "away_team_id")
		opposingTeamHomeString := q.getWhereLogicforInts(q.RequestArgs.OpposingTeamIds, "home_team_id")
		oppString := fmt.Sprintf(
			`((home_team_id = team_id AND %s) OR (away_team_id = team_id and %s))`,
			opposingTeamAwayString,
			opposingTeamHomeString,
		)
		q.WhereConditions = append(q.WhereConditions, oppString)
	}

	if !q.RequestArgs.StartGameDate.IsZero() {
		startGameCond := fmt.Sprintf("game_date >= $%d", q.nextArgNum())
		q.Args = append(q.Args, q.RequestArgs.StartGameDate)
		q.WhereConditions = append(q.WhereConditions, startGameCond)
	}

	if !q.RequestArgs.StartGameDate.IsZero() {
		startGameCond := fmt.Sprintf("game_date <= $%d", q.nextArgNum())
		q.Args = append(q.Args, q.RequestArgs.EndGameDate)
		q.WhereConditions = append(q.WhereConditions, startGameCond)
	}

	if q.RequestArgs.GameLocation != "" {
		var gameLocString string
		if q.RequestArgs.GameLocation == "home" {
			gameLocString = "team_id = home_team_id"
		} else {
			gameLocString = "team_id = away_team_id"
		}
		q.WhereConditions = append(q.WhereConditions, gameLocString)
	}

	if len(q.RequestArgs.Quarters) > 0 {
		qtrString := q.getWhereLogicforInts(q.RequestArgs.Quarters, "qtr")
		q.WhereConditions = append(q.WhereConditions, qtrString)
	}

	// assuming here that the times will be set to -1 if the query params arent set
	if q.RequestArgs.StartTimeLeftSecs <= 720 && q.RequestArgs.StartTimeLeftSecs >= 0 {
		startTimeString := fmt.Sprintf("total_time_left_secs <= $%d", q.nextArgNum())
		q.Args = append(q.Args, q.RequestArgs.StartTimeLeftSecs)
		q.WhereConditions = append(q.WhereConditions, startTimeString)
	}

	if q.RequestArgs.EndTimeLeftSecs <= 720 && q.RequestArgs.EndTimeLeftSecs >= 0 {
		endTimeString := fmt.Sprintf("total_time_left_secs >= $%d", q.nextArgNum())
		q.Args = append(q.Args, q.RequestArgs.EndTimeLeftSecs)
		q.WhereConditions = append(q.WhereConditions, endTimeString)
	}

}

// This function make the arg string, adds the args, and increments arg counter
// has conditional logic where it uses = for comparison if only one item
// or uses in () if there are multiple ids
func (q *ShotQuery) getWhereLogicforInts(items []int, column string) string {
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
	return cond
}

/* This is what a query string using all params looks like:

```
Initiating shots query with query string and args
:
SELECT id, loc_x, loc_y, shot_made, shot_type
FROM shot
WHERE player_id = $1
AND team_id = $2
AND season_year = $3
AND ((home_team_id = team_id AND away_team_id IN ($4, $5)) OR (away_team_id = team_id and home_team_id IN ($6, $7)))
AND game_date >= $8
AND game_date <= $9
AND team_id = home_team_id
AND qtr = $10
AND ((mins_left = $11 and secs_left <= $12) OR (mins_left < $13 an
d mins_left > $14) OR (mins_left = $15 and secs_left >= $16))

[
1 - 1628369
2 - 1610612738
3 - 2024
4 - 1610612761
5 - 1610612762
6 - 1610612761
7 - 1610612762
8 - 2023-02-01 00:00:00 +0000 UTC
9 - 2023-02-01 00:00:00 +0000 UTC
10 - 4
11 - 10
12 - 30
13 - 10
14 - 2
15 - 2
16 - 5
]
```

*/
