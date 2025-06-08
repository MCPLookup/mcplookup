"use client"

import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import * as React from "react"

const MotionDiv = motion.div

interface CardProps {
  children: React.ReactNode
  variant?: "default" | "elevated" | "outlined"
  hover?: boolean
  hoverScale?: number
  className?: string
}

interface CardHeaderProps {
  children: React.ReactNode
  className?: string
}

interface CardBodyProps {
  children: React.ReactNode
  className?: string
}

interface CardFooterProps {
  children: React.ReactNode
  className?: string
}

// Main Card Root component with proper styling and contrast
const CardRoot = React.forwardRef<HTMLDivElement, CardProps>(
  ({ 
    children, 
    variant = "default", 
    hover = true, 
    hoverScale = 1.02, 
    className
  }, ref) => {
    const baseStyles = "rounded-lg border transition-all duration-200 ease-in-out"
    
    const variantStyles = {
      default: "bg-white border-gray-200 shadow-sm hover:shadow-md dark:bg-slate-800 dark:border-slate-700 dark:shadow-slate-900/20",
      elevated: "bg-white border-gray-200 shadow-md hover:shadow-lg dark:bg-slate-800 dark:border-slate-700 dark:shadow-slate-900/30",
      outlined: "bg-white border-gray-300 hover:border-gray-400 dark:bg-slate-800 dark:border-slate-600 dark:hover:border-slate-500"
    }

    const cardVariants = {
      initial: { scale: 1 },
      hover: hover ? { 
        scale: hoverScale,
        transition: { duration: 0.2, ease: "easeOut" }
      } : {}
    }

    return (
      <MotionDiv
        ref={ref}
        className={cn(baseStyles, variantStyles[variant], className)}
        variants={cardVariants}
        initial="initial"
        whileHover="hover"
      >
        {children}
      </MotionDiv>
    )
  }
)

// Card Header with proper text contrast
const CardHeader = React.forwardRef<HTMLDivElement, CardHeaderProps>(
  ({ children, className }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "p-6 pb-3 text-slate-900 dark:text-slate-100",
          className
        )}
      >
        {children}
      </div>
    )
  }
)

// Card Body with proper text contrast
const CardBody = React.forwardRef<HTMLDivElement, CardBodyProps>(
  ({ children, className }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "p-6 pt-0 text-slate-700 dark:text-slate-200",
          className
        )}
      >
        {children}
      </div>
    )
  }
)

// Card Footer with proper text contrast
const CardFooter = React.forwardRef<HTMLDivElement, CardFooterProps>(
  ({ children, className }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "p-6 pt-3 text-slate-600 dark:text-slate-300",
          className
        )}
      >
        {children}
      </div>
    )
  }
)

// Feature Card - specialized card for feature sections
interface FeatureCardProps {
  icon?: React.ReactNode
  title: string
  description: string
  iconBg?: string
  className?: string
}

const FeatureCard = React.forwardRef<HTMLDivElement, FeatureCardProps>(
  ({ icon, title, description, iconBg = "bg-slate-100 dark:bg-slate-700", className }, ref) => {
    return (
      <CardRoot
        ref={ref}
        variant="default"
        className={cn("text-center", className)}
      >
        <CardBody className="p-6 space-y-4">
          {icon && (
            <div className={cn(
              "w-12 h-12 rounded-lg flex items-center justify-center mx-auto",
              iconBg
            )}>
              {icon}
            </div>
          )}
          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
              {title}
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              {description}
            </p>
          </div>
        </CardBody>
      </CardRoot>
    )
  }
)

// Path Card - specialized card for user journey paths
interface PathCardProps {
  icon?: React.ReactNode
  title: string
  description: string
  actions?: React.ReactNode
  iconBg?: string
  className?: string
}

const PathCard = React.forwardRef<HTMLDivElement, PathCardProps>(
  ({ icon, title, description, actions, iconBg = "bg-slate-100 dark:bg-slate-700", className }, ref) => {
    return (
      <CardRoot
        ref={ref}
        variant="default"
        className={cn("text-center", className)}
      >
        <CardBody className="p-6 space-y-4">
          {icon && (
            <div className={cn(
              "w-12 h-12 rounded-lg flex items-center justify-center mx-auto",
              iconBg
            )}>
              {icon}
            </div>
          )}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
              {title}
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              {description}
            </p>
          </div>
          {actions && (
            <div className="space-y-2 mt-4">
              {actions}
            </div>
          )}
        </CardBody>
      </CardRoot>
    )
  }
)

// Code Card - specialized card for before/after code examples
interface CodeCardProps {
  title: string
  subtitle?: string
  code: string
  features: string[]
  type: "problem" | "solution"
  className?: string
}

const CodeCard = React.forwardRef<HTMLDivElement, CodeCardProps>(
  ({ title, subtitle, code, features, type, className }, ref) => {
    const iconBg = type === "problem" ? "bg-red-100 dark:bg-red-900/30" : "bg-green-100 dark:bg-green-900/30"
    const iconColor = type === "problem" ? "text-red-600 dark:text-red-400" : "text-green-600 dark:text-green-400"
    const featureColor = type === "problem" ? "text-red-500 dark:text-red-400" : "text-green-500 dark:text-green-400"
    
    return (
      <CardRoot
        ref={ref}
        variant="default"
        className={className}
      >
        <CardBody className="p-6 space-y-4">
          <div className="flex items-center space-x-3">
            <div className={cn("w-6 h-6 rounded-full flex items-center justify-center", iconBg)}>
              <span className={cn("text-sm font-bold", iconColor)}>
                {type === "problem" ? "❌" : "✅"}
              </span>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                {title}
              </h3>
              {subtitle && (
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  {subtitle}
                </p>
              )}
            </div>
          </div>

          <div className="bg-slate-900 rounded-lg p-4 overflow-x-auto">
            <pre className="text-sm text-slate-300 leading-relaxed">
              <code dangerouslySetInnerHTML={{ __html: code }} />
            </pre>
          </div>

          <div className="space-y-2">
            {features.map((feature, index) => (
              <div key={index} className="flex items-center text-sm">
                <span className={cn("mr-2", featureColor)}>•</span>
                <span className="text-slate-600 dark:text-slate-300">{feature}</span>
              </div>
            ))}
          </div>
        </CardBody>
      </CardRoot>
    )
  }
)

// Export components
CardRoot.displayName = "CardRoot"
CardHeader.displayName = "CardHeader"
CardBody.displayName = "CardBody"
CardFooter.displayName = "CardFooter"
FeatureCard.displayName = "FeatureCard"
PathCard.displayName = "PathCard"
CodeCard.displayName = "CodeCard"

export {
  CardRoot,
  CardHeader,
  CardBody,
  CardFooter,
  FeatureCard,
  PathCard,
  CodeCard
}

// Export as namespace for dot notation usage
export const Card = {
  Root: CardRoot,
  Header: CardHeader,
  Body: CardBody,
  Footer: CardFooter,
  Feature: FeatureCard,
  Path: PathCard,
  Code: CodeCard
}
