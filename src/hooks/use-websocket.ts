"use client"

import { useEffect, useRef, useState } from 'react'

export interface UseWebSocketOptions {
  onOpen?: (event: Event) => void
  onMessage?: (event: MessageEvent) => void
  onError?: (event: Event) => void
  onClose?: (event: CloseEvent) => void
  shouldReconnect?: boolean
  reconnectInterval?: number
  maxReconnectAttempts?: number
}

export interface UseWebSocketReturn {
  socket: WebSocket | null
  connectionStatus: 'connecting' | 'connected' | 'disconnected' | 'error'
  sendMessage: (message: string | object) => void
  disconnect: () => void
  reconnect: () => void
}

export function useWebSocket(
  url: string | null,
  options: UseWebSocketOptions = {}
): UseWebSocketReturn {
  const {
    onOpen,
    onMessage,
    onError,
    onClose,
    shouldReconnect = true,
    reconnectInterval = 3000,
    maxReconnectAttempts = 5
  } = options

  const [socket, setSocket] = useState<WebSocket | null>(null)
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected' | 'error'>('disconnected')
  const reconnectAttempts = useRef(0)
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined)

  const connect = () => {
    if (!url) return

    try {
      setConnectionStatus('connecting')
      const ws = new WebSocket(url)

      ws.onopen = (event) => {
        setConnectionStatus('connected')
        reconnectAttempts.current = 0
        onOpen?.(event)
      }

      ws.onmessage = (event) => {
        onMessage?.(event)
      }

      ws.onerror = (event) => {
        setConnectionStatus('error')
        onError?.(event)
      }

      ws.onclose = (event) => {
        setConnectionStatus('disconnected')
        setSocket(null)
        onClose?.(event)

        // Attempt to reconnect if enabled and not manually closed
        if (shouldReconnect && reconnectAttempts.current < maxReconnectAttempts && !event.wasClean) {
          reconnectAttempts.current++
          reconnectTimeoutRef.current = setTimeout(() => {
            connect()
          }, reconnectInterval)
        }
      }

      setSocket(ws)
    } catch (error) {
      setConnectionStatus('error')
      console.error('WebSocket connection error:', error)
    }
  }

  const disconnect = () => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current)
    }
    if (socket) {
      socket.close(1000, 'Manual disconnect')
    }
  }

  const reconnect = () => {
    disconnect()
    reconnectAttempts.current = 0
    connect()
  }

  const sendMessage = (message: string | object) => {
    if (socket && socket.readyState === WebSocket.OPEN) {
      const messageString = typeof message === 'string' ? message : JSON.stringify(message)
      socket.send(messageString)
    } else {
      console.warn('WebSocket is not connected')
    }
  }

  useEffect(() => {
    if (url) {
      connect()
    }

    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current)
      }
      if (socket) {
        socket.close()
      }
    }
  }, [url])

  return {
    socket,
    connectionStatus,
    sendMessage,
    disconnect,
    reconnect
  }
}
