"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const userController_1 = require("../controllers/userController");
const authMiddleware_1 = __importDefault(require("../middlewares/authMiddleware"));
const router = (0, express_1.Router)();
// rotas de login e register => sem middleware
router.post('/register', userController_1.UserController.registerUser);
router.post('/login', userController_1.UserController.loginUserWithEmail);
//rotas com middleware
router.put('/:id', authMiddleware_1.default, userController_1.UserController.updateUserInfo);
router.post('/logout', authMiddleware_1.default, userController_1.UserController.logoutUser);
exports.default = router;
//# sourceMappingURL=userRoutes.js.map