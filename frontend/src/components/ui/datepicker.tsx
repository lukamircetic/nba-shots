"use client"

import { format } from "date-fns"
import { CalendarIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

interface DatePickerProps {
  date: Date | undefined
  setDate: (value: Date) => void
  defaultDate: Date
  before?: Date
  after?: Date
}

export function DatePicker({
  date,
  setDate,
  defaultDate,
  before,
  after,
}: DatePickerProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant={"outline"}
          className={cn(
            "w-[240px] justify-start text-left font-normal",
            !date && "text-muted-foreground",
          )}
        >
          <CalendarIcon />
          {date ? format(date, "PPP") : <span>Pick a date</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          captionLayout="dropdown"
          selected={date}
          onSelect={setDate}
          defaultMonth={defaultDate}
          startMonth={new Date(2003, 9, 27)}
          endMonth={new Date(2024, 3, 13)}
          today={defaultDate}
          disabled={{
            before: before ? before : new Date(2003, 9, 27),
            after: after ? after : new Date(2024, 3, 13),
          }}
          required
        />
      </PopoverContent>
    </Popover>
  )
}
