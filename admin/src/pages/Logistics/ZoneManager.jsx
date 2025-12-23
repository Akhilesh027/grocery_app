// src/pages/Logistics/ZoneManager.jsx
import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Grid,
  TextField,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
} from "@mui/material";
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon } from "@mui/icons-material";
import axios from "axios";

const API_URL = "https://api.sampurnamart.cloud/api/zones";

const ZoneManager = () => {
  const [openDialog, setOpenDialog] = useState(false);
  const [editingZone, setEditingZone] = useState(null);
  const [zones, setZones] = useState([]);

  const [zoneForm, setZoneForm] = useState({
    name: "",
    pincodes: "",
    deliveryFee: "",
    minimumOrderValue: "",
    deliveryTime: "", // <-- NEW FIELD
  });

  // FETCH ZONES
  const fetchZones = async () => {
    try {
      const res = await axios.get(API_URL);
      setZones(res.data);
    } catch (err) {
      console.log("Error fetching zones", err);
    }
  };

  useEffect(() => {
    fetchZones();
  }, []);

  const handleOpenDialog = (zone = null) => {
    if (zone) {
      setEditingZone(zone);
      setZoneForm({
        name: zone.name,
        pincodes: zone.pincodes.join(", "),
        deliveryFee: zone.deliveryFee,
        minimumOrderValue: zone.minimumOrderValue,
        deliveryTime: zone.deliveryTime || "", // <-- NEW FIELD
      });
    } else {
      setEditingZone(null);
      setZoneForm({
        name: "",
        pincodes: "",
        deliveryFee: "",
        minimumOrderValue: "",
        deliveryTime: "", // <-- NEW
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingZone(null);
  };

  // CREATE / UPDATE ZONE
  const handleSubmit = async (e) => {
    e.preventDefault();

    const zoneData = {
      ...zoneForm,
      pincodes: zoneForm.pincodes.split(",").map((p) => p.trim()),
      deliveryFee: Number(zoneForm.deliveryFee),
      minimumOrderValue: Number(zoneForm.minimumOrderValue),
      deliveryTime: zoneForm.deliveryTime, // <-- NEW FIELD
    };

    try {
      if (editingZone) {
        await axios.put(`${API_URL}/${editingZone._id}`, zoneData);
      } else {
        await axios.post(API_URL, zoneData);
      }
      fetchZones();
      handleCloseDialog();
    } catch (err) {
      console.log("Error saving zone", err);
    }
  };

  // DELETE ZONE
  const handleDelete = async (zone) => {
    if (!window.confirm(`Delete zone "${zone.name}"?`)) return;

    try {
      await axios.delete(`${API_URL}/${zone._id}`);
      fetchZones();
    } catch (err) {
      console.log("Error deleting zone", err);
    }
  };

  return (
    <Box>
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 4 }}>
        <Typography variant="h4" fontWeight="bold">
          Service Zone Management
        </Typography>

        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          Add Zone
        </Button>
      </Box>

      <Grid container spacing={3}>
        {zones.map((zone) => (
          <Grid item xs={12} md={6} key={zone._id}>
            <Card>
              <CardContent>
                <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                  <Typography variant="h6" sx={{ flexGrow: 1 }}>
                    {zone.name}
                  </Typography>

                  <IconButton onClick={() => handleOpenDialog(zone)} color="primary">
                    <EditIcon />
                  </IconButton>

                  <IconButton onClick={() => handleDelete(zone)} color="error">
                    <DeleteIcon />
                  </IconButton>
                </Box>

                <Typography fontSize={14} color="gray">Pincodes:</Typography>
                <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mt: 1 }}>
                  {zone.pincodes.map((pin) => (
                    <Chip key={pin} label={pin} size="small" />
                  ))}
                </Box>

                <Grid container spacing={2} mt={2}>
                  <Grid item xs={4}>
                    <Typography fontSize={14}>Delivery Fee</Typography>
                    <Typography fontWeight="bold">₹{zone.deliveryFee}</Typography>
                  </Grid>

                  <Grid item xs={4}>
                    <Typography fontSize={14}>Min Order Value</Typography>
                    <Typography fontWeight="bold">₹{zone.minimumOrderValue}</Typography>
                  </Grid>

                  <Grid item xs={4}>
                    <Typography fontSize={14}>Delivery Time</Typography>
                    <Typography fontWeight="bold">
                      {zone.deliveryTime || "—"}
                    </Typography>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Add/Edit Zone Modal */}
      <Dialog open={openDialog} onClose={handleCloseDialog} fullWidth maxWidth="sm">
        <DialogTitle>
          {editingZone ? "Edit Service Zone" : "Add New Service Zone"}
        </DialogTitle>

        <form onSubmit={handleSubmit}>
          <DialogContent>
            <Grid container spacing={2}>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Zone Name"
                  value={zoneForm.name}
                  onChange={(e) => setZoneForm((prev) => ({ ...prev, name: e.target.value }))}
                  required
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Pincodes (comma separated)"
                  value={zoneForm.pincodes}
                  onChange={(e) =>
                    setZoneForm((prev) => ({ ...prev, pincodes: e.target.value }))
                  }
                  required
                />
              </Grid>

              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="Delivery Fee (₹)"
                  type="number"
                  value={zoneForm.deliveryFee}
                  onChange={(e) =>
                    setZoneForm((prev) => ({ ...prev, deliveryFee: e.target.value }))
                  }
                  required
                />
              </Grid>

              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="Minimum Order Value (₹)"
                  type="number"
                  value={zoneForm.minimumOrderValue}
                  onChange={(e) =>
                    setZoneForm((prev) => ({ ...prev, minimumOrderValue: e.target.value }))
                  }
                  required
                />
              </Grid>

              {/* NEW DELIVERY TIME FIELD */}
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Delivery Time (e.g., 30-45 min)"
                  value={zoneForm.deliveryTime}
                  onChange={(e) =>
                    setZoneForm((prev) => ({ ...prev, deliveryTime: e.target.value }))
                  }
                  required
                />
              </Grid>

            </Grid>
          </DialogContent>

          <DialogActions>
            <Button onClick={handleCloseDialog}>Cancel</Button>
            <Button type="submit" variant="contained">
              {editingZone ? "Update" : "Create"}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
};

export default ZoneManager;
