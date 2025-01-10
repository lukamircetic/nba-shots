import { BadgeWithButton } from "../ui/badgewithbutton"
import { Button } from "../ui/button"
import { ScrollArea } from "../ui/scroll-area"
import { FilterItem } from "./types"

interface FilterSectionProps<T extends FilterItem> {
  title: string
  items: T[] | undefined
  isLoading: boolean
  isError: boolean
  error: Error | null
  onSelect: (id: string) => void
  onSelectAll: () => void
  nameKey?: keyof T
}

export function FilterSection<T extends FilterItem>({
  title,
  items,
  isLoading,
  isError,
  error,
  onSelect,
  onSelectAll,
  nameKey = "name" as keyof T,
}: FilterSectionProps<T>) {
  if (isLoading) return <div>Loading...</div>
  if (isError) return <div>{`Error fetching ${title}: ${error?.message}`}</div>
  if (items && items.length > 0) {
    return (
      <div className="space-y-2">
        <ScrollArea className="h-72">
          <ul>
            {items?.map((item, key) => (
              <li key={key}>
                <BadgeWithButton
                  id={item.id}
                  value={item[nameKey] as string}
                  handleClick={onSelect}
                />
              </li>
            ))}
          </ul>
        </ScrollArea>
        <Button
          variant="default"
          disabled={!items || items.length == 0}
          onClick={() => onSelectAll()}
        >
          Select All
        </Button>
      </div>
    )
  }
}
