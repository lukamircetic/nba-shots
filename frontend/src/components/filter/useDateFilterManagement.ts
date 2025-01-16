import { useNavigate } from "@tanstack/react-router";
import { format } from "date-fns";
import React from "react";

interface UseDateFilterManagementProps {
  filterName: "start_date" | "end_date"
}
export function useDateFilterManagement<T extends globalThis.Date>(
  {filterName}: UseDateFilterManagementProps
) {
  const navigate = useNavigate({from:"/"})
  const [selectedDate, setSelectedDate] = React.useState<T>()

  const handleSelect = (value: T) => {
    setSelectedDate(value)
    const item = format(value, "yyyy-MM-dd")
    navigate({
      search: (prev) => {
        prev[filterName] = item
        return prev
      },
    })
  }

  const handleRemove = () => {
    setSelectedDate(undefined)
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