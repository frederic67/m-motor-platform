import { useState } from 'react';
import {
  AppBar,
  Box,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
} from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import MenuIcon from '@mui/icons-material/Menu';
import DashboardIcon from '@mui/icons-material/Dashboard';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import DescriptionIcon from '@mui/icons-material/Description';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import { useAuth } from '../../context/AuthContext';

const drawerWidth = 280;

const AdminSidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout, user } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  const menuItems = [
    { label: 'Dashboard', icon: <DashboardIcon />, path: '/admin' },
    { label: 'Vehicles', icon: <DirectionsCarIcon />, path: '/admin/vehicles' },
    { label: 'Applications', icon: <DescriptionIcon />, path: '/admin/applications' },
  ];

  const handleNavigate = (path) => {
    navigate(path);
    setMobileOpen(false);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const drawerContent = (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Box sx={{ p: 3, borderBottom: '1px solid rgba(193, 18, 31, 0.2)' }}>
        <Typography
          variant="h5"
          sx={{
            fontFamily: 'Playfair Display',
            fontWeight: 700,
            color: '#C1121F',
            letterSpacing: '0.06em',
            mb: 0.5,
          }}
        >
          M-MOTOR
        </Typography>
        <Typography variant="body2" color="#9A9A9A" sx={{ letterSpacing: '0.04em' }}>
          Admin Panel
        </Typography>
        {user?.email && (
          <Typography variant="caption" color="#F5F5F5" sx={{ mt: 1.5, display: 'block' }}>
            {user.email}
          </Typography>
        )}
      </Box>

      <List sx={{ px: 1.5, py: 2 }}>
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <ListItem key={item.path} disablePadding sx={{ mb: 1 }}>
              <ListItemButton
                onClick={() => handleNavigate(item.path)}
                sx={{
                  borderRadius: 0,
                  py: 1.3,
                  px: 1.5,
                  bgcolor: isActive ? 'rgba(193, 18, 31, 0.14)' : 'transparent',
                  borderLeft: isActive ? '3px solid #C1121F' : '3px solid transparent',
                  '&:hover': {
                    bgcolor: 'rgba(193, 18, 31, 0.1)',
                    borderLeft: '3px solid rgba(193, 18, 31, 0.7)',
                  },
                }}
              >
                <ListItemIcon sx={{ color: isActive ? '#C1121F' : '#9A9A9A', minWidth: 40 }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText
                  primary={item.label}
                  primaryTypographyProps={{
                    color: isActive ? '#F5F5F5' : '#C7C7C7',
                    fontWeight: isActive ? 700 : 500,
                    letterSpacing: '0.02em',
                  }}
                />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>

      <Box sx={{ mt: 'auto', px: 1.5, pb: 2 }}>
        <Divider sx={{ borderColor: 'rgba(193, 18, 31, 0.2)', mb: 1 }} />
        <ListItem disablePadding>
          <ListItemButton
            onClick={handleLogout}
            sx={{
              borderRadius: 0,
              py: 1.3,
              px: 1.5,
              '&:hover': {
                bgcolor: 'rgba(193, 18, 31, 0.1)',
                borderLeft: '3px solid rgba(193, 18, 31, 0.7)',
              },
            }}
          >
            <ListItemIcon sx={{ color: '#9A9A9A', minWidth: 40 }}>
              <ExitToAppIcon />
            </ListItemIcon>
            <ListItemText
              primary="Logout"
              primaryTypographyProps={{ color: '#C7C7C7', fontWeight: 500, letterSpacing: '0.02em' }}
            />
          </ListItemButton>
        </ListItem>
      </Box>
    </Box>
  );

  return (
    <>
      <AppBar
        position="fixed"
        sx={{
          display: { xs: 'flex', md: 'none' },
          bgcolor: '#0B0B0B',
          borderBottom: '1px solid rgba(193, 18, 31, 0.25)',
          boxShadow: 'none',
        }}
      >
        <Toolbar>
          <IconButton edge="start" color="inherit" onClick={() => setMobileOpen(true)} sx={{ mr: 1 }}>
            <MenuIcon />
          </IconButton>
          <Typography sx={{ fontWeight: 700, letterSpacing: '0.05em' }}>ADMIN</Typography>
        </Toolbar>
      </AppBar>

      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            bgcolor: '#0B0B0B',
            color: '#F5F5F5',
            borderRight: '1px solid rgba(193, 18, 31, 0.2)',
          },
        }}
      >
        {drawerContent}
      </Drawer>

      <Drawer
        variant="permanent"
        sx={{
          display: { xs: 'none', md: 'block' },
          width: drawerWidth,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
            bgcolor: '#0B0B0B',
            color: '#F5F5F5',
            borderRight: '1px solid rgba(193, 18, 31, 0.2)',
          },
        }}
      >
        {drawerContent}
      </Drawer>
    </>
  );
};

export default AdminSidebar;
