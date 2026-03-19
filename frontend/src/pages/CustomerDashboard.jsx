import { useState, useEffect } from 'react';
import { Box, Container, Typography, Grid, CircularProgress, Alert } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import DescriptionIcon from '@mui/icons-material/Description';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import CancelIcon from '@mui/icons-material/Cancel';
import CustomerSidebar from '../components/customer/CustomerSidebar';
import CustomerStatsCard from '../components/customer/CustomerStatsCard';
import CustomerApplicationCard from '../components/customer/CustomerApplicationCard';
import EmptyState from '../components/customer/EmptyState';
import api from '../services/api';
import { toast } from 'react-toastify';

const CustomerDashboard = () => {
  const navigate = useNavigate();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get('/applications/me');
      setApplications(response.data);
    } catch (err) {
      console.error('Error fetching applications:', err);
      setError('Error loading your applications');
      if (err.response?.status === 401) {
        toast.error('Session expired. Please log in again.');
        navigate('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  const stats = {
    total: applications.length,
    pending: applications.filter((app) => app.status === 'PENDING').length,
    approved: applications.filter((app) => app.status === 'APPROVED').length,
    rejected: applications.filter((app) => app.status === 'REJECTED').length,
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#0B0B0B' }}>
      <CustomerSidebar />

      <Box component="main" sx={{ flexGrow: 1, p: 4 }}>
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
              Tableau de Bord
            </Typography>
            <Typography variant="body1" color="#9A9A9A" sx={{ letterSpacing: '0.03em' }}>
              Bienvenue dans votre espace personnel
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
          ) : (
            <>
              {/* Stats Cards */}
              <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item xs={12} sm={6} md={3}>
                  <CustomerStatsCard
                    title="Total Demandes"
                    value={stats.total}
                    icon={<DescriptionIcon fontSize="large" />}
                    color="#C1121F"
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <CustomerStatsCard
                    title="En Attente"
                    value={stats.pending}
                    icon={<HourglassEmptyIcon fontSize="large" />}
                    color="#ff9800"
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <CustomerStatsCard
                    title="Approuvées"
                    value={stats.approved}
                    icon={<CheckCircleIcon fontSize="large" />}
                    color="#4caf50"
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <CustomerStatsCard
                    title="Rejetées"
                    value={stats.rejected}
                    icon={<CancelIcon fontSize="large" />}
                    color="#f44336"
                  />
                </Grid>
              </Grid>

              {/* Applications Section */}
              <Box sx={{ mb: 3 }}>
                <Typography
                  variant="h5"
                  sx={{
                    fontFamily: 'Playfair Display',
                    fontWeight: 600,
                    color: '#F5F5F5',
                    mb: 3,
                    letterSpacing: '0.02em',
                  }}
                >
                  Mes Demandes Récentes
                </Typography>

                {applications.length === 0 ? (
                  <EmptyState
                    title="Aucune demande"
                    message="Vous n'avez pas encore effectué de demande. Consultez notre catalogue de véhicules premium pour commencer."
                    actionText="Voir les véhicules"
                    actionPath="/vehicles"
                  />
                ) : (
                  <Grid container spacing={3}>
                    {applications.slice(0, 6).map((application) => (
                      <Grid item xs={12} md={6} lg={4} key={application.id}>
                        <CustomerApplicationCard application={application} />
                      </Grid>
                    ))}
                  </Grid>
                )}
              </Box>
            </>
          )}
        </Container>
      </Box>
    </Box>
  );
};

export default CustomerDashboard;
