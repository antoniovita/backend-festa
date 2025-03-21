import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class EventController {
    static async createEvent(req: Request, res: Response) {
        const auth = 'é pra colocar aqui o middleware que vai autenticar';
        // vai ter um if para verificar se o user está logado
        try {
            const { name, description, place, price, quantity, ownerId, type, date, startTime, endTime} = req.body;

            if (type === 'private' && quantity > 200) {
                return res.status(400).json({ error: 'Eventos privados têm limite de 200 pessoas.' });
            }

            const event = await prisma.event.create({
                data: { name, description, place, price, quantity, ownerId, type, date, status: 'active' }
            });

            const user = await prisma.user.findUnique({ where: { id: ownerId } });

            if (user && user.type === 'user') {
                await prisma.user.update({
                    where: { id: ownerId },
                    data: { type: 'owner' }
                });
            }

            return res.status(201).json(event);
        } catch (error) {
            return res.status(500).json({ error: 'Erro ao criar evento' });
        }
    }

    static async getAllEvents(req: Request, res: Response) {
        try {
            const events = await prisma.event.findMany({ where: { type: 'public' } });
            return res.status(200).json(events);
        } catch (error) {
            return res.status(500).json({ error: 'Erro ao buscar eventos' });
        }
    }

    static async getEventById(req: Request, res: Response) {
        try {
            const id = parseInt(req.params.id, 10);
            if (isNaN(id)) {
                return res.status(400).json({ error: 'ID inválido' });
            }

            const event = await prisma.event.findUnique({ where: { id } });

            if (!event) {
                return res.status(404).json({ error: 'Evento não encontrado' });
            }

            return res.status(200).json(event);
        } catch (error) {
            return res.status(500).json({ error: 'Erro ao buscar evento' });
        }
    }

    static async updateEvent(req: Request, res: Response) {
        const auth = 'é pra colocar aqui o middleware que vai autenticar';

        try {
            const id = parseInt(req.params.id, 10);
            if (isNaN(id)) {
                return res.status(400).json({ error: 'ID inválido' });
            }

            const { ownerId, name, description, place, price, date, quantity, startTime, endTime } = req.body;

            if (auth.id === ownerId) {
                const event = await prisma.event.update({
                    where: { id },
                    data: { name, description, place, price, quantity, date, startTime, endTime }
                });

                return res.status(200).json(event);
            }
            return res.status(401).json({ error: 'Usuário não é o owner do evento.' });
        } catch (error) {
            return res.status(500).json({ error: 'Erro ao atualizar evento' });
        }
    }

    static async deleteEvent(req: Request, res: Response) {
        const auth = 'middleware de autenticação';
        // vai ter um if para ver se ta logado
        try {
            const { ownerId } = req.body;
            const id = parseInt(req.params.id, 10);

            if (isNaN(id)) {
                return res.status(400).json({ error: 'ID inválido' });
            }

            if (ownerId === auth.id) {
                await prisma.event.delete({ where: { id } });
                return res.status(204).send();
            }

            return res.status(401).json({ error: 'Usuário não é dono do evento.' });
        } catch (error) {
            return res.status(500).json({ error: 'Erro ao deletar evento' });
        }
    }
}
