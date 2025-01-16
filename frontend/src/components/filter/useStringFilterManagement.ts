import { useNavigate } from "@tanstack/react-router"
import React from "react"

interface UseStringFilterManagementProps {
  filterName: "game_loc"
  defaultValue?: string
}
export function useStringFilterManagement<T extends string>({
  filterName,
  defaultValue,
}: UseStringFilterManagementProps) {
  const navigate = useNavigate({ from: "/" })
  const [selectedItem, setSelectedItem] = React.useState<string | undefined>(
    defaultValue,
  )

  const handleSelect = (value: T) => {
    setSelectedItem(value)

    let item: string | undefined
    if (filterName == "game_loc" && value !== "") {
      item = value
    }

    navigate({
      search: (prev) => {
        prev[filterName] = item
        return prev
      },
    })
  }

  const handleRemove = () => {
    setSelectedItem(defaultValue)
    navigate({
      search: (prev) => {
        prev[filterName] = undefined
        return prev
      },
    })
  }

  return {
    selectedItem,
    handleSelect,
    handleRemove,
  }
}
