import { useState, useEffect } from 'react'
import {
  Typography,
  Box,
  Grid,
  Tabs,
  Tab,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Switch,
  Alert,
  CircularProgress,
} from '@mui/material'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import AddIcon from '@mui/icons-material/Add'
import CheckIcon from '@mui/icons-material/Check'
import CloseIcon from '@mui/icons-material/Close'
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar'
import SellIcon from '@mui/icons-material/Sell'
import KeyIcon from '@mui/icons-material/Key'
import PendingActionsIcon from '@mui/icons-material/PendingActions'
import { vehiclesAPI, applicationsAPI } from '../services/api'
import api from '../services/api'
import VehicleFormUpload from '../components/admin/VehicleFormNew'
import AdminSidebar from '../components/admin/AdminSidebar'
import StatsCard from '../components/admin/StatsCard'

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState(0)

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#0B0B0B' }}>
      <AdminSidebar />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: { xs: 2, md: 4 },
          pt: { xs: 10, md: 4 },
        }}
      >
        <Typography variant="h4" gutterBottom sx={{ color: '#F5F5F5', fontFamily: 'Playfair Display' }}>
          Administration
        </Typography>

        <DashboardStats />

        <Box sx={{ borderBottom: 1, borderColor: 'rgba(193, 18, 31, 0.2)', mb: 3 }}>
          <Tabs value={activeTab} onChange={(e, v) => setActiveTab(v)}>
            <Tab label="Véhicules" />
            <Tab label="Demandes" />
          </Tabs>
        </Box>

        {activeTab === 0 && <VehiclesManagement />}
        {activeTab === 1 && <ApplicationsManagement />}
      </Box>
    </Box>
  )
}

const DashboardStats = () => {
  const [stats, setStats] = useState({
    totalVehicles: 0,
    saleVehicles: 0,
    rentVehicles: 0,
    pendingApplications: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [vehiclesRes, applicationsRes] = await Promise.allSettled([
          vehiclesAPI.getAll({ page: 1, page_size: 100 }),
          applicationsAPI.getAll({ page: 1, page_size: 100 }),
        ])

        const vehicles =
          vehiclesRes.status === 'fulfilled' ? vehiclesRes.value.data?.vehicles || [] : []
        const applications =
          applicationsRes.status === 'fulfilled' ? applicationsRes.value.data || [] : []

        setStats({
          totalVehicles: vehicles.length,
          saleVehicles: vehicles.filter((v) => v.available_for_sale).length,
          rentVehicles: vehicles.filter((v) => v.available_for_rent).length,
          pendingApplications: applications.filter((a) => a.status === 'PENDING').length,
        })
      } catch (error) {
        console.error('Erreur chargement stats admin:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
        <CircularProgress size={24} sx={{ color: '#C1121F' }} />
      </Box>
    )
  }

  return (
    <Grid container spacing={2} sx={{ mb: 3 }}>
      <Grid item xs={12} sm={6} lg={3}>
        <StatsCard
          title="Véhicules total"
          value={stats.totalVehicles}
          icon={<DirectionsCarIcon />}
          color="#C1121F"
        />
      </Grid>
      <Grid item xs={12} sm={6} lg={3}>
        <StatsCard
          title="Disponibles à la vente"
          value={stats.saleVehicles}
          icon={<SellIcon />}
          color="#D62828"
        />
      </Grid>
      <Grid item xs={12} sm={6} lg={3}>
        <StatsCard
          title="Disponibles à la location"
          value={stats.rentVehicles}
          icon={<KeyIcon />}
          color="#E09F3E"
        />
      </Grid>
      <Grid item xs={12} sm={6} lg={3}>
        <StatsCard
          title="Demandes en attente"
          value={stats.pendingApplications}
          icon={<PendingActionsIcon />}
          color="#F77F00"
        />
      </Grid>
    </Grid>
  )
}

// ============================================
// Vehicles Management Component
// ============================================

const VehiclesManagement = () => {
  const [vehicles, setVehicles] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [openDialog, setOpenDialog] = useState(false)
  const [editingVehicle, setEditingVehicle] = useState(null)

  useEffect(() => {
    fetchVehicles()
  }, [])

  const fetchVehicles = async () => {
    setLoading(true)
    try {
      const response = await vehiclesAPI.getAll({ page: 1, page_size: 100 })
      setVehicles(response.data.vehicles)
    } catch (err) {
      setError('Erreur lors du chargement des véhicules')
    } finally {
      setLoading(false)
    }
  }

  const handleOpenDialog = (vehicle = null) => {
    setEditingVehicle(vehicle)
    setOpenDialog(true)
  }

  const handleCloseDialog = () => {
    setEditingVehicle(null)
    setOpenDialog(false)
  }

  const handleSwitchAvailability = async (vehicleId, field, currentValue) => {
    try {
      const params = { [field]: !currentValue }
      await vehiclesAPI.switchAvailability(vehicleId, params)
      fetchVehicles()
    } catch (err) {
      alert('Erreur lors de la mise à jour')
    }
  }

  const handleDelete = async (vehicleId) => {
    if (!window.confirm('Confirmer la suppression ?')) return

    try {
      await vehiclesAPI.delete(vehicleId)
      fetchVehicles()
    } catch (err) {
      alert('Erreur lors de la suppression')
    }
  }

  const handleSubmitForm = async (formData, imageFile) => {
    try {
      let vehicleId

      if (editingVehicle) {
        await vehiclesAPI.update(editingVehicle.id, formData)
        vehicleId = editingVehicle.id
      } else {
        const response = await vehiclesAPI.create(formData)
        vehicleId = response.data.id
      }

      if (imageFile) {
        const imageFormData = new FormData()
        imageFormData.append('file', imageFile)
        await api.post(`/vehicles/${vehicleId}/image`, imageFormData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        })
      }

      await fetchVehicles()
      handleCloseDialog()
    } catch (err) {
      alert(err.response?.data?.detail || 'Erreur lors de l\'enregistrement du véhicule')
    }
  }

  if (loading) return <CircularProgress />
  if (error) return <Alert severity="error">{error}</Alert>

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" mb={3}>
        <Typography variant="h6">Gestion des Véhicules</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          Nouveau Véhicule
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Marque</TableCell>
              <TableCell>Modèle</TableCell>
              <TableCell>Année</TableCell>
              <TableCell>Prix</TableCell>
              <TableCell>Kilométrage</TableCell>
              <TableCell>Vente</TableCell>
              <TableCell>Location</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {vehicles.map((vehicle) => (
              <TableRow key={vehicle.id}>
                <TableCell>{vehicle.brand}</TableCell>
                <TableCell>{vehicle.model}</TableCell>
                <TableCell>{vehicle.year}</TableCell>
                <TableCell>{vehicle.price.toLocaleString()} €</TableCell>
                <TableCell>{vehicle.mileage.toLocaleString()} km</TableCell>
                <TableCell>
                  <Switch
                    checked={vehicle.available_for_sale}
                    onChange={() =>
                      handleSwitchAvailability(
                        vehicle.id,
                        'for_sale',
                        vehicle.available_for_sale
                      )
                    }
                    color="primary"
                  />
                </TableCell>
                <TableCell>
                  <Switch
                    checked={vehicle.available_for_rent}
                    onChange={() =>
                      handleSwitchAvailability(
                        vehicle.id,
                        'for_rent',
                        vehicle.available_for_rent
                      )
                    }
                    color="secondary"
                  />
                </TableCell>
                <TableCell align="right">
                  <IconButton
                    size="small"
                    onClick={() => handleOpenDialog(vehicle)}
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    size="small"
                    color="error"
                    onClick={() => handleDelete(vehicle.id)}
                  >
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <VehicleFormUpload
        open={openDialog}
        onClose={handleCloseDialog}
        onSubmit={handleSubmitForm}
        vehicle={editingVehicle}
      />
    </Box>
  )
}

// ============================================
// Applications Management Component
// ============================================

const ApplicationsManagement = () => {
  const [applications, setApplications] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchApplications()
  }, [])

  const fetchApplications = async () => {
    setLoading(true)
    try {
      const response = await applicationsAPI.getAll({ page: 1, page_size: 100 })
      setApplications(response.data)
    } catch (err) {
      setError('Erreur lors du chargement des demandes')
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async (applicationId) => {
    if (!window.confirm('Approuver cette demande ?')) return

    try {
      await applicationsAPI.approve(applicationId)
      fetchApplications()
    } catch (err) {
      alert('Erreur lors de l\'approbation')
    }
  }

  const handleReject = async (applicationId) => {
    if (!window.confirm('Rejeter cette demande ?')) return

    try {
      await applicationsAPI.reject(applicationId)
      fetchApplications()
    } catch (err) {
      alert('Erreur lors du rejet')
    }
  }

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

  if (loading) return <CircularProgress />
  if (error) return <Alert severity="error">{error}</Alert>

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Gestion des Demandes
      </Typography>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Client</TableCell>
              <TableCell>Véhicule</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Statut</TableCell>
              <TableCell>Date</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {applications.map((app) => (
              <TableRow key={app.id}>
                <TableCell>{app.id.slice(0, 8)}</TableCell>
                <TableCell>
                  <Typography variant="body2">{app.user_full_name}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    {app.user_email}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2">
                    {app.vehicle_brand} {app.vehicle_model}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {app.vehicle_year} - {app.vehicle_price.toLocaleString()} €
                  </Typography>
                </TableCell>
                <TableCell>
                  <Chip label={typeLabels[app.type]} size="small" />
                </TableCell>
                <TableCell>
                  <Chip
                    label={statusLabels[app.status]}
                    color={statusColors[app.status]}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  {new Date(app.created_at).toLocaleDateString('fr-FR')}
                </TableCell>
                <TableCell align="right">
                  {app.status === 'PENDING' && (
                    <>
                      <IconButton
                        size="small"
                        color="success"
                        onClick={() => handleApprove(app.id)}
                        title="Approuver"
                      >
                        <CheckIcon />
                      </IconButton>
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleReject(app.id)}
                        title="Rejeter"
                      >
                        <CloseIcon />
                      </IconButton>
                    </>
                  )}
                  {app.status !== 'PENDING' && (
                    <Typography variant="caption" color="text.secondary">
                      Traitée
                    </Typography>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  )
}

export default AdminDashboard
