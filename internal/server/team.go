package server

import (
	"log"
	"nba-shots/internal/types"
	"net/http"
	"strconv"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/render"
)

type TeamResponse struct {
	*types.Team
	Elapsed int64 `json:"elapsed"`
}

func NewTeamListResponse(teams *[]types.Team) []render.Renderer {
	list := []render.Renderer{}
	for _, team := range *teams {
		list = append(list, NewTeamResponse(&team))
	}
	return list
}

func NewTeamResponse(team *types.Team) *TeamResponse {
	resp := &TeamResponse{
		Team: team,
	}
	return resp
}

func (rd *TeamResponse) Render(w http.ResponseWriter, r *http.Request) error {
	rd.Elapsed = 10
	return nil
}

func (s *Server) getTeamByIDHandler(w http.ResponseWriter, r *http.Request) {
	// 1 - parse the teamID from the URL
	teamId, err := strconv.Atoi(chi.URLParam(r, "teamID"))

	log.Println("Parsed teamId from url: ", teamId)
	if err != nil {
		render.Render(w, r, ErrInvalidRequest(err))
		return
	}

	// 2 - send the teamID to the db service to get the team
	team, err := s.db.GetTeamByID(teamId)

	if err != nil {
		render.Render(w, r, ErrInternalServer(err))
		return
	}
	log.Println("Team received from db: ", team.Name)

	// 3 - send the team back to the client
	err = render.Render(w, r, NewTeamResponse(team))
	if err != nil {
		render.Render(w, r, ErrRender(err))
		return
	}
}

func (s *Server) getAllTeamsHandler(w http.ResponseWriter, r *http.Request) {
	teams, err := s.db.GetAllTeams()

	if err != nil {
		render.Render(w, r, ErrInternalServer(err))
		return
	}

	err = render.RenderList(w, r, NewTeamListResponse(&teams))
	if err != nil {
		render.Render(w, r, ErrRender(err))
		return
	}
}
