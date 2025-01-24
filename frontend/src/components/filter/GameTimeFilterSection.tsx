import { Minus } from "lucide-react"
import { TimePickerDemo } from "../ui/time-picker"
import { ToggleGroup, ToggleGroupItem } from "../ui/toggle-group"
import { Quarter } from "@/types"
import { quarters } from "@/constants"

interface GameTimeFilterSectionProps {
  selectedQuarter: Quarter[]
  handleQuarterSelection: (
    id: string,
    preloadedItem?: Quarter | undefined,
  ) => void
  handleQuarterRemoval: (id: string) => void
  startTimeLeft: Date | undefined
  endTimeLeft: Date | undefined
  handleSelectStartTimeLeft: (value: Date | undefined) => void
  handleSelectEndTimeLeft: (value: Date | undefined) => void
}

export function GameTimeFilterSection({
  selectedQuarter,
  handleQuarterSelection,
  handleQuarterRemoval,
  startTimeLeft,
  endTimeLeft,
  handleSelectStartTimeLeft,
  handleSelectEndTimeLeft,
}: GameTimeFilterSectionProps) {
  return (
    <div className="ml-[1px] max-w-sm space-y-6">
      <div className="space-y-3">
        <p className="text-sm sm:text-base">Quarter</p>
        <ToggleGroup
          type="multiple"
          className="grid grid-flow-row grid-cols-8 grid-rows-1 justify-start gap-1 sm:grid-flow-row sm:grid-cols-4 sm:grid-rows-2"
          onValueChange={(value) => {
            if (value.length > selectedQuarter.length) {
              const newVal = value.find((item) => {
                return !selectedQuarter.find((qtr) => qtr.id == item)
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
  )
}
