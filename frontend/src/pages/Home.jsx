import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Typography,
  Button,
  Container,
  Box,
  Grid,
  Paper,
  TextField,
  MenuItem,
  Fade,
  Slide,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import SupportAgentIcon from '@mui/icons-material/SupportAgent';
import SpeedIcon from '@mui/icons-material/Speed';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import StarIcon from '@mui/icons-material/Star';
import { useAuth } from '../context/AuthContext';

const Home = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  
  const [filters, setFilters] = useState({
    type: '',
    brand: '',
    maxPrice: '',
  });

  const handleFilterChange = (field) => (event) => {
    setFilters({ ...filters, [field]: event.target.value });
  };

  const handleSearch = () => {
    const params = new URLSearchParams();
    
    if (filters.type === 'sale') {
      params.append('for_sale', 'true');
    } else if (filters.type === 'rent') {
      params.append('for_rent', 'true');
    }
    
    if (filters.brand) {
      params.append('brand', filters.brand);
    }
    
    if (filters.maxPrice) {
      params.append('max_price', filters.maxPrice);
    }
    
    navigate(`/vehicles?${params.toString()}`);
  };

  return (
    <Box sx={{ background: '#0B0B0B', minHeight: '100vh' }}>
      {/* Hero Section */}
      <Box sx={{ 
        position: 'relative', 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        background: 'radial-gradient(ellipse at center top, rgba(193, 18, 31, 0.12) 0%, #0B0B0B 70%)',
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'linear-gradient(180deg, rgba(11, 11, 11, 0) 0%, rgba(11, 11, 11, 0.8) 90%, #0B0B0B 100%)',
          pointerEvents: 'none',
        }
      }}>
        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1, pt: { xs: 8, md: 0 } }}>
          <Fade in timeout={1500}>
            <Box>
              <Box textAlign="center" sx={{ mb: 8 }}>
                <Box sx={{ mb: 4 }}>
                  <DirectionsCarIcon sx={{ 
                    fontSize: { xs: 60, md: 80 }, 
                    color: '#C1121F', 
                    filter: 'drop-shadow(0 0 30px rgba(193, 18, 31, 0.9))',
                    mb: 3
                  }} />
                </Box>
                <Typography variant="h1" sx={{ 
                  mb: 3, 
                  fontSize: { xs: '2.5rem', md: '5.5rem' }, 
                  color: '#F5F5F5',
                  fontFamily: 'Playfair Display',
                  fontWeight: 700,
                  letterSpacing: '-0.03em',
                  lineHeight: 1.1,
                  textShadow: '0 0 60px rgba(193, 18, 31, 0.3)'
                }}>
                  Découvrez l'excellence automobile
                </Typography>
                <Box sx={{ 
                  width: { xs: 100, md: 140 }, 
                  height: 3, 
                  background: 'linear-gradient(90deg, transparent, #C1121F, transparent)', 
                  margin: '0 auto',
                  mb: 4,
                  boxShadow: '0 0 20px rgba(193, 18, 31, 0.6)'
                }} />
                <Typography variant="h5" sx={{ 
                  mb: 2,
                  fontSize: { xs: '1.1rem', md: '1.5rem' },
                  color: '#9A9A9A',
                  fontWeight: 300,
                  letterSpacing: '0.05em',
                  lineHeight: 1.8,
                  maxWidth: 800,
                  mx: 'auto',
                  px: 2
                }}>
                  Achat et location de véhicules premium dans une expérience fluide, moderne et haut de gamme.
                </Typography>
              </Box>

              {/* Integrated Search Section */}
              <Slide direction="up" in timeout={1000}>
                <Paper sx={{ 
                  p: { xs: 3, md: 5 }, 
                  background: 'linear-gradient(145deg, rgba(31, 31, 31, 0.95) 0%, rgba(21, 21, 21, 0.95) 100%)',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(193, 18, 31, 0.3)',
                  borderRadius: 0,
                  boxShadow: '0 20px 60px rgba(0, 0, 0, 0.7), 0 0 40px rgba(193, 18, 31, 0.2)',
                  maxWidth: 1000,
                  mx: 'auto'
                }}>
                  <Typography variant="h6" sx={{ 
                    mb: 4, 
                    textAlign: 'center',
                    color: '#F5F5F5',
                    fontWeight: 600,
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                    fontSize: '0.9rem'
                  }}>
                    Trouvez votre véhicule idéal
                  </Typography>
                  <Grid container spacing={2.5} alignItems="center">
                    <Grid item xs={12} md={3}>
                      <TextField 
                        select 
                        fullWidth 
                        label="Type" 
                        value={filters.type} 
                        onChange={handleFilterChange('type')}
                        sx={{ 
                          '& .MuiInputBase-root': { 
                            borderRadius: 0,
                            fontSize: '0.95rem'
                          } 
                        }}
                      >
                        <MenuItem value="">Tous</MenuItem>
                        <MenuItem value="sale">Achat</MenuItem>
                        <MenuItem value="rent">Location</MenuItem>
                      </TextField>
                    </Grid>
                    <Grid item xs={12} md={3}>
                      <TextField 
                        fullWidth 
                        label="Marque" 
                        placeholder="BMW, Mercedes..." 
                        value={filters.brand} 
                        onChange={handleFilterChange('brand')}
                        sx={{ 
                          '& .MuiInputBase-root': { 
                            borderRadius: 0,
                            fontSize: '0.95rem'
                          } 
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} md={3}>
                      <TextField 
                        fullWidth 
                        type="number" 
                        label="Budget Maximum" 
                        placeholder="50 000" 
                        value={filters.maxPrice} 
                        onChange={handleFilterChange('maxPrice')}
                        sx={{ 
                          '& .MuiInputBase-root': { 
                            borderRadius: 0,
                            fontSize: '0.95rem'
                          } 
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} md={3}>
                      <Button 
                        fullWidth 
                        variant="contained" 
                        size="large" 
                        endIcon={<SearchIcon />} 
                        onClick={handleSearch}
                        sx={{ 
                          height: '56px', 
                          fontSize: '0.95rem', 
                          fontWeight: 600,
                          letterSpacing: '0.1em',
                          boxShadow: '0 4px 20px rgba(193, 18, 31, 0.4)'
                        }}
                      >
                        Rechercher
                      </Button>
                    </Grid>
                  </Grid>
                </Paper>
              </Slide>

              <Box sx={{ textAlign: 'center', mt: 8 }}>
                <Button 
                  variant="outlined" 
                  size="large" 
                  endIcon={<ArrowForwardIcon />}
                  onClick={() => navigate('/vehicles')}
                  sx={{ 
                    px: 6, 
                    py: 2, 
                    fontSize: '1rem', 
                    fontWeight: 600,
                    letterSpacing: '0.1em'
                  }}
                >
                  Voir toute la collection
                </Button>
              </Box>
            </Box>
          </Fade>
        </Container>

        {/* Decorative bottom line */}
        <Box sx={{ 
          position: 'absolute', 
          bottom: 0, 
          left: 0, 
          right: 0, 
          height: '2px',
          background: 'linear-gradient(90deg, transparent 0%, #C1121F 50%, transparent 100%)',
          boxShadow: '0 0 30px rgba(193, 18, 31, 0.8)'
        }} />
      </Box>

      {/* Services Section */}
      <Box sx={{ py: { xs: 12, md: 20 }, background: 'linear-gradient(180deg, #0B0B0B 0%, #151515 100%)' }}>
        <Container maxWidth="lg">
          <Box textAlign="center" sx={{ mb: 10 }}>
            <Typography variant="h3" gutterBottom sx={{ 
              fontFamily: 'Playfair Display', 
              mb: 2,
              color: '#F5F5F5',
              fontWeight: 700,
              fontSize: { xs: '2rem', md: '3rem' }
            }}>
              Une expérience d'exception
            </Typography>
            <Typography variant="h6" color="#9A9A9A" sx={{ 
              fontWeight: 300,
              letterSpacing: '0.08em',
              fontSize: { xs: '0.9rem', md: '1.1rem' }
            }}>
              Excellence • Prestige • Performance
            </Typography>
          </Box>

          <Grid container spacing={{ xs: 6, md: 8 }}>
            <Grid item xs={12} md={3}>
              <Box textAlign="center">
                <Box sx={{ 
                  width: 110, 
                  height: 110, 
                  margin: '0 auto 32px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '2px solid rgba(193, 18, 31, 0.4)',
                  position: 'relative',
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    inset: -10,
                    border: '1px solid rgba(193, 18, 31, 0.15)',
                  },
                  background: 'radial-gradient(circle, rgba(193, 18, 31, 0.15) 0%, transparent 70%)'
                }}>
                  <DirectionsCarIcon sx={{ 
                    fontSize: 55, 
                    color: '#C1121F',
                    filter: 'drop-shadow(0 0 15px rgba(193, 18, 31, 0.9))'
                  }} />
                </Box>
                <Typography variant="h5" gutterBottom sx={{ 
                  fontWeight: 600,
                  mb: 2.5,
                  color: '#F5F5F5',
                  letterSpacing: '0.03em',
                  fontSize: '1.3rem'
                }}>
                  Collection Exclusive
                </Typography>
                <Typography variant="body1" color="#9A9A9A" sx={{ 
                  lineHeight: 2,
                  letterSpacing: '0.02em',
                  fontSize: '0.95rem'
                }}>
                  Véhicules premium soigneusement sélectionnés pour leur excellence
                </Typography>
              </Box>
            </Grid>

            <Grid item xs={12} md={3}>
              <Box textAlign="center">
                <Box sx={{ 
                  width: 110, 
                  height: 110, 
                  margin: '0 auto 32px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '2px solid rgba(193, 18, 31, 0.4)',
                  position: 'relative',
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    inset: -10,
                    border: '1px solid rgba(193, 18, 31, 0.15)',
                  },
                  background: 'radial-gradient(circle, rgba(193, 18, 31, 0.15) 0%, transparent 70%)'
                }}>
                  <VerifiedUserIcon sx={{ 
                    fontSize: 55, 
                    color: '#C1121F',
                    filter: 'drop-shadow(0 0 15px rgba(193, 18, 31, 0.9))'
                  }} />
                </Box>
                <Typography variant="h5" gutterBottom sx={{ 
                  fontWeight: 600,
                  mb: 2.5,
                  color: '#F5F5F5',
                  letterSpacing: '0.03em',
                  fontSize: '1.3rem'
                }}>
                  Garantie Premium
                </Typography>
                <Typography variant="body1" color="#9A9A9A" sx={{ 
                  lineHeight: 2,
                  letterSpacing: '0.02em',
                  fontSize: '0.95rem'
                }}>
                  Certification complète et garantie étendue sur tous nos véhicules
                </Typography>
              </Box>
            </Grid>

            <Grid item xs={12} md={3}>
              <Box textAlign="center">
                <Box sx={{ 
                  width: 110, 
                  height: 110, 
                  margin: '0 auto 32px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '2px solid rgba(193, 18, 31, 0.4)',
                  position: 'relative',
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    inset: -10,
                    border: '1px solid rgba(193, 18, 31, 0.15)',
                  },
                  background: 'radial-gradient(circle, rgba(193, 18, 31, 0.15) 0%, transparent 70%)'
                }}>
                  <SpeedIcon sx={{ 
                    fontSize: 55, 
                    color: '#C1121F',
                    filter: 'drop-shadow(0 0 15px rgba(193, 18, 31, 0.9))'
                  }} />
                </Box>
                <Typography variant="h5" gutterBottom sx={{ 
                  fontWeight: 600,
                  mb: 2.5,
                  color: '#F5F5F5',
                  letterSpacing: '0.03em',
                  fontSize: '1.3rem'
                }}>
                  Performance
                </Typography>
                <Typography variant="body1" color="#9A9A9A" sx={{ 
                  lineHeight: 2,
                  letterSpacing: '0.02em',
                  fontSize: '0.95rem'
                }}>
                  Des véhicules d'exception offrant performance et technologie
                </Typography>
              </Box>
            </Grid>

            <Grid item xs={12} md={3}>
              <Box textAlign="center">
                <Box sx={{ 
                  width: 110, 
                  height: 110, 
                  margin: '0 auto 32px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '2px solid rgba(193, 18, 31, 0.4)',
                  position: 'relative',
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    inset: -10,
                    border: '1px solid rgba(193, 18, 31, 0.15)',
                  },
                  background: 'radial-gradient(circle, rgba(193, 18, 31, 0.15) 0%, transparent 70%)'
                }}>
                  <SupportAgentIcon sx={{ 
                    fontSize: 55, 
                    color: '#C1121F',
                    filter: 'drop-shadow(0 0 15px rgba(193, 18, 31, 0.9))'
                  }} />
                </Box>
                <Typography variant="h5" gutterBottom sx={{ 
                  fontWeight: 600,
                  mb: 2.5,
                  color: '#F5F5F5',
                  letterSpacing: '0.03em',
                  fontSize: '1.3rem'
                }}>
                  Service d'Excellence
                </Typography>
                <Typography variant="body1" color="#9A9A9A" sx={{ 
                  lineHeight: 2,
                  letterSpacing: '0.02em',
                  fontSize: '0.95rem'
                }}>
                  Accompagnement personnalisé par nos experts automobiles
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* CTA Section */}
      <Box sx={{ 
        py: { xs: 12, md: 20 }, 
        background: 'linear-gradient(180deg, #151515 0%, #0B0B0B 100%)',
        borderTop: '1px solid rgba(193, 18, 31, 0.3)',
        position: 'relative',
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '80%',
          height: '80%',
          background: 'radial-gradient(circle, rgba(193, 18, 31, 0.08) 0%, transparent 70%)',
          pointerEvents: 'none',
        }
      }}>
        <Container maxWidth="md">
          <Box textAlign="center" sx={{ position: 'relative', zIndex: 1 }}>
            <StarIcon sx={{ 
              fontSize: 50, 
              color: '#C1121F', 
              mb: 3,
              filter: 'drop-shadow(0 0 20px rgba(193, 18, 31, 0.8))'
            }} />
            <Typography variant="h3" gutterBottom sx={{ 
              fontFamily: 'Playfair Display',
              mb: 3,
              color: '#F5F5F5',
              fontWeight: 700,
              fontSize: { xs: '2rem', md: '3.5rem' }
            }}>
              Prêt à vivre l'expérience M-Motor ?
            </Typography>
            <Typography variant="h6" color="#9A9A9A" sx={{ 
              mb: 6,
              fontWeight: 300,
              letterSpacing: '0.03em',
              lineHeight: 1.9,
              fontSize: { xs: '1rem', md: '1.2rem' },
              px: { xs: 2, md: 0 }
            }}>
              Rejoignez notre clientèle exclusive et accédez à notre collection de véhicules d'exception
            </Typography>
            <Box sx={{ display: 'flex', gap: 3, justifyContent: 'center', flexWrap: 'wrap' }}>
              {!isAuthenticated ? (
                <>
                  <Button 
                    variant="contained" 
                    size="large" 
                    endIcon={<ArrowForwardIcon />}
                    onClick={() => navigate('/register')}
                    sx={{ 
                      px: 8, 
                      py: 2.5, 
                      fontSize: '1.05rem',
                      letterSpacing: '0.1em',
                      boxShadow: '0 8px 30px rgba(193, 18, 31, 0.5)'
                    }}
                  >
                    Créer un compte
                  </Button>
                  <Button 
                    variant="outlined" 
                    size="large"
                    onClick={() => navigate('/login')}
                    sx={{ 
                      px: 8, 
                      py: 2.5, 
                      fontSize: '1.05rem',
                      letterSpacing: '0.1em'
                    }}
                  >
                    Se connecter
                  </Button>
                </>
              ) : (
                <Button 
                  variant="contained" 
                  size="large" 
                  endIcon={<ArrowForwardIcon />}
                  onClick={() => navigate('/vehicles')}
                  sx={{ 
                    px: 8, 
                    py: 2.5, 
                    fontSize: '1.05rem',
                    letterSpacing: '0.1em',
                    boxShadow: '0 8px 30px rgba(193, 18, 31, 0.5)'
                  }}
                >
                  Explorer la collection
                </Button>
              )}
            </Box>
          </Box>
        </Container>
      </Box>
    </Box>
  );
};

export default Home;
