import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  Button,
  Chip,
  CircularProgress,
  Alert,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material'
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar'
import SpeedIcon from '@mui/icons-material/Speed'
import CalendarTodayIcon from '@mui/icons-material/CalendarToday'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart'
import EventIcon from '@mui/icons-material/Event'
import { vehiclesAPI, applicationsAPI, API_HOST } from '../services/api'
import { useAuth } from '../context/AuthContext'

const VehicleDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()
  
  const [vehicle, setVehicle] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [submitLoading, setSubmitLoading] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [openDialog, setOpenDialog] = useState(false)
  const [applicationType, setApplicationType] = useState('')

  useEffect(() => {
    fetchVehicle()
  }, [id])

  const fetchVehicle = async () => {
    setLoading(true)
    setError('')

    try {
      const response = await vehiclesAPI.getById(id)
      setVehicle(response.data)
    } catch (err) {
      setError('Véhicule introuvable')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleOpenDialog = (type) => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: `/vehicles/${id}` } })
      return
    }
    setApplicationType(type)
    setOpenDialog(true)
  }

  const handleCloseDialog = () => {
    setOpenDialog(false)
    setSubmitError('')
  }

  const handleSubmitApplication = async () => {
    setSubmitLoading(true)
    setSubmitError('')

    try {
      const data = { vehicle_id: id }
      
      if (applicationType === 'purchase') {
        await applicationsAPI.createPurchase(data)
      } else {
        await applicationsAPI.createRental(data)
      }

      setOpenDialog(false)
      navigate('/my-applications', {
        state: { message: 'Demande créée avec succès !' }
      })
    } catch (err) {
      setSubmitError(err.response?.data?.detail || 'Erreur lors de la création de la demande')
    } finally {
      setSubmitLoading(false)
    }
  }

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    )
  }

  if (error || !vehicle) {
    return (
      <Box>
        <Alert severity="error">{error || 'Véhicule introuvable'}</Alert>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/vehicles')}
          sx={{ mt: 2 }}
        >
          Retour à la liste
        </Button>
      </Box>
    )
  }

  return (
    <Box>
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={() => navigate('/vehicles')}
        sx={{ mb: 3 }}
      >
        Retour à la liste
      </Button>

      <Grid container spacing={4}>
        {/* Vehicle Image */}
        <Grid item xs={12} md={6}>
          <Card>
            {vehicle.image_url ? (
              <Box
                component="img"
                src={`${API_HOST}${vehicle.image_url}`}
                alt={`${vehicle.brand} ${vehicle.model}`}
                sx={{
                  width: '100%',
                  height: 400,
                  objectFit: 'cover',
                  display: 'block',
                }}
              />
            ) : (
              <Box
                sx={{
                  height: 400,
                  bgcolor: 'grey.200',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <DirectionsCarIcon sx={{ fontSize: 120, color: 'grey.400' }} />
              </Box>
            )}
          </Card>
        </Grid>

        {/* Vehicle Details */}
        <Grid item xs={12} md={6}>
          <Typography variant="h4" gutterBottom>
            {vehicle.brand} {vehicle.model}
          </Typography>

          <Box sx={{ mb: 3 }}>
            {vehicle.available_for_sale && (
              <Chip label="Disponible à la vente" color="primary" sx={{ mr: 1 }} />
            )}
            {vehicle.available_for_rent && (
              <Chip label="Disponible à la location" color="secondary" />
            )}
          </Box>

          <Typography variant="h5" color="primary" gutterBottom>
            {vehicle.price.toLocaleString()} €
            {vehicle.available_for_rent && '/mois'}
          </Typography>

          <Divider sx={{ my: 3 }} />

          <Grid container spacing={2}>
            <Grid item xs={6}>
              <Box display="flex" alignItems="center" gap={1} mb={2}>
                <CalendarTodayIcon color="action" />
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Année
                  </Typography>
                  <Typography variant="body1" fontWeight="bold">
                    {vehicle.year}
                  </Typography>
                </Box>
              </Box>
            </Grid>

            <Grid item xs={6}>
              <Box display="flex" alignItems="center" gap={1} mb={2}>
                <SpeedIcon color="action" />
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Kilométrage
                  </Typography>
                  <Typography variant="body1" fontWeight="bold">
                    {vehicle.mileage.toLocaleString()} km
                  </Typography>
                </Box>
              </Box>
            </Grid>
          </Grid>

          <Divider sx={{ my: 3 }} />

          <Typography variant="h6" gutterBottom>
            Faites votre demande
          </Typography>

          <Box sx={{ display: 'flex', gap: 2, flexDirection: 'column' }}>
            {vehicle.available_for_sale && (
              <Button
                variant="contained"
                size="large"
                startIcon={<ShoppingCartIcon />}
                onClick={() => handleOpenDialog('purchase')}
                fullWidth
              >
                Demande d'achat
              </Button>
            )}

            {vehicle.available_for_rent && (
              <Button
                variant="contained"
                color="secondary"
                size="large"
                startIcon={<EventIcon />}
                onClick={() => handleOpenDialog('rental')}
                fullWidth
              >
                Demande de location
              </Button>
            )}
          </Box>

          {!isAuthenticated && (
            <Alert severity="info" sx={{ mt: 2 }}>
              Vous devez être connecté pour faire une demande
            </Alert>
          )}
        </Grid>

        {/* Additional Info */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Informations complémentaires
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Pour plus d'informations sur ce véhicule, n'hésitez pas à créer une demande.
                Notre équipe vous contactera dans les plus brefs délais.
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Confirmation Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          Confirmer la demande de {applicationType === 'purchase' ? 'achat' : 'location'}
        </DialogTitle>
        <DialogContent>
          {submitError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {submitError}
            </Alert>
          )}
          <Typography>
            Vous êtes sur le point de créer une demande de{' '}
            {applicationType === 'purchase' ? 'achat' : 'location'} pour :
          </Typography>
          <Typography variant="h6" sx={{ my: 2 }}>
            {vehicle.brand} {vehicle.model} ({vehicle.year})
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Notre équipe traitera votre demande dans les plus brefs délais.
            Vous pourrez suivre le statut de votre demande dans votre espace personnel.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} disabled={submitLoading}>
            Annuler
          </Button>
          <Button
            onClick={handleSubmitApplication}
            variant="contained"
            disabled={submitLoading}
          >
            {submitLoading ? 'Envoi...' : 'Confirmer'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default VehicleDetail
