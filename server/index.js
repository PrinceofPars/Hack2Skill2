require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const electionRoutes = require('./routes/election');
const civicRoutes = require('./routes/civic');
const aiRoutes = require('./routes/ai');
const remindRoutes = require('./routes/remind');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173' }));
app.use(express.json());

// Routes
app.use('/api/election', electionRoutes);
app.use('/api/civic', civicRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/remind', remindRoutes);

// Health check
app.get('/api/health', (req, res) => res.json({ status: 'ok', timestamp: new Date() }));

// MongoDB connection (optional - graceful degradation)
if (process.env.MONGODB_URI) {
  mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('✅ MongoDB connected'))
    .catch(err => console.warn('⚠️  MongoDB not connected (sessions disabled):', err.message));
}

app.listen(PORT, () => {
  console.log(`🗳️  Smart Election Navigator API running on http://localhost:${PORT}`);
});
