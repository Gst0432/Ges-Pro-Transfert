import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva } from "class-variance-authority";

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-medium ring-offset-background transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-blue-500 text-white hover:bg-blue-600 shadow-blue hover:shadow-blue-lg hover:-translate-y-1 font-semibold",
        destructive:
          "bg-red-500 text-red-50 hover:bg-red-600 shadow-lg transition-all duration-300",
        outline:
          "border-2 border-blue-500 bg-transparent text-blue-600 hover:bg-blue-500 hover:text-white transition-all duration-300 hover:shadow-blue",
        secondary:
          "bg-yellow-100 text-yellow-800 hover:bg-yellow-200 transition-all duration-300 border border-yellow-300",
        ghost: "hover:bg-blue-50 hover:text-blue-700 transition-all duration-300",
        link: "text-blue-600 underline-offset-4 hover:underline hover:text-blue-700 transition-colors duration-300",
        yellow: "bg-yellow-500 text-white hover:bg-yellow-600 shadow-yellow hover:shadow-yellow-lg hover:-translate-y-1 font-semibold",
        "yellow-outline": "border-2 border-yellow-500 bg-transparent text-yellow-600 hover:bg-yellow-500 hover:text-white transition-all duration-300 hover:shadow-yellow",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-12 rounded-lg px-8 text-base",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

const Button = React.forwardRef(({ className, variant, size, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : "button"
  return (
    (<Comp
      className={cn(buttonVariants({ variant, size, className }))}
      ref={ref}
      {...props} />)
  );
})
Button.displayName = "Button"

export { Button, buttonVariants }