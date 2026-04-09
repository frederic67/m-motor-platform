import { Card, CardContent, CardActions, Box, Typography, Button, Chip } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import VisibilityIcon from '@mui/icons-material/Visibility';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';

const CustomerApplicationCard = ({ application }) => {
  const navigate = useNavigate();

  const getStatusConfig = (status) => {
    switch (status) {
      case 'APPROVED':
        return { label: 'Approuvée', color: 'success' };
      case 'REJECTED':
        return { label: 'Rejetée', color: 'error' };
      case 'PENDING':
        return { label: 'En attente', color: 'warning' };
      default:
        return { label: status, color: 'default' };
    }
  };

  const getTypeLabel = (type) => {
    return type === 'PURCHASE' ? 'Achat' : 'Location';
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const statusConfig = getStatusConfig(application.status);

  return (
    <Card
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        background: 'linear-gradient(145deg, #151515 0%, #0F0F0F 100%)',
        border: '1px solid rgba(193, 18, 31, 0.2)',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.4)',
        transition: 'all 0.3s ease',
        '&:hover': {
          borderColor: 'rgba(193, 18, 31, 0.4)',
          transform: 'translateY(-4px)',
          boxShadow: '0 8px 30px rgba(193, 18, 31, 0.2)',
        },
      }}
    >
      <CardContent sx={{ flexGrow: 1, p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 2 }}>
          <Typography
            variant="h6"
            sx={{
              color: '#F5F5F5',
              fontWeight: 600,
              letterSpacing: '0.02em',
            }}
          >
            Demande #{application.id.slice(0, 8)}
          </Typography>
          <Chip
            label={statusConfig.label}
            color={statusConfig.color}
            size="small"
            sx={{ fontWeight: 600 }}
          />
        </Box>

        <Box sx={{ mb: 2 }}>
          <Chip
            label={getTypeLabel(application.type)}
            size="small"
            sx={{
              bgcolor: application.type === 'PURCHASE' ? 'rgba(193, 18, 31, 0.2)' : 'rgba(212, 175, 55, 0.2)',
              color: application.type === 'PURCHASE' ? '#C1121F' : '#D4AF37',
              border: `1px solid ${application.type === 'PURCHASE' ? 'rgba(193, 18, 31, 0.4)' : 'rgba(212, 175, 55, 0.4)'}`,
              fontWeight: 600,
            }}
          />
        </Box>

        {application.vehicle && (
          <Box
            sx={{
              p: 2,
              mb: 2,
              border: '1px solid rgba(193, 18, 31, 0.2)',
              bgcolor: 'rgba(31, 31, 31, 0.5)',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <DirectionsCarIcon sx={{ color: '#C1121F', fontSize: '1.2rem' }} />
              <Typography variant="body2" color="#9A9A9A" sx={{ textTransform: 'uppercase', fontSize: '0.7rem', letterSpacing: '0.05em' }}>
                Véhicule
              </Typography>
            </Box>
            <Typography variant="body1" color="#F5F5F5" sx={{ fontWeight: 600 }}>
              {application.vehicle.brand} {application.vehicle.model}
            </Typography>
            <Typography variant="body2" color="#9A9A9A">
              {application.vehicle.year} • {application.vehicle.mileage?.toLocaleString()} km
            </Typography>
            <Typography variant="h6" color="#C1121F" sx={{ fontWeight: 700, mt: 1 }}>
              {application.vehicle.price?.toLocaleString()} €
            </Typography>
          </Box>
        )}

        <Typography variant="body2" color="#9A9A9A" sx={{ mb: 0.5 }}>
          Créé le {formatDate(application.created_at)}
        </Typography>

        {application.updated_at && application.updated_at !== application.created_at && (
          <Typography variant="body2" color="#9A9A9A">
            Mis à jour le {formatDate(application.updated_at)}
          </Typography>
        )}
      </CardContent>

      <CardActions sx={{ borderTop: '1px solid rgba(193, 18, 31, 0.2)', p: 2 }}>
        <Button
          fullWidth
          variant="outlined"
          startIcon={<VisibilityIcon />}
          onClick={() => navigate(`/dashboard/applications/${application.id}`)}
          sx={{
            color: '#F5F5F5',
            borderColor: 'rgba(193, 18, 31, 0.5)',
            '&:hover': {
              borderColor: '#C1121F',
              bgcolor: 'rgba(193, 18, 31, 0.1)',
            },
          }}
        >
          Voir les détails
        </Button>
      </CardActions>
    </Card>
  );
};

export default CustomerApplicationCard;
