import { Router } from 'express';
import { UserController } from '../controllers/userController';
import authenticate from '../middlewares/authMiddleware';

const router = Router();

// rotas de login e register => sem middleware
router.post('/register', UserController.registerUser);
router.post('/login', UserController.loginUserWithEmail);

//rotas com middleware
router.put('/:id', authenticate, UserController.updateUserInfo);
router.post('/logout', authenticate, UserController.logoutUser);

export default router;
