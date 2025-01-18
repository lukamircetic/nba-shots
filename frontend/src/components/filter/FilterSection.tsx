import { BadgeWithButton } from "../ui/badgewithbutton"
import { Button } from "../ui/button"
import { LoadingSpinner } from "../ui/loading-spinner"
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
  if (isLoading) return <LoadingSpinner className="w-full justify-center" />
  if (isError) return <div>{`Error fetching ${title}: ${error?.message}`}</div>
  if (items && items.length > 0) {
    return (
      <div className="space-y-4">
        <ScrollArea className="sm:40 h-40 md:h-52 lg:h-52 xl:h-72">
          <ul>
            {items?.map((item, key) => (
              <li key={key} className="w-4/5">
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
          className="text-sm"
        >
          Select All
        </Button>
      </div>
    )
  }
}
