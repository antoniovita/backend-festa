"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentController = void 0;
const client_1 = require("@prisma/client");
const stripe_1 = __importDefault(require("stripe"));
const ticketController_1 = require("./ticketController");
const prisma = new client_1.PrismaClient();
const stripeClient = new stripe_1.default(process.env.STRIPE_SECRET_KEY, {
    apiVersion: '2025-02-24.acacia'
});
class PaymentController {
}
exports.PaymentController = PaymentController;
_a = PaymentController;
// cria o pagamento e ja cria o registro na db
PaymentController.createPayment = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { userId, eventId, price, method, currency } = req.body;
        const amount = Math.round(price * 100);
        const paymentMethodTypes = [method.toLowerCase()];
        const paymentIntent = yield stripeClient.paymentIntents.create({
            amount,
            currency: currency.toLowerCase(),
            payment_method_types: paymentMethodTypes,
            metadata: {
                userId,
                eventId,
                method,
            },
        });
        const paymentRecord = yield prisma.payment.create({
            data: {
                userId,
                eventId,
                price,
                method,
                currency,
                date: new Date(),
            },
        });
        const ticket = yield ticketController_1.TicketController.createTicketForPayment(paymentRecord.id, userId, eventId, "active");
        res.status(201).json({ clientSecret: paymentIntent.client_secret, paymentRecord, ticket });
        return;
    }
    catch (error) {
        console.error("Erro ao criar Payment Intent:", error);
        res.status(500).json({ message: "Erro ao criar Payment Intent", error });
        return;
    }
});
//cria individualmente um registro de um pagamento sem que haja o pagamento.
PaymentController.createPaymentRecord = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const dateTime = new Date();
        const { userId, eventId, price, method, currency } = req.body;
        const payment = yield prisma.payment.create({
            data: {
                userId,
                eventId,
                price,
                method,
                currency,
                date: dateTime,
            },
        });
        res.status(201).json(payment);
        return;
    }
    catch (error) {
        console.error("Erro ao criar registro de pagamento:", error);
        res.status(500).json({ error: "Erro ao criar registro de pagamento." });
        return;
    }
});
//adm rota protegida
PaymentController.getAllPayments = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const auth = req.user;
    if (!auth) {
        res.status(401).json({ error: 'Usuário não autenticado.' });
        return;
    }
    const adm = yield prisma.user.findUnique({ where: { id: auth.id } });
    if (!adm) {
        res.status(404).json({ error: 'Usuário não encontrado.' });
        return;
    }
    if (adm.type === "adm") {
        const payments = yield prisma.payment.findMany();
        res.status(200).json(payments);
        return;
    }
    else {
        res.status(403).json({ error: 'Acesso negado. Somente administradores podem acessar os pagamentos.' });
        return;
    }
});
// adm rota protegida
PaymentController.getPaymentById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const auth = req.user;
        if (!auth) {
            res.status(401).json({ error: 'Usuário não autenticado.' });
            return;
        }
        const adm = yield prisma.user.findUnique({ where: { id: auth.id } });
        if (!adm) {
            res.status(404).json({ error: 'Usuário não encontrado.' });
            return;
        }
        if (adm.type === "adm") {
            const { id } = req.params;
            const payment = yield prisma.payment.findUnique({
                where: { id },
                include: { user: true, event: true, tickets: true },
            });
            if (!payment) {
                res.status(404).json({ error: "Pagamento não encontrado." });
                return;
            }
            res.status(200).json(payment);
            return;
        }
        else {
            res.status(403).json({ error: 'Acesso negado. Somente administradores podem acessar os pagamentos.' });
            return;
        }
    }
    catch (error) {
        console.error("Erro ao buscar o pagamento:", error);
        res.status(500).json({ error: "Erro ao buscar pagamento" });
        return;
    }
});
//# sourceMappingURL=paymentController.js.map