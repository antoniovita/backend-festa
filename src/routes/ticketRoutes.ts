import { Router } from 'express';
import { TicketController } from '../controllers/ticketController';
import authenticate from '../middlewares/authMiddleware';

const router = Router();

// nao precisa de uma createTicket já que ela funciona automaticamente quando há o pagamento na createPayment
router.post('/createTicket', TicketController.createTicket)

// rota para o usuário autenticado ver seus tickets
router.get('/mytickets', authenticate, TicketController.getUserTickets);

// rota para o usuário ver os detalhes do ticket dele
router.get('/:id', TicketController.getTicketById);

// rota para deletar um ticket -> exclusivo para adm
router.delete('/:id', authenticate, TicketController.deleteTicket);

// rota para expirar um ticket (falta terminá-la)
router.post('/expire', TicketController.expireTicket);

export default router;
