import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Typography,
  Box,
  Card,
  CardContent,
  CardActions,
  Button,
  Chip,
  CircularProgress,
  Alert,
  Grid,
} from '@mui/material'
import VisibilityIcon from '@mui/icons-material/Visibility'
import AddIcon from '@mui/icons-material/Add'
import { applicationsAPI } from '../services/api'

const statusColors = {
  PENDING: 'warning',
  APPROVED: 'success',
  REJECTED: 'error',
}

const statusLabels = {
  PENDING: 'En attente',
  APPROVED: 'Approuvée',
  REJECTED: 'Rejetée',
}

const typeLabels = {
  PURCHASE: 'Achat',
  RENTAL: 'Location',
}

const MyApplications = () => {
  const navigate = useNavigate()
  const [applications, setApplications] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchApplications()
  }, [])

  const fetchApplications = async () => {
    setLoading(true)
    setError('')

    try {
      const response = await applicationsAPI.getMine()
      setApplications(response.data)
    } catch (err) {
      setError('Erreur lors du chargement des demandes')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    )
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">
          Mes Demandes
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate('/vehicles')}
        >
          Nouvelle Demande
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {applications.length === 0 ? (
        <Card>
          <CardContent>
            <Box textAlign="center" py={4}>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                Aucune demande pour le moment
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                Commencez par consulter notre catalogue de véhicules
              </Typography>
              <Button
                variant="contained"
                onClick={() => navigate('/vehicles')}
                sx={{ mt: 2 }}
              >
                Voir les véhicules
              </Button>
            </Box>
          </CardContent>
        </Card>
      ) : (
        <Grid container spacing={3}>
          {applications.map((application) => (
            <Grid item xs={12} md={6} key={application.id}>
              <Card>
                <CardContent>
                  <Box display="flex" justifyContent="space-between" alignItems="start" mb={2}>
                    <Typography variant="h6" component="div">
                      Demande #{application.id.slice(0, 8)}
                    </Typography>
                    <Chip
                      label={statusLabels[application.status]}
                      color={statusColors[application.status]}
                      size="small"
                    />
                  </Box>

                  <Box mb={2}>
                    <Chip
                      label={typeLabels[application.type]}
                      variant="outlined"
                      size="small"
                    />
                  </Box>

                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Véhicule: {application.vehicle_id}
                  </Typography>

                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Créée le: {formatDate(application.created_at)}
                  </Typography>

                  {application.updated_at !== application.created_at && (
                    <Typography variant="body2" color="text.secondary">
                      Mise à jour: {formatDate(application.updated_at)}
                    </Typography>
                  )}
                </CardContent>

                <CardActions>
                  <Button
                    size="small"
                    startIcon={<VisibilityIcon />}
                    onClick={() => navigate(`/applications/${application.id}`)}
                  >
                    Voir détails
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  )
}

export default MyApplications
