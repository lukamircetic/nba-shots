import { Player, Quarter, Season, Team } from "@/types"
import { LoadingSpinner } from "../ui/loading-spinner"
import { DestructiveButton } from "../ui/destructivebutton"
import {
  CalendarArrowDown,
  CalendarArrowUp,
  Clock9,
  Hourglass,
  MapPin,
  Swords,
  Trophy,
  UserRound,
  UsersRound,
} from "lucide-react"
import { Capitalize } from "@/api/helpers"
import { format } from "date-fns"

interface SelectionsListProps {
  selectedPlayers: Player[]
  searchedPlayers: Player[] | undefined
  playerSearchKey: string
  isParamPlayersFetching: boolean
  handlePlayerRemoval: (id: string) => void
  handleRemoveAllPlayers: (_: string) => void
  selectedTeams: Team[]
  searchedTeams: Team[] | undefined
  handleTeamRemoval: (id: string) => void
  handleRemoveAllTeams: (_: string) => void
  selectedSeasons: Season[]
  searchedSeasons: Season[] | undefined
  handleSeasonRemoval: (id: string) => void
  handleRemoveAllSeasons: (_: string) => void
  selectedOppTeams: Team[]
  searchedOppTeams: Team[] | undefined
  handleOppTeamRemoval: (id: string) => void
  handleRemoveAllOppTeams: (_: string) => void
  selectedGameLoc: string | undefined
  handleRemoveGameLoc: () => void
  selectedQuarter: Quarter[]
  handleRemoveAllQuarter: (_: string) => void
  startTimeLeft: Date | undefined
  endTimeLeft: Date | undefined
  handleRemoveStartTimeLeft: () => void
  handleRemoveEndTimeLeft: () => void
  selectedStartDate: Date | undefined
  selectedEndDate: Date | undefined
  handleRemoveStartDate: () => void
  handleRemoveEndDate: () => void
}

export function SelectionsList({
  selectedPlayers,
  searchedPlayers,
  playerSearchKey,
  isParamPlayersFetching,
  handlePlayerRemoval,
  handleRemoveAllPlayers,
  selectedTeams,
  searchedTeams,
  handleTeamRemoval,
  handleRemoveAllTeams,
  selectedSeasons,
  searchedSeasons,
  handleSeasonRemoval,
  handleRemoveAllSeasons,
  selectedOppTeams,
  searchedOppTeams,
  handleOppTeamRemoval,
  handleRemoveAllOppTeams,
  selectedGameLoc,
  handleRemoveGameLoc,
  selectedQuarter,
  handleRemoveAllQuarter,
  startTimeLeft,
  endTimeLeft,
  handleRemoveStartTimeLeft,
  handleRemoveEndTimeLeft,
  selectedStartDate,
  selectedEndDate,
  handleRemoveStartDate,
  handleRemoveEndDate,
}: SelectionsListProps) {
  return (
    <ul className="grid grid-cols-2 gap-1 sm:grid-cols-1 md:grid-cols-2 2xl:grid-cols-1">
      {isParamPlayersFetching && (
        <LoadingSpinner className="w-full justify-center" />
      )}
      {selectedPlayers &&
        !isParamPlayersFetching &&
        (searchedPlayers?.length !== 0 || selectedPlayers.length <= 5) &&
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
  )
}
