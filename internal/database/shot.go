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

func (q *ShotQuery) nextArgNum() int {
	q.ArgCount++
	return q.ArgCount
}

func (q *ShotQuery) buildWhereClause() {
	// log.Println("Building where clause")
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

	// if !(q.RequestArgs.StartMinsLeft == 12 && q.RequestArgs.EndMinsLeft == 0 && q.RequestArgs.StartSecsLeft == 0 && q.RequestArgs.EndSecsLeft == 0) {
	// 	gameTimeCond := q.getWhereLogicForGameTime()
	// 	log.Println("Game times where logic: ", gameTimeCond)
	// 	q.WhereConditions = append(q.WhereConditions, gameTimeCond)
	// }

}

// This function make the arg string, adds the args, and increments arg counter
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

// func (q *ShotQuery) getWhereLogicForGameTime() string {
// 	var cond string = "("
// 	if q.RequestArgs.StartMinsLeft != 12 {
// 		cond += fmt.Sprintf("(mins_left = $%d AND secs_left <= $%d)", q.nextArgNum(), q.nextArgNum())
// 		q.Args = append(q.Args, q.RequestArgs.StartMinsLeft, q.RequestArgs.StartSecsLeft)
// 	}

// 	if q.RequestArgs.StartMinsLeft != 12 && (q.RequestArgs.EndMinsLeft != 0 || q.RequestArgs.EndSecsLeft != 0) {
// 		cond += " OR "
// 		cond += fmt.Sprintf("(mins_left < $%d AND mins_left > $%d)", q.nextArgNum(), q.nextArgNum())
// 		q.Args = append(q.Args, q.RequestArgs.StartMinsLeft, q.RequestArgs.EndMinsLeft)
// 	}
// 	cond = fmt.Sprintf(`
// 	((mins_left = $%d and secs_left <= $%d) OR (mins_left < $%d and mins_left > $%d) OR (mins_left = $%d and secs_left >= $%d))`,
// 		q.nextArgNum(), q.nextArgNum(), q.nextArgNum(), q.nextArgNum(), q.nextArgNum(), q.nextArgNum(),
// 	)
// 	q.Args = append(
// 		q.Args,
// 		q.RequestArgs.StartMinsLeft,
// 		q.RequestArgs.StartSecsLeft,
// 		q.RequestArgs.StartMinsLeft,
// 		q.RequestArgs.EndMinsLeft,
// 		q.RequestArgs.EndMinsLeft,
// 		q.RequestArgs.EndSecsLeft,
// 	)
// 	return cond
// }
