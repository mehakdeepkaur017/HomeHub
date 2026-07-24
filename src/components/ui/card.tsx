import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const cardVariants = cva(
  "bg-card text-card-foreground transition-all duration-300 ease-out",
  {
    variants: {
      variant: {
        display: "shadow-lg border border-black/5 dark:border-white/5 texture-paper hover:-translate-y-[2px] hover:shadow-float hover:border-black/10 dark:hover:border-white/10 rounded-[2rem] overflow-hidden relative",
        workspace: "shadow-sm border border-border/40 hover:-translate-y-[1px] hover:shadow-md hover:border-primary/20 rounded-3xl overflow-hidden bg-gradient-to-b from-card to-background relative",
        floating: "shadow-md border border-primary/5 hover:-translate-y-[2px] hover:shadow-glow rounded-3xl backdrop-blur-xl bg-card/80 relative overflow-hidden",
        timeline: "border-none shadow-none rounded-none bg-transparent hover:bg-secondary/20",
        information: "border border-border/30 bg-secondary/20 shadow-none hover:bg-secondary/40 rounded-2xl",
        bento: "shadow-md border border-border/50 hover:-translate-y-[2px] hover:shadow-lg hover:border-primary/20 rounded-[2.5rem] bg-gradient-to-br from-card to-secondary/10 relative overflow-hidden",
      },
    },
    defaultVariants: {
      variant: "workspace",
    },
  }
)

export interface CardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(cardVariants({ variant, className }))}
      {...props}
    />
  )
)
Card.displayName = "Card"

const CardHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("flex flex-col space-y-2 p-6 md:p-8", className)}
      {...props}
    />
  )
)
CardHeader.displayName = "CardHeader"

const CardTitle = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h3
      ref={ref}
      className={cn(
        "text-xl font-serif text-primary leading-tight",
        className
      )}
      {...props}
    />
  )
)
CardTitle.displayName = "CardTitle"

const CardDescription = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => (
    <p
      ref={ref}
      className={cn("text-body text-muted-foreground", className)}
      {...props}
    />
  )
)
CardDescription.displayName = "CardDescription"

const CardContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("p-6 md:p-8 pt-0", className)} {...props} />
  )
)
CardContent.displayName = "CardContent"

const CardFooter = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("flex items-center p-6 md:p-8 pt-0", className)}
      {...props}
    />
  )
)
CardFooter.displayName = "CardFooter"

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent }
