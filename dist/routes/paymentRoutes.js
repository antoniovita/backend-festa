"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const paymentController_1 = require("../controllers/paymentController");
const authMiddleware_1 = __importDefault(require("../middlewares/authMiddleware"));
const router = (0, express_1.Router)();
//o createPayment já cria o pagamento na stripe, cria o recordPayment e cria o ticket tudo junto
router.post('/createPayment', paymentController_1.PaymentController.createPayment);
//serve mais para criar um recordPayment avulso sem ter ocorrido o pagamento
router.post('/recordPayment', paymentController_1.PaymentController.createPaymentRecord);
//adm routes
router.get('/', authMiddleware_1.default, paymentController_1.PaymentController.getAllPayments);
router.get('/:id', authMiddleware_1.default, paymentController_1.PaymentController.getPaymentById);
exports.default = router;
//# sourceMappingURL=paymentRoutes.js.map