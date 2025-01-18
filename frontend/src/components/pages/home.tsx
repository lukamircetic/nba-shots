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
  fetchPlayersByIds,
  fetchPlayersByName,
  fetchShotsWithFilters,
  Player,
  Quarter,
  Season,
  Team,
} from "@/api/queries"
import { useQuery } from "@tanstack/react-query"
import BasketballCourt from "../viz/basketball-court"
import { DestructiveButton } from "../ui/destructivebutton"
import { useFilterManagement } from "../filter/useFilterManagement"
import { FilterSection } from "../filter/FilterSection"
import {
  CalendarArrowDown,
  CalendarArrowUp,
  Clock9,
  FileCode,
  Hourglass,
  ImageDown,
  MapPin,
  Minus,
  Pickaxe,
  Swords,
  Trophy,
  UserRound,
  UsersRound,
} from "lucide-react"
import { ButtonWithTooltip } from "../ui/buttonwithtooltip"
import { DialogShareButton } from "./sharedialog"
import { saveSvgAsPng } from "@/api/saveimage"
import { saveAsJSON } from "@/api/exportjson"
import { useSearch } from "@tanstack/react-router"
import { DatePicker } from "../ui/datepicker"
import { format } from "date-fns"
import { useDateFilterManagement } from "../filter/useDateFilterManagement"
import { RadioGroup, RadioGroupItem } from "../ui/radio-group"
import { Label } from "../ui/label"
import { useStringFilterManagement } from "../filter/useStringFilterManagement"
import { Capitalize } from "@/api/helpers"
import { ToggleGroup, ToggleGroupItem } from "../ui/toggle-group"
import { TimePickerDemo } from "../ui/time-picker"
import { LoadingSpinner } from "../ui/loading-spinner"
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table"

const quarters = [
  { id: "1", name: "1st" },
  { id: "2", name: "2nd" },
  { id: "3", name: "3rd" },
  { id: "4", name: "4th" },
  { id: "5", name: "OT" },
  { id: "6", name: "2OT" },
  { id: "7", name: "3OT" },
  { id: "8", name: "4OT" },
]

function Home() {
  const search = useSearch({ from: "/" })

  const [isGenShots, setIsGenShots] = React.useState<boolean>(false)
  const [playerSearchKey, setPlayerSearchKey] = React.useState<string>("")
  const initialLoad = React.useRef<boolean>(true)
  const svgRef = React.useRef<SVGSVGElement>(null)

  // 2003-10-27 -> 2024-04-13
  const {
    isFetching: isPlayersFetching,
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
    isFetching: isTeamPending,
    isError: isTeamError,
    data: teamData,
    error: teamError,
  } = useQuery({
    queryKey: ["teams"],
    queryFn: () => fetchAllTeams(),
  })

  const {
    isFetching: isSeasonPending,
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
  } = useFilterManagement({ filterName: "players", data: playerData })

  const {
    selectedItems: selectedTeams,
    searchedItems: searchedTeams,
    handleSelectAll: handleSelectAllTeams,
    handleSelect: handleTeamSelection,
    handleRemove: handleTeamRemoval,
    handleRemoveAll: handleRemoveAllTeams,
  } = useFilterManagement({ filterName: "teams", data: teamData })

  const {
    selectedItems: selectedSeasons,
    searchedItems: searchedSeasons,
    handleSelectAll: handleSelectAllSeasons,
    handleSelect: handleSeasonSelection,
    handleRemove: handleSeasonRemoval,
    handleRemoveAll: handleRemoveAllSeasons,
  } = useFilterManagement({
    filterName: "seasons",
    data: seasonData,
    nameKey: "season_years",
  })

  const {
    selectedItems: selectedOppTeams,
    searchedItems: searchedOppTeams,
    handleSelectAll: handleSelectAllOppTeams,
    handleSelect: handleOppTeamSelection,
    handleRemove: handleOppTeamRemoval,
    handleRemoveAll: handleRemoveAllOppTeams,
  } = useFilterManagement({ filterName: "opp_teams", data: teamData })

  const {
    selectedItems: selectedQuarter,
    handleSelect: handleQuarterSelection,
    handleRemove: handleQuarterRemoval,
    handleRemoveAll: handleRemoveAllQuarter,
  } = useFilterManagement({ filterName: "quarter", data: quarters })

  const {
    selectedDate: selectedStartDate,
    handleSelect: handleSelectStartDate,
    handleRemove: handleRemoveStartDate,
  } = useDateFilterManagement({ filterName: "start_date" })

  const {
    selectedDate: selectedEndDate,
    handleSelect: handleSelectEndDate,
    handleRemove: handleRemoveEndDate,
  } = useDateFilterManagement({ filterName: "end_date" })

  const {
    selectedItem: selectedGameLoc,
    handleSelect: handleSelectGameLoc,
    handleRemove: handleRemoveGameLoc,
  } = useStringFilterManagement({ filterName: "game_loc", defaultValue: "" })

  const {
    selectedDate: startTimeLeft,
    handleSelect: handleSelectStartTimeLeft,
    handleRemove: handleRemoveStartTimeLeft,
  } = useDateFilterManagement({
    filterName: "start_time_left",
    defaultValue: new Date(new Date().setHours(0, 12, 0, 0)),
  })

  const {
    selectedDate: endTimeLeft,
    handleSelect: handleSelectEndTimeLeft,
    handleRemove: handleRemoveEndTimeLeft,
  } = useDateFilterManagement({
    filterName: "end_time_left",
    defaultValue: new Date(new Date().setHours(0, 0, 0, 0)),
  })

  const {
    isFetching: isShotsFetching,
    isError: isShotsError,
    data: shotsData,
    error: shotsError,
    refetch: refetchShots,
  } = useQuery({
    queryKey: [
      selectedPlayers,
      selectedTeams,
      selectedSeasons,
      selectedOppTeams,
      selectedStartDate,
      selectedEndDate,
      selectedGameLoc,
      selectedQuarter,
      startTimeLeft,
      endTimeLeft,
    ],
    queryFn: ({ queryKey }) => {
      const [players, teams, seasons, opps, sDate, eDate, gLoc, qtr, sTL, eTL] =
        queryKey
      // const stMins = sTL.
      return fetchShotsWithFilters(
        players as Player[] | undefined,
        teams as Team[] | undefined,
        seasons as Season[] | undefined,
        opps as Team[] | undefined,
        sDate as Date | undefined,
        eDate as Date | undefined,
        gLoc as "home" | "away" | undefined,
        qtr as Quarter[] | undefined,
        sTL as Date | undefined,
        eTL as Date | undefined,
      )
    },
    enabled: false,
  })

  // TODO: Show loading and error states for url param loading
  // TODO: This request gets sent everytime a player gets added... fix this
  const {
    isFetching: isParamPlayersFetching,
    // isError: isParamPlayersError,
    data: paramPlayersData,
    // error: paramPlayersError,
    // refetch: refetchParamPlayers,
  } = useQuery({
    queryKey: [search.players],
    queryFn: ({ queryKey }) => {
      const [playersString] = queryKey
      if (playersString === undefined) return []
      return fetchPlayersByIds(playersString)
    },
  })

  const onGenShotsClick = () => {
    setIsGenShots(true)
  }

  const handleGenShots = () => {
    if (
      !isShotsFetching &&
      (selectedPlayers.length > 0 ||
        selectedTeams.length > 0 ||
        selectedSeasons.length > 0)
    ) {
      refetchShots()
    }
  }

  const handleSavePNG = async () => {
    if (svgRef.current) {
      try {
        await saveSvgAsPng(svgRef.current)
      } catch (error) {
        console.error("Failed to save PNG", error)
      }
    }
  }

  const handleSaveData = () => {
    if (shotsData?.shots) {
      saveAsJSON(
        shotsData.shots,
        selectedPlayers,
        selectedTeams,
        selectedSeasons,
        selectedOppTeams,
        selectedStartDate,
        selectedEndDate,
        selectedGameLoc,
        selectedQuarter,
        startTimeLeft,
        endTimeLeft,
      )
    }
  }

  // TODO: This url param loading stuff is really messy, cleanup
  React.useEffect(() => {
    if (
      initialLoad.current &&
      (paramPlayersData !== undefined ||
        teamData !== undefined ||
        seasonData !== undefined)
    ) {
      initialLoad.current = false
      if (search.players !== undefined && paramPlayersData !== undefined) {
        for (const player of paramPlayersData) {
          handlePlayerSelection(player.id, player)
        }
      }
      if (search.teams !== undefined && teamData !== undefined) {
        for (const teamId of search.teams.split(",")) {
          const team = teamData.find((team) => team.id === teamId)
          if (team !== undefined) {
            handleTeamSelection(team.id, team)
          }
        }
      }
      if (search.seasons !== undefined && seasonData !== undefined) {
        for (const seasonId of search.seasons.split(",")) {
          const season = seasonData.find((s) => s.id === seasonId)
          if (season !== undefined) {
            handleSeasonSelection(season.id, season)
          }
        }
      }
      if (search.opp_teams !== undefined && teamData !== undefined) {
        for (const teamId of search.opp_teams.split(",")) {
          const team = teamData.find((t) => t.id === teamId)
          if (team !== undefined) {
            handleOppTeamSelection(team.id, team)
          }
        }
      }
      if (search.start_date !== undefined) {
        const paramDate = new Date(search.start_date)
        handleSelectStartDate(paramDate)
      }
      if (search.end_date !== undefined) {
        const paramDate = new Date(search.end_date)
        handleSelectEndDate(paramDate)
      }
      if (search.game_loc !== undefined) {
        if (search.game_loc == "home" || search.game_loc === "away") {
          handleSelectGameLoc(search.game_loc)
        } else {
          handleRemoveGameLoc()
        }
      }
      if (search.quarter !== undefined) {
        for (const qId of search.quarter.split(",")) {
          const qtr = quarters.find((q) => q.id === qId)
          if (qtr !== undefined) {
            handleQuarterSelection(qtr.id, qtr)
          }
        }
      }
      if (search.start_time_left !== undefined) {
        const [minutes, seconds] = search.start_time_left.split(":").map(Number)
        const paramTime = new Date(new Date().setHours(0, minutes, seconds, 0))
        handleSelectStartTimeLeft(paramTime)
      }
      if (search.end_time_left !== undefined) {
        const [minutes, seconds] = search.end_time_left.split(":").map(Number)
        const paramTime = new Date(new Date().setHours(0, minutes, seconds, 0))
        handleSelectEndTimeLeft(paramTime)
      }

      setIsGenShots(true)
    }
  }, [paramPlayersData, teamData, seasonData])

  React.useEffect(() => {
    if (isGenShots) {
      handleGenShots()
      setIsGenShots(false)
    }
  }, [isGenShots])

  return (
    <div className="relative mx-auto flex min-h-svh max-w-4xl flex-col space-y-6 bg-background px-4 lg:space-y-10 lg:px-14 2xl:max-w-[1536px]">
      <div className="flex w-full flex-col items-start justify-items-start space-y-0 pt-10 lg:pt-16">
        <h1 className="scroll-m-20 text-3xl font-extrabold tracking-tight sm:text-4xl lg:text-5xl">
          nba shots
        </h1>
        <h1 className="text-base text-muted-foreground lg:text-xl">
          advanced shot querying and visualization
        </h1>
      </div>
      <div className="grid w-full grid-cols-1 gap-4 space-y-6 sm:grid-cols-2 sm:space-y-0 md:grid-cols-5 lg:gap-10 2xl:grid-flow-col 2xl:grid-cols-12 2xl:gap-20">
        <div className="flex flex-col space-y-6 sm:col-span-1 md:col-span-2 2xl:col-span-3">
          <h3 className="scroll-m-20 text-xl font-semibold tracking-tight sm:text-2xl lg:text-3xl">
            Filters
          </h3>
          <Accordion type="multiple">
            <AccordionItem value="item-1">
              <AccordionTrigger>Player</AccordionTrigger>
              <AccordionContent>
                <div className="ml-[1px] max-w-sm space-y-4">
                  <InputWithButton
                    value={playerSearchKey}
                    setValue={setPlayerSearchKey}
                  />
                  <FilterSection
                    title="Player"
                    items={searchedPlayers}
                    isLoading={isPlayersFetching}
                    isError={isPlayerError}
                    error={isPlayerError ? playerError : null}
                    onSelect={handlePlayerSelection}
                    onSelectAll={handleSelectAllPlayers}
                  />
                </div>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-2">
              <AccordionTrigger>Team</AccordionTrigger>
              <AccordionContent>
                <div className="ml-[1px] max-w-sm space-y-4">
                  <FilterSection
                    title="Team"
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
              <AccordionTrigger>Season</AccordionTrigger>
              <AccordionContent>
                <div className="ml-[1px] max-w-sm space-y-4">
                  <FilterSection
                    title="Season"
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
            <AccordionItem value="item-4">
              <AccordionTrigger>Opponent</AccordionTrigger>
              <AccordionContent>
                <div className="ml-[1px] max-w-sm space-y-4">
                  <FilterSection
                    title="Opponent"
                    items={searchedOppTeams}
                    isLoading={isTeamPending}
                    isError={isTeamError}
                    error={isTeamError ? teamError : null}
                    onSelect={handleOppTeamSelection}
                    onSelectAll={handleSelectAllOppTeams}
                  />
                </div>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-5">
              <AccordionTrigger>Date</AccordionTrigger>
              <AccordionContent>
                <div className="ml-[1px] max-w-sm space-y-4">
                  <p className="text-sm sm:text-base">Start Date</p>
                  <DatePicker
                    date={selectedStartDate}
                    setDate={handleSelectStartDate}
                    defaultDate={
                      selectedEndDate ? selectedEndDate : new Date(2024, 0)
                    }
                    after={selectedEndDate}
                  />
                  <p className="text-sm sm:text-base">End Date</p>
                  <DatePicker
                    date={selectedEndDate}
                    setDate={handleSelectEndDate}
                    defaultDate={
                      selectedStartDate ? selectedStartDate : new Date(2024, 0)
                    }
                    before={selectedStartDate}
                  />
                </div>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-6">
              <AccordionTrigger>Location</AccordionTrigger>
              <AccordionContent>
                <div className="ml-[1px] max-w-sm space-y-4">
                  <RadioGroup
                    defaultValue=""
                    value={selectedGameLoc}
                    onValueChange={handleSelectGameLoc}
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="" id="option-one" />
                      <Label
                        htmlFor="all-locations"
                        className="font-normal sm:text-base"
                      >
                        All Locations
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="home" id="option-two" />
                      <Label
                        htmlFor="home"
                        className="font-normal sm:text-base"
                      >
                        Home Games
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="away" id="option-three" />
                      <Label
                        htmlFor="away"
                        className="font-normal sm:text-base"
                      >
                        Away Games
                      </Label>
                    </div>
                  </RadioGroup>
                </div>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-7">
              <AccordionTrigger>Game Time</AccordionTrigger>
              <AccordionContent>
                <div className="ml-[1px] max-w-sm space-y-6">
                  <div className="space-y-3">
                    <p className="text-sm sm:text-base">Quarter</p>
                    <ToggleGroup
                      type="multiple"
                      className="grid grid-flow-row grid-cols-8 grid-rows-1 justify-start gap-1 sm:grid-flow-row sm:grid-cols-4 sm:grid-rows-2"
                      onValueChange={(value) => {
                        if (value.length > selectedQuarter.length) {
                          const newVal = value.find((item) => {
                            // console.log(item, selectedQuarter)
                            return !selectedQuarter.find(
                              (qtr) => qtr.id == item,
                            )
                          })
                          if (newVal) handleQuarterSelection(newVal)
                        } else {
                          const newVal = selectedQuarter.find(
                            (qtr) => !value.find((item) => qtr.id == item),
                          )
                          if (newVal) handleQuarterRemoval(newVal.id)
                        }
                      }}
                      value={selectedQuarter?.map((q) => q.id)}
                    >
                      {quarters.map((quarter, key) => (
                        <ToggleGroupItem
                          value={quarter.id}
                          key={key}
                          className="lg:text-base"
                        >
                          {quarter.name}
                        </ToggleGroupItem>
                      ))}
                    </ToggleGroup>
                  </div>
                  <div className="space-y-3">
                    <p className="text-sm sm:text-base">Time Left in Quarter</p>
                    <div className="flex flex-row items-center">
                      <div className="">
                        <TimePickerDemo
                          date={startTimeLeft}
                          setDate={handleSelectStartTimeLeft}
                        />
                      </div>
                      <div className="flex h-10 items-center">
                        <Minus className="mx-2 h-4 w-4" />
                      </div>
                      <div className="">
                        <TimePickerDemo
                          date={endTimeLeft}
                          setDate={handleSelectEndTimeLeft}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
        <div className="flex flex-col space-y-6 sm:col-span-1 md:col-span-3 2xl:col-span-3">
          <h3 className="scroll-m-20 text-xl font-semibold tracking-tight sm:text-2xl lg:text-3xl">
            Selected Filters
          </h3>
          <div>
            <ul className="grid grid-cols-2 gap-1 sm:grid-cols-1 md:grid-cols-2 2xl:grid-cols-1">
              {isParamPlayersFetching && (
                <LoadingSpinner className="w-full justify-center" />
              )}
              {selectedPlayers &&
                !isParamPlayersFetching &&
                (searchedPlayers?.length !== 0 ||
                  selectedPlayers.length <= 5) &&
                selectedPlayers.map((player, key) => (
                  <li key={key}>
                    <DestructiveButton
                      id={player.id}
                      value={player.name}
                      handleClick={handlePlayerRemoval}
                    >
                      <UserRound className="size-4 sm:size-5" />
                    </DestructiveButton>
                  </li>
                ))}
              {/* basically if you select all, and theres more than 5 players it shows a summary of the search key instead of all the players */}
              {selectedPlayers &&
                !isParamPlayersFetching &&
                selectedPlayers.length > 5 &&
                searchedPlayers?.length === 0 && (
                  <li>
                    <DestructiveButton
                      id=""
                      value={`%${playerSearchKey}% (${selectedPlayers.length} players)`}
                      handleClick={handleRemoveAllPlayers}
                    >
                      <UserRound className="size-4 sm:size-5" />
                    </DestructiveButton>
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
                    >
                      <UsersRound className="size-4 sm:size-5" />
                    </DestructiveButton>
                  </li>
                ))}
              {selectedTeams && searchedTeams?.length === 0 && (
                <li>
                  <DestructiveButton
                    id=""
                    value={`All Teams`}
                    handleClick={handleRemoveAllTeams}
                  >
                    <UsersRound className="size-4 sm:size-5" />
                  </DestructiveButton>
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
                    >
                      <Trophy className="size-4 sm:size-5" />
                    </DestructiveButton>
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
                    >
                      <Trophy className="size-4 sm:size-5" />
                    </DestructiveButton>
                  </li>
                )}
              {selectedOppTeams &&
                selectedOppTeams?.length !== 0 &&
                selectedOppTeams.map((team, key) => (
                  <li key={key}>
                    <DestructiveButton
                      id={team.id}
                      value={team.name}
                      handleClick={handleOppTeamRemoval}
                    >
                      <Swords className="size-4 sm:size-5" />
                    </DestructiveButton>
                  </li>
                ))}
              {selectedOppTeams && searchedOppTeams?.length === 0 && (
                <li>
                  <DestructiveButton
                    id=""
                    value={`All Teams`}
                    handleClick={handleRemoveAllOppTeams}
                  >
                    <Swords className="size-4 sm:size-5" />
                  </DestructiveButton>
                </li>
              )}
              {selectedGameLoc && selectedGameLoc !== "" && (
                <li>
                  <DestructiveButton
                    id=""
                    value={`${Capitalize(selectedGameLoc)}`}
                    handleClick={handleRemoveGameLoc}
                  >
                    <MapPin className="size-4 sm:size-5" />
                  </DestructiveButton>
                </li>
              )}
              {selectedQuarter && selectedQuarter.length > 0 && (
                <li>
                  <DestructiveButton
                    id=""
                    value={selectedQuarter
                      .sort((a, b) => parseInt(a.id) - parseInt(b.id))
                      .map((q) => q.name)
                      .join(", ")}
                    handleClick={handleRemoveAllQuarter}
                  >
                    <Clock9 className="size-4 sm:size-5" />
                  </DestructiveButton>
                </li>
              )}
              {startTimeLeft &&
                endTimeLeft &&
                !(
                  startTimeLeft.getMinutes() === 12 &&
                  endTimeLeft.getMinutes() === 0 &&
                  endTimeLeft.getSeconds() === 0
                ) && (
                  <li>
                    <DestructiveButton
                      id=""
                      value={`${format(startTimeLeft, "mm:ss")} - ${format(endTimeLeft, "mm:ss")}`}
                      handleClick={() => {
                        handleRemoveStartTimeLeft()
                        handleRemoveEndTimeLeft()
                      }}
                    >
                      <Hourglass className="size-4 sm:size-5" />
                    </DestructiveButton>
                  </li>
                )}
              {selectedStartDate && (
                <li>
                  <DestructiveButton
                    id=""
                    value={`${format(selectedStartDate, "PP")}`}
                    handleClick={handleRemoveStartDate}
                  >
                    <CalendarArrowDown className="size-4 sm:size-5" />
                  </DestructiveButton>
                </li>
              )}
              {selectedEndDate && (
                <li>
                  <DestructiveButton
                    id=""
                    value={format(selectedEndDate, "PP")}
                    handleClick={handleRemoveEndDate}
                  >
                    <CalendarArrowUp className="size-4 sm:size-5" />
                  </DestructiveButton>
                </li>
              )}
            </ul>
          </div>
          <div className="flex w-full justify-center">
            <Button
              disabled={
                selectedPlayers?.length === 0 &&
                selectedTeams?.length === 0 &&
                selectedSeasons?.length === 0
              }
              variant="default"
              size="lg"
              onClick={onGenShotsClick}
              className="min-w-56 self-center lg:px-10"
            >
              {isShotsFetching && <LoadingSpinner />}
              {!isShotsFetching && (
                <>
                  <Pickaxe /> Generate Shot Chart
                </>
              )}
            </Button>
          </div>
        </div>
        <div className="flex-1 space-y-5 pb-10 sm:col-span-2 sm:pt-10 md:col-span-5 2xl:col-span-6 2xl:col-start-7 2xl:mt-0 2xl:py-0">
          <div className="flex items-center justify-end gap-1 sm:gap-2">
            <h3 className="flex-1 scroll-m-20 self-start text-xl font-semibold tracking-tight sm:text-2xl lg:text-3xl">
              Shot Chart
            </h3>
            <DialogShareButton disabled={shotsData === undefined} />
            <ButtonWithTooltip
              text="Save as PNG"
              onClick={handleSavePNG}
              disabled={shotsData === undefined}
            >
              <ImageDown />
            </ButtonWithTooltip>
            <ButtonWithTooltip
              text="Save JSON shot data"
              onClick={handleSaveData}
              disabled={shotsData === undefined}
            >
              <FileCode />
            </ButtonWithTooltip>
          </div>
          <div className="relative w-full">
            {/* Spinner overlay */}
            {isShotsFetching && (
              <div className="absolute inset-0 z-10 flex items-center justify-center">
                <LoadingSpinner size={60} />
              </div>
            )}
            {/* Basketball Court */}
            {isShotsError ? (
              <div>{`Error fetching shots: ${shotsError.message}`}</div>
            ) : (
              <div className="aspect-square max-h-[85vh] w-full">
                <BasketballCourt ref={svgRef} shots={shotsData?.shots} />
              </div>
            )}
          </div>
          <Table>
            <TableCaption>The stats for the queried shots.</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead className="">Shot Type</TableHead>
                <TableHead>Shots Made</TableHead>
                <TableHead>Shots Missed</TableHead>
                <TableHead>Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell className="font-medium">2PT FG</TableCell>
                <TableCell>{shotsData?.made2PtShots}</TableCell>
                <TableCell>{shotsData?.missed2PtShots}</TableCell>
                <TableCell>
                  {shotsData
                    ? shotsData?.missed2PtShots + shotsData?.made2PtShots
                    : 0}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">3PT FG</TableCell>
                <TableCell>{shotsData?.made3PtShots}</TableCell>
                <TableCell>{shotsData?.missed3PtShots}</TableCell>
                <TableCell>
                  {shotsData
                    ? shotsData.made3PtShots + shotsData.missed3PtShots
                    : 0}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">All FG</TableCell>
                <TableCell>{shotsData?.totalMadeShots}</TableCell>
                <TableCell>{shotsData?.totalMissedShots}</TableCell>
                <TableCell>{shotsData ? shotsData.shots.length : 0}</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  )
}

export default Home
