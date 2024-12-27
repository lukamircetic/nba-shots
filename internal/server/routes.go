package server

import (
	"encoding/json"
	"log"
	"nba-shots/internal/types"
	"net/http"

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
