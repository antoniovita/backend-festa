"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const ticketController_1 = require("../controllers/ticketController");
const authMiddleware_1 = __importDefault(require("../middlewares/authMiddleware"));
const router = (0, express_1.Router)();
// cria ticket avulso sem pagamento
router.post('/createTicket', ticketController_1.TicketController.createTicket);
// rota para o usuário autenticado ver seus tickets
router.get('/mytickets', authMiddleware_1.default, ticketController_1.TicketController.getUserTickets);
// rota para o usuário ver os detalhes do ticket dele
router.get('/:id', ticketController_1.TicketController.getTicketById);
// rota para deletar um ticket -> exclusivo para adm
router.delete('/:id', authMiddleware_1.default, ticketController_1.TicketController.deleteTicket);
// rota para expirar um ticket (falta terminá-la)
router.post('/expire', ticketController_1.TicketController.expireTicket);
exports.default = router;
//# sourceMappingURL=ticketRoutes.js.map