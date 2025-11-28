// src/pages/Orders/LoyaltyCoinsManager.jsx
import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Typography,
  Box,
  Grid,
  Alert,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Card,
  CardContent,
} from '@mui/material';
import {
  AccountBalanceWallet as CoinsIcon,
  Add as AddIcon,
  Remove as RemoveIcon,
} from '@mui/icons-material';

const LoyaltyCoinsManager = ({ open, onClose, order, user, onUpdate }) => {
  const [action, setAction] = useState('add');
  const [coins, setCoins] = useState('');
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const API_BASE_URL = 'https://grocery-c3c0.onrender.com/api';

  const handleSubmit = async () => {
    if (!coins || coins <= 0) {
      setError('Please enter a valid number of coins');
      return;
    }

    if (!reason.trim()) {
      setError('Please provide a reason for this action');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const token = localStorage.getItem('token');
      const url = action === 'add' 
        ? `${API_BASE_URL}/admin/users/${user._id}/loyalty-coins`
        : `${API_BASE_URL}/admin/users/${user._id}/loyalty-coins/deduct`;

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          coins: parseInt(coins),
          reason: reason.trim(),
          orderId: order?._id || null
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to update loyalty coins');
      }

      setSuccess(data.message);
      setCoins('');
      setReason('');
      
      // Notify parent component about the update
      if (onUpdate) {
        onUpdate(data.user);
      }

      // Auto close after success
      setTimeout(() => {
        onClose();
      }, 2000);

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setCoins('');
    setReason('');
    setError('');
    setSuccess('');
    setAction('add');
    onClose();
  };

  const predefinedReasons = [
    'Customer service compensation',
    'Promotional bonus',
    'Referral reward',
    'Order issue resolution',
    'Special offer',
    'Customer appreciation',
    'Service delay compensation',
    'Product quality issue',
    'Other'
  ];

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <CoinsIcon color="primary" />
          Manage Loyalty Coins
        </Box>
      </DialogTitle>

      <DialogContent>
        {/* User Information */}
        {user && (
          <Card variant="outlined" sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                User Information
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="body2" fontWeight="medium">
                    {user.name}
                  </Typography>
                  <Typography variant="caption" color="textSecondary">
                    {user.email}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Chip
                    icon={<CoinsIcon />}
                    label={`${user.loyaltyCoins} coins`}
                    color="primary"
                    variant="outlined"
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        )}

        {/* Order Information */}
        {order && (
          <Card variant="outlined" sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                Order Information
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="body2" fontWeight="medium">
                    {order.orderId}
                  </Typography>
                  <Typography variant="caption" color="textSecondary">
                    Order ID
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" fontWeight="medium">
                    ₹{(order.totalAmount || 0).toLocaleString()}
                  </Typography>
                  <Typography variant="caption" color="textSecondary">
                    Total Amount
                  </Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        )}

        {/* Action Selection */}
        <FormControl fullWidth sx={{ mb: 3 }}>
          <InputLabel>Action</InputLabel>
          <Select
            value={action}
            label="Action"
            onChange={(e) => setAction(e.target.value)}
          >
            <MenuItem value="add">
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <AddIcon color="success" />
                Add Coins
              </Box>
            </MenuItem>
            <MenuItem value="deduct">
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <RemoveIcon color="error" />
                Deduct Coins
              </Box>
            </MenuItem>
          </Select>
        </FormControl>

        {/* Coins Input */}
        <TextField
          fullWidth
          type="number"
          label="Number of Coins"
          value={coins}
          onChange={(e) => setCoins(e.target.value)}
          sx={{ mb: 3 }}
          inputProps={{ min: 1, max: 10000 }}
          helperText={`${action === 'add' ? 'Add' : 'Deduct'} coins from user's balance`}
        />

        {/* Reason Input */}
        <FormControl fullWidth sx={{ mb: 2 }}>
          <InputLabel>Reason</InputLabel>
          <Select
            value={reason}
            label="Reason"
            onChange={(e) => setReason(e.target.value)}
          >
            {predefinedReasons.map((reasonOption) => (
              <MenuItem key={reasonOption} value={reasonOption}>
                {reasonOption}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Custom Reason */}
        {reason === 'Other' && (
          <TextField
            fullWidth
            label="Custom Reason"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            sx={{ mb: 2 }}
            placeholder="Please specify the reason..."
          />
        )}

        {/* Error Alert */}
        {error && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {error}
          </Alert>
        )}

        {/* Success Alert */}
        {success && (
          <Alert severity="success" sx={{ mt: 2 }}>
            {success}
          </Alert>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose} disabled={loading}>
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={loading}
          color={action === 'add' ? 'success' : 'error'}
          startIcon={
            loading ? <CircularProgress size={16} /> : 
            action === 'add' ? <AddIcon /> : <RemoveIcon />
          }
        >
          {loading ? 'Processing...' : `${action === 'add' ? 'Add' : 'Deduct'} Coins`}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default LoyaltyCoinsManager;