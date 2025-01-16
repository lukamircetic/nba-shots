import React from "react"
import { FilterItem } from "./types"
import { useNavigate } from "@tanstack/react-router"

interface UseFilterManagementProps<T extends FilterItem> {
  filterName: "players" | "teams" | "seasons" | "opp_teams" | "quarter"
  data: T[] | undefined
  nameKey?: keyof T
}

export function useFilterManagement<T extends FilterItem>({
  filterName,
  data,
  nameKey = "name" as keyof T,
}: UseFilterManagementProps<T>) {
  const navigate = useNavigate({ from: "/" })
  const [selectedItems, setSelectedItems] = React.useState<T[]>([])
  const [filteredMap] = React.useState<Map<string, string>>(new Map())

  const searchedItems = React.useMemo(() => {
    return data?.filter((item) => !filteredMap.has(item.id))
  }, [selectedItems, data])

  const handleSelectAll = () => {
    if (!searchedItems) return
    for (const p of searchedItems) {
      handleSelect(p.id)
    }
  }

  const handleSelect = (id: string, preloadedItem ?: T) => {
    if (filteredMap.has(id)) {
      return
    }

    let item;
    if (preloadedItem  === undefined) {
      item = data?.find((item) => item.id == id)
      if (!item) return
    } else {
      item = preloadedItem
    }

    setSelectedItems((prevSelected) => {
      return [...prevSelected, item]
    })

    navigate({
      search: (prev) => {
        if (prev[filterName] === undefined) {
          prev[filterName] = id
          return prev
        }
        if (!prev[filterName].split(",").includes(id)) {
          prev[filterName] += "," + id
        }
        return prev
      },
    })

    filteredMap.set(id, item[nameKey] as string)
  }

  const handleRemove = (id: string) => {
    if (!filteredMap.has(id)) {
      return
    }
    setSelectedItems((prevSelected) => {
      return prevSelected.filter((p) => p.id !== id)
    })

    navigate({
      search: (prev) => {
        if (prev[filterName] === undefined) {
          return prev
        }
        const prevArr = prev[filterName].split(",")
        const newArr = prevArr.filter(item => item !== id)
        if (newArr.length === 0) {
          prev[filterName] = undefined
        } else {
          prev[filterName] = newArr.join(",")
        }
        return prev
      },
    })

    filteredMap.delete(id)
  }

  const handleRemoveAll = (_: string) => {
    setSelectedItems([])
    filteredMap.clear()
    navigate({
      search: (prev) => {
        prev[filterName] = undefined
        return prev
      },
    })
  }

  return {
    selectedItems,
    searchedItems,
    handleSelectAll,
    handleSelect,
    handleRemove,
    handleRemoveAll,
  }
}
