export const saveAsJSON = (
  selectedPlayers: any[],
  selectedTeams: any[],
  selectedSeasons: any[],
  shotData: any[],
  filename: string = 'shot-data.json' // TODO: make this dynamic to the filters
) => {
  const jsonData = JSON.stringify({
    players: selectedPlayers,
    teams: selectedTeams,
    seasons: selectedSeasons,
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
