import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
} from '@mui/material';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';

const ConfirmDialog = ({
  open,
  title,
  message,
  onConfirm,
  onCancel,
  confirmText = 'Confirmer',
  cancelText = 'Annuler',
  danger = false,
}) => {
  return (
    <Dialog
      open={open}
      onClose={onCancel}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          background: '#151515',
          border: `1px solid ${danger ? 'rgba(193, 18, 31, 0.4)' : 'rgba(193, 18, 31, 0.3)'}`,
          borderRadius: 0,
          boxShadow: danger 
            ? '0 8px 32px rgba(193, 18, 31, 0.3)' 
            : '0 8px 32px rgba(0, 0, 0, 0.5)',
        },
      }}
    >
      <DialogTitle
        sx={{
          borderBottom: `1px solid ${danger ? 'rgba(193, 18, 31, 0.3)' : 'rgba(193, 18, 31, 0.2)'}`,
          pb: 2,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          {danger && (
            <WarningAmberIcon
              sx={{
                color: '#C1121F',
                fontSize: '2rem',
              }}
            />
          )}
          <Typography
            variant="h6"
            sx={{
              fontFamily: 'Playfair Display',
              fontWeight: 600,
              color: '#F5F5F5',
              letterSpacing: '0.02em',
            }}
          >
            {title}
          </Typography>
        </Box>
      </DialogTitle>
      <DialogContent sx={{ pt: 3, pb: 2 }}>
        <Typography
          variant="body1"
          sx={{
            color: '#F5F5F5',
            lineHeight: 1.6,
          }}
        >
          {message}
        </Typography>
      </DialogContent>
      <DialogActions
        sx={{
          borderTop: `1px solid ${danger ? 'rgba(193, 18, 31, 0.3)' : 'rgba(193, 18, 31, 0.2)'}`,
          p: 3,
          gap: 2,
        }}
      >
        <Button
          onClick={onCancel}
          variant="outlined"
          sx={{
            px: 4,
            color: '#F5F5F5',
            borderColor: 'rgba(245, 245, 245, 0.3)',
            '&:hover': {
              borderColor: '#F5F5F5',
              bgcolor: 'rgba(245, 245, 245, 0.05)',
            },
          }}
        >
          {cancelText}
        </Button>
        <Button
          onClick={onConfirm}
          variant="contained"
          sx={{
            px: 4,
            bgcolor: danger ? '#C1121F' : '#C1121F',
            color: '#F5F5F5',
            fontWeight: 600,
            '&:hover': {
              bgcolor: danger ? '#9A0E18' : '#9A0E18',
            },
          }}
        >
          {confirmText}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ConfirmDialog;
