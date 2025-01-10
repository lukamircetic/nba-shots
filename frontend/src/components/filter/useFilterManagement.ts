import React from "react";
import { FilterItem } from "./types";

interface UseFilterManagementProps<T extends FilterItem> {
  data: T[] | undefined
  nameKey?: keyof T
}

export function useFilterManagement<T extends FilterItem>({
  data,
  nameKey = 'name' as keyof T
}: UseFilterManagementProps<T>) {
  const [selectedItems, setSelectedItems] = React.useState<T[]>([])
  const [filteredMap,] = React.useState<Map<string, string>>(new Map())

  const searchedItems = React.useMemo(() => {
      return data?.filter(item => !filteredMap.has(item.id))
    }, [selectedItems, data])

    const handleSelectAll = () => {
      if (!searchedItems) return
      for (const p of searchedItems) {
        handleSelect(p.id)
      }
    }

    const handleSelect = (id: string) => {
      if (filteredMap.has(id)) {
        return
      }

      const item = data?.find(item => item.id == id)
      if (!item) return

      setSelectedItems((prevSelected) => {
        return [...prevSelected, item]
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

      filteredMap.delete(id)
    }

    const handleRemoveAll = (_: string) => {
      setSelectedItems([])
      filteredMap.clear()
    }

    return {
      selectedItems,
      searchedItems,
      handleSelectAll,
      handleSelect,
      handleRemove,
      handleRemoveAll
    }
}