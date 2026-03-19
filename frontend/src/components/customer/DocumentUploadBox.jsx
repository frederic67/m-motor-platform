import { useState } from 'react';
import { Box, Typography, Button, LinearProgress, Alert } from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { documentsAPI } from '../../services/api';
import { toast } from 'react-toastify';

const DocumentUploadBox = ({ applicationId, onUploadSuccess }) => {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
    if (!allowedTypes.includes(file.type)) {
      setError('Invalid file format. Accepted formats: PDF, JPG, PNG');
      return;
    }

    // Validate file size (5MB max)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      setError('File is too large. Maximum size: 5 MB');
      return;
    }

    setError('');
    setUploading(true);

    try {
      await documentsAPI.upload(applicationId, file);
      toast.success('Document uploaded successfully');
      if (onUploadSuccess) {
        onUploadSuccess();
      }
      // Reset file input
      event.target.value = '';
    } catch (err) {
      console.error('Error uploading document:', err);
      const errorMessage = err.response?.data?.detail || 'Error uploading document';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setUploading(false);
    }
  };

  return (
    <Box
      sx={{
        p: 3,
        border: '2px dashed rgba(193, 18, 31, 0.3)',
        bgcolor: 'rgba(31, 31, 31, 0.5)',
        textAlign: 'center',
        transition: 'all 0.3s ease',
        '&:hover': {
          borderColor: 'rgba(193, 18, 31, 0.5)',
          bgcolor: 'rgba(31, 31, 31, 0.7)',
        },
      }}
    >
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <CloudUploadIcon
        sx={{
          fontSize: 48,
          color: '#C1121F',
          mb: 2,
          opacity: uploading ? 0.5 : 1,
        }}
      />
      
      <Typography variant="body1" color="#F5F5F5" sx={{ mb: 1, fontWeight: 600 }}>
        Upload Document
      </Typography>
      
      <Typography variant="body2" color="#9A9A9A" sx={{ mb: 3 }}>
        Accepted formats: PDF, JPG, PNG • Max size: 5 MB
      </Typography>

      {uploading ? (
        <Box sx={{ width: '100%', mb: 2 }}>
          <LinearProgress
            sx={{
              bgcolor: 'rgba(193, 18, 31, 0.1)',
              '& .MuiLinearProgress-bar': {
                bgcolor: '#C1121F',
              },
            }}
          />
          <Typography variant="body2" color="#9A9A9A" sx={{ mt: 1 }}>
            Uploading...
          </Typography>
        </Box>
      ) : (
        <Button
          variant="contained"
          component="label"
          startIcon={<CloudUploadIcon />}
          sx={{
            bgcolor: '#C1121F',
            color: '#F5F5F5',
            px: 4,
            '&:hover': {
              bgcolor: '#9A0E18',
            },
          }}
        >
          Choose File
          <input
            type="file"
            hidden
            accept=".pdf,.jpg,.jpeg,.png"
            onChange={handleFileChange}
            disabled={uploading}
          />
        </Button>
      )}
    </Box>
  );
};

export default DocumentUploadBox;
