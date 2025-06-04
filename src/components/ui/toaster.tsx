"use client"

import React, { createContext, useContext, useState, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { FaCheckCircle, FaExclamationTriangle, FaInfoCircle, FaTimes, FaSpinner } from "react-icons/fa"

const MotionDiv = motion.div

export interface Toast {
  id: string
  title: string
  description?: string
  type: "success" | "error" | "warning" | "info" | "loading"
  duration?: number | null
  closable?: boolean
}

interface ToasterContextType {
  toasts: Toast[]
  addToast: (toast: Omit<Toast, 'id'>) => string
  removeToast: (id: string) => void
  updateToast: (id: string, updates: Partial<Toast>) => void
}

const ToasterContext = createContext<ToasterContextType | undefined>(undefined)

export function useToaster() {
  const context = useContext(ToasterContext)
  if (!context) {
    throw new Error('useToaster must be used within a ToasterProvider')
  }
  return context
}

export function ToasterProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const addToast = useCallback((toast: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9)
    const newToast = { ...toast, id }

    setToasts(prev => [...prev, newToast])

    // Auto remove after duration
    if (toast.duration !== null && toast.duration !== undefined && toast.duration > 0) {
      setTimeout(() => {
        setToasts(prev => prev.filter(t => t.id !== id))
      }, toast.duration)
    }

    return id
  }, [])

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id))
  }, [])

  const updateToast = useCallback((id: string, updates: Partial<Toast>) => {
    setToasts(prev => prev.map(toast =>
      toast.id === id ? { ...toast, ...updates } : toast
    ))
  }, [])

  return (
<<<<<<< HEAD
    <ToasterContext.Provider value={{ toasts, addToast, removeToast, updateToast }}>
      {children}
      <Toaster />
    </ToasterContext.Provider>
=======
    <Portal>
      <ChakraToaster toaster={toaster} insetInline={{ mdDown: "4" }}>
        {(toast) => (
          <MotionBox
            initial={{ opacity: 0, x: 100, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 100, scale: 0.9 }}
            transition={{
              type: "spring",
              stiffness: 200,
              damping: 20,
              duration: 0.4
            }}
            whileHover={{ scale: 1.02 }}
          >
            <Toast.Root
              width={{ md: "sm" }}
              bg="white"
              _dark={{ 
                bg: "gray.800",
                borderColor: "gray.700"
              }}
              shadow="xl"
              border="1px"
              borderColor="gray.200"
              rounded="lg"
              overflow="hidden"
            >
              {/* Progress bar for timed toasts */}
              {toast.duration && toast.duration > 0 && (
                <MotionBox
                  position="absolute"
                  top="0"
                  left="0"
                  height="2px"
                  bg={
                    toast.type === "success" ? "green.500" :
                    toast.type === "error" ? "red.500" :
                    toast.type === "warning" ? "yellow.500" :
                    "blue.500"
                  }
                  initial={{ width: "100%" }}
                  animate={{ width: "0%" }}
                  transition={{ duration: toast.duration / 1000, ease: "linear" }}
                />
              )}

              <Stack direction="row" gap="3" align="start" p="4">
                {/* Enhanced icons */}
                {toast.type === "loading" ? (
                  <MotionBox
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  >
                    <Spinner size="sm" color="blue.500" />
                  </MotionBox>
                ) : (
                  <MotionBox
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{
                      type: "spring",
                      stiffness: 200,
                      damping: 15,
                      delay: 0.1
                    }}
                  >
                    {toast.type === "success" && (
                      <Icon as={FaCheckCircle} color="green.500" boxSize="5" />
                    )}
                    {toast.type === "error" && (
                      <Icon as={FaTimes} color="red.500" boxSize="5" />
                    )}
                    {toast.type === "warning" && (
                      <Icon as={FaExclamationTriangle} color="yellow.500" boxSize="5" />
                    )}
                    {toast.type === "info" && (
                      <Icon as={FaInfoCircle} color="blue.500" boxSize="5" />
                    )}
                    {!toast.type && <Toast.Indicator />}
                  </MotionBox>
                )}

                <Stack gap="1" flex="1" maxWidth="100%">
                  {toast.title && (
                    <MotionBox
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2, duration: 0.3 }}
                    >
                      <Toast.Title fontWeight="semibold">
                        {toast.title}
                      </Toast.Title>
                    </MotionBox>
                  )}
                  {toast.description && (
                    <MotionBox
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3, duration: 0.3 }}
                    >
                      <Toast.Description color="gray.600" _dark={{ color: "gray.300" }}>
                        {toast.description}
                      </Toast.Description>
                    </MotionBox>
                  )}
                </Stack>

                {/* Enhanced action and close buttons */}
                <Stack direction="row" gap="2">
                  {toast.action && (
                    <MotionBox
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.4, duration: 0.2 }}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Toast.ActionTrigger>
                        {toast.action.label}
                      </Toast.ActionTrigger>
                    </MotionBox>
                  )}

                  {toast.closable && (
                    <MotionBox
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.5, duration: 0.2 }}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <Toast.CloseTrigger />
                    </MotionBox>
                  )}
                </Stack>
              </Stack>
            </Toast.Root>
          </MotionBox>
        )}
      </ChakraToaster>
    </Portal>
>>>>>>> 6f40b1d5753db3f8009af3b63c7ec9fb64a2b1c1
  )
}

function Toaster() {
  const { toasts, removeToast } = useToaster()

<<<<<<< HEAD
  return (
    <div className="fixed bottom-4 right-4 z-50 space-y-2 max-w-sm">
      <AnimatePresence>
        {toasts.map((toast) => (
          <ToastItem
            key={toast.id}
            toast={toast}
            onClose={() => removeToast(toast.id)}
          />
        ))}
      </AnimatePresence>
    </div>
  )
}

interface ToastItemProps {
  toast: Toast
  onClose: () => void
}

function ToastItem({ toast, onClose }: ToastItemProps) {
  const getIcon = () => {
    switch (toast.type) {
      case "success":
        return <FaCheckCircle className="w-5 h-5 text-green-500" />
      case "error":
        return <FaTimes className="w-5 h-5 text-red-500" />
      case "warning":
        return <FaExclamationTriangle className="w-5 h-5 text-yellow-500" />
      case "info":
        return <FaInfoCircle className="w-5 h-5 text-blue-500" />
      case "loading":
        return (
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          >
            <FaSpinner className="w-5 h-5 text-blue-500" />
          </motion.div>
        )
      default:
        return null
    }
  }

  const getBgColor = () => {
    switch (toast.type) {
      case "success":
        return "bg-green-50 border-green-200"
      case "error":
        return "bg-red-50 border-red-200"
      case "warning":
        return "bg-yellow-50 border-yellow-200"
      case "info":
        return "bg-blue-50 border-blue-200"
      case "loading":
        return "bg-blue-50 border-blue-200"
      default:
        return "bg-white border-gray-200"
    }
  }

  return (
    <MotionDiv
      initial={{ opacity: 0, x: 100, scale: 0.9 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 100, scale: 0.9 }}
      transition={{
        type: "spring",
        stiffness: 200,
        damping: 20,
        duration: 0.4
      }}
      whileHover={{ scale: 1.02 }}
      className={`relative p-4 rounded-lg border shadow-lg ${getBgColor()}`}
    >
      {/* Progress bar for timed toasts */}
      {toast.duration && toast.duration > 0 && (
        <motion.div
          className="absolute top-0 left-0 h-1 bg-current opacity-30 rounded-t-lg"
          initial={{ width: "100%" }}
          animate={{ width: "0%" }}
          transition={{ duration: toast.duration / 1000, ease: "linear" }}
        />
      )}

      <div className="flex items-start gap-3">
        {/* Icon */}
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{
            type: "spring",
            stiffness: 200,
            damping: 15,
            delay: 0.1
          }}
        >
          {getIcon()}
        </motion.div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {toast.title && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <h4 className="text-sm font-semibold text-gray-900 leading-tight">
                {toast.title}
              </h4>
            </motion.div>
          )}

          {toast.description && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <p className={`text-sm text-gray-600 ${toast.title ? 'mt-1' : ''}`}>
                {toast.description}
              </p>
            </motion.div>
          )}
        </div>

        {/* Close button */}
        {toast.closable !== false && (
          <motion.button
            onClick={onClose}
            className="absolute top-2 right-2 p-1 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            transition={{ type: "spring", stiffness: 400, damping: 17 }}
          >
            <FaTimes className="w-3 h-3" />
          </motion.button>
        )}
      </div>
    </MotionDiv>
  )
}

// Hook to create toasts with convenience methods
export function useToast() {
  const { addToast, removeToast, updateToast } = useToaster()

  return {
    success: (title: string, description?: string, options?: Partial<Toast>) =>
      addToast({
        title,
        description,
        type: "success",
        duration: 4000,
        closable: true,
        ...options
      }),

    error: (title: string, description?: string, options?: Partial<Toast>) =>
      addToast({
        title,
        description,
        type: "error",
        duration: 6000,
        closable: true,
        ...options
      }),

    warning: (title: string, description?: string, options?: Partial<Toast>) =>
      addToast({
        title,
        description,
        type: "warning",
        duration: 5000,
        closable: true,
        ...options
      }),

    info: (title: string, description?: string, options?: Partial<Toast>) =>
      addToast({
        title,
        description,
        type: "info",
        duration: 4000,
        closable: true,
        ...options
      }),

    loading: (title: string, description?: string, options?: Partial<Toast>) =>
      addToast({
        title,
        description,
        type: "loading",
        duration: null,
        closable: false,
        ...options
      }),

    remove: removeToast,
    update: updateToast
  }
=======
  error: (title: string, description?: string) =>
    toaster.create({
      title,
      description,
      type: "error",
      duration: 6000,
      closable: true,
    }),

  warning: (title: string, description?: string) =>
    toaster.create({
      title,
      description,
      type: "warning",
      duration: 5000,
      closable: true,
    }),

  info: (title: string, description?: string) =>
    toaster.create({
      title,
      description,
      type: "info",
      duration: 4000,
      closable: true,
    }),

  loading: (title: string, description?: string) =>
    toaster.create({
      title,
      description,
      type: "loading",
      duration: undefined, // Persist until manually closed
      closable: false,
    }),
>>>>>>> 6f40b1d5753db3f8009af3b63c7ec9fb64a2b1c1
}
