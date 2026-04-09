import { Box, Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Typography, Divider } from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import DashboardIcon from '@mui/icons-material/Dashboard';
import DescriptionIcon from '@mui/icons-material/Description';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import { useAuth } from '../../context/AuthContext';

const drawerWidth = 280;

const CustomerSidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout, user } = useAuth();

  const menuItems = [
    { label: 'Tableau de bord', icon: <DashboardIcon />, path: '/dashboard' },
    { label: 'Mes demandes', icon: <DescriptionIcon />, path: '/my-applications' },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: drawerWidth,
          boxSizing: 'border-box',
          bgcolor: '#0B0B0B',
          borderRight: '1px solid rgba(193, 18, 31, 0.2)',
        },
      }}
    >
      <Box sx={{ p: 3, borderBottom: '1px solid rgba(193, 18, 31, 0.2)' }}>
        <Typography
          variant="h5"
          sx={{
            fontFamily: 'Playfair Display',
            fontWeight: 700,
            color: '#C1121F',
            letterSpacing: '0.05em',
            mb: 1,
          }}
        >
          M-MOTOR
        </Typography>
        <Typography variant="body2" color="#9A9A9A" sx={{ letterSpacing: '0.03em' }}>
          Espace Client
        </Typography>
        {user && (
          <Box sx={{ mt: 2, pt: 2, borderTop: '1px solid rgba(193, 18, 31, 0.1)' }}>
            <Typography variant="body2" color="#F5F5F5" sx={{ fontWeight: 600 }}>
              {user.email}
            </Typography>
          </Box>
        )}
      </Box>

      <List sx={{ px: 2, py: 3 }}>
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <ListItem key={item.path} disablePadding sx={{ mb: 1 }}>
              <ListItemButton
                onClick={() => navigate(item.path)}
                sx={{
                  borderRadius: 0,
                  py: 1.5,
                  bgcolor: isActive ? 'rgba(193, 18, 31, 0.1)' : 'transparent',
                  borderLeft: isActive ? '3px solid #C1121F' : '3px solid transparent',
                  '&:hover': {
                    bgcolor: 'rgba(193, 18, 31, 0.05)',
                    borderLeft: '3px solid rgba(193, 18, 31, 0.5)',
                  },
                  transition: 'all 0.2s ease',
                }}
              >
                <ListItemIcon
                  sx={{
                    color: isActive ? '#C1121F' : '#9A9A9A',
                    minWidth: 40,
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                <ListItemText
                  primary={item.label}
                  primaryTypographyProps={{
                    fontWeight: isActive ? 600 : 400,
                    color: isActive ? '#F5F5F5' : '#9A9A9A',
                    letterSpacing: '0.02em',
                  }}
                />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>

      <Divider sx={{ borderColor: 'rgba(193, 18, 31, 0.2)', mx: 2 }} />

      <List sx={{ px: 2, py: 2 }}>
        <ListItem disablePadding>
          <ListItemButton
            onClick={handleLogout}
            sx={{
              borderRadius: 0,
              py: 1.5,
              '&:hover': {
                bgcolor: 'rgba(193, 18, 31, 0.05)',
                borderLeft: '3px solid rgba(193, 18, 31, 0.5)',
              },
            }}
          >
            <ListItemIcon sx={{ color: '#9A9A9A', minWidth: 40 }}>
              <ExitToAppIcon />
            </ListItemIcon>
            <ListItemText
              primary="Déconnexion"
              primaryTypographyProps={{
                color: '#9A9A9A',
                letterSpacing: '0.02em',
              }}
            />
          </ListItemButton>
        </ListItem>
      </List>
    </Drawer>
  );
};

export default CustomerSidebar;
