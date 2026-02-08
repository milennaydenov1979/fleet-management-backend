const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

// ==================== VEHICLES ====================
app.get('/api/vehicles', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('vehicles')
      .select('*')
      .order('id', { ascending: true });

    if (error) throw error;
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/vehicles', async (req, res) => {
  try {
    const { regNumber, brand, type } = req.body;
    const { data, error } = await supabase
      .from('vehicles')
      .insert([{ reg_number: regNumber, brand, type }])
      .select();

    if (error) throw error;
    res.json({ success: true, data: data[0] });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.put('/api/vehicles/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { regNumber, brand, type } = req.body;
    const { data, error } = await supabase
      .from('vehicles')
      .update({ reg_number: regNumber, brand, type, updated_at: new Date() })
      .eq('id', id)
      .select();

    if (error) throw error;
    res.json({ success: true, data: data[0] });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.delete('/api/vehicles/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { error } = await supabase
      .from('vehicles')
      .delete()
      .eq('id', id);

    if (error) throw error;
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ==================== DRIVERS ====================
app.get('/api/drivers', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('drivers')
      .select('*')
      .order('id', { ascending: true });

    if (error) throw error;
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/drivers', async (req, res) => {
  try {
    const { name, phone, licenseNumber, licenseCategory, hireDate } = req.body;
    const { data, error } = await supabase
      .from('drivers')
      .insert([{
        name,
        phone,
        license_number: licenseNumber,
        license_category: licenseCategory,
        hire_date: hireDate
      }])
      .select();

    if (error) throw error;
    res.json({ success: true, data: data[0] });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.put('/api/drivers/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, phone, licenseNumber, licenseCategory, hireDate } = req.body;
    const { data, error } = await supabase
      .from('drivers')
      .update({
        name,
        phone,
        license_number: licenseNumber,
        license_category: licenseCategory,
        hire_date: hireDate,
        updated_at: new Date()
      })
      .eq('id', id)
      .select();

    if (error) throw error;
    res.json({ success: true, data: data[0] });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.delete('/api/drivers/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { error } = await supabase
      .from('drivers')
      .delete()
      .eq('id', id);

    if (error) throw error;
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ==================== ASSIGNMENTS ====================
app.get('/api/assignments', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('vehicle_assignments')
      .select(`
        *,
        vehicles (reg_number),
        drivers (name)
      `)
      .is('ended_at', null)
      .order('assigned_at', { ascending: false });

    if (error) throw error;

    const assignments = data.map(a => ({
      ...a,
      vehicle_reg_number: a.vehicles?.reg_number,
      driver_name: a.drivers?.name
    }));

    res.json({ success: true, data: assignments });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/assignments', async (req, res) => {
  try {
    const { vehicleId, driverId, notes } = req.body;
    const { data, error } = await supabase
      .from('vehicle_assignments')
      .insert([{
        vehicle_id: vehicleId,
        driver_id: driverId,
        notes
      }])
      .select();

    if (error) throw error;
    res.json({ success: true, data: data[0] });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.put('/api/assignments/:id/end', async (req, res) => {
  try {
    const { id } = req.params;
    const { data, error } = await supabase
      .from('vehicle_assignments')
      .update({ ended_at: new Date() })
      .eq('id', id)
      .select();

    if (error) throw error;
    res.json({ success: true, data: data[0] });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ==================== TRIPS (ENHANCED) ====================
app.get('/api/trips', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('trips')
      .select(`
        *,
        vehicles (reg_number, brand),
        drivers (name)
      `)
      .order('start_time', { ascending: false });

    if (error) throw error;

    const trips = data.map(t => ({
      ...t,
      vehicle_reg_number: t.vehicles?.reg_number,
      vehicle_brand: t.vehicles?.brand,
      driver_name: t.drivers?.name
    }));

    res.json({ success: true, data: trips });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/trips', async (req, res) => {
  try {
    const { 
      vehicleId, driverId, startTime, endTime, startOdometer, endOdometer, 
      route, notes, price, fuelCost, driverCost, otherCosts,
      cmrNumber, clientName, cargoDescription, cargoWeight
    } = req.body;
    
    // Calculate distance
    let distanceKm = null;
    if (startOdometer && endOdometer) {
      distanceKm = endOdometer - startOdometer;
    }

    // Calculate costs and profit
    const fuelCostVal = parseFloat(fuelCost) || 0;
    const driverCostVal = parseFloat(driverCost) || 0;
    const otherCostsVal = parseFloat(otherCost) || 0;
    const totalCosts = fuelCostVal + driverCostVal + otherCostsVal;
    
    const priceVal = parseFloat(price) || 0;
    const profit = priceVal - totalCosts;
    const profitMargin = priceVal > 0 ? (profit / priceVal) * 100 : 0;

    const { data, error } = await supabase
      .from('trips')
      .insert([{
        vehicle_id: vehicleId,
        driver_id: driverId,
        start_time: startTime,
        end_time: endTime,
        start_odometer: startOdometer,
        end_odometer: endOdometer,
        distance_km: distanceKm,
        route,
        notes,
        status: endTime ? 'completed' : 'active',
        price: priceVal,
        fuel_cost: fuelCostVal,
        driver_cost: driverCostVal,
        other_costs: otherCostsVal,
        total_costs: totalCosts,
        profit: profit,
        profit_margin: profitMargin,
        cmr_number: cmrNumber,
        client_name: clientName,
        cargo_description: cargoDescription,
        cargo_weight: cargoWeight
      }])
      .select();

    if (error) throw error;
    res.json({ success: true, data: data[0] });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.put('/api/trips/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      vehicleId, driverId, startTime, endTime, startOdometer, endOdometer, 
      route, notes, price, fuelCost, driverCost, otherCosts,
      cmrNumber, clientName, cargoDescription, cargoWeight
    } = req.body;
    
    // Calculate distance
    let distanceKm = null;
    if (startOdometer && endOdometer) {
      distanceKm = endOdometer - startOdometer;
    }

    // Calculate costs and profit
    const fuelCostVal = parseFloat(fuelCost) || 0;
    const driverCostVal = parseFloat(driverCost) || 0;
    const otherCostsVal = parseFloat(otherCosts) || 0;
    const totalCosts = fuelCostVal + driverCostVal + otherCostsVal;
    
    const priceVal = parseFloat(price) || 0;
    const profit = priceVal - totalCosts;
    const profitMargin = priceVal > 0 ? (profit / priceVal) * 100 : 0;

    const { data, error } = await supabase
      .from('trips')
      .update({
        vehicle_id: vehicleId,
        driver_id: driverId,
        start_time: startTime,
        end_time: endTime,
        start_odometer: startOdometer,
        end_odometer: endOdometer,
        distance_km: distanceKm,
        route,
        notes,
        status: endTime ? 'completed' : 'active',
        updated_at: new Date(),
        price: priceVal,
        fuel_cost: fuelCostVal,
        driver_cost: driverCostVal,
        other_costs: otherCostsVal,
        total_costs: totalCosts,
        profit: profit,
        profit_margin: profitMargin,
        cmr_number: cmrNumber,
        client_name: clientName,
        cargo_description: cargoDescription,
        cargo_weight: cargoWeight
      })
      .eq('id', id)
      .select();

    if (error) throw error;
    res.json({ success: true, data: data[0] });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.delete('/api/trips/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { error } = await supabase
      .from('trips')
      .delete()
      .eq('id', id);

    if (error) throw error;
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ==================== FUEL RECORDS ====================
app.get('/api/fuel', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('fuel_records')
      .select(`
        *,
        vehicles (reg_number, brand)
      `)
      .order('fuel_date', { ascending: false });

    if (error) throw error;

    const fuelRecords = data.map(f => ({
      ...f,
      vehicle_reg_number: f.vehicles?.reg_number,
      vehicle_brand: f.vehicles?.brand
    }));

    res.json({ success: true, data: fuelRecords });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/fuel', async (req, res) => {
  try {
    const { vehicleId, fuelDate, liters, pricePerLiter, odometerReading, fuelType, stationName, notes } = req.body;
    
    const totalCost = liters * pricePerLiter;

    const { data, error } = await supabase
      .from('fuel_records')
      .insert([{
        vehicle_id: vehicleId,
        fuel_date: fuelDate,
        liters: liters,
        price_per_liter: pricePerLiter,
        total_cost: totalCost,
        odometer_reading: odometerReading,
        fuel_type: fuelType || 'diesel',
        station_name: stationName,
        notes: notes
      }])
      .select();

    if (error) throw error;
    res.json({ success: true, data: data[0] });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.put('/api/fuel/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { vehicleId, fuelDate, liters, pricePerLiter, odometerReading, fuelType, stationName, notes } = req.body;
    
    const totalCost = liters * pricePerLiter;

    const { data, error } = await supabase
      .from('fuel_records')
      .update({
        vehicle_id: vehicleId,
        fuel_date: fuelDate,
        liters: liters,
        price_per_liter: pricePerLiter,
        total_cost: totalCost,
        odometer_reading: odometerReading,
        fuel_type: fuelType,
        station_name: stationName,
        notes: notes,
        updated_at: new Date()
      })
      .eq('id', id)
      .select();

    if (error) throw error;
    res.json({ success: true, data: data[0] });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.delete('/api/fuel/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { error } = await supabase
      .from('fuel_records')
      .delete()
      .eq('id', id);

    if (error) throw error;
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Fleet Management API with Analytics is running' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
