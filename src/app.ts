const express = require('express');
const cors = require('cors');
const app = express();

app.use(express.json());
app.use(cors());

const userRoutes = require('./routes/userRoutes');
const eventRoutes = require('./routes/eventRoutes');
const ticketRoutes = require('./routes/ticketRoutes');
const paymentRoutes = require('./routes/paymentRoutes');

app.use('/users', userRoutes);
app.use('/events', eventRoutes);
app.use('/tickets', ticketRoutes);
app.use('/payments', paymentRoutes);

app.get('/', (req, res) => {
  res.send('Server funcionando.');
});

module.exports = app;
