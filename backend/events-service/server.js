// Load environment variables FIRST
require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });

const express = require('express');
const cors = require('cors');
const connectDB = require('../shared/config/db');

// Pre-load Mongoose models
require('../shared/models/auth.model');
require('../shared/models/events.model');

const app = express();
app.use(cors());
app.use(express.json());

connectDB();

const routes = require('./events.routes');
// Mount at root — the API Gateway strips the /api/* prefix before forwarding
app.use('/', routes);

app.get('/health', (req, res) => res.json({ status: 'ok', service: 'events-service' }));

const PORT = 5004;
app.listen(PORT, () => console.log('events-service running on port ' + PORT));
