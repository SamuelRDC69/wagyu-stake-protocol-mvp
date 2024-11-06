import React, { createContext, useContext, useState } from 'react'
import { ToastConfig } from '../types/notification'

interface NotificationsContextType {
  showToast: (message: string, config?: ToastConfig) => void
  clearToasts: () => void
}

export const NotificationsContext = createContext<NotificationsContextType | undefined>(undefined)

export const NotificationsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<any[]>([])

  const showToast = (message: string, config?: ToastConfig) => {
    // Implementation here
  }

  const clearToasts = () => {
    setToasts([])
  }

  return (
    <NotificationsContext.Provider value={{ showToast, clearToasts }}>
      {children}
    </NotificationsContext.Provider>
  )
}