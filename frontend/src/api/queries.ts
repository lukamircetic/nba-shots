import { format } from "date-fns"

interface HasId {
  id: string
}

export interface Player extends HasId {
  id: string
  name: string
}

export interface Team extends HasId {
  id: string
  name: string
}

export interface Quarter extends HasId {
  id: string
  name: string
}

export interface Season extends HasId {
  id: string
  season_years: string
}

type PlayerResponse = {
  id: number
  name: string
  elapsed: number
}

type TeamResponse = {
  id: number
  name: string
  abbreviation: string
  elapsed: number
}

type SeasonResponse = {
  id: number
  season_years: string
  elapsed: number
}

type ShotResponse = {
  id: number
  loc_x: number
  loc_y: number
  shot_made: boolean
  shot_type: string
  elapsed: number
}

export async function fetchPlayersByName(name: string) {
  const response = await fetch(`http://localhost:8080/player?name=${name}`)
  const data: PlayerResponse[] = await response.json()

  if (!response.ok) {
    throw new Error("Failed to fetch players")
  }

  return data.map((player) => ({
    id: player.id.toString(),
    name: player.name,
  }))
}

export async function fetchPlayersByIds(playerIds: string) {
  const response = await fetch(
    `http://localhost:8080/player/multi?player_id=${playerIds}`,
  )
  const data: PlayerResponse[] = await response.json()

  if (!response.ok) {
    throw new Error("Failed to fetch players")
  }

  return data.map((player) => ({
    id: player.id.toString(),
    name: player.name,
  }))
}

export async function fetchAllTeams() {
  const response = await fetch(`http://localhost:8080/team/all`)
  const data: TeamResponse[] = await response.json()

  if (!response.ok) {
    throw new Error("Failed to fetch teams")
  }

  return data.map((team) => ({
    id: team.id.toString(),
    name: team.name,
    abbreviation: team.abbreviation,
  }))
}

export async function fetchAllSeasons() {
  const response = await fetch(`http://localhost:8080/season/all`)
  const data: SeasonResponse[] = await response.json()

  if (!response.ok) {
    throw new Error("Failed to fetch seasons")
  }

  return data.map((season) => ({
    id: season.id.toString(),
    season_years: season.season_years,
  }))
}

export async function fetchShotsWithFilters(
  players?: HasId[],
  teams?: HasId[],
  seasons?: HasId[],
  opp?: HasId[],
  sDate?: Date,
  eDate?: Date,
  gLoc?: "home" | "away",
  qtr?: Quarter[],
) {
  let queryString = "http://localhost:8080/shots" + "?"
  let filters = {
    player_id: players ? createIdFilterString(players) : undefined,
    team_id: teams ? createIdFilterString(teams) : undefined,
    season: seasons ? createIdFilterString(seasons) : undefined,
    opposing_team_id: opp ? createIdFilterString(opp) : undefined,
    start_game_date: sDate ? format(sDate, "yyyy-MM-dd") : undefined,
    end_game_date: eDate ? format(eDate, "yyyy-MM-dd") : undefined,
    game_location: gLoc ? gLoc : undefined,
    quarter: qtr ? createIdFilterString(qtr) : undefined,
  }

  Object.entries(filters).forEach(([key, value]) => {
    if (value) {
      queryString += `&${key}=${value}`
    }
  })

  const response = await fetch(queryString)
  const data: ShotResponse[] = await response.json()

  if (!response.ok) {
    throw new Error("Failed to fetch teams")
  }

  return data.map((shot) => ({
    id: shot.id.toString(),
    locX: shot.loc_x,
    locY: shot.loc_y,
    shotMade: shot.shot_made,
    shotType: shot.shot_type,
  }))
}

function createIdFilterString(arr: HasId[]) {
  return arr?.map((item) => item.id).join(",")
}
