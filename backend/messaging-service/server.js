// Load environment variables FIRST
require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });

const express = require('express');
const cors = require('cors');
const connectDB = require('../shared/config/db');

// Pre-load Mongoose models
require('../shared/models/auth.model');
require('../shared/models/messaging.model');

const app = express();
app.use(cors());
app.use(express.json());

connectDB();

const routes = require('./messaging.routes');
// Mount at root — the API Gateway strips the /api/* prefix before forwarding
app.use('/', routes);

app.get('/health', (req, res) => res.json({ status: 'ok', service: 'messaging-service' }));

const PORT = 5006;
app.listen(PORT, () => console.log('messaging-service running on port ' + PORT));
