import { DatePicker } from "../ui/datepicker"

interface DateFilterSectionProps {
  selectedStartDate: Date | undefined
  selectedEndDate: Date | undefined
  handleSelectStartDate: (value: Date | undefined) => void
  handleSelectEndDate: (value: Date | undefined) => void
}

export function DateFilterSection({
  selectedStartDate,
  selectedEndDate,
  handleSelectStartDate,
  handleSelectEndDate,
}: DateFilterSectionProps) {
  return (
    <div className="ml-[1px] max-w-sm space-y-4">
      <p className="text-sm sm:text-base">Start Date</p>
      <DatePicker
        date={selectedStartDate}
        setDate={handleSelectStartDate}
        defaultDate={selectedEndDate ? selectedEndDate : new Date(2024, 0)}
        after={selectedEndDate}
      />
      <p className="text-sm sm:text-base">End Date</p>
      <DatePicker
        date={selectedEndDate}
        setDate={handleSelectEndDate}
        defaultDate={selectedStartDate ? selectedStartDate : new Date(2024, 0)}
        before={selectedStartDate}
      />
    </div>
  )
}
