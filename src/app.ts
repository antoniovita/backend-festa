import express, { Request, Response } from 'express';
const cors = require('cors');
const app = express();
const cookieParser = require('cookie-parser');

app.use(cookieParser());
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

app.get('/', (req: Request, res: Response) => {
  res.send('Server funcionando.');
});

module.exports = app;
