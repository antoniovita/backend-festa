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
exports.EventController = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
class EventController {
    static createEvent(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            const auth = req.user;
            if (!auth) {
                res.status(401).json({ error: 'Usuário não autenticado.' });
                return;
            }
            const { ownerId } = req.body;
            if (ownerId !== auth.id) {
                res
                    .status(403)
                    .json({ error: 'Usuário não autorizado a criar evento para outro usuário.' });
                return;
            }
            try {
                const { name, description, place, price, quantity, type, date, startTime, endTime } = req.body;
                const parsedDate = new Date(date);
                if (isNaN(parsedDate.getTime())) {
                    res.status(400).json({ error: 'Formato de data inválido para "date".' });
                    return;
                }
                const parsedStartTime = new Date(startTime);
                if (isNaN(parsedStartTime.getTime())) {
                    res.status(400).json({ error: 'Formato de data inválido para "startTime".' });
                    return;
                }
                const parsedEndTime = new Date(endTime);
                if (isNaN(parsedEndTime.getTime())) {
                    res.status(400).json({ error: 'Formato de data inválido para "endTime".' });
                    return;
                }
                if (type === 'private' && quantity > 200) { //limite de 200 para o type private
                    res.status(400).json({ error: 'Eventos privados têm limite de 200 pessoas.' });
                    return;
                }
                const uploadedImgUrl = ((_a = req.file) === null || _a === void 0 ? void 0 : _a.filename) ? `/uploads/${req.file.filename}` : null;
                const event = yield prisma.event.create({
                    data: {
                        name,
                        description,
                        place,
                        price,
                        quantity,
                        ownerId,
                        type,
                        date: parsedDate,
                        status: 'active',
                        startTime: parsedStartTime,
                        endTime: parsedEndTime,
                        imgUrl: uploadedImgUrl
                    },
                });
                const user = yield prisma.user.findUnique({ where: { id: ownerId } });
                if (user && user.type === 'user') {
                    yield prisma.user.update({
                        where: { id: ownerId },
                        data: { type: 'owner' },
                    });
                }
                res.status(201).json(event);
                return;
            }
            catch (error) {
                console.error('Erro ao criar evento:', error);
                res.status(500).json({ error: 'Erro ao criar evento' });
                return;
            }
        });
    }
    static getAllEvents(_req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const events = yield prisma.event.findMany({ where: { type: 'public' } });
                res.status(200).json(events);
                return;
            }
            catch (error) {
                console.error('Erro ao buscar eventos:', error);
                res.status(500).json({ error: 'Erro ao buscar eventos' });
                return;
            }
        });
    }
    static getEventById(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const id = req.params.id;
                if (!id) {
                    res.status(400).json({ error: 'É necessário o id.' });
                    return;
                }
                const event = yield prisma.event.findUnique({ where: { id } });
                if (!event) {
                    res.status(404).json({ error: 'Evento não encontrado' });
                    return;
                }
                res.status(200).json(event);
                return;
            }
            catch (error) {
                console.error('Erro ao buscar evento:', error);
                res.status(500).json({ error: 'Erro ao buscar evento' });
                return;
            }
        });
    }
    static updateEvent(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            const auth = req.user;
            if (!auth) {
                res.status(401).json({ error: 'Usuário não autenticado.' });
                return;
            }
            try {
                const id = req.params.id;
                if (!id) {
                    res.status(400).json({ error: 'É necessário o id.' });
                    return;
                }
                const eventFind = yield prisma.event.findUnique({ where: { id } });
                if (!eventFind) {
                    res.status(404).json({ error: 'Evento não encontrado.' });
                    return;
                }
                const ownerId = eventFind.ownerId;
                const uploadedImgUrl = ((_a = req.file) === null || _a === void 0 ? void 0 : _a.filename) ? `/uploads/${req.file.filename}` : null;
                const { name, description, place, price, date, quantity, startTime, endTime } = req.body;
                const parsedDate = new Date(date);
                if (isNaN(parsedDate.getTime())) {
                    res.status(400).json({ error: 'Formato de data inválido para "date".' });
                    return;
                }
                const parsedStartTime = new Date(startTime);
                if (isNaN(parsedStartTime.getTime())) {
                    res.status(400).json({ error: 'Formato de data inválido para "startTime".' });
                    return;
                }
                const parsedEndTime = new Date(endTime);
                if (isNaN(parsedEndTime.getTime())) {
                    res.status(400).json({ error: 'Formato de data inválido para "endTime".' });
                    return;
                }
                if (auth.id !== ownerId) {
                    res.status(401).json({ error: 'Usuário não é o owner do evento.' });
                    return;
                }
                const event = yield prisma.event.update({
                    where: { id },
                    data: { name, description, place, price, quantity, date: parsedDate, startTime: parsedStartTime, endTime: parsedEndTime, imgUrl: uploadedImgUrl },
                });
                res.status(200).json(event);
                return;
            }
            catch (error) {
                console.error('Erro ao atualizar evento:', error);
                res.status(500).json({ error: 'Erro ao atualizar evento' });
                return;
            }
        });
    }
    static deleteEvent(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const auth = req.user;
            if (!auth) {
                res.status(401).json({ error: 'Usuário não autenticado.' });
                return;
            }
            try {
                const id = req.params.id;
                if (!id) {
                    res.status(400).json({ error: 'É preciso do ID.' });
                    return;
                }
                const eventFind = yield prisma.event.findUnique({ where: { id } });
                if (!eventFind) {
                    res.status(404).json({ error: 'Evento não encontrado.' });
                    return;
                }
                const ownerId = eventFind.ownerId;
                if (ownerId !== auth.id) {
                    res.status(401).json({ error: 'Usuário não é dono do evento.' });
                    return;
                }
                yield prisma.event.delete({ where: { id } });
                res.status(204).send();
                return;
            }
            catch (error) {
                console.error('Erro ao deletar evento:', error);
                res.status(500).json({ error: 'Erro ao deletar evento' });
                return;
            }
        });
    }
}
exports.EventController = EventController;
//# sourceMappingURL=eventController.js.map