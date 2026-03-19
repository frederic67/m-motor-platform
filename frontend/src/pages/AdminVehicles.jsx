import { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Button,
  CircularProgress,
  Alert,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { useNavigate } from 'react-router-dom';
import AdminSidebar from '../components/admin/AdminSidebar';
import VehicleTable from '../components/admin/VehicleTable';
import VehicleForm from '../components/admin/VehicleFormNew';
import ConfirmDialog from '../components/admin/ConfirmDialog';
import api from '../services/api';
import { toast } from 'react-toastify';

const AdminVehicles = () => {
  const navigate = useNavigate();
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formOpen, setFormOpen] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState(null);
  const [confirmDialog, setConfirmDialog] = useState({
    open: false,
    title: '',
    message: '',
    vehicleId: null,
  });

  useEffect(() => {
    fetchVehicles();
  }, []);

  const fetchVehicles = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get('/vehicles/');
      const data = response.data;
      setVehicles(Array.isArray(data) ? data : data.vehicles ?? []);
    } catch (err) {
      console.error('Error fetching vehicles:', err);
      setError('Erreur lors du chargement des véhicules');
      if (err.response?.status === 401) {
        toast.error('Session expirée. Veuillez vous reconnecter.');
        navigate('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAddClick = () => {
    setEditingVehicle(null);
    setFormOpen(true);
  };

  const handleEditClick = (vehicle) => {
    setEditingVehicle(vehicle);
    setFormOpen(true);
  };

  const handleCloseForm = () => {
    setFormOpen(false);
    setEditingVehicle(null);
  };

  const handleSubmitForm = async (formData, imageFile) => {
    try {
      let vehicleId;
      
      if (editingVehicle) {
        // Update existing vehicle
        await api.patch(`/vehicles/${editingVehicle.id}`, formData);
        vehicleId = editingVehicle.id;
        toast.success('Véhicule modifié avec succès');
      } else {
        // Create new vehicle
        const response = await api.post('/vehicles/', formData);
        vehicleId = response.data.id;
        toast.success('Véhicule créé avec succès');
      }

      // Upload image if provided
      if (imageFile) {
        const imageFormData = new FormData();
        imageFormData.append('file', imageFile);
        
        try {
          await api.post(`/vehicles/${vehicleId}/image`, imageFormData, {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          });
          toast.success('Photo téléversée avec succès');
        } catch (imgErr) {
          console.error('Error uploading image:', imgErr);
          toast.warning('Véhicule créé mais erreur lors du téléversement de la photo');
        }
      }

      // Refresh vehicles list
      await fetchVehicles();
      
      // Close form
      handleCloseForm();
    } catch (err) {
      console.error('Error saving vehicle:', err);
      toast.error(
        err.response?.data?.detail || 
        'Erreur lors de l\'enregistrement du véhicule'
      );
    }
  };

  const handleDeleteClick = (vehicleId) => {
    setConfirmDialog({
      open: true,
      title: 'Supprimer le véhicule',
      message: 'Êtes-vous sûr de vouloir supprimer ce véhicule ? Cette action est irréversible.',
      vehicleId,
    });
  };

  const handleConfirmDelete = async () => {
    const { vehicleId } = confirmDialog;
    
    try {
      await api.delete(`/vehicles/${vehicleId}`);
      toast.success('Véhicule supprimé avec succès');

      // Refresh vehicles list
      await fetchVehicles();
      
      // Close dialog
      setConfirmDialog({
        open: false,
        title: '',
        message: '',
        vehicleId: null,
      });
    } catch (err) {
      console.error('Error deleting vehicle:', err);
      toast.error('Erreur lors de la suppression du véhicule');
    }
  };

  const handleCancelDelete = () => {
    setConfirmDialog({
      open: false,
      title: '',
      message: '',
      vehicleId: null,
    });
  };

  const handleToggleSale = async (vehicleId, currentValue) => {
    try {
      await api.patch(`/vehicles/${vehicleId}`, {
        available_for_sale: !currentValue,
      });
      
      toast.success(
        !currentValue 
          ? 'Véhicule disponible à la vente' 
          : 'Véhicule retiré de la vente'
      );

      // Refresh vehicles list
      await fetchVehicles();
    } catch (err) {
      console.error('Error toggling sale availability:', err);
      toast.error('Erreur lors de la modification');
    }
  };

  const handleToggleRent = async (vehicleId, currentValue) => {
    try {
      await api.patch(`/vehicles/${vehicleId}`, {
        available_for_rent: !currentValue,
      });
      
      toast.success(
        !currentValue 
          ? 'Véhicule disponible à la location' 
          : 'Véhicule retiré de la location'
      );

      // Refresh vehicles list
      await fetchVehicles();
    } catch (err) {
      console.error('Error toggling rent availability:', err);
      toast.error('Erreur lors de la modification');
    }
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#0B0B0B' }}>
      <AdminSidebar />
      
      <Box component="main" sx={{ flexGrow: 1, p: { xs: 2, md: 4 }, pt: { xs: 10, md: 4 } }}>
        <Container maxWidth="xl">
          {/* Header */}
          <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box>
              <Typography
                variant="h4"
                sx={{
                  fontFamily: 'Playfair Display',
                  fontWeight: 700,
                  color: '#F5F5F5',
                  mb: 1,
                  letterSpacing: '0.02em',
                }}
              >
                Gestion des Véhicules
              </Typography>
              <Typography variant="body1" color="#9A9A9A" sx={{ letterSpacing: '0.03em' }}>
                Gérez votre inventaire de véhicules premium
              </Typography>
            </Box>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleAddClick}
              sx={{
                bgcolor: '#C1121F',
                color: '#F5F5F5',
                px: 3,
                py: 1.5,
                fontWeight: 600,
                '&:hover': {
                  bgcolor: '#9A0E18',
                },
              }}
            >
              Nouveau Véhicule
            </Button>
          </Box>

          {/* Content */}
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
              <CircularProgress sx={{ color: '#C1121F' }} />
            </Box>
          ) : error ? (
            <Alert 
              severity="error" 
              sx={{ 
                bgcolor: 'rgba(193, 18, 31, 0.1)',
                border: '1px solid rgba(193, 18, 31, 0.3)',
                color: '#F5F5F5',
              }}
            >
              {error}
            </Alert>
          ) : (
            <Paper
              sx={{
                background: 'linear-gradient(145deg, #151515 0%, #0F0F0F 100%)',
                border: '1px solid rgba(193, 18, 31, 0.2)',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.4)',
                borderRadius: 0,
                overflow: 'hidden',
              }}
            >
              <VehicleTable
                vehicles={vehicles}
                onEdit={handleEditClick}
                onDelete={handleDeleteClick}
                onToggleSale={handleToggleSale}
                onToggleRent={handleToggleRent}
              />
            </Paper>
          )}
        </Container>
      </Box>

      {/* Vehicle Form Dialog */}
      <VehicleForm
        open={formOpen}
        onClose={handleCloseForm}
        onSubmit={handleSubmitForm}
        vehicle={editingVehicle}
      />

      {/* Confirm Delete Dialog */}
      <ConfirmDialog
        open={confirmDialog.open}
        title={confirmDialog.title}
        message={confirmDialog.message}
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
        danger={true}
        confirmText="Supprimer"
      />
    </Box>
  );
};

export default AdminVehicles;
