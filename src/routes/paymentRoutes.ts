import { Router } from 'express';
import { PaymentController } from '../controllers/paymentController';
import authenticate from '../middlewares/authMiddleware';

const router = Router();

router.post('/createPayment', PaymentController.createPayment);
router.post('/recordPayment', PaymentController.createPaymentRecord);

//adm routes
router.get('/', authenticate, PaymentController.getAllPayments);
router.get('/:id', authenticate, PaymentController.getPaymentById);

export default router;
