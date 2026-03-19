import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Switch,
  Box,
  Typography,
  Tooltip,
  Avatar,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';

const VehicleTable = ({ vehicles, onEdit, onDelete, onToggleSale, onToggleRent }) => {
  if (!vehicles || vehicles.length === 0) {
    return (
      <Box sx={{ p: 6, textAlign: 'center' }}>
        <Typography variant="h6" color="#9A9A9A" sx={{ mb: 1 }}>
          Aucun véhicule
        </Typography>
        <Typography variant="body2" color="#9A9A9A">
          Ajoutez des véhicules pour commencer
        </Typography>
      </Box>
    );
  }

  return (
    <TableContainer>
      <Table>
        <TableHead>
          <TableRow
            sx={{
              borderBottom: '2px solid rgba(193, 18, 31, 0.3)',
            }}
          >
            {['Photo', 'Brand', 'Model', 'Year', 'Price', 'Mileage', 'Sale', 'Rent', 'Actions'].map((header) => (
              <TableCell
                key={header}
                sx={{
                  color: '#F5F5F5',
                  fontWeight: 700,
                  letterSpacing: '0.05em',
                  textTransform: 'uppercase',
                  fontSize: '0.75rem',
                  bgcolor: 'rgba(31, 31, 31, 0.5)',
                }}
              >
                {header}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {vehicles.map((vehicle) => (
            <TableRow
              key={vehicle.id}
              sx={{
                '&:hover': {
                  bgcolor: 'rgba(193, 18, 31, 0.05)',
                },
                borderBottom: '1px solid rgba(193, 18, 31, 0.1)',
              transition: 'background-color 0.2s ease',
            }}
          >
            <TableCell>
              <Avatar
                src={vehicle.image_url ? `http://localhost:8000${vehicle.image_url}` : undefined}
                variant="rounded"
                sx={{ 
                  width: 60, 
                  height: 45,
                  bgcolor: 'rgba(193, 18, 31, 0.2)',
                }}
              >
                {!vehicle.image_url && <DirectionsCarIcon sx={{ color: '#C1121F' }} />}
              </Avatar>
            </TableCell>
            <TableCell>
                <Typography variant="body2" color="#F5F5F5" sx={{ fontWeight: 600 }}>
                  {vehicle.brand}
                </Typography>
              </TableCell>
              <TableCell>
                <Typography variant="body2" color="#F5F5F5">
                  {vehicle.model}
                </Typography>
              </TableCell>
              <TableCell>
                <Typography variant="body2" color="#9A9A9A">
                  {vehicle.year}
                </Typography>
              </TableCell>
              <TableCell>
                <Typography variant="body2" color="#C1121F" sx={{ fontWeight: 600 }}>
                  {vehicle.price?.toLocaleString()} €
                </Typography>
              </TableCell>
              <TableCell>
                <Typography variant="body2" color="#9A9A9A">
                  {vehicle.mileage?.toLocaleString()} km
                </Typography>
              </TableCell>
              <TableCell>
                <Switch
                  checked={vehicle.available_for_sale}
                  onChange={() => onToggleSale(vehicle.id, vehicle.available_for_sale)}
                  sx={{
                    '& .MuiSwitch-switchBase.Mui-checked': {
                      color: '#C1121F',
                    },
                    '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                      backgroundColor: '#C1121F',
                    },
                  }}
                />
              </TableCell>
              <TableCell>
                <Switch
                  checked={vehicle.available_for_rent}
                  onChange={() => onToggleRent(vehicle.id, vehicle.available_for_rent)}
                  sx={{
                    '& .MuiSwitch-switchBase.Mui-checked': {
                      color: '#D4AF37',
                    },
                    '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                      backgroundColor: '#D4AF37',
                    },
                  }}
                />
              </TableCell>
              <TableCell>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Tooltip title="Edit">
                    <IconButton
                      size="small"
                      onClick={() => onEdit(vehicle)}
                      sx={{
                        color: '#9A9A9A',
                        '&:hover': {
                          color: '#F5F5F5',
                          bgcolor: 'rgba(245, 245, 245, 0.1)',
                        },
                      }}
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Delete">
                    <IconButton
                      size="small"
                      onClick={() => onDelete(vehicle.id)}
                      sx={{
                        color: '#C1121F',
                        '&:hover': {
                          bgcolor: 'rgba(193, 18, 31, 0.1)',
                        },
                      }}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Box>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default VehicleTable;
