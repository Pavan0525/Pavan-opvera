import React, { createContext, useContext, useState, useCallback } from 'react'

const ToastContext = createContext()

export const useToast = () => {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider')
  }
  return context
}

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([])

  const addToast = useCallback((toast) => {
    const id = Date.now() + Math.random()
    const newToast = {
      id,
      type: 'info', // info, success, warning, error
      title: '',
      message: '',
      duration: 5000, // 5 seconds
      ...toast
    }

    setToasts(prev => [...prev, newToast])

    // Auto remove toast after duration
    if (newToast.duration > 0) {
      setTimeout(() => {
        removeToast(id)
      }, newToast.duration)
    }

    return id
  }, [])

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id))
  }, [])

  const success = useCallback((message, options = {}) => {
    return addToast({
      type: 'success',
      message,
      ...options
    })
  }, [addToast])

  const error = useCallback((message, options = {}) => {
    return addToast({
      type: 'error',
      message,
      duration: 7000, // Longer duration for errors
      ...options
    })
  }, [addToast])

  const warning = useCallback((message, options = {}) => {
    return addToast({
      type: 'warning',
      message,
      ...options
    })
  }, [addToast])

  const info = useCallback((message, options = {}) => {
    return addToast({
      type: 'info',
      message,
      ...options
    })
  }, [addToast])

  const value = {
    toasts,
    addToast,
    removeToast,
    success,
    error,
    warning,
    info
  }

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastContainer />
    </ToastContext.Provider>
  )
}

const ToastContainer = () => {
  const { toasts, removeToast } = useToast()

  if (toasts.length === 0) return null

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm">
      {toasts.map(toast => (
        <Toast key={toast.id} toast={toast} onRemove={removeToast} />
      ))}
    </div>
  )
}

const Toast = ({ toast, onRemove }) => {
  const getToastStyles = (type) => {
    const baseStyles = "p-4 rounded-lg shadow-lg backdrop-blur-lg border flex items-start space-x-3 animate-in slide-in-from-right-full duration-300"
    
    switch (type) {
      case 'success':
        return `${baseStyles} bg-green-500/20 border-green-500/50 text-green-100`
      case 'error':
        return `${baseStyles} bg-red-500/20 border-red-500/50 text-red-100`
      case 'warning':
        return `${baseStyles} bg-yellow-500/20 border-yellow-500/50 text-yellow-100`
      case 'info':
      default:
        return `${baseStyles} bg-blue-500/20 border-blue-500/50 text-blue-100`
    }
  }

  const getIcon = (type) => {
    switch (type) {
      case 'success':
        return '✅'
      case 'error':
        return '❌'
      case 'warning':
        return '⚠️'
      case 'info':
      default:
        return 'ℹ️'
    }
  }

  return (
    <div className={getToastStyles(toast.type)}>
      <div className="flex-shrink-0 text-lg">
        {getIcon(toast.type)}
      </div>
      
      <div className="flex-1 min-w-0">
        {toast.title && (
          <div className="font-medium text-sm mb-1">
            {toast.title}
          </div>
        )}
        <div className="text-sm">
          {toast.message}
        </div>
      </div>
      
      <button
        onClick={() => onRemove(toast.id)}
        className="flex-shrink-0 text-current/60 hover:text-current/80 transition-colors"
      >
        <span className="sr-only">Close</span>
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
        </svg>
      </button>
    </div>
  )
}

export default ToastProvider
