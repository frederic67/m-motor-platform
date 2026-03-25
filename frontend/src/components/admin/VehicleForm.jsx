import { useState, useEffect } from 'react';
import { API_HOST } from '../../services/api';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  FormControlLabel,
  Checkbox,
  Box,
  Typography,
  IconButton,
  Avatar,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DeleteIcon from '@mui/icons-material/Delete';

const VehicleForm = ({ open, onClose, onSubmit, vehicle }) => {
  const [formData, setFormData] = useState({
    brand: '',
    model: '',
    year: new Date().getFullYear(),
    mileage: 0,
    price: 0,
    image_url: '',
    available_for_sale: false,
    available_for_rent: false,
  });

  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (vehicle) {
      setFormData(vehicle);
      setImagePreview(vehicle.image_url ? `${API_HOST}${vehicle.image_url}` : null);
    } else {
      setFormData({
        brand: '',
        model: '',
        year: new Date().getFullYear(),
        mileage: 0,
        price: 0,
        image_url: '',
        available_for_sale: false,
        available_for_rent: false,
      });
      setImagePreview(null);
    }
    setSelectedImage(null);
    setErrors({});
  }, [vehicle, open]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : type === 'number' ? Number(value) : value
    }));
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        setErrors(prev => ({ ...prev, image: 'Format invalide. JPG, PNG, WEBP uniquement.' }));
        return;
      }

      // Validate file size (5MB)
      const maxSize = 5 * 1024 * 1024;
      if (file.size > maxSize) {
        setErrors(prev => ({ ...prev, image: 'Taille maximale: 5 MB' }));
        return;
      }

      setSelectedImage(file);
      setErrors(prev => ({ ...prev, image: '' }));

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
    setFormData(prev => ({ ...prev, image_url: '' }));
  };

  const validate = () => {
    const newErrors = {};
    
    if (!formData.brand || formData.brand.trim() === '') {
      newErrors.brand = 'La marque est requise';
    }
    
    if (!formData.model || formData.model.trim() === '') {
      newErrors.model = 'Le modèle est requis';
    }
    
    if (formData.year < 1900 || formData.year > new Date().getFullYear() + 1) {
      newErrors.year = `L'année doit être entre 1900 et ${new Date().getFullYear() + 1}`;
    }
    
    if (formData.mileage < 0) {
      newErrors.mileage = 'Le kilométrage doit être positif';
    }
    
    if (formData.price <= 0) {
      newErrors.price = 'Le prix doit être supérieur à 0';
    }
    
    if (!formData.available_for_sale && !formData.available_for_rent) {
      newErrors.availability = 'Le véhicule doit être disponible à la vente ou à la location';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validate()) {
      onSubmit(formData, selectedImage);
    }
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="md" 
      fullWidth
      PaperProps={{
        sx: {
          background: '#151515',
          border: '1px solid rgba(193, 18, 31, 0.3)',
          borderRadius: 0,
        }
      }}
    >
      <DialogTitle sx={{ 
        borderBottom: '1px solid rgba(193, 18, 31, 0.2)', 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        pb: 2
      }}>
        <Typography variant="h6" sx={{
          fontFamily: 'Playfair Display',
          fontWeight: 600,
          color: '#F5F5F5',
          letterSpacing: '0.02em'
        }}>
          {vehicle ? 'Modifier le véhicule' : 'Nouveau véhicule'}
        </Typography>
        <IconButton onClick={onClose} sx={{ color: '#9A9A9A', '&:hover': { color: '#F5F5F5' } }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent sx={{ pt: 3 }}>
          <Grid container spacing={3}>
            {/* Image Upload Section */}
            <Grid item xs={12}>
              <Box sx={{ 
                p: 3, 
                border: `2px dashed ${errors.image ? '#f44336' : 'rgba(193, 18, 31, 0.3)'}`,
                bgcolor: 'rgba(31, 31, 31, 0.5)',
                textAlign: 'center'
              }}>
                <Typography variant="body2" color="#9A9A9A" sx={{ mb: 2, fontWeight: 600 }}>
                  Photo du véhicule
                </Typography>
                
                {imagePreview ? (
                  <Box sx={{ position: 'relative', display: 'inline-block' }}>
                    <Avatar
                      src={imagePreview}
                      variant="rounded"
                      sx={{ 
                        width: 200, 
                        height: 150, 
                        mb: 2,
                        border: '2px solid rgba(193, 18, 31, 0.3)'
                      }}
                    />
                    <IconButton
                      onClick={handleRemoveImage}
                      sx={{
                        position: 'absolute',
                        top: 0,
                        right: 0,
                        bgcolor: '#C1121F',
                        color: '#F5F5F5',
                        '&:hover': { bgcolor: '#9A0E18' },
                        width: 32,
                        height: 32,
                      }}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Box>
                ) : (
                  <CloudUploadIcon sx={{ fontSize: 48, color: '#C1121F', mb: 2 }} />
                )}

                <Box>
                  <Button
                    variant="contained"
                    component="label"
                    startIcon={<CloudUploadIcon />}
                    sx={{
                      bgcolor: '#C1121F',
                      color: '#F5F5F5',
                      '&:hover': { bgcolor: '#9A0E18' },
                    }}
                  >
                    {imagePreview ? 'Changer la photo' : 'Ajouter une photo'}
                    <input
                      type="file"
                      hidden
                      accept="image/jpeg,image/jpg,image/png,image/webp"
                      onChange={handleImageChange}
                    />
                  </Button>
                </Box>

                <Typography variant="caption" color="#9A9A9A" sx={{ display: 'block', mt: 1 }}>
                  Formats: JPG, PNG, WEBP • Taille max: 5 MB
                </Typography>

                {errors.image && (
                  <Typography variant="caption" color="#f44336" sx={{ display: 'block', mt: 1 }}>
                    {errors.image}
                  </Typography>
                )}
              </Box>
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Marque"
                name="brand"
                value={formData.brand}
                onChange={handleChange}
                required
                error={!!errors.brand}
                helperText={errors.brand}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Modèle"
                name="model"
                value={formData.model}
                onChange={handleChange}
                required
                error={!!errors.model}
                helperText={errors.model}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Année"
                name="year"
                type="number"
                value={formData.year}
                onChange={handleChange}
                required
                error={!!errors.year}
                helperText={errors.year}
                inputProps={{ min: 1900, max: new Date().getFullYear() + 1 }}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Kilométrage"
                name="mileage"
                type="number"
                value={formData.mileage}
                onChange={handleChange}
                required
                error={!!errors.mileage}
                helperText={errors.mileage}
                inputProps={{ min: 0 }}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Prix (€)"
                name="price"
                type="number"
                value={formData.price}
                onChange={handleChange}
                required
                error={!!errors.price}
                helperText={errors.price}
                inputProps={{ min: 0, step: 0.01 }}
              />
            </Grid>
            <Grid item xs={12}>
              <Box sx={{ 
                display: 'flex', 
                flexDirection: 'column',
                gap: 2,
                p: 2,
                border: `1px solid ${errors.availability ? '#f44336' : 'rgba(193, 18, 31, 0.2)'}`,
                bgcolor: 'rgba(31, 31, 31, 0.5)'
              }}>
                <Typography variant="body2" color={errors.availability ? '#f44336' : '#9A9A9A'} sx={{ letterSpacing: '0.03em' }}>
                  Disponibilité *
                </Typography>
                <Box sx={{ display: 'flex', gap: 3 }}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        name="available_for_sale"
                        checked={formData.available_for_sale}
                        onChange={handleChange}
                        sx={{ 
                          color: '#9A9A9A',
                          '&.Mui-checked': { color: '#C1121F' }
                        }}
                      />
                    }
                    label="Disponible à la vente"
                    sx={{ color: '#F5F5F5' }}
                  />
                  <FormControlLabel
                    control={
                      <Checkbox
                        name="available_for_rent"
                        checked={formData.available_for_rent}
                        onChange={handleChange}
                        sx={{ 
                          color: '#9A9A9A',
                          '&.Mui-checked': { color: '#C1121F' }
                        }}
                      />
                    }
                    label="Disponible à la location"
                    sx={{ color: '#F5F5F5' }}
                  />
                </Box>
                {errors.availability && (
                  <Typography variant="caption" color="#f44336" sx={{ mt: -1 }}>
                    {errors.availability}
                  </Typography>
                )}
              </Box>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ borderTop: '1px solid rgba(193, 18, 31, 0.2)', p: 3, gap: 2 }}>
          <Button 
            onClick={onClose} 
            variant="outlined"
            sx={{ px: 4 }}
          >
            Annuler
          </Button>
          <Button 
            type="submit" 
            variant="contained"
            sx={{ px: 4 }}
          >
            {vehicle ? 'Enregistrer' : 'Créer'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default VehicleForm;
