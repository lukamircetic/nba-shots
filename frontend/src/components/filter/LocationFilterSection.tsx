import { Label } from "../ui/label"
import { RadioGroup, RadioGroupItem } from "../ui/radio-group"

interface LocationFilterSectionProps {
  selectedGameLoc: string | undefined
  handleSelectGameLoc: (value: string) => void
}

export function LocationFilterSection({
  selectedGameLoc,
  handleSelectGameLoc,
}: LocationFilterSectionProps) {
  return (
    <div className="ml-[1px] max-w-sm space-y-4">
      <RadioGroup
        defaultValue=""
        value={selectedGameLoc}
        onValueChange={handleSelectGameLoc}
      >
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="" id="option-one" />
          <Label htmlFor="all-locations" className="font-normal sm:text-base">
            All Locations
          </Label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="home" id="option-two" />
          <Label htmlFor="home" className="font-normal sm:text-base">
            Home Games
          </Label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="away" id="option-three" />
          <Label htmlFor="away" className="font-normal sm:text-base">
            Away Games
          </Label>
        </div>
      </RadioGroup>
    </div>
  )
}
