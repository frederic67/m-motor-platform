import { toast } from 'react-toastify'

export const useNotification = () => {
  const showSuccess = (message) => {
    toast.success(message, {
      position: 'top-right',
      autoClose: 3000,
    })
  }

  const showError = (message) => {
    toast.error(message, {
      position: 'top-right',
      autoClose: 4000,
    })
  }

  const showInfo = (message) => {
    toast.info(message, {
      position: 'top-right',
      autoClose: 3000,
    })
  }

  const showWarning = (message) => {
    toast.warning(message, {
      position: 'top-right',
      autoClose: 3000,
    })
  }

  return {
    showSuccess,
    showError,
    showInfo,
    showWarning,
  }
}
