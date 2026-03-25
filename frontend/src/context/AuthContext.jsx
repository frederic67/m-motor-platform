import { createContext, useContext, useState, useEffect } from 'react'
import { authAPI } from '../services/api'
import api from '../services/api'

const AuthContext = createContext(null)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Load user from localStorage on mount
    const storedUser = localStorage.getItem('user')
    const storedToken = localStorage.getItem('token')
    
    if (storedUser && storedToken) {
      setUser(JSON.parse(storedUser))
    }
    setLoading(false)
  }, [])

  const login = async (email, password) => {
    try {
      const response = await authAPI.login({ email, password })
      const { access_token } = response.data

      localStorage.setItem('token', access_token)

      // Récupérer le vrai rôle depuis l'API
      const meResponse = await api.get('/auth/me', {
        headers: { Authorization: `Bearer ${access_token}` }
      })
      const userData = {
        email: meResponse.data.email,
        id: meResponse.data.id,
        full_name: meResponse.data.full_name,
        role: meResponse.data.role,
      }

      localStorage.setItem('user', JSON.stringify(userData))
      setUser(userData)

      return { success: true }
    } catch (error) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      setUser(null)
      return { 
        success: false, 
        error: error.response?.data?.detail || 'Login failed' 
      }
    }
  }

  const register = async (userData) => {
    const payload = {
      full_name: userData.full_name,
      email: userData.email,
      password: userData.password,
    }
    try {
      const response = await authAPI.register(payload)
      return { success: true, data: response.data }
    } catch (error) {
      console.error('[register] error:', error)
      console.error('[register] response data:', error.response?.data)
      console.error('[register] status:', error.response?.status)

      const detail = error.response?.data?.detail
      let errorMessage
      if (Array.isArray(detail)) {
        errorMessage = detail.map((e) => e.msg || JSON.stringify(e)).join(' | ')
      } else if (typeof detail === 'string') {
        errorMessage = detail
      } else if (error.message) {
        errorMessage = error.message
      } else {
        errorMessage = 'Inscription échouée — vérifiez votre connexion et réessayez.'
      }

      return { success: false, error: errorMessage }
    }
  }

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setUser(null)
  }

  const isAdmin = () => {
    return user?.role === 'ADMIN'
  }

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    isAuthenticated: !!user,
    isAdmin,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
