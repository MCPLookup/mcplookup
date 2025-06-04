"use client"

<<<<<<< HEAD
import { motion, AnimatePresence } from "framer-motion"
import * as React from "react"
import { LoadingSpinner } from "./loading"

export interface AnimatedButtonProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'onDrag' | 'onDragEnd' | 'onDragStart' | 'onAnimationStart' | 'onAnimationEnd' | 'onTransitionEnd'> {
=======
import { Button as ChakraButton, ButtonProps } from "@chakra-ui/react"
import * as React from "react"

export interface AnimatedButtonProps extends ButtonProps {
>>>>>>> 6f40b1d5753db3f8009af3b63c7ec9fb64a2b1c1
  children: React.ReactNode
  state?: "idle" | "loading" | "success" | "error"
  loadingText?: string
  hoverScale?: number
  clickScale?: number
  rippleEffect?: boolean
  glowOnHover?: boolean
<<<<<<< HEAD
  pulseOnClick?: boolean
  loadingText?: string
  successIcon?: React.ElementType
  errorIcon?: React.ElementType
  state?: "idle" | "loading" | "success" | "error"
  animationDuration?: number
  variant?: "primary" | "secondary" | "outline" | "ghost"
  size?: "sm" | "md" | "lg"
}

export const AnimatedButton = React.forwardRef<HTMLButtonElement, AnimatedButtonProps>(
  function AnimatedButton({
    children,
    hoverScale = 1.05,
    clickScale = 0.95,
    rippleEffect = true,
    glowOnHover = false,
    pulseOnClick = false,
    loadingText = "Loading...",
    successIcon,
    errorIcon,
    state = "idle",
    animationDuration = 0.2,
    variant = "primary",
    size = "md",
    disabled,
    onClick,
    className,
    ...props
  }, ref) {
    const [isClicked, setIsClicked] = React.useState(false)
    const [ripples, setRipples] = React.useState<Array<{ id: number; x: number; y: number }>>([])
    const buttonRef = React.useRef<HTMLButtonElement>(null)

    const isLoading = state === "loading"
    const isSuccess = state === "success"
    const isError = state === "error"
    const isDisabled = disabled || isLoading

    // Get button styles based on variant and size
    const getButtonStyles = () => {
      const baseStyles = "inline-flex items-center justify-center font-medium rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 relative overflow-hidden"

      const sizeStyles = {
        sm: "px-3 py-2 text-sm",
        md: "px-4 py-2 text-base",
        lg: "px-6 py-3 text-lg"
      }

      const variantStyles = {
        primary: "bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500",
        secondary: "bg-gray-600 text-white hover:bg-gray-700 focus:ring-gray-500",
        outline: "border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 focus:ring-blue-500",
        ghost: "text-gray-700 hover:bg-gray-100 focus:ring-gray-500"
      }

      return `${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className || ""}`
    }

    const buttonVariants = {
      idle: {
        scale: 1,
        boxShadow: glowOnHover ? "0 0 0 0 rgba(59, 130, 246, 0)" : undefined,
        transition: {
          duration: animationDuration,
          ease: "easeOut"
        }
      },
      hover: {
        scale: isDisabled ? 1 : hoverScale,
        boxShadow: glowOnHover && !isDisabled ? "0 0 20px 0 rgba(59, 130, 246, 0.4)" : undefined,
        transition: {
          duration: animationDuration,
          ease: "easeOut"
        }
      },
      tap: {
        scale: isDisabled ? 1 : clickScale,
        transition: {
          duration: 0.1,
          ease: "easeInOut"
        }
      },
      pulse: pulseOnClick ? {
        scale: [1, 1.1, 1],
        transition: {
          duration: 0.6,
          ease: "easeInOut"
        }
      } : {}
    }

    const contentVariants = {
      idle: { opacity: 1, y: 0 },
      loading: { opacity: 0, y: -10 },
      success: { opacity: 1, y: 0 },
      error: { opacity: 1, y: 0 }
    }

    const iconVariants = {
      initial: { scale: 0, rotate: -180 },
      animate: { 
        scale: 1, 
        rotate: 0,
        transition: {
          type: "spring",
          stiffness: 200,
          damping: 15
        }
      },
      exit: { 
        scale: 0, 
        rotate: 180,
        transition: {
          duration: 0.2
        }
      }
    }

    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
      if (isDisabled) return

      setIsClicked(true)
      setTimeout(() => setIsClicked(false), 600)

      // Ripple effect
      if (rippleEffect && buttonRef.current) {
        const rect = buttonRef.current.getBoundingClientRect()
        const x = event.clientX - rect.left
        const y = event.clientY - rect.top
        const newRipple = { id: Date.now(), x, y }
        
        setRipples(prev => [...prev, newRipple])
        setTimeout(() => {
          setRipples(prev => prev.filter(ripple => ripple.id !== newRipple.id))
        }, 600)
      }

      onClick?.(event)
    }

    const getButtonContent = () => {
      switch (state) {
        case "loading":
          return (
            <motion.div
              style={{ display: "flex", alignItems: "center", gap: "8px" }}
              variants={contentVariants}
              initial="idle"
              animate="loading"
            >
              <LoadingSpinner size="sm" />
              {loadingText}
            </motion.div>
          )
        case "success":
          return (
            <motion.div
              style={{ display: "flex", alignItems: "center", gap: "8px" }}
              variants={contentVariants}
              initial="idle"
              animate="success"
            >
              <AnimatePresence>
                {successIcon && (
                  <motion.div
                    variants={iconVariants}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                  >
                    {React.createElement(successIcon, { className: "w-4 h-4 text-green-500" })}
                  </motion.div>
                )}
              </AnimatePresence>
              {children}
            </motion.div>
          )
        case "error":
          return (
            <motion.div
              style={{ display: "flex", alignItems: "center", gap: "8px" }}
              variants={contentVariants}
              initial="idle"
              animate="error"
            >
              <AnimatePresence>
                {errorIcon && (
                  <motion.div
                    variants={iconVariants}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                  >
                    {React.createElement(errorIcon, { className: "w-4 h-4 text-red-500" })}
                  </motion.div>
                )}
              </AnimatePresence>
              {children}
            </motion.div>
          )
        default:
          return (
            <motion.div
              variants={contentVariants}
              initial="idle"
              animate="idle"
            >
              {children}
            </motion.div>
          )
      }
    }

    return (
      <motion.button
        ref={buttonRef}
        className={getButtonStyles()}
        variants={buttonVariants}
        initial="idle"
        whileHover="hover"
        whileTap="tap"
        animate={isClicked && pulseOnClick ? "pulse" : "idle"}
        onClick={handleClick}
        disabled={isDisabled}
        {...props}
      >
        {/* Ripple effects */}
        <AnimatePresence>
          {ripples.map((ripple) => (
            <motion.div
              key={ripple.id}
              style={{
                position: "absolute",
                left: ripple.x,
                top: ripple.y,
                width: 4,
                height: 4,
                borderRadius: "50%",
                backgroundColor: "rgba(255, 255, 255, 0.6)",
                pointerEvents: "none",
                transform: "translate(-50%, -50%)"
              }}
              initial={{ scale: 0, opacity: 1 }}
              animate={{ scale: 20, opacity: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
            />
          ))}
        </AnimatePresence>

        {getButtonContent()}
      </motion.button>
=======
}

export const AnimatedButton = React.forwardRef<HTMLButtonElement, AnimatedButtonProps>(
  (props, ref) => {
    const { state, loadingText, hoverScale, clickScale, rippleEffect, glowOnHover, ...rest } = props
    return (
      <ChakraButton 
        ref={ref} 
        loading={state === "loading"}
        {...rest}
      />
>>>>>>> 6f40b1d5753db3f8009af3b63c7ec9fb64a2b1c1
    )
  }
)

<<<<<<< HEAD
// Floating Action Button with enhanced animations
export interface FloatingActionButtonProps extends AnimatedButtonProps {
  position?: "bottom-right" | "bottom-left" | "top-right" | "top-left"
  offset?: number
  expandOnHover?: boolean
  tooltip?: string
}

export const FloatingActionButton = React.forwardRef<HTMLButtonElement, FloatingActionButtonProps>(
  function FloatingActionButton({
    position = "bottom-right",
    offset = 24,
    expandOnHover = false,
    tooltip,
    children,
    ...props
  }, ref) {
    const getPosition = () => {
      switch (position) {
        case "bottom-left":
          return { bottom: offset, left: offset }
        case "top-right":
          return { top: offset, right: offset }
        case "top-left":
          return { top: offset, left: offset }
        default:
          return { bottom: offset, right: offset }
      }
    }

    return (
      <motion.div
        style={{
          position: "fixed",
          zIndex: 1000,
          ...getPosition()
        }}
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{
          type: "spring",
          stiffness: 200,
          damping: 20,
          delay: 0.2
        }}
        whileHover={expandOnHover ? { scale: 1.1 } : {}}
      >
        <AnimatedButton
          ref={ref}
          className="rounded-full shadow-lg"
          size="lg"
          hoverScale={1.1}
          glowOnHover
          {...props}
        >
          {children}
        </AnimatedButton>
      </motion.div>
    )
  }
)

export default AnimatedButton
=======
AnimatedButton.displayName = "AnimatedButton"
>>>>>>> 6f40b1d5753db3f8009af3b63c7ec9fb64a2b1c1
