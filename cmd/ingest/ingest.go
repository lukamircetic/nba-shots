package main

import (
	"encoding/csv"
	"log"
	"nba-shots/internal/database"
	"nba-shots/internal/types"
	"os"
	"path/filepath"
	"strconv"
	"time"
)

// toggle whether to insert or not
const (
	uploadPlayers       = false
	uploadTeams         = false
	uploadSeasons       = false
	uploadGames         = false
	uploadShots         = false
	uploadPlayerTeams   = false
	uploadPlayerSeasons = false
	uploadPlayerGames   = false
	uploadTeamSeasons   = false
	uploadTeamGames     = false
	uploadGameSeasons   = false
)

type rawShotData struct {
	PlayerID      int       `db:"player_id"`
	PlayerName    string    `db:"player_name"`
	GameID        int       `db:"game_id"`
	TeamID        int       `db:"team_id"`
	TeamName      string    `db:"team_name"`
	SeasonEndYear int       `db:"season_end_year"`
	SeasonYears   string    `db:"season_years"`
	EventType     string    `db:"event_type"`
	ShotMade      bool      `db:"shot_made"`
	ActionType    string    `db:"action_type"`
	ShotType      string    `db:"shot_type"`
	BasicZone     string    `db:"basic_zone"`
	ZoneName      string    `db:"zone_name"`
	ZoneABB       string    `db:"zone_abb"`
	ZoneRange     string    `db:"zone_range"`
	LocX          float64   `db:"loc_x"`
	LocY          float64   `db:"loc_y"`
	ShotDistance  int       `db:"shot_distance"`
	Quarter       int       `db:"qtr"`
	MinsLeft      int       `db:"mins_left"`
	SecsLeft      int       `db:"secs_left"`
	Position      string    `db:"position"`
	PositionGroup string    `db:"position_group"`
	GameDate      time.Time `db:"game_date"`
	HomeTeam      string    `db:"home_team"`
	AwayTeam      string    `db:"away_team"`
}

func main() {
	log.Println("Starting ingest script 1")

	dbService := database.New()
	defer dbService.Close()

	// query the database to confirm that the tables are empty
	dbEmpty, err := dbService.IsEmptyDatabase()

	if err != nil {
		log.Fatalf("error checking if database is empty: %v", err)
	}

	if dbEmpty {
		allData, seasons := readAndParseShotsCSV()

		if uploadPlayers {
			// get all unique players
			players := allPlayers(allData)
			log.Println("Total parsed players: ", len(*players))
			// insert into db
			log.Println("Inserting players to the database...")
			err := dbService.InsertPlayers(*players)
			// log.Println("Commit transaction error for players: ", err)
			if err != nil {
				log.Fatalf("error inserting players: %v", err)
			}
			log.Printf("Inserted %v players to the players table\n", len(*players))
		}

		if uploadTeams {
			// get all unique teams
			teams := allTeams(allData)
			log.Println("Total teams: ", len(*teams))

			// insert into db
			log.Println("Inserting teams to the database...")
			err := dbService.InsertTeams(*teams)
			if err != nil {
				log.Fatalf("error inserting teams: %v", err)
			}
			log.Printf("Inserted %v teams to the database\n", len(*teams))
		}

		if uploadSeasons {
			// all unique seasons
			log.Println("Total seasons: ", len(*seasons))
			log.Println("Inserting seasons to the database...")
			err := dbService.InsertSeasons(*seasons)
			if err != nil {
				log.Fatalf("error inserting seasons: %v", err)
			}
			log.Printf("Inserted %v seasons to the database\n", len(*seasons))
		}

		if uploadGames {
			// get all unique games
			games := allGames(allData)
			log.Println("Total games: ", len(*games))
			// insert into db
			log.Println("Inserting games to the database...")
			err := dbService.InsertGames(*games)
			if err != nil {
				log.Fatalf("error inserting games: %v", err)
			}
			log.Printf("Inserted %v games to the database\n", len(*games))
		}

		if uploadShots {
			// get cleaned shots data
			shots := allShots(allData)
			log.Println("Total shots: ", len(*shots))
			// insert into db
			log.Println("Inserting shots to the database...")
			err := dbService.InsertShots(*shots)
			if err != nil {
				log.Fatalf("error inserting shots: %v", err)
			}
			log.Printf("Inserted %v shots to the database\n", len(*shots))
		}

		if uploadPlayerTeams {
			playerTeams := allPlayerTeams(allData)
			log.Println("Total playerTeams: ", len(*playerTeams))
			// insert into db
			log.Println("Inserting shots to the database...")
			err := dbService.InsertPlayerTeams(*playerTeams)
			if err != nil {
				log.Fatalf("error inserting playerSeasons: %v", err)
			}
			log.Printf("Inserted %v player teams to the database\n", len(*playerTeams))
		}

		if uploadPlayerSeasons {
			playerSeasons := allPlayerSeasons(allData)
			log.Println("Total playerSeasons: ", len(*playerSeasons))
			// insert into db
			log.Println("Inserting player seasons to the database...")
			err := dbService.InsertPlayerSeasons(*playerSeasons)
			if err != nil {
				log.Fatalf("error inserting playerSeasons: %v", err)
			}
			log.Printf("Inserted %v player seasons to the database\n", len(*playerSeasons))
		}

		if uploadPlayerGames {
			playerGames := allPlayerGames(allData)
			log.Println("Total playerGames: ", len(*playerGames))
			// insert into db
			log.Println("Inserting playerGames to the database...")
			err := dbService.InsertPlayerGames(*playerGames)
			if err != nil {
				log.Fatalf("error inserting playerGames: %v", err)
			}
			log.Printf("Inserted %v player games to the database\n", len(*playerGames))
		}

		if uploadTeamSeasons {
			teamSeasons := allTeamSeasons(allData)
			log.Println("Total teamSeasons: ", len(*teamSeasons))
			// insert into db
			log.Println("Inserting teamSeasons to the database...")
			err := dbService.InsertTeamSeasons(*teamSeasons)
			if err != nil {
				log.Fatalf("error inserting teamSeasons: %v", err)
			}
			log.Printf("Inserted %v team seasons to the database\n", len(*teamSeasons))
		}

		if uploadTeamGames {
			teamGames := allTeamGames(allData)
			log.Println("Total teamGames: ", len(*teamGames))
			// insert into db
			log.Println("Inserting teamGames to the database...")
			err := dbService.InsertTeamGames(*teamGames)
			if err != nil {
				log.Fatalf("error inserting teamGames: %v", err)
			}
			log.Printf("Inserted %v team games to the database\n", len(*teamGames))
		}

		if uploadGameSeasons {
			gameSeasons := allGameSeasons(allData)
			log.Println("Total gameSeasons: ", len(*gameSeasons))
			// insert into db
			log.Println("Inserting gameSeasons to the database...")
			err := dbService.InsertGameSeasons(*gameSeasons)
			if err != nil {
				log.Fatalf("error inserting gameSeasons: %v", err)
			}
			log.Printf("Inserted %v game seasons to the database\n", len(*gameSeasons))
		}

	}
}

func readAndParseShotsCSV() (*[]rawShotData, *[]types.Season) {
	// need to fix something with docker taking up a lot of disk space and it might be related to these files
	// docker system prune -a -> this command removed 65gb lol
	dataDir := filepath.Join("raw_data", "nbashots")
	files, err := filepath.Glob(filepath.Join(dataDir, "*.csv"))

	log.Println("Files in filepath: ", files)
	if err != nil {
		log.Fatalf("could not read CSV files from directory %s. Err: %v", dataDir, err)
	}

	// need to combine all the shot records from one csv into a single slice
	// then from there we will process the data for player, team, season, game
	// once those tables are populated then shot can be populated
	var all_data []rawShotData
	var seasons []types.Season
	for _, file := range files {
		f, err := os.Open(file)

		if err != nil {
			log.Fatalf("could not open file %s. Err: %v", file, err)
		}
		defer f.Close()

		reader := csv.NewReader(f)
		records, err := reader.ReadAll()

		if err != nil {
			log.Fatalf("could not read CSV file %s. Err: %v", file, err)
		}

		for j, r := range records[1:] {
			typedRow := parseShotRow(r)
			all_data = append(all_data, typedRow)

			// get the season data from this file since it will be the same for all records
			if j == 0 {
				seasons = append(seasons, types.Season{
					Year:        typedRow.SeasonEndYear,
					SeasonYears: typedRow.SeasonYears,
				})
			}
		}

		f.Close()
	}
	log.Println("Total records: ", len(all_data))
	return &all_data, &seasons
}

func parseShotRow(row []string) rawShotData {
	seasonEndYear, _ := strconv.Atoi(row[0])
	teamID, _ := strconv.Atoi(row[2])
	playerID, _ := strconv.Atoi(row[4])
	gameID, _ := strconv.Atoi(row[9])
	shotMade, _ := strconv.ParseBool(row[13])
	locX, _ := strconv.ParseFloat(row[20], 64)
	locY, _ := strconv.ParseFloat(row[21], 64)
	shotDistance, _ := strconv.Atoi(row[22])
	quarter, _ := strconv.Atoi(row[23])
	minsLeft, _ := strconv.Atoi(row[24])
	secsLeft, _ := strconv.Atoi(row[25])
	gameDate, _ := time.Parse("01-02-2006", row[8])

	return rawShotData{
		SeasonEndYear: seasonEndYear,
		SeasonYears:   row[1],
		TeamID:        teamID,
		TeamName:      row[3],
		PlayerID:      playerID,
		PlayerName:    row[5],
		PositionGroup: row[6],
		Position:      row[7],
		GameDate:      gameDate,
		GameID:        gameID,
		HomeTeam:      row[10],
		AwayTeam:      row[11],
		EventType:     row[12],
		ShotMade:      shotMade,
		ActionType:    row[14],
		ShotType:      row[15],
		BasicZone:     row[16],
		ZoneName:      row[17],
		ZoneABB:       row[18],
		ZoneRange:     row[19],
		LocX:          locX,
		LocY:          locY,
		ShotDistance:  shotDistance,
		Quarter:       quarter,
		MinsLeft:      minsLeft,
		SecsLeft:      secsLeft,
	}
}

func allPlayers(data *[]rawShotData) *[]types.Player {
	seenPlayers := make(map[int]bool)
	var uniquePlayers []types.Player
	for _, shot := range *data {
		if !seenPlayers[shot.PlayerID] {
			seenPlayers[shot.PlayerID] = true
			uniquePlayers = append(uniquePlayers, types.Player{
				ID:   shot.PlayerID,
				Name: shot.PlayerName,
			})
		}
	}
	return &uniquePlayers
}

// for now i will keep the latest team name with the team
func allTeams(data *[]rawShotData) *[]types.Team {
	seenTeams := make(map[int]string)

	var uniqueTeams []types.Team
	for _, shot := range *data {
		if seenTeams[shot.TeamID] != shot.TeamName {
			seenTeams[shot.TeamID] = shot.TeamName
		}
	}

	for teamID, teamName := range seenTeams {
		uniqueTeams = append(uniqueTeams, types.Team{
			ID:           teamID,
			Name:         teamName,
			Abbreviation: teamIDAbbrev[teamID],
		})
	}
	return &uniqueTeams
}

// theres 5 games in 2021 with the same game_id - i'll deal with those later
/*
GAME_ID	GAME_DATE	HOME_TEAM	AWAY_TEAM	SEASON_1	SEASON_2
3575310	22000000	2020-12-25	MIA	NOP	2021	2020-21
3576179	22000000	2020-12-23	PHX	DAL	2021	2020-21
3576180	22000000	2020-12-23	BOS	MIL	2021	2020-21
3578254	22000000	2020-12-22	BKN	GSW	2021	2020-21
3578256	22000000	2020-12-22	LAL	LAC	2021	2020-21
*/
func allGames(data *[]rawShotData) *[]types.Game {
	seenGames := make(map[int]bool)
	var uniqueGames []types.Game
	for _, shot := range *data {
		if !seenGames[shot.GameID] {
			seenGames[shot.GameID] = true
			uniqueGames = append(uniqueGames, types.Game{
				ID:         shot.GameID,
				HomeTeamID: teamAbbrevID[shot.HomeTeam],
				AwayTeamID: teamAbbrevID[shot.AwayTeam],
				SeasonYear: shot.SeasonEndYear,
				GameDate:   shot.GameDate,
			})
		}
	}
	return &uniqueGames
}

func allShots(data *[]rawShotData) *[]types.Shot {
	var formattedShots []types.Shot
	for _, shot := range *data {
		formattedShots = append(formattedShots, types.Shot{
			PlayerID:          shot.PlayerID,
			GameID:            shot.GameID,
			TeamID:            shot.TeamID,
			HomeTeamID:        teamAbbrevID[shot.HomeTeam],
			AwayTeamID:        teamAbbrevID[shot.AwayTeam],
			SeasonYear:        shot.SeasonEndYear,
			EventType:         shot.EventType,
			ShotMade:          shot.ShotMade,
			ActionType:        shot.ActionType,
			ShotType:          shot.ShotType,
			BasicZone:         shot.BasicZone,
			ZoneName:          shot.ZoneName,
			ZoneABB:           shot.ZoneABB,
			ZoneRange:         shot.ZoneRange,
			LocX:              shot.LocX,
			LocY:              shot.LocY,
			ShotDistance:      shot.ShotDistance,
			Quarter:           shot.Quarter,
			MinsLeft:          shot.MinsLeft,
			SecsLeft:          shot.SecsLeft,
			TotalTimeLeftSecs: generateTotalTimeInSecs(shot.MinsLeft, shot.SecsLeft),
			Position:          shot.Position,
			PositionGroup:     shot.PositionGroup,
			GameDate:          shot.GameDate,
		})
	}
	return &formattedShots
}

func generateTotalTimeInSecs(minLeft int, secLeft int) int {
	return (minLeft * 60) + secLeft
}

func allPlayerTeams(data *[]rawShotData) *[]types.PlayerTeam {
	var playerTeams []types.PlayerTeam

	// for each team check if that player has played for them
	playersOnTeams := make(map[int]map[int]string)
	for _, shot := range *data {
		if playersOnTeams[shot.TeamID] == nil {
			playersOnTeams[shot.TeamID] = make(map[int]string)
		}
		playersOnTeams[shot.TeamID][shot.PlayerID] = shot.TeamName
	}

	for teamId, players := range playersOnTeams {
		for playerId, teamName := range players {
			if teamName != "" {
				playerTeams = append(playerTeams, types.PlayerTeam{
					PlayerID: playerId,
					TeamID:   teamId,
					TeamName: teamName,
				})
			}
		}
	}
	return &playerTeams
}

func allPlayerSeasons(data *[]rawShotData) *[]types.PlayerSeason {
	// for each player check if they have played in that season
	playerSeasons := make(map[int]map[int]bool)
	for _, shot := range *data {
		if playerSeasons[shot.PlayerID] == nil {
			playerSeasons[shot.PlayerID] = make(map[int]bool)
		}
		playerSeasons[shot.PlayerID][shot.SeasonEndYear] = true
	}

	var playerSeason []types.PlayerSeason
	for playerId, seasons := range playerSeasons {
		for year, played := range seasons {
			if played {
				playerSeason = append(playerSeason, types.PlayerSeason{
					PlayerID:   playerId,
					SeasonYear: year,
				})
			}
		}
	}
	return &playerSeason
}

func allPlayerGames(data *[]rawShotData) *[]types.PlayerGame {
	playerGames := make(map[int]map[int]time.Time)

	for _, shot := range *data {
		if playerGames[shot.PlayerID] == nil {
			playerGames[shot.PlayerID] = make(map[int]time.Time)
		}
		playerGames[shot.PlayerID][shot.GameID] = shot.GameDate
	}

	var playerGame []types.PlayerGame
	for playerId, games := range playerGames {
		for gameId, gameDate := range games {
			playerGame = append(playerGame, types.PlayerGame{
				PlayerID: playerId,
				GameID:   gameId,
				GameDate: gameDate,
			})

		}
	}
	return &playerGame
}

func allTeamSeasons(data *[]rawShotData) *[]types.TeamSeason {
	teamSeasons := make(map[int]map[int]string)

	for _, shot := range *data {
		if teamSeasons[shot.TeamID] == nil {
			teamSeasons[shot.TeamID] = make(map[int]string)
		}
		teamSeasons[shot.TeamID][shot.SeasonEndYear] = shot.TeamName
	}

	var teamSeason []types.TeamSeason
	for teamId, seasons := range teamSeasons {
		for year, name := range seasons {
			if name != "" {
				teamSeason = append(teamSeason, types.TeamSeason{
					TeamID:     teamId,
					SeasonYear: year,
					TeamName:   name,
				})
			}
		}
	}
	return &teamSeason
}

func allTeamGames(data *[]rawShotData) *[]types.TeamGame {
	teamGames := make(map[int]map[int]time.Time)

	for _, shot := range *data {
		if teamGames[shot.TeamID] == nil {
			teamGames[shot.TeamID] = make(map[int]time.Time)
		}
		teamGames[shot.TeamID][shot.GameID] = shot.GameDate
	}

	var teamGame []types.TeamGame
	for teamId, games := range teamGames {
		for gameId, gameDate := range games {
			teamGame = append(teamGame, types.TeamGame{
				TeamID:   teamId,
				GameID:   gameId,
				GameDate: gameDate,
			})
		}
	}
	return &teamGame
}

func allGameSeasons(data *[]rawShotData) *[]types.GameSeason {
	gameSeasons := make(map[int]map[int]bool)
	for _, shot := range *data {
		if gameSeasons[shot.GameID] == nil {
			gameSeasons[shot.GameID] = make(map[int]bool)
		}
		gameSeasons[shot.GameID][shot.SeasonEndYear] = true
	}

	var gameSeasonsList []types.GameSeason
	for gameId, seasons := range gameSeasons {
		for year, played := range seasons {
			if played {
				gameSeasonsList = append(gameSeasonsList, types.GameSeason{
					GameID:     gameId,
					SeasonYear: year,
				})
			}
		}
	}
	return &gameSeasonsList
}

var teamIDAbbrev = map[int]string{
	1610612747: "LAL",
	1610612757: "POR",
	1610612737: "ATL",
	1610612738: "BOS",
	1610612743: "DEN",
	1610612759: "SAS",
	1610612762: "UTA",
	1610612763: "MEM",
	1610612741: "CHI",
	1610612751: "BKN",
	1610612750: "MIN",
	1610612748: "MIA",
	1610612756: "PHX",
	1610612745: "HOU",
	1610612755: "PHI",
	1610612764: "WAS",
	1610612754: "IND",
	1610612740: "NOP",
	1610612746: "LAC",
	1610612760: "OKC",
	1610612758: "SAC",
	1610612742: "DAL",
	1610612744: "GSW",
	1610612753: "ORL",
	1610612749: "MIL",
	1610612761: "TOR",
	1610612752: "NYK",
	1610612739: "CLE",
	1610612765: "DET",
	1610612766: "CHA",
}

var teamAbbrevID = map[string]int{
	"LAL": 1610612747,
	"POR": 1610612757,
	"ATL": 1610612737,
	"BOS": 1610612738,
	"DEN": 1610612743,
	"SAS": 1610612759,
	"UTA": 1610612762,
	"MEM": 1610612763,
	"CHI": 1610612741,
	"BKN": 1610612751,
	"MIN": 1610612750,
	"MIA": 1610612748,
	"PHX": 1610612756,
	"HOU": 1610612745,
	"PHI": 1610612755,
	"WAS": 1610612764,
	"IND": 1610612754,
	"NOP": 1610612740,
	"LAC": 1610612746,
	"OKC": 1610612760,
	"SAC": 1610612758,
	"DAL": 1610612742,
	"GSW": 1610612744,
	"ORL": 1610612753,
	"MIL": 1610612749,
	"TOR": 1610612761,
	"NYK": 1610612752,
	"CLE": 1610612739,
	"DET": 1610612765,
	"CHA": 1610612766,
	"SEA": 1610612760,
	"NOH": 1610612740,
	"NJN": 1610612751,
	"NOK": 1610612740,
}

// [ .csv format of ingest data
// 0 SEASON_1: 2004
// 1 SEASON_2: 2003-04
// 2 TEAM_ID: 1610612747
// 3 TEAM_NAME: Los Angeles Lakers
// 4 PLAYER_ID: 977
// 5 PLAYER_NAME: Kobe Bryant
// 6 POSITION_GROUP: G
// 7 POSITION: SG
// 8 GAME_DATE: 04-14-2004
// 9 GAME_ID: 20301187
// 10 HOME_TEAM: POR
// 11 AWAY_TEAM: LAL
// 12 EVENT_TYPE: Made Shot
// 13 SHOT_MADE: TRUE
// 14 ACTION_TYPE: Jump Shot
// 15 SHOT_TYPE: 3PT Field Goal
// 16 BASIC_ZONE: Above the Break 3
// 17 ZONE_NAME: Left Side Center
// 18 ZONE_ABB: LC
// 19 ZONE_RANGE: 24+ ft.
// 20 LOC_X: 20
// 21 LOC_Y: 21.35
// 22 SHOT_DISTANCE: 25
// 23 QUARTER: 6
// 24 MINS_LEFT: 0
// 25 SECS_LEFT: 0
// ]
