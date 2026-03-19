import { Box, Typography, Button } from '@mui/material';
import InboxIcon from '@mui/icons-material/Inbox';
import { useNavigate } from 'react-router-dom';

const EmptyState = ({ title, message, actionText, actionPath }) => {
  const navigate = useNavigate();

  return (
    <Box
      sx={{
        p: 8,
        textAlign: 'center',
        background: 'linear-gradient(145deg, #151515 0%, #0F0F0F 100%)',
        border: '1px solid rgba(193, 18, 31, 0.2)',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.4)',
      }}
    >
      <InboxIcon
        sx={{
          fontSize: 80,
          color: 'rgba(193, 18, 31, 0.3)',
          mb: 3,
        }}
      />
      <Typography
        variant="h5"
        sx={{
          color: '#F5F5F5',
          fontFamily: 'Playfair Display',
          fontWeight: 600,
          mb: 2,
          letterSpacing: '0.02em',
        }}
      >
        {title}
      </Typography>
      <Typography variant="body1" color="#9A9A9A" sx={{ mb: 4, maxWidth: 500, mx: 'auto' }}>
        {message}
      </Typography>
      {actionText && actionPath && (
        <Button
          variant="contained"
          onClick={() => navigate(actionPath)}
          sx={{
            bgcolor: '#C1121F',
            color: '#F5F5F5',
            px: 4,
            py: 1.5,
            fontWeight: 600,
            '&:hover': {
              bgcolor: '#9A0E18',
            },
          }}
        >
          {actionText}
        </Button>
      )}
    </Box>
  );
};

export default EmptyState;
