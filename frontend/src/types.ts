export type ShotResponse = {
  id: number
  loc_x: number
  loc_y: number
  shot_made: boolean
  shot_type: string
}

export type ShotResponseMetadata = {
  total_made_shots: number
  total_missed_shots: number
  made_2pt_shots: number
  missed_2pt_shots: number
  made_3pt_shots: number
  missed_3pt_shots: number
  shots: ShotResponse[]
}

export type Shot = {
  id: string
  locX: number
  locY: number
  shotMade: boolean
  shotType: string
}

export type ShotData = {
  totalMadeShots: number
  totalMissedShots: number
  totalShots: number
  pctTotal: number
  made2PtShots: number
  missed2PtShots: number
  total2PtShots: number
  pct2Pt: number
  made3PtShots: number
  missed3PtShots: number
  total3PtShots: number
  pct3Pt: number
  shots: Shot[]
}

export interface HasId {
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

export interface Quarter extends HasId {
  id: string
  name: string
}

export type PlayerResponse = {
  id: number
  name: string
  elapsed?: number
}

export type TeamResponse = {
  id: number
  name: string
  abbreviation: string
  elapsed: number
}

export type SeasonResponse = {
  id: number
  season_years: string
  elapsed: number
}