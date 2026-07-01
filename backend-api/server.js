const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');

const app = express();
app.use(cors()); // Crucial to prevent frontend CORS blocking

// Connect to your database
const pool = new Pool({
    user: 'postgres',
    password: 'YOUR_ACTUAL_PASSWORD', // Change this
    host: 'localhost',
    port: 5432,
    database: 'geonirisk'
});

app.get('/api/nearest-water', async (req, res) => {
    const { lat, lng } = req.query;
    if (!lat || !lng) return res.status(400).json({ error: "Missing coordinates" });

    // The <-> operator performs blazing fast nearest-neighbor spatial sorting
    const query = `
        SELECT 
            ST_X(geom) AS lng, 
            ST_Y(geom) AS lat,
            ST_DistanceSphere(geom, ST_SetSRID(ST_MakePoint($1, $2), 4326)) / 1000.0 AS dist_km
        FROM gis_osm_waterways_free_1
        ORDER BY geom <-> ST_SetSRID(ST_MakePoint($1, $2), 4326)
        LIMIT 1;
    `;
    
    try {
        const { rows } = await pool.query(query, [lng, lat]);
        res.json(rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.listen(3000, () => console.log('Spatial API running on port 3000'));