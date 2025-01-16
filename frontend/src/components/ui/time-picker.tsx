"use client"

import * as React from "react"
import { Minus } from "lucide-react"
import { TimePickerInput } from "./time-picker-input"

interface TimePickerDemoProps {
  date: Date | undefined
  setDate: (date: Date | undefined) => void
  icon?: boolean
}

export function TimePickerDemo({
  date,
  setDate,
  icon = false,
}: TimePickerDemoProps) {
  const minuteRef = React.useRef<HTMLInputElement>(null)
  const secondRef = React.useRef<HTMLInputElement>(null)

  return (
    <div className="flex items-end gap-2">
      <div className="grid gap-1 text-center">
        <TimePickerInput
          picker="minutes"
          date={date}
          setDate={setDate}
          ref={minuteRef}
          onRightFocus={() => secondRef.current?.focus()}
        />
      </div>
      <div className="grid gap-1 text-center">
        <TimePickerInput
          picker="seconds"
          date={date}
          setDate={setDate}
          ref={secondRef}
          onLeftFocus={() => minuteRef.current?.focus()}
        />
      </div>
      {icon && (
        <div className="flex h-10 items-center">
          <Minus className="ml-2 h-4 w-4" />
        </div>
      )}
    </div>
  )
}
