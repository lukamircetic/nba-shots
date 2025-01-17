import { format } from "date-fns"

export const saveAsJSON = (
  shotData: any[],
  selectedPlayers?: any[],
  selectedTeams?: any[],
  selectedSeasons?: any[],
  opponents?: any[],
  startDate?: Date,
  endDate?: Date,
  gameLocation?: string,
  quarter?: any[],
  startTimeLeft?: Date,
  endTimeLeft?: Date,
  filename: string = 'shot-data.json' // TODO: make this dynamic to the filters
) => {
  const jsonData = JSON.stringify({
    players: selectedPlayers,
    teams: selectedTeams,
    seasons: selectedSeasons,
    opposingTeams: opponents,
    startDate: startDate ? format(startDate, "yyyy-MM-dd") : undefined,
    endDate: endDate ? format(endDate, "yyyy-MM-dd") : undefined,
    gameLocation: gameLocation,
    quarters: quarter,
    startTimeLeft: startTimeLeft ? format(startTimeLeft, "mm:ss") : undefined,
    endTimeLeft: endTimeLeft ? format(endTimeLeft, "mm:ss") : undefined,
    shots: shotData,
  }, null, 2)
  const blob = new Blob([jsonData], {type: 'application/json'})
  const url = URL.createObjectURL(blob)

  const link = document.createElement('a')
  link.href = url
  link.download = filename

  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)

  URL.revokeObjectURL(url)
}
