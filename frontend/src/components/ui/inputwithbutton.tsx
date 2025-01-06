import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export function InputWithButton() {
  return (
    <div className="flex w-full max-w-sm items-center space-x-2 mt-1">
      <Input type="search" placeholder="Player Name" />
      <Button type="submit">Search</Button>
    </div>
  )
}