package server

import (
	"errors"
	"fmt"
	"log"
	"nba-shots/internal/types"
	"net/http"
	"strconv"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/render"
)

type PlayerResponse struct {
	*types.Player
	Elapsed int64 `json:"elapsed"`
}

func NewPlayerListResponse(players *[]types.Player) []render.Renderer {
	list := []render.Renderer{}
	for _, player := range *players {
		list = append(list, NewPlayerResponse(&player))
	}
	return list
}

func NewPlayerResponse(player *types.Player) *PlayerResponse {
	resp := &PlayerResponse{
		Player: player,
	}
	return resp
}

func (rd *PlayerResponse) Render(w http.ResponseWriter, r *http.Request) error {
	rd.Elapsed = 10
	return nil
}

func (s *Server) getPlayerByIDHandler(w http.ResponseWriter, r *http.Request) {
	// 1 - parse the playerID from the URL
	playerId, err := strconv.Atoi(chi.URLParam(r, "playerID"))

	log.Println("Parsed playerId from url: ", playerId)
	if err != nil {
		render.Render(w, r, ErrInvalidRequest(err))
		return
	}

	// 2 - send the playerID to the db service to get the player
	player, err := s.db.GetPlayerByID(playerId)

	if err != nil {
		render.Render(w, r, ErrInternalServer(err))
		return
	}
	log.Println("Player received from db: ", player.Name)

	// 3 - send the player back to the client
	err = render.Render(w, r, NewPlayerResponse(player))
	if err != nil {
		render.Render(w, r, ErrRender(err))
		return
	}
}

func (s *Server) getPlayerByNameHandler(w http.ResponseWriter, r *http.Request) {
	playerName := r.URL.Query().Get("name")
	playerName = fmt.Sprintf("%%%s%%", playerName)
	if playerName == "" {
		err := errors.New("missing required name query parameter")
		render.Render(w, r, ErrInvalidRequest(err))
		return
	}

	players, err := s.db.GetPlayersByName(playerName)

	if err != nil {
		render.Render(w, r, ErrInternalServer(err))
		return
	}

	err = render.RenderList(w, r, NewPlayerListResponse(&players))
	if err != nil {
		render.Render(w, r, ErrRender(err))
		return
	}
}
