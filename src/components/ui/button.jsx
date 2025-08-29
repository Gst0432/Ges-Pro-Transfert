import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva } from "class-variance-authority";

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-golden-500 text-white hover:bg-golden-600 shadow-golden transition-all duration-300 hover:shadow-golden-lg hover:-translate-y-1",
        destructive:
          "bg-red-500 text-red-50 hover:bg-red-600 shadow-lg transition-all duration-300",
        outline:
          "border-2 border-golden-500 bg-transparent text-golden-600 hover:bg-golden-500 hover:text-white transition-all duration-300 hover:shadow-golden",
        secondary:
          "bg-golden-100 text-golden-800 hover:bg-golden-200 transition-all duration-300",
        ghost: "hover:bg-golden-100 hover:text-golden-800 transition-all duration-300",
        link: "text-golden-600 underline-offset-4 hover:underline hover:text-golden-700 transition-colors duration-300",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
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