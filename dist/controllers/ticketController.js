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
Object.defineProperty(exports, "__esModule", { value: true });
exports.TicketController = void 0;
const client_1 = require("@prisma/client");
const uuid_1 = require("uuid");
const prisma = new client_1.PrismaClient();
class TicketController {
    //cria ingresso sem pagamento
    static createTicket(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { paymentId, userId, eventId, status } = req.body;
                const ticket = yield prisma.ticket.create({
                    data: {
                        paymentId,
                        userId,
                        eventId,
                        number: (0, uuid_1.v4)(),
                        status,
                        date: new Date()
                    }
                });
                res.status(201).json(ticket);
                return;
            }
            catch (error) {
                console.error("Erro ao criar ticket:", error);
                res.status(500).json({ error: 'Erro ao criar ticket' });
                return;
            }
        });
    }
    // utilizada quando chamamos a funcao createPayment no paymentController
    static createTicketForPayment(paymentId, userId, eventId, status) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const ticket = yield prisma.ticket.create({
                    data: {
                        paymentId,
                        userId,
                        eventId,
                        number: (0, uuid_1.v4)(),
                        status,
                        date: new Date()
                    }
                });
                return ticket;
            }
            catch (error) {
                console.error("Erro ao criar ticket:", error);
                throw new Error('Erro ao criar ticket');
            }
        });
    }
    //get tickets pegando o id do usuario pelo auth
    static getUserTickets(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const auth = req.user;
                if (!auth) {
                    res.status(401).json({ error: 'Usuário não autenticado.' });
                    return;
                }
                const userId = auth.id;
                const tickets = yield prisma.ticket.findMany({ where: { userId } });
                res.status(200).json(tickets);
                return;
            }
            catch (error) {
                res.status(500).json({ error: 'Erro ao buscar tickets' });
                return;
            }
        });
    }
    // nao precisa de autenticação
    static getTicketById(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { id } = req.params;
                const ticket = yield prisma.ticket.findUnique({ where: { id } });
                if (!ticket) {
                    res.status(404).json({ error: 'Ticket não encontrado' });
                    return;
                }
                ;
                res.status(200).json(ticket);
            }
            catch (error) {
                res.status(500).json({ error: 'Erro ao buscar ticket' });
                return;
            }
        });
    }
    // deleção permitida apenas para o type adm
    static deleteTicket(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const auth = req.user;
                if (!auth) {
                    res.status(401).json({ error: 'Usuário não autenticado.' });
                    return;
                }
                const { id } = req.params;
                if (auth.type === 'adm') {
                    const ticket = yield prisma.ticket.delete({ where: { id } });
                    res.status(200).json({ message: 'Ticket deletado com sucesso.', ticket });
                    return;
                }
                res.status(403).json({ message: 'Acesso negado.' });
                return;
            }
            catch (error) {
                res.status(500).json({ error: 'Erro ao deletar ticket' });
                return;
            }
        });
    }
    // expire ticket usando cron job node com node cron 
    static expireTicket(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { eventId } = req.body;
                const now = new Date();
                // Busca o evento pelo ID
                const event = yield prisma.event.findUnique({
                    where: { id: eventId },
                    select: { id: true, startTime: true, endTime: true },
                });
                if (!event) {
                    res.status(404).json({ error: 'Evento não encontrado.' });
                    return;
                }
                // Verifica se o evento já terminou
                if (event.endTime && new Date(event.endTime) < now) {
                    // Expira todos os tickets vinculados ao evento
                    yield prisma.ticket.updateMany({
                        where: { eventId },
                        data: { status: 'expired' },
                    });
                    res.status(200).json({ message: 'Tickets expirados com sucesso.' });
                    return;
                }
                res.status(400).json({ error: 'O evento ainda não terminou, tickets não expirados.' });
                return;
            }
            catch (error) {
                console.error('Erro ao expirar tickets:', error);
                res.status(500).json({ error: 'Erro ao expirar tickets depois do tempo da festa.' });
                return;
            }
        });
    }
}
exports.TicketController = TicketController;
//# sourceMappingURL=ticketController.js.map