import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { CircularProgress, Box } from '@mui/material'

const AdminRoute = ({ children }) => {
  const { isAuthenticated, isAdmin, loading } = useAuth()

  if (loading) {
    return (
      <Box 
        display="flex" 
        justifyContent="center" 
        alignItems="center" 
        minHeight="100vh"
        sx={{ bgcolor: '#0B0B0B' }}
      >
        <CircularProgress sx={{ color: '#C1121F' }} />
      </Box>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  if (!isAdmin()) {
    return <Navigate to="/dashboard" replace />
  }

  return children
}

export default AdminRoute
