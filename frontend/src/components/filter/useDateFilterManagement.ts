import { useNavigate } from "@tanstack/react-router";
import { format } from "date-fns";
import React from "react";

interface UseDateFilterManagementProps {
  filterName: "start_date" | "end_date" | "start_time_left" | "end_time_left"
  defaultValue?: Date
}
export function useDateFilterManagement<T extends globalThis.Date>(
  {filterName, defaultValue}: UseDateFilterManagementProps
) {
  const navigate = useNavigate({from:"/"})
  const [selectedDate, setSelectedDate] = React.useState<Date | undefined>(defaultValue)

  const handleSelect = (value: T | undefined) => {
    if (!value) return
    setSelectedDate(value)
    let item: string | undefined = undefined
    if (filterName == "start_date" || filterName == "end_date") {
      item = format(value, "yyyy-MM-dd")
    }
    if (filterName == "start_time_left" || filterName == "end_time_left") {
      const mins = value.getMinutes()
      const secs = value.getSeconds()
      if ((mins == 12 || mins == 0) && secs == 0) {
        item = undefined
      } else {
        item = format(value, "mm:ss")
      }
    }

    navigate({
      search: (prev) => {
        prev[filterName] = item
        return prev
      },
    })
  }

  const handleRemove = () => {
    setSelectedDate(defaultValue)
    navigate({
      search: (prev) => {
        prev[filterName] = undefined
        return prev
      }
    })
  }

  return {
    selectedDate,
    handleSelect,
    handleRemove,
  }
}