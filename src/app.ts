import express, { Request, Response } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';

import paymentRoutes from './routes/paymentRoutes';

const app = express();

app.use(cookieParser());
app.use(express.json());
app.use(cors());

app.use('/payments', paymentRoutes);

app.get('/', (_req: Request, res: Response) => {
  res.send('Server funcionando.');
});

export default app;
