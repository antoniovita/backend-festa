import { Router } from 'express';
import { EventController } from '../controllers/eventController';
import authenticate from '../middlewares/authMiddleware';

const router = Router();

// rotas públicas
router.get('/', EventController.getAllEvents);
router.get('/:id', EventController.getEventById);

// rotas protegidas por autenticação (requerem autenticação)
router.post('/', authenticate, EventController.createEvent);
router.put('/:id', authenticate, EventController.updateEvent);
router.delete('/:id', authenticate, EventController.deleteEvent);

export default router;
