import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import {
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  CardMedia,
  CardActions,
  Button,
  Chip,
  CircularProgress,
  Alert,
  Pagination,
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Paper,
} from '@mui/material'
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar'
import SpeedIcon from '@mui/icons-material/Speed'
import CalendarTodayIcon from '@mui/icons-material/CalendarToday'
import { vehiclesAPI } from '../services/api'

const VehicleList = () => {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  
  const [vehicles, setVehicles] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 12,
    total: 0,
  })
  
  const [filters, setFilters] = useState({
    type: searchParams.get('for_sale') ? 'sale' : searchParams.get('for_rent') ? 'rent' : '',
    brand: searchParams.get('brand') || '',
    maxPrice: searchParams.get('max_price') || '',
  })

  useEffect(() => {
    fetchVehicles()
  }, [searchParams, pagination.page])

  const fetchVehicles = async () => {
    setLoading(true)
    setError('')

    try {
      const params = {
        page: pagination.page,
        page_size: pagination.pageSize,
      }

      if (searchParams.get('for_sale') === 'true') {
        params.for_sale = true
      }
      if (searchParams.get('for_rent') === 'true') {
        params.for_rent = true
      }
      if (searchParams.get('brand')) {
        params.brand = searchParams.get('brand')
      }
      if (searchParams.get('max_price')) {
        params.max_price = searchParams.get('max_price')
      }

      const response = await vehiclesAPI.getAll(params)
      setVehicles(response.data.vehicles)
      setPagination((prev) => ({
        ...prev,
        total: response.data.total,
      }))
    } catch (err) {
      setError('Erreur lors du chargement des véhicules')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleFilterChange = (field) => (event) => {
    setFilters({ ...filters, [field]: event.target.value })
  }

  const applyFilters = () => {
    const params = new URLSearchParams()
    
    if (filters.type === 'sale') {
      params.append('for_sale', 'true')
    } else if (filters.type === 'rent') {
      params.append('for_rent', 'true')
    }
    
    if (filters.brand) {
      params.append('brand', filters.brand)
    }
    
    if (filters.maxPrice) {
      params.append('max_price', filters.maxPrice)
    }
    
    setSearchParams(params)
    setPagination((prev) => ({ ...prev, page: 1 }))
  }

  const clearFilters = () => {
    setFilters({ type: '', brand: '', maxPrice: '' })
    setSearchParams({})
    setPagination((prev) => ({ ...prev, page: 1 }))
  }

  const handlePageChange = (event, value) => {
    setPagination((prev) => ({ ...prev, page: value }))
    window.scrollTo({ top: 0, behavior: 'smooth' })
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
      <Typography variant="h4" gutterBottom>
        Catalogue de Véhicules
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Filters */}
      <Paper elevation={2} sx={{ p: 3, mb: 4 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel>Type</InputLabel>
              <Select
                value={filters.type}
                label="Type"
                onChange={handleFilterChange('type')}
              >
                <MenuItem value="">Tous</MenuItem>
                <MenuItem value="sale">À vendre</MenuItem>
                <MenuItem value="rent">À louer</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} md={3}>
            <TextField
              fullWidth
              size="small"
              label="Marque"
              value={filters.brand}
              onChange={handleFilterChange('brand')}
            />
          </Grid>
          
          <Grid item xs={12} md={3}>
            <TextField
              fullWidth
              size="small"
              label="Prix maximum"
              type="number"
              value={filters.maxPrice}
              onChange={handleFilterChange('maxPrice')}
            />
          </Grid>
          
          <Grid item xs={12} md={3}>
            <Box display="flex" gap={1}>
              <Button
                fullWidth
                variant="contained"
                onClick={applyFilters}
              >
                Filtrer
              </Button>
              <Button
                fullWidth
                variant="outlined"
                onClick={clearFilters}
              >
                Réinitialiser
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Results count */}
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        {pagination.total} véhicule{pagination.total > 1 ? 's' : ''} trouvé{pagination.total > 1 ? 's' : ''}
      </Typography>

      {/* Vehicle Grid */}
      {vehicles.length === 0 ? (
        <Alert severity="info">Aucun véhicule ne correspond à vos critères</Alert>
      ) : (
        <>
          <Grid container spacing={3}>
            {vehicles.map((vehicle) => (
              <Grid item xs={12} sm={6} md={4} key={vehicle.id}>
                <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                  {vehicle.image_url ? (
                    <CardMedia
                      component="img"
                      height="200"
                      image={`http://localhost:8000${vehicle.image_url}`}
                      alt={`${vehicle.brand} ${vehicle.model}`}
                      sx={{ objectFit: 'cover' }}
                    />
                  ) : (
                    <CardMedia
                      component="div"
                      sx={{
                        height: 200,
                        bgcolor: 'grey.200',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <DirectionsCarIcon sx={{ fontSize: 80, color: 'grey.400' }} />
                    </CardMedia>
                  )}
                  
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Typography variant="h6" gutterBottom>
                      {vehicle.brand} {vehicle.model}
                    </Typography>
                    
                    <Box sx={{ mb: 2 }}>
                      {vehicle.available_for_sale && (
                        <Chip label="Vente" color="primary" size="small" sx={{ mr: 1 }} />
                      )}
                      {vehicle.available_for_rent && (
                        <Chip label="Location" color="secondary" size="small" />
                      )}
                    </Box>
                    
                    <Box display="flex" alignItems="center" gap={1} mb={1}>
                      <CalendarTodayIcon fontSize="small" color="action" />
                      <Typography variant="body2" color="text.secondary">
                        {vehicle.year}
                      </Typography>
                    </Box>
                    
                    <Box display="flex" alignItems="center" gap={1} mb={2}>
                      <SpeedIcon fontSize="small" color="action" />
                      <Typography variant="body2" color="text.secondary">
                        {vehicle.mileage.toLocaleString()} km
                      </Typography>
                    </Box>
                    
                    <Typography variant="h6" color="primary">
                      {vehicle.price.toLocaleString()} €
                      {vehicle.available_for_rent && '/mois'}
                    </Typography>
                  </CardContent>
                  
                  <CardActions>
                    <Button
                      fullWidth
                      variant="contained"
                      onClick={() => navigate(`/vehicles/${vehicle.id}`)}
                    >
                      Voir détails
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>

          {/* Pagination */}
          {pagination.total > pagination.pageSize && (
            <Box display="flex" justifyContent="center" mt={4}>
              <Pagination
                count={Math.ceil(pagination.total / pagination.pageSize)}
                page={pagination.page}
                onChange={handlePageChange}
                color="primary"
                size="large"
              />
            </Box>
          )}
        </>
      )}
    </Box>
  )
}

export default VehicleList
