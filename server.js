require('dotenv').config();
const express = require('express');
const app = express();
const { getHotspotById, getHotspots } = require('./controllers/hotspotController');

app.use(express.json());

// Jalur/Endpoint API untuk Task Backend Anda
app.get('/api/hotspots', getHotspots);
app.get('/api/hotspots/:id', getHotspotById);

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`Server Backend Karhutla berjalan di http://localhost:${PORT}`);
});