import * as React from "react"

import { cn } from "@/lib/utils"

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-9 w-full rounded-md border border-input bg-transparent px-2 py-1 text-base shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
          "[&::-webkit-search-cancel-button]:relative [&::-webkit-search-cancel-button]:h-4 [&::-webkit-search-cancel-button]:w-4 [&::-webkit-search-cancel-button]:cursor-pointer [&::-webkit-search-cancel-button]:appearance-none [&::-webkit-search-cancel-button]:bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20width%3D%2224%22%20height%3D%2224%22%20fill%3D%22none%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cpath%20d%3D%22m12%2010.586%204.95-4.95%201.414%201.414-4.95%204.95%204.95%204.95-1.414%201.414-4.95-4.95-4.95%204.95-1.414-1.414%204.95-4.95-4.95-4.95L7.05%205.636l4.95%204.95Z%22%20fill%3D%22%236B7280%22%2F%3E%3C%2Fsvg%3E')] [&::-webkit-search-cancel-button]:bg-contain [&::-webkit-search-cancel-button]:bg-center [&::-webkit-search-cancel-button]:bg-no-repeat",
          className,
        )}
        ref={ref}
        {...props}
      />
    )
  },
)
Input.displayName = "Input"

export { Input }
