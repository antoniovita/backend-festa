import { Router } from 'express';
import { PaymentController } from '../controllers/paymentController';
import authenticate from '../middlewares/authMiddleware';

const router = Router();

//o createPayment já cria o pagamento na stripe, cria o recordPayment e cria o ticket tudo junto
router.post('/createPayment', PaymentController.createPayment);
//serve mais para criar um recordPayment avulso sem ter ocorrido o pagamento
router.post('/recordPayment', PaymentController.createPaymentRecord);

//adm routes
router.get('/', authenticate, PaymentController.getAllPayments);
router.get('/:id', authenticate, PaymentController.getPaymentById);

export default router;
