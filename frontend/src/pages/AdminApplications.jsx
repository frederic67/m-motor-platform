import { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Grid,
  Chip,
  Divider,
  List,
  ListItem,
  ListItemText,
  Link,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import AdminSidebar from '../components/admin/AdminSidebar';
import ApplicationTable from '../components/admin/ApplicationTable';
import ConfirmDialog from '../components/admin/ConfirmDialog';
import { applicationsAPI, documentsAPI, API_HOST } from '../services/api';
import { toast } from 'react-toastify';

const AdminApplications = () => {
  const navigate = useNavigate();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [documents, setDocuments] = useState([]);
  const [documentsLoading, setDocumentsLoading] = useState(false);
  const [documentsError, setDocumentsError] = useState('');
  const [confirmDialog, setConfirmDialog] = useState({
    open: false,
    title: '',
    message: '',
    action: null,
    applicationId: null,
    danger: false,
  });

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await applicationsAPI.getAll();
      const normalized = (response.data || []).map((application) => ({
        ...application,
        user: application.user ?? {
          full_name: application.user_full_name,
          email: application.user_email,
        },
        vehicle: application.vehicle ?? {
          brand: application.vehicle_brand,
          model: application.vehicle_model,
          year: application.vehicle_year,
          price: application.vehicle_price,
        },
      }));
      setApplications(normalized);
    } catch (err) {
      console.error('Error fetching applications:', err);
      setError('Erreur lors du chargement des demandes');
      if (err.response?.status === 401) {
        toast.error('Session expirée. Veuillez vous reconnecter.');
        navigate('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = async (application) => {
    setSelectedApplication(application);
    setViewDialogOpen(true);
    setDocuments([]);
    setDocumentsError('');
    setDocumentsLoading(true);
    try {
      const response = await documentsAPI.getByApplication(application.id);
      setDocuments(response.data || []);
    } catch (err) {
      console.error('Error fetching documents:', err);
      setDocumentsError('Impossible de charger les pièces jointes');
    } finally {
      setDocumentsLoading(false);
    }
  };

  const handleCloseViewDialog = () => {
    setViewDialogOpen(false);
    setSelectedApplication(null);
    setDocuments([]);
    setDocumentsError('');
  };

  const handleApproveClick = (applicationId) => {
    setConfirmDialog({
      open: true,
      title: 'Approuver la demande',
      message: 'Êtes-vous sûr de vouloir approuver cette demande ?',
      action: 'approve',
      applicationId,
    });
  };

  const handleRejectClick = (applicationId) => {
    setConfirmDialog({
      open: true,
      title: 'Rejeter la demande',
      message: 'Êtes-vous sûr de vouloir rejeter cette demande ?',
      action: 'reject',
      applicationId,
      danger: true,
    });
  };

  const handleDeleteClick = (applicationId) => {
    setConfirmDialog({
      open: true,
      title: 'Supprimer la demande',
      message: 'Cette action est définitive. Voulez-vous supprimer cette demande ?',
      action: 'delete',
      applicationId,
      danger: true,
    });
  };

  const handleConfirmAction = async () => {
    const { action, applicationId } = confirmDialog;
    
    try {
      if (action === 'approve') {
        await applicationsAPI.updateStatus(applicationId, 'APPROVED');
        toast.success('Demande approuvée avec succès');
      } else if (action === 'reject') {
        await applicationsAPI.updateStatus(applicationId, 'REJECTED');
        toast.success('Demande rejetée');
      } else if (action === 'delete') {
        await applicationsAPI.delete(applicationId);
        toast.success('Demande supprimée');
        if (selectedApplication?.id === applicationId) {
          handleCloseViewDialog();
        }
      }

      // Refresh applications list
      await fetchApplications();
      
      // Close dialog
      setConfirmDialog({
        open: false,
        title: '',
        message: '',
        action: null,
        applicationId: null,
        danger: false,
      });
    } catch (err) {
      console.error('Error updating application:', err);
      toast.error('Erreur lors de la mise à jour de la demande');
    }
  };

  const handleCancelAction = () => {
    setConfirmDialog({
      open: false,
      title: '',
      message: '',
      action: null,
      applicationId: null,
      danger: false,
    });
  };

  const getDocumentUrl = (filePath) => {
    if (!filePath) return '#';
    if (filePath.startsWith('http://') || filePath.startsWith('https://')) return filePath;

    // Handle full filesystem paths by extracting the /uploads/... segment.
    const normalizedSlashes = filePath.replace(/\\/g, '/');
    const uploadsIndex = normalizedSlashes.indexOf('/uploads/');
    if (uploadsIndex >= 0) {
      return `${API_HOST}${normalizedSlashes.slice(uploadsIndex)}`;
    }

    const normalizedPath = normalizedSlashes.startsWith('/') ? normalizedSlashes : `/${normalizedSlashes}`;
    return `${API_HOST}${normalizedPath}`;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'APPROVED':
        return 'success';
      case 'REJECTED':
        return 'error';
      case 'PENDING':
        return 'warning';
      default:
        return 'default';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'APPROVED':
        return 'Approuvée';
      case 'REJECTED':
        return 'Rejetée';
      case 'PENDING':
        return 'En attente';
      default:
        return status;
    }
  };

  const getTypeLabel = (type) => {
    return type === 'PURCHASE' ? 'Achat' : 'Location';
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#0B0B0B' }}>
      <AdminSidebar />
      
      <Box component="main" sx={{ flexGrow: 1, p: { xs: 2, md: 4 }, pt: { xs: 10, md: 4 } }}>
        <Container maxWidth="xl">
          {/* Header */}
          <Box sx={{ mb: 4 }}>
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
              Gestion des Demandes
            </Typography>
            <Typography variant="body1" color="#9A9A9A" sx={{ letterSpacing: '0.03em' }}>
              Visualisez et gérez les demandes d'achat et de location
            </Typography>
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
              <ApplicationTable
                applications={applications}
                onView={handleViewDetails}
                onApprove={handleApproveClick}
                onReject={handleRejectClick}
                onDelete={handleDeleteClick}
              />
            </Paper>
          )}
        </Container>
      </Box>

      {/* View Details Dialog */}
      <Dialog
        open={viewDialogOpen}
        onClose={handleCloseViewDialog}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            background: '#151515',
            border: '1px solid rgba(193, 18, 31, 0.3)',
            borderRadius: 0,
          },
        }}
      >
        <DialogTitle
          sx={{
            borderBottom: '1px solid rgba(193, 18, 31, 0.2)',
            pb: 2,
          }}
        >
          <Typography
            variant="h6"
            sx={{
              fontFamily: 'Playfair Display',
              fontWeight: 600,
              color: '#F5F5F5',
              letterSpacing: '0.02em',
            }}
          >
            Détails de la Demande
          </Typography>
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          {selectedApplication && (
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="#9A9A9A" sx={{ mb: 1 }}>
                    Statut
                  </Typography>
                  <Chip
                    label={getStatusLabel(selectedApplication.status)}
                    color={getStatusColor(selectedApplication.status)}
                    sx={{ fontWeight: 600 }}
                  />
                </Box>
              </Grid>

              <Grid item xs={12}>
                <Divider sx={{ borderColor: 'rgba(193, 18, 31, 0.2)' }} />
              </Grid>

              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="#9A9A9A" sx={{ mb: 0.5 }}>
                  Client
                </Typography>
                <Typography variant="body1" color="#F5F5F5" sx={{ fontWeight: 500 }}>
                  {selectedApplication.user?.full_name || 'N/A'}
                </Typography>
                <Typography variant="body2" color="#9A9A9A" sx={{ mt: 0.5 }}>
                  {selectedApplication.user?.email || ''}
                </Typography>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="#9A9A9A" sx={{ mb: 0.5 }}>
                  Type de demande
                </Typography>
                <Typography variant="body1" color="#F5F5F5" sx={{ fontWeight: 500 }}>
                  {getTypeLabel(selectedApplication.type)}
                </Typography>
              </Grid>

              <Grid item xs={12}>
                <Divider sx={{ borderColor: 'rgba(193, 18, 31, 0.2)' }} />
              </Grid>

              <Grid item xs={12}>
                <Typography variant="body2" color="#9A9A9A" sx={{ mb: 1 }}>
                  Véhicule
                </Typography>
                <Box
                  sx={{
                    p: 2,
                    border: '1px solid rgba(193, 18, 31, 0.2)',
                    bgcolor: 'rgba(31, 31, 31, 0.5)',
                  }}
                >
                  <Typography variant="h6" color="#F5F5F5" sx={{ fontWeight: 600, mb: 1 }}>
                    {selectedApplication.vehicle?.brand} {selectedApplication.vehicle?.model}
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="#9A9A9A">
                        Année
                      </Typography>
                      <Typography variant="body1" color="#F5F5F5">
                        {selectedApplication.vehicle?.year}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="#9A9A9A">
                        Kilométrage
                      </Typography>
                      <Typography variant="body1" color="#F5F5F5">
                        {selectedApplication.vehicle?.mileage?.toLocaleString()} km
                      </Typography>
                    </Grid>
                    <Grid item xs={12}>
                      <Typography variant="body2" color="#9A9A9A">
                        Prix
                      </Typography>
                      <Typography variant="h6" color="#C1121F" sx={{ fontWeight: 700 }}>
                        {selectedApplication.vehicle?.price?.toLocaleString()} €
                      </Typography>
                    </Grid>
                  </Grid>
                </Box>
              </Grid>

              <Grid item xs={12}>
                <Divider sx={{ borderColor: 'rgba(193, 18, 31, 0.2)' }} />
              </Grid>

              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="#9A9A9A" sx={{ mb: 0.5 }}>
                  Date de création
                </Typography>
                <Typography variant="body1" color="#F5F5F5">
                  {new Date(selectedApplication.created_at).toLocaleDateString('fr-FR', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </Typography>
              </Grid>

              {selectedApplication.updated_at && (
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="#9A9A9A" sx={{ mb: 0.5 }}>
                    Dernière mise à jour
                  </Typography>
                  <Typography variant="body1" color="#F5F5F5">
                    {new Date(selectedApplication.updated_at).toLocaleDateString('fr-FR', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </Typography>
                </Grid>
              )}

              <Grid item xs={12}>
                <Divider sx={{ borderColor: 'rgba(193, 18, 31, 0.2)' }} />
              </Grid>

              <Grid item xs={12}>
                <Typography variant="body2" color="#9A9A9A" sx={{ mb: 1 }}>
                  Pièces jointes
                </Typography>
                {documentsLoading ? (
                  <CircularProgress size={22} sx={{ color: '#C1121F' }} />
                ) : documentsError ? (
                  <Alert severity="error" sx={{ bgcolor: 'rgba(193, 18, 31, 0.1)' }}>
                    {documentsError}
                  </Alert>
                ) : documents.length === 0 ? (
                  <Typography variant="body2" color="#9A9A9A">
                    Aucune pièce jointe pour cette demande.
                  </Typography>
                ) : (
                  <List sx={{ p: 0 }}>
                    {documents.map((doc) => (
                      <ListItem
                        key={doc.id}
                        sx={{
                          px: 0,
                          borderBottom: '1px solid rgba(193, 18, 31, 0.1)',
                        }}
                      >
                        <ListItemText
                          primary={
                            <Link
                              href={getDocumentUrl(doc.file_path)}
                              target="_blank"
                              rel="noopener noreferrer"
                              sx={{ color: '#F5F5F5', textDecorationColor: '#C1121F' }}
                            >
                              {doc.filename}
                            </Link>
                          }
                          secondary={`Type: ${doc.content_type}`}
                        />
                      </ListItem>
                    ))}
                  </List>
                )}
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions sx={{ borderTop: '1px solid rgba(193, 18, 31, 0.2)', p: 3, gap: 1 }}>
          {selectedApplication?.status === 'PENDING' && (
            <>
              <Button
                onClick={() => handleApproveClick(selectedApplication.id)}
                variant="contained"
                sx={{ bgcolor: '#2e7d32', '&:hover': { bgcolor: '#1b5e20' } }}
              >
                Accepter
              </Button>
              <Button
                onClick={() => handleRejectClick(selectedApplication.id)}
                variant="contained"
                sx={{ bgcolor: '#C1121F', '&:hover': { bgcolor: '#9A0E18' } }}
              >
                Rejeter
              </Button>
            </>
          )}
          <Button
            onClick={() => selectedApplication?.id && handleDeleteClick(selectedApplication.id)}
            variant="outlined"
            color="error"
            disabled={!selectedApplication?.id}
          >
            Supprimer
          </Button>
          <Button onClick={handleCloseViewDialog} variant="outlined">
            Fermer
          </Button>
        </DialogActions>
      </Dialog>

      {/* Confirm Dialog */}
      <ConfirmDialog
        open={confirmDialog.open}
        title={confirmDialog.title}
        message={confirmDialog.message}
        onConfirm={handleConfirmAction}
        onCancel={handleCancelAction}
        danger={confirmDialog.danger}
      />
    </Box>
  );
};

export default AdminApplications;
