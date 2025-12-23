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
  Dashboard,
  Inventory2,
  Storefront,
  Category,
  ReceiptLong,
  Notifications,
  LocalOffer,
  GroupAdd,
  LocalShipping,
  Map,
  Campaign,
  Collections,
  AddPhotoAlternate,
  PhotoLibrary,
  BarChart,
  ExpandLess,
  ExpandMore,
} from '@mui/icons-material';

import { useNavigate, useLocation } from 'react-router-dom';

const drawerWidth = 280;

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [productsOpen, setProductsOpen] = useState(true);
  const [logisticsOpen, setLogisticsOpen] = useState(false);
  const [bannerOpen, setBannerOpen] = useState(false);

  const isActive = (path) => location.pathname === path;

  const menuItems = [
    {
      text: 'Dashboard',
      icon: <Dashboard />,
      path: '/dashboard',
    },
    {
      text: 'Products & Inventory',
      icon: <Inventory2 />,
      children: [
        { text: 'All Products', path: '/products', icon: <Storefront /> },
        { text: 'Categories', path: '/products/categories', icon: <Category /> },
      ],
    },
    {
      text: 'Order Management',
      icon: <ReceiptLong />,
      path: '/orders',
    },
    {
      text: 'Notifications',
      icon: <Notifications />,
      path: '/notification',
    },
    {
      text: 'Coupon Management',
      icon: <LocalOffer />,
      path: '/coupon',
    },
    {
      text: 'Referral Management',
      icon: <GroupAdd />,
      path: '/referal',
    },
    {
      text: 'Logistics & Delivery',
      icon: <LocalShipping />,
      children: [
        { text: 'Service Zones', path: '/logistics/zones', icon: <Map /> },
        { text: 'Offers Management', path: '/logistics/staff', icon: <Campaign /> },
      ],
    },
    {
      text: 'Banners',
      icon: <Collections />,
      children: [
        { text: 'Add Banner', path: '/banner/add', icon: <AddPhotoAlternate /> },
        { text: 'Banner List', path: '/banner', icon: <PhotoLibrary /> },
      ],
    },
    {
      text: 'Reports & Analytics',
      icon: <BarChart />,
      path: '/reports/sales',
    },
  ];

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: drawerWidth,
        '& .MuiDrawer-paper': {
          width: drawerWidth,
          backgroundColor: '#1a237e',
          color: '#fff',
        },
      }}
    >
      <Box sx={{ p: 2, textAlign: 'center' }}>
        <Typography variant="h6" fontWeight="bold">
          🛒 Grocery Admin
        </Typography>
      </Box>

      <List sx={{ px: 1 }}>
        {menuItems.map((item) => {
          const isProducts = item.text === 'Products & Inventory';
          const isLogistics = item.text === 'Logistics & Delivery';
          const isBanner = item.text === 'Banners';

          const open =
            isProducts ? productsOpen :
            isLogistics ? logisticsOpen :
            bannerOpen;

          return (
            <React.Fragment key={item.text}>
              {item.children ? (
                <>
                  <ListItemButton
                    onClick={() => {
                      if (isProducts) setProductsOpen(!productsOpen);
                      else if (isLogistics) setLogisticsOpen(!logisticsOpen);
                      else setBannerOpen(!bannerOpen);
                    }}
                    sx={{
                      borderRadius: 2,
                      mb: 0.5,
                      '&:hover': { backgroundColor: 'rgba(255,255,255,0.1)' },
                    }}
                  >
                    <ListItemIcon sx={{ color: '#fff' }}>
                      {item.icon}
                    </ListItemIcon>
                    <ListItemText primary={item.text} />
                    {open ? <ExpandLess /> : <ExpandMore />}
                  </ListItemButton>

                  <Collapse in={open} timeout="auto" unmountOnExit>
                    <List component="div" disablePadding>
                      {item.children.map((child) => (
                        <ListItemButton
                          key={child.text}
                          onClick={() => navigate(child.path)}
                          sx={{
                            pl: 4,
                            borderRadius: 2,
                            backgroundColor: isActive(child.path)
                              ? 'rgba(255,255,255,0.2)'
                              : 'transparent',
                            '&:hover': { backgroundColor: 'rgba(255,255,255,0.1)' },
                          }}
                        >
                          <ListItemIcon sx={{ color: '#fff', minWidth: 36 }}>
                            {child.icon}
                          </ListItemIcon>
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
                  <ListItemIcon sx={{ color: '#fff' }}>
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
