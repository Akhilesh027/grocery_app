// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline, Box } from '@mui/material';

// Layout Components
import Layout from './components/layout/Layout.jsx';
import Header from './components/layout/Header.jsx';
import Sidebar from './components/layout/Sidebar.jsx';

// Page Components
import Dashboard from './pages/Dashboard/Dashboard.jsx';
import ProductList from './pages/Products/ProductList.jsx';
import ProductForm from './pages/Products/ProductForm.jsx';
import CategoryManager from './pages/Products/CategoryManager.jsx';
import OrderList from './pages/Orders/OrderList.jsx';
import OrderDetails from './pages/Orders/OrderDetails.jsx';
import ZoneManager from './pages/Logistics/ZoneManager.jsx';
import DeliveryStaff from './pages/Logistics/DeliveryStaff.jsx';
import SalesReport from './pages/Reports/SalesReport.jsx';
import InventoryReport from './pages/Reports/InventoryReport.jsx';
import BannerList from './pages/Banner/BannerList.jsx';
import AddBanner from './pages/Banner/Addbanner.jsx';
import Notification from './pages/Notification/notification.js'
// Theme Configuration
const theme = createTheme({
  palette: {
    primary: {
      main: '#2E7D32',
      light: '#4CAF50',
      dark: '#1B5E20',
    },
    secondary: {
      main: '#FF6F00',
    },
    background: {
      default: '#f5f5f5',
      paper: '#ffffff',
    },
  },
  typography: {
    h4: {
      fontWeight: 600,
    },
    h6: {
      fontWeight: 600,
    },
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          borderRadius: 12,
        },
      },
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Layout>
          <Box sx={{ display: 'flex' }}>
            <Sidebar />
            <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
              <Header />
              <Routes>
                {/* Dashboard */}
                <Route path="/" element={<Dashboard />} />
                <Route path="/dashboard" element={<Dashboard />} />

                {/* Products & Inventory */}
                <Route path="/products" element={<ProductList />} />
                <Route path="/products/new" element={<ProductForm />} />
                <Route path="/products/edit/:id" element={<ProductForm />} />
                <Route path="/products/categories" element={<CategoryManager />} />

                <Route path="/orders" element={<OrderList />} />
                <Route path="/orders/:id" element={<OrderDetails />} />

                <Route path="/logistics/zones" element={<ZoneManager />} />
                <Route path="/logistics/staff" element={<DeliveryStaff />} />

                <Route path="/reports/sales" element={<SalesReport />} />
                <Route path="/reports/inventory" element={<InventoryReport />} />
                <Route path="/banner" element={<BannerList />} />
                <Route path="/banner/add" element={<AddBanner />} />
                <Route path="/notification" element={<Notification />} />

                {/* Fallback route */}
                <Route path="*" element={<Navigate to="/dashboard" replace />} />
              </Routes>
            </Box>
          </Box>
        </Layout>
      </Router>
    </ThemeProvider>
  );
}

export default App;