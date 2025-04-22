"use client"

import type React from "react"
import { useState, useEffect, useCallback } from "react"

type ToastProps = {
  id: string
  title?: string
  description?: string
  action?: React.ReactNode
  open: boolean
}

// Create a store for toasts outside of the hook
let toasts: ToastProps[] = []
let listeners: Array<() => void> = []

const addToast = ({
  title,
  description,
  action,
}: { title?: string; description?: string; action?: React.ReactNode }) => {
  const id = Math.random().toString(36).substring(2, 9)
  toasts = [...toasts, { id, title, description, action, open: true }]
  listeners.forEach((listener) => listener())

  // Auto-dismiss after 5 seconds
  setTimeout(() => {
    dismissToast(id)
  }, 5000)

  return id
}

const dismissToast = (id: string) => {
  toasts = toasts.map((toast) => (toast.id === id ? { ...toast, open: false } : toast))
  listeners.forEach((listener) => listener())

  // Remove from array after animation
  setTimeout(() => {
    toasts = toasts.filter((toast) => toast.id !== id)
    listeners.forEach((listener) => listener())
  }, 300)
}

// Export a standalone toast function
export const toast = (props: { title?: string; description?: string; action?: React.ReactNode }) => {
  return addToast(props)
}

export function useToast() {
  const [localToasts, setLocalToasts] = useState<ToastProps[]>(toasts)

  useEffect(() => {
    const listener = () => {
      setLocalToasts([...toasts])
    }

    listeners.push(listener)
    return () => {
      listeners = listeners.filter((l) => l !== listener)
    }
  }, [])

  const dismiss = useCallback((id: string) => {
    dismissToast(id)
  }, [])

  return {
    toasts: localToasts,
    toast: addToast,
    dismiss,
  }
}
