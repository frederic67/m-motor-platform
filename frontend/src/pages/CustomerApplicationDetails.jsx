import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Paper,
  Grid,
  CircularProgress,
  Alert,
  Button,
  Divider,
  Chip,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import CustomerSidebar from '../components/customer/CustomerSidebar';
import ApplicationStatusBadge from '../components/customer/ApplicationStatusBadge';
import DocumentUploadBox from '../components/customer/DocumentUploadBox';
import UploadedDocumentsList from '../components/customer/UploadedDocumentsList';
import api from '../services/api';
import { documentsAPI } from '../services/api';
import { toast } from 'react-toastify';

const CustomerApplicationDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [application, setApplication] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingDocuments, setLoadingDocuments] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchApplication();
    fetchDocuments();
  }, [id]);

  const fetchApplication = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get(`/applications/${id}`);
      setApplication(response.data);
    } catch (err) {
      console.error('Error fetching application:', err);
      setError('Erreur lors du chargement de la demande');
      if (err.response?.status === 401) {
        toast.error('Session expirée. Veuillez vous reconnecter.');
        navigate('/login');
      } else if (err.response?.status === 404) {
        setError('Demande introuvable');
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchDocuments = async () => {
    try {
      setLoadingDocuments(true);
      const response = await documentsAPI.getByApplication(id);
      setDocuments(response.data);
    } catch (err) {
      console.error('Error fetching documents:', err);
      // Don't show error for documents, just keep empty array
    } finally {
      setLoadingDocuments(false);
    }
  };

  const handleUploadSuccess = () => {
    fetchDocuments();
  };

  const handleDeleteSuccess = () => {
    fetchDocuments();
  };

  const getTypeLabel = (type) => {
    return type === 'PURCHASE' ? 'Achat' : 'Location';
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#0B0B0B' }}>
      <CustomerSidebar />

      <Box component="main" sx={{ flexGrow: 1, p: 4 }}>
        <Container maxWidth="xl">
          {/* Header */}
          <Box sx={{ mb: 4 }}>
            <Button
              startIcon={<ArrowBackIcon />}
              onClick={() => navigate('/dashboard')}
              sx={{
                color: '#9A9A9A',
                mb: 2,
                '&:hover': {
                  color: '#F5F5F5',
                  bgcolor: 'rgba(193, 18, 31, 0.1)',
                },
              }}
            >
              Retour au tableau de bord
            </Button>
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
              Détails de la Demande
            </Typography>
            <Typography variant="body1" color="#9A9A9A" sx={{ letterSpacing: '0.03em' }}>
              Demande #{id?.slice(0, 8)}
            </Typography>
          </Box>

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
          ) : application ? (
            <Grid container spacing={3}>
              {/* Application Info */}
              <Grid item xs={12} md={8}>
                <Paper
                  sx={{
                    p: 3,
                    background: 'linear-gradient(145deg, #151515 0%, #0F0F0F 100%)',
                    border: '1px solid rgba(193, 18, 31, 0.2)',
                    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.4)',
                    mb: 3,
                  }}
                >
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 3 }}>
                    <Box>
                      <Typography variant="h6" color="#F5F5F5" sx={{ mb: 1, fontWeight: 600 }}>
                        Informations de la demande
                      </Typography>
                      <Chip
                        label={getTypeLabel(application.type)}
                        size="small"
                        sx={{
                          bgcolor:
                            application.type === 'PURCHASE'
                              ? 'rgba(193, 18, 31, 0.2)'
                              : 'rgba(212, 175, 55, 0.2)',
                          color: application.type === 'PURCHASE' ? '#C1121F' : '#D4AF37',
                          border: `1px solid ${
                            application.type === 'PURCHASE'
                              ? 'rgba(193, 18, 31, 0.4)'
                              : 'rgba(212, 175, 55, 0.4)'
                          }`,
                          fontWeight: 600,
                        }}
                      />
                    </Box>
                    <ApplicationStatusBadge status={application.status} />
                  </Box>

                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" color="#9A9A9A" sx={{ mb: 0.5 }}>
                        Date de création
                      </Typography>
                      <Typography variant="body1" color="#F5F5F5">
                        {formatDate(application.created_at)}
                      </Typography>
                    </Grid>
                    {application.updated_at && application.updated_at !== application.created_at && (
                      <Grid item xs={12} sm={6}>
                        <Typography variant="body2" color="#9A9A9A" sx={{ mb: 0.5 }}>
                          Dernière mise à jour
                        </Typography>
                        <Typography variant="body1" color="#F5F5F5">
                          {formatDate(application.updated_at)}
                        </Typography>
                      </Grid>
                    )}
                  </Grid>
                </Paper>

                {/* Vehicle Info */}
                {application.vehicle && (
                  <Paper
                    sx={{
                      p: 3,
                      background: 'linear-gradient(145deg, #151515 0%, #0F0F0F 100%)',
                      border: '1px solid rgba(193, 18, 31, 0.2)',
                      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.4)',
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                      <DirectionsCarIcon sx={{ color: '#C1121F' }} />
                      <Typography variant="h6" color="#F5F5F5" sx={{ fontWeight: 600 }}>
                        Véhicule
                      </Typography>
                    </Box>

                    <Divider sx={{ borderColor: 'rgba(193, 18, 31, 0.2)', mb: 3 }} />

                    <Typography
                      variant="h5"
                      sx={{
                        color: '#F5F5F5',
                        fontFamily: 'Playfair Display',
                        fontWeight: 700,
                        mb: 2,
                      }}
                    >
                      {application.vehicle.brand} {application.vehicle.model}
                    </Typography>

                    <Grid container spacing={3}>
                      <Grid item xs={6} sm={3}>
                        <Typography variant="body2" color="#9A9A9A" sx={{ mb: 0.5 }}>
                          Année
                        </Typography>
                        <Typography variant="body1" color="#F5F5F5" sx={{ fontWeight: 600 }}>
                          {application.vehicle.year}
                        </Typography>
                      </Grid>
                      <Grid item xs={6} sm={3}>
                        <Typography variant="body2" color="#9A9A9A" sx={{ mb: 0.5 }}>
                          Kilométrage
                        </Typography>
                        <Typography variant="body1" color="#F5F5F5" sx={{ fontWeight: 600 }}>
                          {application.vehicle.mileage?.toLocaleString()} km
                        </Typography>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="body2" color="#9A9A9A" sx={{ mb: 0.5 }}>
                          Prix
                        </Typography>
                        <Typography
                          variant="h5"
                          sx={{
                            color: '#C1121F',
                            fontFamily: 'Playfair Display',
                            fontWeight: 700,
                          }}
                        >
                          {application.vehicle.price?.toLocaleString()} €
                        </Typography>
                      </Grid>
                    </Grid>
                  </Paper>
                )}
              </Grid>

              {/* Documents Section */}
              <Grid item xs={12} md={4}>
                <Paper
                  sx={{
                    p: 3,
                    background: 'linear-gradient(145deg, #151515 0%, #0F0F0F 100%)',
                    border: '1px solid rgba(193, 18, 31, 0.2)',
                    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.4)',
                  }}
                >
                  <Typography variant="h6" color="#F5F5F5" sx={{ mb: 3, fontWeight: 600 }}>
                    Documents
                  </Typography>

                  <Box sx={{ mb: 3 }}>
                    <DocumentUploadBox applicationId={id} onUploadSuccess={handleUploadSuccess} />
                  </Box>

                  <Typography variant="body2" color="#9A9A9A" sx={{ mb: 2, fontWeight: 600 }}>
                    Documents téléversés ({documents.length})
                  </Typography>

                  {loadingDocuments ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                      <CircularProgress size={30} sx={{ color: '#C1121F' }} />
                    </Box>
                  ) : (
                    <UploadedDocumentsList documents={documents} onDeleteSuccess={handleDeleteSuccess} />
                  )}
                </Paper>
              </Grid>
            </Grid>
          ) : null}
        </Container>
      </Box>
    </Box>
  );
};

export default CustomerApplicationDetails;
