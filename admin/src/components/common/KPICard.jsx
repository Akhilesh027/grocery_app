// src/components/common/KPICard.jsx
import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
} from '@mui/material';

const KPICard = ({ 
  title, 
  value, 
  trend, 
  trendIcon, 
  trendColor = 'success', 
  icon, 
  color = 'primary' 
}) => {
  return (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Typography color="textSecondary" gutterBottom variant="overline">
            {title}
          </Typography>
          <Typography variant="h4" sx={{ opacity: 0.3 }}>
            {icon}
          </Typography>
        </Box>
        
        <Typography variant="h4" component="div" sx={{ mb: 1, fontWeight: 'bold' }}>
          {value}
        </Typography>
        
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {trendIcon && React.cloneElement(trendIcon, { 
            fontSize: 'small',
            color: trendColor 
          })}
          <Chip
            label={trend}
            size="small"
            color={trendColor}
            variant="outlined"
          />
        </Box>
      </CardContent>
    </Card>
  );
};

export default KPICard;