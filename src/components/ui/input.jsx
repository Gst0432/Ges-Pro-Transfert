import * as React from "react"

import { cn } from "@/lib/utils"

const Input = React.forwardRef(({ className, type, ...props }, ref) => {
  return (
    (<input
      type={type}
      className={cn(
        "flex h-10 w-full rounded-md border-2 border-golden-200 bg-white/90 px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-golden-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-golden-500 focus-visible:ring-offset-2 focus-visible:border-golden-500 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-300 hover:border-golden-300 shadow-sm hover:shadow-golden",
        className
      )}
      ref={ref}
      {...props} />)
  );
})
Input.displayName = "Input"

export { Input }