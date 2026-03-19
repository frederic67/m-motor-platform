import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Chip,
  Box,
  Typography,
  Tooltip,
} from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import DeleteIcon from '@mui/icons-material/Delete';

const ApplicationTable = ({ applications, onView, onApprove, onReject, onDelete }) => {
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

  if (!applications || applications.length === 0) {
    return (
      <Box sx={{ p: 6, textAlign: 'center' }}>
        <Typography variant="h6" color="#9A9A9A" sx={{ mb: 1 }}>
          Aucune demande
        </Typography>
        <Typography variant="body2" color="#9A9A9A">
          Les demandes des clients apparaîtront ici
        </Typography>
      </Box>
    );
  }

  return (
    <TableContainer>
      <Table>
        <TableHead>
          <TableRow
            sx={{
              borderBottom: '2px solid rgba(193, 18, 31, 0.3)',
            }}
          >
            <TableCell
              sx={{
                color: '#F5F5F5',
                fontWeight: 700,
                letterSpacing: '0.05em',
                textTransform: 'uppercase',
                fontSize: '0.75rem',
                bgcolor: 'rgba(31, 31, 31, 0.5)',
              }}
            >
              Client
            </TableCell>
            <TableCell
              sx={{
                color: '#F5F5F5',
                fontWeight: 700,
                letterSpacing: '0.05em',
                textTransform: 'uppercase',
                fontSize: '0.75rem',
                bgcolor: 'rgba(31, 31, 31, 0.5)',
              }}
            >
              Véhicule
            </TableCell>
            <TableCell
              sx={{
                color: '#F5F5F5',
                fontWeight: 700,
                letterSpacing: '0.05em',
                textTransform: 'uppercase',
                fontSize: '0.75rem',
                bgcolor: 'rgba(31, 31, 31, 0.5)',
              }}
            >
              Type
            </TableCell>
            <TableCell
              sx={{
                color: '#F5F5F5',
                fontWeight: 700,
                letterSpacing: '0.05em',
                textTransform: 'uppercase',
                fontSize: '0.75rem',
                bgcolor: 'rgba(31, 31, 31, 0.5)',
              }}
            >
              Statut
            </TableCell>
            <TableCell
              sx={{
                color: '#F5F5F5',
                fontWeight: 700,
                letterSpacing: '0.05em',
                textTransform: 'uppercase',
                fontSize: '0.75rem',
                bgcolor: 'rgba(31, 31, 31, 0.5)',
              }}
            >
              Date
            </TableCell>
            <TableCell
              align="right"
              sx={{
                color: '#F5F5F5',
                fontWeight: 700,
                letterSpacing: '0.05em',
                textTransform: 'uppercase',
                fontSize: '0.75rem',
                bgcolor: 'rgba(31, 31, 31, 0.5)',
              }}
            >
              Actions
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {applications.map((application) => (
            <TableRow
              key={application.id}
              onClick={() => onView(application)}
              sx={{
                cursor: 'pointer',
                '&:hover': {
                  bgcolor: 'rgba(193, 18, 31, 0.05)',
                },
                borderBottom: '1px solid rgba(193, 18, 31, 0.1)',
                transition: 'background-color 0.2s ease',
              }}
            >
              <TableCell>
                <Box>
                  <Typography
                    variant="body2"
                    sx={{
                      color: '#F5F5F5',
                      fontWeight: 600,
                      mb: 0.5,
                    }}
                  >
                    {application.user?.full_name || 'N/A'}
                  </Typography>
                  <Typography variant="caption" color="#9A9A9A">
                    {application.user?.email || ''}
                  </Typography>
                </Box>
              </TableCell>
              <TableCell>
                <Typography
                  variant="body2"
                  sx={{
                    color: '#F5F5F5',
                    fontWeight: 600,
                  }}
                >
                  {application.vehicle?.brand} {application.vehicle?.model}
                </Typography>
                <Typography variant="caption" color="#9A9A9A">
                  {application.vehicle?.year}
                </Typography>
              </TableCell>
              <TableCell>
                <Chip
                  label={getTypeLabel(application.type)}
                  size="small"
                  sx={{
                    bgcolor: application.type === 'PURCHASE' 
                      ? 'rgba(193, 18, 31, 0.2)' 
                      : 'rgba(212, 175, 55, 0.2)',
                    color: application.type === 'PURCHASE' ? '#C1121F' : '#D4AF37',
                    border: `1px solid ${application.type === 'PURCHASE' ? 'rgba(193, 18, 31, 0.4)' : 'rgba(212, 175, 55, 0.4)'}`,
                    fontWeight: 600,
                  }}
                />
              </TableCell>
              <TableCell>
                <Chip
                  label={getStatusLabel(application.status)}
                  color={getStatusColor(application.status)}
                  size="small"
                  sx={{ fontWeight: 600 }}
                />
              </TableCell>
              <TableCell>
                <Typography variant="body2" color="#F5F5F5">
                  {new Date(application.created_at).toLocaleDateString('fr-FR', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                  })}
                </Typography>
              </TableCell>
              <TableCell align="right">
                <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                  <Tooltip title="Voir les détails">
                    <IconButton
                      size="small"
                      onClick={(event) => {
                        event.stopPropagation();
                        onView(application);
                      }}
                      sx={{
                        color: '#9A9A9A',
                        '&:hover': {
                          color: '#F5F5F5',
                          bgcolor: 'rgba(245, 245, 245, 0.1)',
                        },
                      }}
                    >
                      <VisibilityIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  
                  {application.status === 'PENDING' && (
                    <>
                      <Tooltip title="Approuver">
                        <IconButton
                          size="small"
                          onClick={(event) => {
                            event.stopPropagation();
                            onApprove(application.id);
                          }}
                          sx={{
                            color: '#4caf50',
                            '&:hover': {
                              bgcolor: 'rgba(76, 175, 80, 0.1)',
                            },
                          }}
                        >
                          <CheckCircleIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      
                      <Tooltip title="Rejeter">
                        <IconButton
                          size="small"
                          onClick={(event) => {
                            event.stopPropagation();
                            onReject(application.id);
                          }}
                          sx={{
                            color: '#C1121F',
                            '&:hover': {
                              bgcolor: 'rgba(193, 18, 31, 0.1)',
                            },
                          }}
                        >
                          <CancelIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </>
                  )}
                  <Tooltip title="Supprimer la demande">
                    <IconButton
                      size="small"
                      onClick={(event) => {
                        event.stopPropagation();
                        onDelete(application.id);
                      }}
                      sx={{
                        color: '#ff6b6b',
                        '&:hover': {
                          bgcolor: 'rgba(255, 107, 107, 0.1)',
                        },
                      }}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Box>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default ApplicationTable;
