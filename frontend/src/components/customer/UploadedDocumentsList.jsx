import { Box, Typography, List, ListItem, ListItemIcon, ListItemText, IconButton, Divider, CircularProgress } from '@mui/material';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import ImageIcon from '@mui/icons-material/Image';
import DeleteIcon from '@mui/icons-material/Delete';
import { documentsAPI } from '../../services/api';
import { toast } from 'react-toastify';
import { useState } from 'react';

const UploadedDocumentsList = ({ documents, onDeleteSuccess }) => {
  const [deleting, setDeleting] = useState(null);

  const getFileIcon = (contentType) => {
    if (contentType?.includes('pdf')) {
      return <PictureAsPdfIcon sx={{ color: '#C1121F' }} />;
    } else if (contentType?.includes('image')) {
      return <ImageIcon sx={{ color: '#C1121F' }} />;
    }
    return <InsertDriveFileIcon sx={{ color: '#C1121F' }} />;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleDelete = async (documentId) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce document ?')) {
      return;
    }

    setDeleting(documentId);
    try {
      await documentsAPI.delete(documentId);
      toast.success('Document supprimé');
      if (onDeleteSuccess) {
        onDeleteSuccess();
      }
    } catch (err) {
      console.error('Error deleting document:', err);
      toast.error('Erreur lors de la suppression du document');
    } finally {
      setDeleting(null);
    }
  };

  if (!documents || documents.length === 0) {
    return (
      <Box
        sx={{
          p: 4,
          textAlign: 'center',
          border: '1px solid rgba(193, 18, 31, 0.2)',
          bgcolor: 'rgba(31, 31, 31, 0.3)',
        }}
      >
        <Typography variant="body2" color="#9A9A9A">
          Aucun document téléversé
        </Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        border: '1px solid rgba(193, 18, 31, 0.2)',
        bgcolor: 'rgba(31, 31, 31, 0.3)',
      }}
    >
      <List sx={{ p: 0 }}>
        {documents.map((doc, index) => (
          <Box key={doc.id}>
            <ListItem
              sx={{
                py: 2,
                px: 3,
                '&:hover': {
                  bgcolor: 'rgba(193, 18, 31, 0.05)',
                },
              }}
              secondaryAction={
                <IconButton
                  edge="end"
                  onClick={() => handleDelete(doc.id)}
                  disabled={deleting === doc.id}
                  sx={{
                    color: '#C1121F',
                    '&:hover': {
                      bgcolor: 'rgba(193, 18, 31, 0.1)',
                    },
                  }}
                >
                  {deleting === doc.id ? (
                    <CircularProgress size={20} sx={{ color: '#C1121F' }} />
                  ) : (
                    <DeleteIcon />
                  )}
                </IconButton>
              }
            >
              <ListItemIcon sx={{ minWidth: 40 }}>
                {getFileIcon(doc.content_type)}
              </ListItemIcon>
              <ListItemText
                primary={
                  <Typography variant="body2" color="#F5F5F5" sx={{ fontWeight: 600 }}>
                    {doc.filename}
                  </Typography>
                }
                secondary={
                  <Typography variant="caption" color="#9A9A9A">
                    Téléversé le {formatDate(doc.uploaded_at)}
                  </Typography>
                }
              />
            </ListItem>
            {index < documents.length - 1 && (
              <Divider sx={{ borderColor: 'rgba(193, 18, 31, 0.1)' }} />
            )}
          </Box>
        ))}
      </List>
    </Box>
  );
};

export default UploadedDocumentsList;
