import React from 'react'
import { Box, Button, Typography } from '@mui/material'

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo)
  }

  handleReload = () => {
    window.location.reload()
  }

  render() {
    if (this.state.hasError) {
      return (
        <Box
          sx={{
            minHeight: '100vh',
            bgcolor: '#0B0B0B',
            color: '#F5F5F5',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            p: 3,
          }}
        >
          <Box sx={{ textAlign: 'center', maxWidth: 520 }}>
            <Typography variant="h4" sx={{ mb: 2, fontFamily: 'Playfair Display' }}>
              Une erreur est survenue
            </Typography>
            <Typography variant="body1" sx={{ mb: 3, color: '#9A9A9A' }}>
              L'interface a rencontré un problème inattendu. Rechargez la page pour continuer.
            </Typography>
            <Button variant="contained" onClick={this.handleReload} sx={{ bgcolor: '#C1121F' }}>
              Recharger la page
            </Button>
          </Box>
        </Box>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary
