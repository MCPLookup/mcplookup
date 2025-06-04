"use client"

import {
  Toaster as ChakraToaster,
  Portal,
  Spinner,
  Stack,
  Toast,
  createToaster,
  Box,
  Icon,
} from "@chakra-ui/react"
import { motion, AnimatePresence } from "framer-motion"
import { FaCheckCircle, FaExclamationTriangle, FaInfoCircle, FaTimes } from "react-icons/fa"

const MotionBox = motion(Box)

export const toaster = createToaster({
  placement: "bottom-end",
  pauseOnPageIdle: true,
  max: 5,
})

// Enhanced toaster with animations
export const Toaster = () => {
  return (
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
              _dark={{ bg: "gray.800" }}
              shadow="xl"
              border="1px"
              borderColor="gray.200"
              _dark={{ borderColor: "gray.700" }}
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
                      <Toast.ActionTrigger
                        size="sm"
                        variant="outline"
                        colorPalette={
                          toast.type === "success" ? "green" :
                          toast.type === "error" ? "red" :
                          toast.type === "warning" ? "yellow" :
                          "blue"
                        }
                      >
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
                      <Toast.CloseTrigger
                        size="sm"
                        variant="ghost"
                        color="gray.500"
                        _hover={{ color: "gray.700", bg: "gray.100" }}
                        _dark={{
                          color: "gray.400",
                          _hover: { color: "gray.200", bg: "gray.700" }
                        }}
                      />
                    </MotionBox>
                  )}
                </Stack>
              </Stack>
            </Toast.Root>
          </MotionBox>
        )}
      </ChakraToaster>
    </Portal>
  )
}

// Enhanced toast creation functions with better defaults
export const createAnimatedToast = {
  success: (title: string, description?: string) =>
    toaster.create({
      title,
      description,
      type: "success",
      duration: 4000,
      closable: true,
    }),

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
      duration: null, // Persist until manually closed
      closable: false,
    }),
}
