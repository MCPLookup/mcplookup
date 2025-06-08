"use client"

import * as React from "react"

export interface TabsProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: string
  onValueChange?: (value: string) => void
  defaultValue?: string
}

export interface TabsListProps extends React.HTMLAttributes<HTMLDivElement> {}
export interface TabsTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  value: string
}
export interface TabsContentProps extends React.HTMLAttributes<HTMLDivElement> {
  value: string
}

const TabsContext = React.createContext<{
  value?: string
  onValueChange?: (value: string) => void
}>({})

export const Tabs = React.forwardRef<HTMLDivElement, TabsProps>(
  function Tabs({ value, onValueChange, defaultValue, children, ...props }, ref) {
    const [internalValue, setInternalValue] = React.useState(defaultValue || '')
    const currentValue = value ?? internalValue
    
    const handleValueChange = React.useCallback((newValue: string) => {
      if (onValueChange) {
        onValueChange(newValue)
      } else {
        setInternalValue(newValue)
      }
    }, [onValueChange])

    return (
      <TabsContext.Provider value={{ value: currentValue, onValueChange: handleValueChange }}>
        <div ref={ref} {...props}>
          {children}
        </div>
      </TabsContext.Provider>
    )
  }
)

export const TabsList = React.forwardRef<HTMLDivElement, TabsListProps>(
  function TabsList({ className, ...props }, ref) {
    return (
      <div
        ref={ref}
        className={`inline-flex h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground ${className || ''}`}
        {...props}
      />
    )
  }
)

export const TabsTrigger = React.forwardRef<HTMLButtonElement, TabsTriggerProps>(
  function TabsTrigger({ className, value, ...props }, ref) {
    const context = React.useContext(TabsContext)
    const isActive = context.value === value
    
    return (
      <button
        ref={ref}
        className={`inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 ${
          isActive 
            ? 'bg-background text-foreground shadow-sm' 
            : 'hover:bg-accent hover:text-accent-foreground'
        } ${className || ''}`}
        onClick={() => context.onValueChange?.(value)}
        {...props}
      />
    )
  }
)

export const TabsContent = React.forwardRef<HTMLDivElement, TabsContentProps>(
  function TabsContent({ className, value, ...props }, ref) {
    const context = React.useContext(TabsContext)
    const isActive = context.value === value
    
    if (!isActive) return null
    
    return (
      <div
        ref={ref}
        className={`mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${className || ''}`}
        {...props}
      />
    )
  }
)
