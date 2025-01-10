import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../ui/accordion"
import { InputWithButton } from "../ui/inputwithbutton"
import { DataTable } from "../ui/data-table"
import { teamColumns } from "../../columndefs/team"
import { seasonColumns } from "../../columndefs/season"
import React from "react"
import { Badge } from "../ui/badge"
import { Button } from "../ui/button"
import {
  fetchAllSeasons,
  fetchAllTeams,
  fetchPlayersByName,
  fetchShotsWithFilters,
} from "@/api/queries"
import { useQuery } from "@tanstack/react-query"
import BasketballCourt from "../viz/basketball-court"
import { BadgeWithButton } from "../ui/badgewithbutton"
import { ScrollArea } from "../ui/scroll-area"
import { DestructiveButton } from "../ui/destructivebutton"

interface Player {
  id: string
  name: string
}

interface Team {
  id: string
  name: string
  abbreviation: string
}

interface Season {
  id: string
  season_years: string
}

function Home() {
  const [playerSearchKey, setPlayerSearchKey] = React.useState<string>("")
  const [selectedPlayers, setSelectedPlayers] = React.useState<Player[]>([])
  const [selectedTeams, setSelectedTeams] = React.useState<Team[]>([])
  const [selectedSeasons2, setSelectedSeasons2] = React.useState<Season[]>([])
  const [filteredPlayersMap, setFilteredPlayersMap] = React.useState<
    Map<string, string>
  >(new Map<string, string>())
  const [filteredTeamsMap, setFilteredTeamsMap] = React.useState<
    Map<string, string>
  >(new Map<string, string>())
  const [filteredSeasonsMap, setFilteredSeasonsMap] = React.useState<
    Map<string, string>
  >(new Map<string, string>())

  // Queries for filter fields
  const {
    isPending: isPlayerPending,
    isError: isPlayerError,
    data: playerData,
    error: playerError,
  } = useQuery({
    queryKey: ["players", playerSearchKey],
    queryFn: ({ queryKey }) => {
      const [, name] = queryKey
      if (name == "") return [] // probably a better way to do this
      return fetchPlayersByName(name)
    },
  })

  const {
    isPending: isTeamPending,
    isError: isTeamError,
    data: teamData,
    error: teamError,
  } = useQuery({
    queryKey: ["teams"],
    queryFn: () => fetchAllTeams(),
  })

  const {
    isPending: isSeasonPending,
    isError: isSeasonError,
    data: seasonData,
    error: seasonError,
  } = useQuery({
    queryKey: ["seasons"],
    queryFn: () => fetchAllSeasons(),
  })

  const searchedPlayers = React.useMemo(() => {
    return playerData?.filter((player) => !filteredPlayersMap.has(player.id))
  }, [selectedPlayers, playerData])
  const searchedTeams = React.useMemo(() => {
    return teamData?.filter((team) => !filteredTeamsMap.has(team.id))
  }, [selectedTeams, teamData])
  const searchedSeasons = React.useMemo(() => {
    return seasonData?.filter((season) => !filteredSeasonsMap.has(season.id))
  }, [selectedSeasons2, seasonData])

  const {
    isPending: isShotsPending,
    isFetching: isShotsFetching,
    isError: isShotsError,
    data: shotsData,
    error: shotsError,
    refetch,
  } = useQuery({
    queryKey: [selectedPlayers, selectedTeams, searchedSeasons],
    queryFn: ({ queryKey }) => {
      const [p, t, s] = queryKey
      return fetchShotsWithFilters(p, t, s)
    },
    enabled: false,
  })

  const handleGenShots = () => {
    if (!isShotsFetching) {
      refetch()
    }
  }

  const handleSelectAllPlayers = () => {
    if (!searchedPlayers) return
    for (const p of searchedPlayers) {
      handlePlayerSelection(p.id)
    }
  }

  const handlePlayerSelection = (id: string) => {
    if (filteredPlayersMap.has(id)) {
      return
    }

    const player = playerData?.find((player) => player.id == id)
    if (!player) return

    setSelectedPlayers((prevSelected) => {
      return [...prevSelected, player]
    })

    filteredPlayersMap.set(id, player.name)
  }

  const handlePlayerRemoval = (id: string) => {
    if (!filteredPlayersMap.has(id)) {
      return
    }
    setSelectedPlayers((prevSelected) => {
      return prevSelected.filter((p) => p.id !== id)
    })

    filteredPlayersMap.delete(id)
  }

  const handleSelectAllTeams = () => {
    if (!searchedTeams) return
    for (const t of searchedTeams) {
      handleTeamSelection(t.id)
    }
  }

  const handleTeamSelection = (id: string) => {
    if (filteredTeamsMap.has(id)) {
      return
    }

    const team = teamData?.find((team) => team.id == id)
    if (!team) return

    setSelectedTeams((prevSelected) => {
      return [...prevSelected, team]
    })

    filteredTeamsMap.set(id, team.name)
  }

  const handleTeamRemoval = (id: string) => {
    if (!filteredTeamsMap.has(id)) {
      return
    }
    setSelectedTeams((prevSelected) => {
      return prevSelected.filter((p) => p.id !== id)
    })

    filteredTeamsMap.delete(id)
  }

  const handleSelectAllSeasons = () => {
    if (!searchedSeasons) return
    for (const t of searchedSeasons) {
      handleSeasonSelection(t.id)
    }
  }

  const handleSeasonSelection = (id: string) => {
    if (filteredSeasonsMap.has(id)) {
      return
    }

    const season = seasonData?.find((season) => season.id == id)
    if (!season) return

    setSelectedSeasons2((prevSelected) => {
      return [...prevSelected, season]
    })

    filteredSeasonsMap.set(id, season.season_years)
  }

  const handleSeasonRemoval = (id: string) => {
    if (!filteredSeasonsMap.has(id)) {
      return
    }
    setSelectedSeasons2((prevSelected) => {
      return prevSelected.filter((p) => p.id !== id)
    })

    filteredSeasonsMap.delete(id)
  }

  return (
    <div className="relative flex min-h-svh flex-col bg-background px-14">
      <div className="flex w-full flex-col items-start justify-items-start space-y-2 py-16">
        <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl">
          nba shots
        </h1>
        <h1 className="text-lg text-muted-foreground lg:text-xl">
          advanced shot querying and visualization
        </h1>
      </div>
      <div className="flex flex-1 flex-row">
        <div className="flex w-1/4 flex-col">
          <h3 className="scroll-m-20 text-2xl font-semibold tracking-tight">
            Filters
          </h3>
          <Accordion type="multiple">
            <AccordionItem value="item-1">
              <AccordionTrigger>Players</AccordionTrigger>
              <AccordionContent>
                <div className="ml-[1px] max-w-xs space-y-4">
                  <InputWithButton
                    value={playerSearchKey}
                    setValue={setPlayerSearchKey}
                  />
                  {isPlayerPending && <div>Loading...</div>}
                  {isPlayerError && (
                    <div>{`Error fetching players: ${playerError.message}`}</div>
                  )}
                  {searchedPlayers && (
                    <div className="space-y-2">
                      <ScrollArea className="h-72">
                        <ul>
                          {searchedPlayers.map((player, key) => (
                            <li key={key}>
                              <BadgeWithButton
                                id={player.id}
                                value={player.name}
                                handleClick={handlePlayerSelection}
                              />
                            </li>
                          ))}
                        </ul>
                      </ScrollArea>
                      <Button
                        variant="default"
                        disabled={
                          !searchedPlayers || searchedPlayers.length == 0
                        }
                        onClick={() => handleSelectAllPlayers()}
                      >
                        Select All
                      </Button>
                    </div>
                  )}
                </div>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-2">
              <AccordionTrigger>Teams</AccordionTrigger>
              <AccordionContent>
                <div className="ml-[1px] max-w-sm space-y-4">
                  {isTeamPending && <div>Loading...</div>}
                  {isTeamError && (
                    <div>{`Error fetching teams: ${teamError.message}`}</div>
                  )}
                  {searchedTeams && (
                    <div className="space-y-2">
                      <ScrollArea className="h-72">
                        <ul>
                          {searchedTeams.map((team, key) => (
                            <li key={key}>
                              <BadgeWithButton
                                id={team.id}
                                value={team.name}
                                handleClick={handleTeamSelection}
                              />
                            </li>
                          ))}
                        </ul>
                      </ScrollArea>
                      <Button
                        variant="default"
                        disabled={!searchedTeams || searchedTeams.length == 0}
                        onClick={() => handleSelectAllTeams()}
                      >
                        Select All
                      </Button>
                    </div>
                  )}
                </div>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-3">
              <AccordionTrigger>Seasons</AccordionTrigger>
              <AccordionContent>
                <div className="ml-[1px] max-w-sm space-y-4">
                  {isSeasonPending && <div>Loading...</div>}
                  {isSeasonError && (
                    <div>{`Error fetching seasons: ${seasonError.message}`}</div>
                  )}
                  {searchedSeasons && (
                    <div className="space-y-2">
                      <ScrollArea className="h-72">
                        <ul>
                          {searchedSeasons.map((season, key) => (
                            <li key={key}>
                              <BadgeWithButton
                                id={season.id}
                                value={season.season_years}
                                handleClick={handleSeasonSelection}
                              />
                            </li>
                          ))}
                        </ul>
                      </ScrollArea>
                      <Button
                        variant="default"
                        disabled={
                          !searchedSeasons || searchedSeasons.length == 0
                        }
                        onClick={() => handleSelectAllSeasons()}
                      >
                        Select All
                      </Button>
                    </div>
                  )}
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
        <div className="ml-12 flex w-1/5 flex-col">
          <h3 className="scroll-m-20 text-2xl font-semibold tracking-tight">
            Selected Filters
          </h3>
          <div>
            <ul className="space-y-1">
              {selectedPlayers &&
                selectedPlayers.map((player, key) => (
                  <li key={key}>
                    <DestructiveButton
                      id={player.id}
                      value={player.name}
                      handleClick={handlePlayerRemoval}
                    />
                  </li>
                ))}
              {selectedTeams &&
                selectedTeams.map((team, key) => (
                  <li key={key}>
                    <DestructiveButton
                      id={team.id}
                      value={team.name}
                      handleClick={handleTeamRemoval}
                    />
                  </li>
                ))}
              {selectedSeasons2 &&
                selectedSeasons2.map((season, key) => (
                  <li key={key}>
                    <DestructiveButton
                      id={season.id}
                      value={season.season_years}
                      handleClick={handleSeasonRemoval}
                    />
                  </li>
                ))}
            </ul>
          </div>
          <div>
            <Button variant="secondary" onClick={handleGenShots}>
              Generate Shot Chart
            </Button>
          </div>
        </div>
        <div className="flex-1">
          <h3 className="scroll-m-20 text-2xl font-semibold tracking-tight">
            Shot Chart
          </h3>
          <div className="h-[70lvh] w-full">
            <div className="p-4">
              {isShotsPending && <div>Please run a query</div>}
              {isShotsFetching && <div>Loading...</div>}
              {isShotsError && (
                <div>{`Error fetching shots: ${shotsError.message}`}</div>
              )}
              {shotsData && (
                <div className="">
                  <BasketballCourt shots={shotsData} />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Home
