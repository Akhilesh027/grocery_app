// src/components/layout/Sidebar.jsx
import React, { useState } from 'react';
import {
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Collapse,
  Box,
  Typography,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Inventory as InventoryIcon,
  ShoppingCart as OrdersIcon,
  LocalShipping as LogisticsIcon,
  Assessment as ReportsIcon,
  ExpandLess,
  ExpandMore,
  Image as ImageIcon,
  AddPhotoAlternate as AddBannerIcon,
  PhotoLibrary as BannerListIcon,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';

const drawerWidth = 280;

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [productsOpen, setProductsOpen] = useState(true);
  const [logisticsOpen, setLogisticsOpen] = useState(false);
  const [bannerOpen, setBannerOpen] = useState(false);

  const menuItems = [
    {
      text: 'Dashboard',
      icon: <DashboardIcon />,
      path: '/dashboard',
    },
    {
      text: 'Products & Inventory',
      icon: <InventoryIcon />,
      children: [
        { text: 'All Products', path: '/products' },
        { text: 'Categories', path: '/products/categories' },
      ],
    },
    {
      text: 'Order Management',
      icon: <OrdersIcon />,
      path: '/orders',
    },
     {
      text: 'Notifications',
      icon: <OrdersIcon />,
      path: '/notification',
    },
    {
      text: 'Logistics & Delivery',
      icon: <LogisticsIcon />,
      children: [
        { text: 'Service Zones', path: '/logistics/zones' },
        { text: 'Offers management', path: '/logistics/staff' },
      ],
    },

    // ✅ ADDED BANNER SECTION
    {
      text: 'Banners',
      icon: <ImageIcon />,
      children: [
        { text: 'Add Banner', path: '/banner/add' },
        { text: 'Banner List', path: '/banner' },
      ],
    },

    {
      text: 'Reports & Analytics',
      icon: <ReportsIcon />,
      path: '/reports/sales',
    },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: drawerWidth,
          boxSizing: 'border-box',
          backgroundColor: '#1a237e',
          color: 'white',
        },
      }}
    >
      <Box sx={{ p: 2, textAlign: 'center' }}>
        <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'white' }}>
          🛒 Grocery Admin
        </Typography>
      </Box>

      <List sx={{ px: 1 }}>
        {menuItems.map((item) => {
          const isBanner = item.text === 'Banners';
          const isProducts = item.text === 'Products & Inventory';
          const isLogistics = item.text === 'Logistics & Delivery';

          return (
            <React.Fragment key={item.text}>
              {item.children ? (
                <>
                  <ListItemButton
                    onClick={() => {
                      if (isProducts) setProductsOpen(!productsOpen);
                      else if (isLogistics) setLogisticsOpen(!logisticsOpen);
                      else if (isBanner) setBannerOpen(!bannerOpen);
                    }}
                    sx={{
                      borderRadius: 2,
                      mb: 0.5,
                      '&:hover': { backgroundColor: 'rgba(255,255,255,0.1)' },
                    }}
                  >
                    <ListItemIcon sx={{ color: 'white', minWidth: 40 }}>
                      {item.icon}
                    </ListItemIcon>

                    <ListItemText primary={item.text} />

                    {isProducts
                      ? productsOpen ? <ExpandLess /> : <ExpandMore />
                      : isLogistics
                      ? logisticsOpen ? <ExpandLess /> : <ExpandMore />
                      : bannerOpen ? <ExpandLess /> : <ExpandMore />}
                  </ListItemButton>

                  <Collapse
                    in={
                      isProducts
                        ? productsOpen
                        : isLogistics
                        ? logisticsOpen
                        : bannerOpen
                    }
                    timeout="auto"
                    unmountOnExit
                  >
                    <List component="div" disablePadding>
                      {item.children.map((child) => (
                        <ListItemButton
                          key={child.text}
                          onClick={() => navigate(child.path)}
                          sx={{
                            pl: 4,
                            borderRadius: 2,
                            mb: 0.5,
                            backgroundColor: isActive(child.path)
                              ? 'rgba(255,255,255,0.2)'
                              : 'transparent',
                            '&:hover': { backgroundColor: 'rgba(255,255,255,0.1)' },
                          }}
                        >
                          <ListItemText primary={child.text} />
                        </ListItemButton>
                      ))}
                    </List>
                  </Collapse>
                </>
              ) : (
                <ListItemButton
                  onClick={() => navigate(item.path)}
                  sx={{
                    borderRadius: 2,
                    mb: 0.5,
                    backgroundColor: isActive(item.path)
                      ? 'rgba(255,255,255,0.2)'
                      : 'transparent',
                    '&:hover': { backgroundColor: 'rgba(255,255,255,0.1)' },
                  }}
                >
                  <ListItemIcon sx={{ color: 'white', minWidth: 40 }}>
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText primary={item.text} />
                </ListItemButton>
              )}
            </React.Fragment>
          );
        })}
      </List>
    </Drawer>
  );
};

export default Sidebar;
