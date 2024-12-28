package server

import (
	"encoding/json"
	"log"
	"nba-shots/internal/types"
	"net/http"
	"time"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
	"github.com/go-chi/cors"
)

func (s *Server) RegisterRoutes() http.Handler {
	r := chi.NewRouter()
	r.Use(middleware.Logger)

	r.Use(cors.Handler(cors.Options{
		AllowedOrigins:   []string{"https://*", "http://*"},
		AllowedMethods:   []string{"GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"},
		AllowedHeaders:   []string{"Accept", "Authorization", "Content-Type"},
		AllowCredentials: true,
		MaxAge:           300,
	}))

	r.Get("/", s.HelloWorldHandler)

	r.Get("/health", s.healthHandler)
	r.Get("/players", s.InsertPlayersHandler)
	r.Get("/teams", s.InsertTeamsHandler)
	r.Get("/seasons", s.InsertSeasonHandler)
	r.Get("/games", s.InsertGamesHandler)
	r.Get("/shots", s.InsertShotsHandler)

	return r
}

func (s *Server) HelloWorldHandler(w http.ResponseWriter, r *http.Request) {
	resp := make(map[string]string)
	resp["message"] = "Hello World"

	jsonResp, err := json.Marshal(resp)
	if err != nil {
		log.Fatalf("error handling JSON marshal. Err: %v", err)
	}

	_, _ = w.Write(jsonResp)
}

func (s *Server) healthHandler(w http.ResponseWriter, r *http.Request) {
	jsonResp, _ := json.Marshal(s.db.Health())
	_, _ = w.Write(jsonResp)
}

func (s *Server) InsertPlayersHandler(w http.ResponseWriter, r *http.Request) {
	// Decode the request body
	var players = make([]types.Player, 3)
	players[0] = types.Player{ID: 1, Name: "LeBron James"}
	players[1] = types.Player{ID: 2, Name: "Anthony Davis"}
	players[2] = types.Player{ID: 3, Name: "Nikola Jokic"}

	// Insert the players
	err := s.db.InsertPlayers(players)
	if err != nil {
		log.Fatalf("error inserting players: %v", err)
		http.Error(w, "error inserting players", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusCreated)
}

func (s *Server) InsertTeamsHandler(w http.ResponseWriter, r *http.Request) {
	// Decode the request body
	var teams = make([]types.Team, 3)
	teams[0] = types.Team{ID: 1, Name: "Los Angeles Lakers"}
	teams[1] = types.Team{ID: 2, Name: "Denver Nuggets"}
	teams[2] = types.Team{ID: 3, Name: "Utah Jazz"}
	// Insert the players
	err := s.db.InsertTeams(teams)
	if err != nil {
		log.Fatalf("error inserting players: %v", err)
		http.Error(w, "error inserting players", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusCreated)
}

func (s *Server) InsertSeasonHandler(w http.ResponseWriter, r *http.Request) {
	// Decode the request body
	var seasons = make([]types.Season, 3)
	seasons[0] = types.Season{ID: 1, SeasonEndYear: 2021, SeasonYears: "2020-21"}
	seasons[1] = types.Season{ID: 2, SeasonEndYear: 2022, SeasonYears: "2021-22"}
	seasons[2] = types.Season{ID: 3, SeasonEndYear: 2023, SeasonYears: "2022-23"}
	// Insert the players
	err := s.db.InsertSeasons(seasons)
	if err != nil {
		log.Fatalf("error inserting seasons: %v", err)
		http.Error(w, "error inserting seasons", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusCreated)
}

func (s *Server) InsertGamesHandler(w http.ResponseWriter, r *http.Request) {
	// Decode the request body
	var games = make([]types.Game, 3)
	layout := "2006-01-02"
	date, err := time.Parse(layout, "2021-10-19")
	if err != nil {
		log.Fatalf("error parsing date: %v", err)
		http.Error(w, "error parsing date", http.StatusInternalServerError)
		return
	}
	games[0] = types.Game{ID: 1, HomeTeamID: 1, AwayTeamID: 2, SeasonID: 1, GameDate: date}
	games[1] = types.Game{ID: 2, HomeTeamID: 2, AwayTeamID: 3, SeasonID: 1, GameDate: date}
	games[2] = types.Game{ID: 3, HomeTeamID: 3, AwayTeamID: 1, SeasonID: 1, GameDate: date}
	// Insert the players
	err = s.db.InsertGames(games)
	if err != nil {
		log.Fatalf("error inserting players: %v", err)
		http.Error(w, "error inserting players", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusCreated)
}

func (s *Server) InsertShotsHandler(w http.ResponseWriter, r *http.Request) {
	// Decode the request body
	var shots = make([]types.Shot, 3)
	shots[0] = types.Shot{PlayerID: 1, GameID: 1, TeamID: 1, SeasonID: 1, EventType: "2pt", ShotMade: true, ActionType: "jump shot", ShotType: "2pt", ZoneName: "left wing", ZoneABB: "LW", ZoneRange: "24+", LocX: 0.0, LocY: 0.0, ShotDistance: 24, Quarter: 1, MinsLeft: 11, SecsLeft: 59, Position: "F", PositionGroup: "F"}
	shots[1] = types.Shot{PlayerID: 2, GameID: 1, TeamID: 1, SeasonID: 1, EventType: "3pt", ShotMade: false, ActionType: "jump shot", ShotType: "3pt", ZoneName: "right wing", ZoneABB: "RW", ZoneRange: "24+", LocX: 0.0, LocY: 0.0, ShotDistance: 24, Quarter: 1, MinsLeft: 11, SecsLeft: 59, Position: "F", PositionGroup: "F"}
	shots[2] = types.Shot{PlayerID: 3, GameID: 1, TeamID: 1, SeasonID: 1, EventType: "2pt", ShotMade: true, ActionType: "jump shot", ShotType: "2pt", ZoneName: "top of the key", ZoneABB: "TK", ZoneRange: "24+", LocX: 0.0, LocY: 0.0, ShotDistance: 24, Quarter: 1, MinsLeft: 11, SecsLeft: 59, Position: "F", PositionGroup: "F"}
	// Insert the players
	err := s.db.InsertShots(shots)
	if err != nil {
		log.Fatalf("error inserting players: %v", err)
		http.Error(w, "error inserting players", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusCreated)
}

/// curl -X POST http://localhost:8080/players
