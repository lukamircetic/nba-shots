package server

import (
	"bytes"
	"encoding/json"
	"log"
	"net/http"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
	"github.com/go-chi/cors"
	"github.com/go-chi/docgen"
	"github.com/go-chi/render"
	"github.com/yuin/goldmark"
)

func (s *Server) RegisterRoutes() http.Handler {
	r := chi.NewRouter()

	r.Use(middleware.RequestID)
	r.Use(middleware.Logger)
	r.Use(middleware.Recoverer)
	r.Use(middleware.URLFormat)
	r.Use(render.SetContentType(render.ContentTypeJSON))

	r.Use(cors.Handler(cors.Options{
		AllowedOrigins:   []string{"https://*", "http://*"},
		AllowedMethods:   []string{"GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"},
		AllowedHeaders:   []string{"Accept", "Authorization", "Content-Type"},
		AllowCredentials: true,
		MaxAge:           300,
	}))

	r.Get("/health", s.healthHandler)

	r.Route("/player", func(r chi.Router) {
		r.Route("/{playerID}", func(r chi.Router) {
			r.Get("/", s.getPlayerByIDHandler)
		})
		r.Get("/", s.getPlayerByNameHandler)
		r.Get("/multi", s.GetPlayersByIDsHandler)
	})

	r.Route("/team", func(r chi.Router) {
		r.Route("/{teamID}", func(r chi.Router) {
			r.Get("/", s.getTeamByIDHandler)
		})
		r.Get("/all", s.getAllTeamsHandler)
	})

	r.Route("/season", func(r chi.Router) {
		r.Route("/{year}", func(r chi.Router) {
			r.Get("/", s.getSeasonByYearHandler)
		})
		r.Get("/all", s.getAllSeasonsHandler)
	})

	r.Route("/game", func(r chi.Router) {
		r.Route("/{gameID}", func(r chi.Router) {
			r.Get("/", s.getGameByIDHandler)
		})
		r.Get("/last/{numGames}", s.getLastXGamesHandler)
	})

	r.Route("/shots", func(r chi.Router) {
		r.Use(ShotCtx)
		r.Get("/", s.getShotsHandler)
	})

	markdownDoc := docgen.MarkdownRoutesDoc(r, docgen.MarkdownOpts{
		ProjectPath: "github.com/lukamircetic/nba-shots",
		Intro:       "Welcome to the nba-shots GO api docs",
	})
	log.Println(markdownDoc)
	var htmlBuffer bytes.Buffer
	err := goldmark.Convert([]byte(markdownDoc), &htmlBuffer)

	if err != nil {
		log.Println("Unable to convert docs into hmtl", err)
	}

	s.APIDocs = htmlBuffer.Bytes()

	r.Get("/", s.HelloWorldHandler)

	return r
}

func (s *Server) HelloWorldHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "text/html")
	_, _ = w.Write(s.APIDocs)
}

func (s *Server) healthHandler(w http.ResponseWriter, r *http.Request) {
	jsonResp, _ := json.Marshal(s.db.Health())
	_, _ = w.Write(jsonResp)
}
