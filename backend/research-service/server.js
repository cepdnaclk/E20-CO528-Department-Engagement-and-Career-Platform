// Load environment variables FIRST
require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });

const express = require('express');
const cors = require('cors');
const connectDB = require('../shared/config/db');

// Pre-load Mongoose models
require('../shared/models/auth.model');
require('../shared/models/research.model');

const app = express();
app.use(cors());
app.use(express.json());

connectDB();

const routes = require('./research.routes');
// Mount at root — the API Gateway strips the /api/* prefix before forwarding
app.use('/', routes);

app.get('/health', (req, res) => res.json({ status: 'ok', service: 'research-service' }));

const PORT = 5005;
app.listen(PORT, () => console.log('research-service running on port ' + PORT));
