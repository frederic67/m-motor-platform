import { Box, Typography, Card, CardContent } from '@mui/material';

const StatsCard = ({ title, value, icon, color = '#C1121F' }) => {
  return (
    <Card
      sx={{
        height: '100%',
        background: 'linear-gradient(145deg, #151515 0%, #0F0F0F 100%)',
        border: '1px solid rgba(193, 18, 31, 0.2)',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.4)',
        transition: 'all 0.3s ease',
        '&:hover': {
          borderColor: 'rgba(193, 18, 31, 0.4)',
          transform: 'translateY(-4px)',
          boxShadow: '0 8px 30px rgba(193, 18, 31, 0.2)',
        },
      }}
    >
      <CardContent sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Box>
            <Typography
              variant="body2"
              color="#9A9A9A"
              sx={{
                mb: 1.5,
                letterSpacing: '0.05em',
                textTransform: 'uppercase',
                fontSize: '0.75rem',
                fontWeight: 600,
              }}
            >
              {title}
            </Typography>
            <Typography
              variant="h3"
              sx={{
                color: '#F5F5F5',
                fontWeight: 700,
                letterSpacing: '-0.02em',
                fontFamily: 'Playfair Display',
              }}
            >
              {value}
            </Typography>
          </Box>
          <Box
            sx={{
              width: 56,
              height: 56,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: `2px solid ${color}40`,
              background: `radial-gradient(circle, ${color}33 0%, transparent 70%)`,
              color: color,
              filter: `drop-shadow(0 0 10px ${color}80)`,
            }}
          >
            {icon}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

export default StatsCard;
