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
  res.json({ message: 'Fleet Management API with Supabase!', version: '3.0' });
});

app.get('/api/vehicles', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('vehicles')
      .select('*')
      .order('id', { ascending: true });
    
    if (error) throw error;
    res.json({ success: true, data });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/vehicles', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('vehicles')
      .insert([{
        reg_number: req.body.regNumber,
        brand: req.body.brand,
        type: req.body.type || 'truck',
        status: 'active'
      }])
      .select();
    
    if (error) throw error;
    res.status(201).json({ success: true, data: data[0] });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.put('/api/vehicles/:id', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('vehicles')
      .update({
        reg_number: req.body.regNumber,
        brand: req.body.brand
      })
      .eq('id', req.params.id)
      .select();
    
    if (error) throw error;
    res.json({ success: true, data: data[0] });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.delete('/api/vehicles/:id', async (req, res) => {
  try {
    const { error } = await supabase
      .from('vehicles')
      .delete()
      .eq('id', req.params.id);
    
    if (error) throw error;
    res.json({ success: true });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log('');
  console.log('🚀 Fleet Management API v3.0 - WITH SUPABASE! 🎉');
  console.log('📍 Server: http://localhost:' + PORT);
  console.log('🗄️  Database: Supabase PostgreSQL');
  console.log('🌐 Endpoints:');
  console.log('   GET    /api/vehicles');
  console.log('   POST   /api/vehicles');
  console.log('   PUT    /api/vehicles/:id');
  console.log('   DELETE /api/vehicles/:id');
  console.log('');
  console.log('✅ Connected to Supabase!');
  console.log('💾 Data persists after restart!');
  console.log('');
});
