const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

app.get('/', (req, res) => {
  res.json({ message: 'Fleet Management API v4.0 - with Drivers!', version: '4.0' });
});

app.get('/api/vehicles', async (req, res) => {
  try {
    const { data, error } = await supabase.from('vehicles').select('*').order('id', { ascending: true });
    if (error) throw error;
    res.json({ success: true, data });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/vehicles', async (req, res) => {
  try {
    const { data, error } = await supabase.from('vehicles').insert([{
      reg_number: req.body.regNumber, brand: req.body.brand, type: req.body.type || 'truck', status: 'active'
    }]).select();
    if (error) throw error;
    res.status(201).json({ success: true, data: data[0] });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.put('/api/vehicles/:id', async (req, res) => {
  try {
    const { data, error } = await supabase.from('vehicles').update({
      reg_number: req.body.regNumber, brand: req.body.brand
    }).eq('id', req.params.id).select();
    if (error) throw error;
    res.json({ success: true, data: data[0] });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.delete('/api/vehicles/:id', async (req, res) => {
  try {
    const { error } = await supabase.from('vehicles').delete().eq('id', req.params.id);
    if (error) throw error;
    res.json({ success: true });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/drivers', async (req, res) => {
  try {
    const { data, error } = await supabase.from('drivers').select('*').order('id', { ascending: true });
    if (error) throw error;
    res.json({ success: true, data });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/drivers', async (req, res) => {
  try {
    const { data, error } = await supabase.from('drivers').insert([{
      name: req.body.name, phone: req.body.phone, license_number: req.body.licenseNumber,
      license_category: req.body.licenseCategory, hire_date: req.body.hireDate, status: 'active'
    }]).select();
    if (error) throw error;
    res.status(201).json({ success: true, data: data[0] });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.put('/api/drivers/:id', async (req, res) => {
  try {
    const { data, error } = await supabase.from('drivers').update({
      name: req.body.name, phone: req.body.phone, license_number: req.body.licenseNumber,
      license_category: req.body.licenseCategory
    }).eq('id', req.params.id).select();
    if (error) throw error;
    res.json({ success: true, data: data[0] });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.delete('/api/drivers/:id', async (req, res) => {
  try {
    const { error } = await supabase.from('drivers').delete().eq('id', req.params.id);
    if (error) throw error;
    res.json({ success: true });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/assignments', async (req, res) => {
  try {
    const { data, error } = await supabase.from('vehicle_assignments')
      .select('*, vehicle:vehicles(id, reg_number, brand), driver:drivers(id, name, phone)')
      .is('ended_at', null).order('assigned_at', { ascending: false });
    if (error) throw error;
    res.json({ success: true, data });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/assignments', async (req, res) => {
  try {
    const { data, error } = await supabase.from('vehicle_assignments').insert([{
      vehicle_id: req.body.vehicleId, driver_id: req.body.driverId, notes: req.body.notes
    }]).select();
    if (error) throw error;
    res.status(201).json({ success: true, data: data[0] });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.put('/api/assignments/:id/end', async (req, res) => {
  try {
    const { data, error } = await supabase.from('vehicle_assignments')
      .update({ ended_at: new Date().toISOString() }).eq('id', req.params.id).select();
    if (error) throw error;
    res.json({ success: true, data: data[0] });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log('');
  console.log('🚀 Fleet Management API v4.0 - WITH DRIVERS! 🎉');
  console.log('📍 Server: http://localhost:' + PORT);
  console.log('🗄️  Database: Supabase PostgreSQL');
  console.log('');
});
