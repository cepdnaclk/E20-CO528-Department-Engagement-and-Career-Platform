// Load environment variables FIRST
require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });

const express = require('express');
const cors = require('cors');
const connectDB = require('../shared/config/db');

// Pre-load Mongoose models
require('../shared/models/auth.model');
require('../shared/models/feed.model');

const app = express();
app.use(cors());
app.use(express.json());

connectDB();

const routes = require('./feed.routes');
// Mount at root — the API Gateway strips the /api/* prefix before forwarding
app.use('/', routes);

app.get('/health', (req, res) => res.json({ status: 'ok', service: 'feed-service' }));

const PORT = 5002;
app.listen(PORT, () => console.log('feed-service running on port ' + PORT));
