package types

import (
	"reflect"
	"time"
)

type Player struct {
	ID   int    `db:"id"`
	Name string `db:"name"`
}

type Team struct {
	ID           int    `db:"id"`
	Name         string `db:"name"`
	Abbreviation string `db:"abbreviation"`
}

type Season struct {
	ID            int    `db:"id"`
	SeasonEndYear int    `db:"season_end_year"`
	SeasonYears   string `db:"season_years"`
}

type Game struct {
	ID         int       `db:"id"`
	HomeTeamID int       `db:"home_team_id"`
	AwayTeamID int       `db:"away_team_id"`
	SeasonID   int       `db:"season_id"`
	GameDate   time.Time `db:"game_date"`
}

type Shot struct {
	PlayerID      int     `db:"player_id"`
	GameID        int     `db:"game_id"`
	TeamID        int     `db:"team_id"`
	HomeTeamID    int     `db:"home_team_id"`
	AwayTeamID    int     `db:"away_team_id"`
	SeasonID      int     `db:"season_id"`
	EventType     string  `db:"event_type"`
	ShotMade      bool    `db:"shot_made"`
	ActionType    string  `db:"action_type"`
	ShotType      string  `db:"shot_type"`
	BasicZone     string  `db:"basic_zone"`
	ZoneName      string  `db:"zone_name"`
	ZoneABB       string  `db:"zone_abb"`
	ZoneRange     string  `db:"zone_range"`
	LocX          float64 `db:"loc_x"`
	LocY          float64 `db:"loc_y"`
	ShotDistance  int     `db:"shot_distance"`
	Quarter       int     `db:"qtr"`
	MinsLeft      int     `db:"mins_left"`
	SecsLeft      int     `db:"secs_left"`
	Position      string  `db:"position"`
	PositionGroup string  `db:"position_group"`
}

type PlayerTeam struct {
	PlayerID int    `db:"player_id"`
	TeamID   int    `db:"team_id"`
	TeamName string `db:"team_name"`
}

type PlayerSeason struct {
	PlayerID int `db:"player_id"`
	SeasonID int `db:"season_id"`
}

type PlayerGame struct {
	PlayerID int `db:"player_id"`
	GameID   int `db:"game_id"`
}

type TeamSeason struct {
	TeamID   int    `db:"team_id"`
	SeasonID int    `db:"season_id"`
	TeamName string `db:"team_name"`
}

type TeamGame struct {
	TeamID int `db:"team_id"`
	GameID int `db:"game_id"`
}

type GameSeason struct {
	GameID   int `db:"game_id"`
	SeasonID int `db:"season_id"`
}

type PlayerTeamSeason struct {
	PlayerID int    `db:"player_id"`
	TeamID   int    `db:"team_id"`
	SeasonID int    `db:"season_id"`
	TeamName string `db:"team_name"`
}

type RequestShotParams struct {
	PlayerIDs []int `json:"player_id"`
	TeamIDs   []int `json:"team_id"`
	SeasonIDs []int `json:"season_id"`
}

func NewRequestShotParams() *RequestShotParams {
	return &RequestShotParams{}
}

type ReturnShot struct {
	LocX     float64 `json:"loc_x"`
	LocY     float64 `json:"loc_y"`
	ShotMade bool    `json:"shot_made"`
	ShotType string  `json:"shot_type"`
}

func GetTypeDBColumnNames(v interface{}) []string {
	t := reflect.TypeOf(v)
	columns := make([]string, t.NumField())

	for i := 0; i < t.NumField(); i++ {
		columns[i] = t.Field(i).Tag.Get("db")
	}
	return columns
}
