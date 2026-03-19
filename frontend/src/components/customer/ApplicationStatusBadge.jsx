import { Chip } from '@mui/material';

const ApplicationStatusBadge = ({ status }) => {
  const getStatusConfig = (status) => {
    switch (status) {
      case 'APPROVED':
        return {
          label: 'Approuvée',
          color: 'success',
        };
      case 'REJECTED':
        return {
          label: 'Rejetée',
          color: 'error',
        };
      case 'PENDING':
        return {
          label: 'En attente',
          color: 'warning',
        };
      default:
        return {
          label: status,
          color: 'default',
        };
    }
  };

  const config = getStatusConfig(status);

  return (
    <Chip
      label={config.label}
      color={config.color}
      size="small"
      sx={{
        fontWeight: 600,
        letterSpacing: '0.02em',
      }}
    />
  );
};

export default ApplicationStatusBadge;
