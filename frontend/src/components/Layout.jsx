import { useState } from 'react'
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Container,
  Box,
  IconButton,
  Menu,
  MenuItem,
  useTheme,
  useMediaQuery,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
} from '@mui/material'
import { Link as RouterLink, useNavigate } from 'react-router-dom'
import MenuIcon from '@mui/icons-material/Menu'
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar'
import AccountCircleIcon from '@mui/icons-material/AccountCircle'
import DashboardIcon from '@mui/icons-material/Dashboard'
import DescriptionIcon from '@mui/icons-material/Description'
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings'
import LogoutIcon from '@mui/icons-material/Logout'
import LoginIcon from '@mui/icons-material/Login'
import PersonAddIcon from '@mui/icons-material/PersonAdd'
import { useAuth } from '../context/AuthContext'
import { useNotification } from '../hooks/useNotification'

const Layout = ({ children }) => {
  const { isAuthenticated, logout, isAdmin, user } = useAuth()
  const navigate = useNavigate()
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))
  const { showInfo } = useNotification()

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [accountMenuAnchor, setAccountMenuAnchor] = useState(null)

  const handleLogout = () => {
    logout()
    showInfo('Déconnexion réussie')
    navigate('/login')
    setAccountMenuAnchor(null)
    setMobileMenuOpen(false)
  }

  const handleMenuClick = (path) => {
    navigate(path)
    setMobileMenuOpen(false)
    setAccountMenuAnchor(null)
  }

  const menuItems = [
    { label: 'Accueil', path: '/', icon: <DirectionsCarIcon />, public: true },
    { label: 'Véhicules', path: '/vehicles', icon: <DirectionsCarIcon />, public: true },
    { label: 'Dashboard', path: '/dashboard', icon: <DashboardIcon />, auth: true },
    { label: 'Mes Demandes', path: '/my-applications', icon: <DescriptionIcon />, auth: true },
    { label: 'Administration', path: '/admin', icon: <AdminPanelSettingsIcon />, admin: true },
  ]

  const filteredMenuItems = menuItems.filter((item) => {
    if (item.admin) return isAuthenticated && isAdmin()
    if (item.auth) return isAuthenticated
    return true
  })

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {/* AppBar */}
      <AppBar position="sticky" elevation={2}>
        <Toolbar>
          {/* Mobile menu button */}
          {isMobile && (
            <IconButton
              color="inherit"
              edge="start"
              onClick={() => setMobileMenuOpen(true)}
              sx={{ mr: 2 }}
            >
              <MenuIcon />
            </IconButton>
          )}

          {/* Logo */}
          <Typography
            variant="h6"
            component={RouterLink}
            to="/"
            sx={{
              flexGrow: 1,
              textDecoration: 'none',
              color: 'inherit',
              display: 'flex',
              alignItems: 'center',
              gap: 1,
            }}
          >
            <DirectionsCarIcon />
            M-Motor
          </Typography>

          {/* Desktop menu */}
          {!isMobile && (
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button color="inherit" component={RouterLink} to="/vehicles">
                Véhicules
              </Button>

              {isAuthenticated ? (
                <>
                  <Button color="inherit" component={RouterLink} to="/my-applications">
                    Mes Demandes
                  </Button>
                  <Button color="inherit" component={RouterLink} to="/dashboard">
                    Dashboard
                  </Button>
                  {isAdmin() && (
                    <Button color="inherit" component={RouterLink} to="/admin">
                      Admin
                    </Button>
                  )}
                  <IconButton
                    color="inherit"
                    onClick={(e) => setAccountMenuAnchor(e.currentTarget)}
                  >
                    <AccountCircleIcon />
                  </IconButton>
                </>
              ) : (
                <>
                  <Button color="inherit" component={RouterLink} to="/login">
                    Connexion
                  </Button>
                  <Button color="inherit" component={RouterLink} to="/register">
                    Inscription
                  </Button>
                </>
              )}
            </Box>
          )}
        </Toolbar>
      </AppBar>

      {/* Mobile Drawer */}
      <Drawer
        anchor="left"
        open={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
      >
        <Box sx={{ width: 250 }} role="presentation">
          <List>
            <ListItem>
              <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <DirectionsCarIcon />
                M-Motor
              </Typography>
            </ListItem>
            <Divider />
            
            {filteredMenuItems.map((item) => (
              <ListItem
                button
                key={item.path}
                onClick={() => handleMenuClick(item.path)}
              >
                <ListItemIcon>{item.icon}</ListItemIcon>
                <ListItemText primary={item.label} />
              </ListItem>
            ))}
            
            <Divider />
            
            {isAuthenticated ? (
              <>
                <ListItem>
                  <ListItemText
                    primary={user?.email}
                    secondary={isAdmin() ? 'Administrateur' : 'Client'}
                  />
                </ListItem>
                <ListItem button onClick={handleLogout}>
                  <ListItemIcon>
                    <LogoutIcon />
                  </ListItemIcon>
                  <ListItemText primary="Déconnexion" />
                </ListItem>
              </>
            ) : (
              <>
                <ListItem button onClick={() => handleMenuClick('/login')}>
                  <ListItemIcon>
                    <LoginIcon />
                  </ListItemIcon>
                  <ListItemText primary="Connexion" />
                </ListItem>
                <ListItem button onClick={() => handleMenuClick('/register')}>
                  <ListItemIcon>
                    <PersonAddIcon />
                  </ListItemIcon>
                  <ListItemText primary="Inscription" />
                </ListItem>
              </>
            )}
          </List>
        </Box>
      </Drawer>

      {/* Account Menu */}
      <Menu
        anchorEl={accountMenuAnchor}
        open={Boolean(accountMenuAnchor)}
        onClose={() => setAccountMenuAnchor(null)}
      >
        <MenuItem disabled>
          <Typography variant="body2" color="text.secondary">
            {user?.email}
          </Typography>
        </MenuItem>
        <MenuItem disabled>
          <Typography variant="caption" color="text.secondary">
            {isAdmin() ? 'Administrateur' : 'Client'}
          </Typography>
        </MenuItem>
        <Divider />
        <MenuItem onClick={handleLogout}>
          <ListItemIcon>
            <LogoutIcon fontSize="small" />
          </ListItemIcon>
          Déconnexion
        </MenuItem>
      </Menu>

      {/* Main content */}
      <Container
        component="main"
        maxWidth="lg"
        sx={{
          flex: 1,
          py: { xs: 2, md: 4 },
          px: { xs: 2, md: 3 },
        }}
      >
        {children}
      </Container>

      {/* Footer */}
      <Box
        component="footer"
        sx={{
          py: 3,
          px: 2,
          mt: 'auto',
          backgroundColor: 'background.paper',
          borderTop: 1,
          borderColor: 'divider',
        }}
      >
        <Container maxWidth="lg">
          <Typography variant="body2" color="text.secondary" align="center">
            © {new Date().getFullYear()} M-Motor. Tous droits réservés.
          </Typography>
        </Container>
      </Box>
    </Box>
  )
}

export default Layout
