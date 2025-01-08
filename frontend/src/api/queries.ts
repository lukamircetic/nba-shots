type PlayerResponse = {
  id: number,
  name: string,
  elapsed: number,
}

type TeamResponse = {
  id: number,
  name: string,
  abbreviation: string,
  elapsed: number,
}

type SeasonResponse = {
  id: number,
  season_years: string,
  elapsed: number,
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