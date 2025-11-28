// src/components/layout/Layout.jsx
import React from 'react';
import { Box } from '@mui/material';

const Layout = ({ children }) => {
  return (
    <Box 
      sx={{ 
        display: 'flex', 
        minHeight: '100vh',
        backgroundColor: '#f5f5f5',
        overflow: 'hidden'   // prevents unwanted scroll issues
      }}
    >
      {children}
    </Box>
  );
};

export default Layout;