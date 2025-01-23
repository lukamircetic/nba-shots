import { format } from "date-fns"


function getBackendUrl() {
  return import.meta.env.VITE_ENV === "prod"
    ? import.meta.env.VITE_BACKEND_URL_PROD
    : import.meta.env.VITE_BACKEND_URL_DEV;
}

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

type Shot = {
  id: number
  loc_x: number
  loc_y: number
  shot_made: boolean
  shot_type: string
}

type ShotResponse = {
  total_made_shots: number
  total_missed_shots: number
  made_2pt_shots: number
  missed_2pt_shots: number
  made_3pt_shots: number
  missed_3pt_shots: number
  shots: Shot[]
}

export async function fetchPlayersByName(name: string) {
  const url = getBackendUrl()
  console.log(url)
  const response = await fetch(`${url}/player?name=${name}`)
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
  const url = getBackendUrl()
  console.log(url)
  const response = await fetch(
    `${url}/player/multi?player_id=${playerIds}`,
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
  const url = getBackendUrl()
  console.log(url)
  const response = await fetch(`${url}/team/all`)
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
  const url = getBackendUrl()
  console.log(url)
  const response = await fetch(`${url}/season/all`)
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
  sTL?: Date | undefined,
  eTL?: Date | undefined,
) {
  const url = getBackendUrl()
  console.log(url)
  let queryString = `${url}/shots` + "?"
  let filters = {
    player_id: players ? createIdFilterString(players) : undefined,
    team_id: teams ? createIdFilterString(teams) : undefined,
    season: seasons ? createIdFilterString(seasons) : undefined,
    opposing_team_id: opp ? createIdFilterString(opp) : undefined,
    start_game_date: sDate ? format(sDate, "yyyy-MM-dd") : undefined,
    end_game_date: eDate ? format(eDate, "yyyy-MM-dd") : undefined,
    game_location: gLoc ? gLoc : undefined,
    quarter: qtr ? createIdFilterString(qtr) : undefined,
    start_time_left: sTL ? format(sTL, "mm:ss") : undefined,
    end_time_left: eTL ? format(eTL, "mm:ss") : undefined,
  }

  Object.entries(filters).forEach(([key, value]) => {
    if (value) {
      queryString += `&${key}=${value}`
    }
  })

  const response = await fetch(queryString)
  const data: ShotResponse = await response.json()

  if (!response.ok) {
    throw new Error("Failed to fetch teams")
  }

  const pctTotal =
    data.shots.length > 0
      ? (data.total_made_shots / data.shots.length) * 100
      : 0

  const total2PtShots = data.made_2pt_shots + data.missed_2pt_shots
  const pct2Pt =
    total2PtShots > 0
      ? (data.made_2pt_shots / (data.made_2pt_shots + data.missed_2pt_shots)) *
        100
      : 0

  const total3PtShots = data.made_3pt_shots + data.missed_3pt_shots
  const pct3Pt =
    total3PtShots > 0
      ? (data.made_3pt_shots / (data.made_3pt_shots + data.missed_3pt_shots)) *
        100
      : 0

  return {
    totalMadeShots: data.total_made_shots,
    totalMissedShots: data.total_missed_shots,
    totalShots: data.shots.length,
    pctTotal: Math.round(pctTotal),
    made2PtShots: data.made_2pt_shots,
    missed2PtShots: data.missed_2pt_shots,
    total2PtShots: total2PtShots,
    pct2Pt: Math.round(pct2Pt),
    made3PtShots: data.made_3pt_shots,
    missed3PtShots: data.missed_3pt_shots,
    total3PtShots: total3PtShots,
    pct3Pt: Math.round(pct3Pt),
    shots: data.shots.map((shot) => ({
      id: shot.id.toString(),
      locX: shot.loc_x,
      locY: shot.loc_y,
      shotMade: shot.shot_made,
      shotType: shot.shot_type,
    })),
  }
}

function createIdFilterString(arr: HasId[]) {
  return arr?.map((item) => item.id).join(",")
}
