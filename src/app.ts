import express, { Request, Response } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';

import paymentRoutes from './routes/paymentRoutes';
import userRoutes from './routes/userRoutes';

const app = express();

app.use(cookieParser());
app.use(express.json());
app.use(cors());

app.use('/payment', paymentRoutes);
app.use('/user', userRoutes)

app.get('/', (_req: Request, res: Response) => {
  res.send('Server funcionando.');
});

export default app;
