import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../ui/accordion"
import { InputWithButton } from "../ui/inputwithbutton"
import React from "react"
import { Button } from "../ui/button"
import {
  fetchAllSeasons,
  fetchAllTeams,
  fetchPlayersByName,
  fetchShotsWithFilters,
} from "@/api/queries"
import { useQuery } from "@tanstack/react-query"
import BasketballCourt from "../viz/basketball-court"
import { DestructiveButton } from "../ui/destructivebutton"
import { useFilterManagement } from "../filter/useFilterManagement"
import { FilterSection } from "../filter/FilterSection"
import { Pickaxe } from "lucide-react"

function Home() {
  const [playerSearchKey, setPlayerSearchKey] = React.useState<string>("")

  const {
    isPending: isPlayerPending,
    isError: isPlayerError,
    data: playerData,
    error: playerError,
  } = useQuery({
    queryKey: ["players", playerSearchKey],
    queryFn: ({ queryKey }) => {
      const [, name] = queryKey
      if (name == "") return [] // don't allow all players search for now
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

  const {
    selectedItems: selectedPlayers,
    searchedItems: searchedPlayers,
    handleSelectAll: handleSelectAllPlayers,
    handleSelect: handlePlayerSelection,
    handleRemove: handlePlayerRemoval,
    handleRemoveAll: handleRemoveAllPlayers,
  } = useFilterManagement({ data: playerData })

  const {
    selectedItems: selectedTeams,
    searchedItems: searchedTeams,
    handleSelectAll: handleSelectAllTeams,
    handleSelect: handleTeamSelection,
    handleRemove: handleTeamRemoval,
    handleRemoveAll: handleRemoveAllTeams,
  } = useFilterManagement({ data: teamData })

  const {
    selectedItems: selectedSeasons,
    searchedItems: searchedSeasons,
    handleSelectAll: handleSelectAllSeasons,
    handleSelect: handleSeasonSelection,
    handleRemove: handleSeasonRemoval,
    handleRemoveAll: handleRemoveAllSeasons,
  } = useFilterManagement({ data: seasonData, nameKey: "season_years" })

  const {
    isFetching: isShotsFetching,
    isError: isShotsError,
    data: shotsData,
    error: shotsError,
    refetch,
  } = useQuery({
    queryKey: [selectedPlayers, selectedTeams, selectedSeasons],
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
                  <FilterSection
                    title="Players"
                    items={searchedPlayers}
                    isLoading={isPlayerPending}
                    isError={isPlayerError}
                    error={isPlayerError ? playerError : null}
                    onSelect={handlePlayerSelection}
                    onSelectAll={handleSelectAllPlayers}
                  />
                </div>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-2">
              <AccordionTrigger>Teams</AccordionTrigger>
              <AccordionContent>
                <div className="ml-[1px] max-w-sm space-y-4">
                  <FilterSection
                    title="Teams"
                    items={searchedTeams}
                    isLoading={isTeamPending}
                    isError={isTeamError}
                    error={isTeamError ? teamError : null}
                    onSelect={handleTeamSelection}
                    onSelectAll={handleSelectAllTeams}
                  />
                </div>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-3">
              <AccordionTrigger>Seasons</AccordionTrigger>
              <AccordionContent>
                <div className="ml-[1px] max-w-sm space-y-4">
                  <FilterSection
                    title="Seasons"
                    items={searchedSeasons}
                    isLoading={isSeasonPending}
                    isError={isSeasonError}
                    error={isSeasonError ? seasonError : null}
                    onSelect={handleSeasonSelection}
                    onSelectAll={handleSelectAllSeasons}
                    nameKey="season_years"
                  />
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
        <div className="ml-12 flex w-1/5 flex-col space-y-2">
          <h3 className="scroll-m-20 text-2xl font-semibold tracking-tight">
            Selected Filters
          </h3>
          <div>
            <ul className="space-y-1">
              {selectedPlayers &&
                (searchedPlayers?.length !== 0 ||
                  selectedPlayers.length <= 5) &&
                selectedPlayers.map((player, key) => (
                  <li key={key}>
                    <DestructiveButton
                      id={player.id}
                      value={player.name}
                      handleClick={handlePlayerRemoval}
                    />
                  </li>
                ))}
              {/* basically if you select all, and theres more than 5 players it shows a summary of the search key instead of all the players */}
              {selectedPlayers &&
                selectedPlayers.length > 5 &&
                searchedPlayers?.length === 0 && (
                  <li>
                    <DestructiveButton
                      id=""
                      value={`%${playerSearchKey}% (${selectedPlayers.length} players)`}
                      handleClick={handleRemoveAllPlayers}
                    />
                  </li>
                )}
              {selectedTeams &&
                searchedTeams?.length !== 0 &&
                selectedTeams.map((team, key) => (
                  <li key={key}>
                    <DestructiveButton
                      id={team.id}
                      value={team.name}
                      handleClick={handleTeamRemoval}
                    />
                  </li>
                ))}
              {selectedTeams && searchedTeams?.length === 0 && (
                <li>
                  <DestructiveButton
                    id=""
                    value={`All Teams`}
                    handleClick={handleRemoveAllTeams}
                  />
                </li>
              )}
              {selectedSeasons &&
                searchedSeasons?.length !== 0 &&
                selectedSeasons.map((season, key) => (
                  <li key={key}>
                    <DestructiveButton
                      id={season.id}
                      value={season.season_years}
                      handleClick={handleSeasonRemoval}
                    />
                  </li>
                ))}
              {selectedSeasons &&
                selectedSeasons.length > 0 &&
                searchedSeasons?.length === 0 && (
                  <li>
                    <DestructiveButton
                      id=""
                      value="2003-2024" // TODO: make this dynamic in V2
                      handleClick={handleRemoveAllSeasons}
                    />
                  </li>
                )}
            </ul>
          </div>
          <div>
            <Button
              disabled={
                selectedPlayers?.length === 0 &&
                selectedTeams?.length === 0 &&
                selectedSeasons?.length === 0
              }
              variant="default"
              onClick={handleGenShots}
              className="min-w-60 py-6"
            >
              <Pickaxe /> Generate Shot Chart
            </Button>
          </div>
        </div>
        <div className="flex-1">
          <h3 className="scroll-m-20 text-2xl font-semibold tracking-tight">
            Shot Chart
          </h3>
          <div className="h-[70lvh] w-full">
            <div className="p-4">
              {isShotsFetching && <div>Loading...</div>}
              {isShotsError && (
                <div>{`Error fetching shots: ${shotsError.message}`}</div>
              )}
              {
                <div className="">
                  <BasketballCourt shots={shotsData} />
                </div>
              }
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Home
