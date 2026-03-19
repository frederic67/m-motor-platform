import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  Typography,
  Box,
  Card,
  CardContent,
  Button,
  Chip,
  CircularProgress,
  Alert,
  Divider,
  Grid,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  IconButton,
  TextField,
  Paper,
} from '@mui/material'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import DescriptionIcon from '@mui/icons-material/Description'
import CloudUploadIcon from '@mui/icons-material/CloudUpload'
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf'
import ImageIcon from '@mui/icons-material/Image'
import { applicationsAPI, documentsAPI } from '../services/api'

const statusColors = {
  PENDING: 'warning',
  APPROVED: 'success',
  REJECTED: 'error',
}

const statusLabels = {
  PENDING: 'En attente',
  APPROVED: 'Approuvée',
  REJECTED: 'Rejetée',
}

const typeLabels = {
  PURCHASE: 'Achat',
  RENTAL: 'Location',
}

const ApplicationDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  
  const [application, setApplication] = useState(null)
  const [documents, setDocuments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [uploadLoading, setUploadLoading] = useState(false)
  const [uploadError, setUploadError] = useState('')
  const [uploadSuccess, setUploadSuccess] = useState('')
  const [selectedFile, setSelectedFile] = useState(null)

  useEffect(() => {
    fetchApplicationDetails()
    fetchDocuments()
  }, [id])

  const fetchApplicationDetails = async () => {
    setLoading(true)
    setError('')

    try {
      const response = await applicationsAPI.getById(id)
      setApplication(response.data)
    } catch (err) {
      setError(err.response?.data?.detail || 'Erreur lors du chargement de la demande')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const fetchDocuments = async () => {
    try {
      const response = await documentsAPI.getByApplication(id)
      setDocuments(response.data)
    } catch (err) {
      console.error('Error fetching documents:', err)
    }
  }

  const handleFileChange = (event) => {
    const file = event.target.files[0]
    if (file) {
      // Validate file type
      const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png']
      if (!allowedTypes.includes(file.type)) {
        setUploadError('Type de fichier non autorisé. Formats acceptés: PDF, JPG, PNG')
        setSelectedFile(null)
        return
      }

      // Validate file size (5MB)
      if (file.size > 5 * 1024 * 1024) {
        setUploadError('Fichier trop volumineux. Taille maximale: 5MB')
        setSelectedFile(null)
        return
      }

      setSelectedFile(file)
      setUploadError('')
    }
  }

  const handleUpload = async () => {
    if (!selectedFile) {
      setUploadError('Veuillez sélectionner un fichier')
      return
    }

    setUploadLoading(true)
    setUploadError('')
    setUploadSuccess('')

    try {
      await documentsAPI.upload(id, selectedFile)
      setUploadSuccess('Document uploadé avec succès')
      setSelectedFile(null)
      // Reset file input
      document.getElementById('file-input').value = ''
      // Refresh documents list
      fetchDocuments()
    } catch (err) {
      setUploadError(err.response?.data?.detail || 'Erreur lors de l\'upload du document')
    } finally {
      setUploadLoading(false)
    }
  }

  const getFileIcon = (contentType) => {
    if (contentType === 'application/pdf') {
      return <PictureAsPdfIcon color="error" />
    }
    return <ImageIcon color="primary" />
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    )
  }

  if (error || !application) {
    return (
      <Box>
        <Alert severity="error">{error || 'Demande introuvable'}</Alert>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/my-applications')}
          sx={{ mt: 2 }}
        >
          Retour à mes demandes
        </Button>
      </Box>
    )
  }

  return (
    <Box>
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={() => navigate('/my-applications')}
        sx={{ mb: 3 }}
      >
        Retour à mes demandes
      </Button>

      <Grid container spacing={3}>
        {/* Application Details */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h5" gutterBottom>
                Détails de la demande
              </Typography>

              <Box display="flex" gap={1} mb={3}>
                <Chip
                  label={statusLabels[application.status]}
                  color={statusColors[application.status]}
                />
                <Chip
                  label={typeLabels[application.type]}
                  variant="outlined"
                />
              </Box>

              <Divider sx={{ my: 2 }} />

              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    ID Demande
                  </Typography>
                  <Typography variant="body1" fontWeight="bold">
                    #{application.id.slice(0, 8)}
                  </Typography>
                </Grid>

                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    Type
                  </Typography>
                  <Typography variant="body1" fontWeight="bold">
                    {typeLabels[application.type]}
                  </Typography>
                </Grid>

                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    Statut
                  </Typography>
                  <Typography variant="body1" fontWeight="bold">
                    {statusLabels[application.status]}
                  </Typography>
                </Grid>

                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    Véhicule
                  </Typography>
                  <Typography variant="body1" fontWeight="bold">
                    {application.vehicle_id.slice(0, 8)}
                  </Typography>
                </Grid>

                <Grid item xs={12}>
                  <Typography variant="body2" color="text.secondary">
                    Date de création
                  </Typography>
                  <Typography variant="body1">
                    {formatDate(application.created_at)}
                  </Typography>
                </Grid>

                {application.updated_at !== application.created_at && (
                  <Grid item xs={12}>
                    <Typography variant="body2" color="text.secondary">
                      Dernière mise à jour
                    </Typography>
                    <Typography variant="body1">
                      {formatDate(application.updated_at)}
                    </Typography>
                  </Grid>
                )}
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Documents Section */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h5" gutterBottom>
                Documents
              </Typography>

              {documents.length === 0 ? (
                <Alert severity="info" sx={{ mb: 2 }}>
                  Aucun document uploadé pour le moment
                </Alert>
              ) : (
                <List sx={{ mb: 2 }}>
                  {documents.map((doc) => (
                    <ListItem key={doc.id}>
                      <ListItemIcon>
                        {getFileIcon(doc.content_type)}
                      </ListItemIcon>
                      <ListItemText
                        primary={doc.filename}
                        secondary={formatDate(doc.uploaded_at)}
                      />
                    </ListItem>
                  ))}
                </List>
              )}

              <Divider sx={{ my: 2 }} />

              {/* Upload Form */}
              <Typography variant="h6" gutterBottom>
                Uploader un document
              </Typography>

              {uploadSuccess && (
                <Alert severity="success" sx={{ mb: 2 }}>
                  {uploadSuccess}
                </Alert>
              )}

              {uploadError && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {uploadError}
                </Alert>
              )}

              <Box>
                <input
                  accept=".pdf,.jpg,.jpeg,.png"
                  style={{ display: 'none' }}
                  id="file-input"
                  type="file"
                  onChange={handleFileChange}
                />
                <label htmlFor="file-input">
                  <Button
                    variant="outlined"
                    component="span"
                    startIcon={<DescriptionIcon />}
                    fullWidth
                    sx={{ mb: 2 }}
                  >
                    Choisir un fichier
                  </Button>
                </label>

                {selectedFile && (
                  <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                      Fichier sélectionné:
                    </Typography>
                    <Typography variant="body1">
                      {selectedFile.name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                    </Typography>
                  </Paper>
                )}

                <Typography variant="caption" color="text.secondary" display="block" mb={2}>
                  Formats acceptés: PDF, JPG, PNG (max 5MB)
                </Typography>

                <Button
                  variant="contained"
                  startIcon={<CloudUploadIcon />}
                  onClick={handleUpload}
                  disabled={!selectedFile || uploadLoading}
                  fullWidth
                >
                  {uploadLoading ? 'Upload en cours...' : 'Uploader'}
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  )
}

export default ApplicationDetail
