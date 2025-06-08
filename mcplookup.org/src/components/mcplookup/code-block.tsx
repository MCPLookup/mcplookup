"use client"

import { Box, Text, Button, HStack } from "@chakra-ui/react"
import { useState } from "react"

interface CodeBlockProps {
  language: string
  code: string
  theme?: "light" | "dark"
  maxHeight?: string
  showCopy?: boolean
}

export function CodeBlock({ 
  language, 
  code, 
  theme = "dark", 
  maxHeight = "auto",
  showCopy = true 
}: CodeBlockProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error("Failed to copy code:", err)
    }
  }

  const themeStyles = {
    light: {
      bg: "gray.50",
      border: "gray.200",
      textColor: "gray.800",
      headerBg: "gray.100"
    },
    dark: {
      bg: "gray.900",
      border: "gray.700",
      textColor: "gray.100",
      headerBg: "gray.800"
    }
  }

  const styles = themeStyles[theme]

  return (
    <Box
      bg={styles.bg}
      border="1px solid"
      borderColor={styles.border}
      rounded="lg"
      overflow="hidden"
      maxH={maxHeight}
    >
      {/* Header */}
      <HStack
        justify="space-between"
        align="center"
        bg={styles.headerBg}
        px={4}
        py={2}
        borderBottom="1px solid"
        borderColor={styles.border}
      >
        <Text fontSize="xs" fontWeight="medium" color={styles.textColor} opacity={0.8}>
          {language.toUpperCase()}
        </Text>
        
        {showCopy && (
          <Button
            size="xs"
            variant="ghost"
            colorPalette="gray"
            onClick={handleCopy}
            _hover={{ bg: theme === "dark" ? "gray.700" : "gray.200" }}
          >
            {copied ? "✅ Copied" : "📋 Copy"}
          </Button>
        )}
      </HStack>

      {/* Code Content */}
      <Box
        p={4}
        overflow="auto"
        maxH={maxHeight === "auto" ? "auto" : maxHeight}
      >
        <Text
          fontSize="sm"
          fontFamily="mono"
          color={styles.textColor}
          whiteSpace="pre-wrap"
          lineHeight="relaxed"
        >
          {code.trim()}
        </Text>
      </Box>
    </Box>
  )
}
