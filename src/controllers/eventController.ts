import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class EventController {
  static async createEvent(req: Request, res: Response) {
    const auth = (req as any).user;
    if (!auth) {
      return res.status(401).json({ error: 'Usuário não autenticado.' });
    }

    const { ownerId } = req.body;
    if (ownerId !== auth.id) {
      return res
        .status(403)
        .json({ error: 'Usuário não autorizado a criar evento para outro usuário.' });
    }

    try {
      const { name, description, place, price, quantity, type, date, startTime, endTime } = req.body;

      if (type === 'private' && quantity > 200) {   //limite de 200 para o type private
        return res.status(400).json({ error: 'Eventos privados têm limite de 200 pessoas.' });
      }

      const event = await prisma.event.create({
        data: {
          name,
          description,
          place,
          price,
          quantity,
          ownerId,
          type,
          date,
          status: 'active',
          startTime,
          endTime,
        },
      });
      
      const user = await prisma.user.findUnique({ where: { id: ownerId } });
      if (user && user.type === 'user') {
        await prisma.user.update({
          where: { id: ownerId },
          data: { type: 'owner' },
        });
      }

      return res.status(201).json(event);
    } catch (error) {
      console.error('Erro ao criar evento:', error);
      return res.status(500).json({ error: 'Erro ao criar evento' });
    }
  }

  static async getAllEvents(req: Request, res: Response) {
    try {
      const events = await prisma.event.findMany({ where: { type: 'public' } });
      return res.status(200).json(events);
    } catch (error) {
      console.error('Erro ao buscar eventos:', error);
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
      console.error('Erro ao buscar evento:', error);
      return res.status(500).json({ error: 'Erro ao buscar evento' });
    }
  }

  static async updateEvent(req: Request, res: Response) {
    const auth = (req as any).user;
    if (!auth) {
      return res.status(401).json({ error: 'Usuário não autenticado.' });
    }

    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) {
        return res.status(400).json({ error: 'ID inválido' });
      }

      const { ownerId, name, description, place, price, date, quantity, startTime, endTime } = req.body;
      if (auth.id !== ownerId) {
        return res.status(401).json({ error: 'Usuário não é o owner do evento.' });
      }

      const event = await prisma.event.update({
        where: { id },
        data: { name, description, place, price, quantity, date, startTime, endTime },
      });

      return res.status(200).json(event);
    } catch (error) {
      console.error('Erro ao atualizar evento:', error);
      return res.status(500).json({ error: 'Erro ao atualizar evento' });
    }
  }

  static async deleteEvent(req: Request, res: Response) {
    const auth = (req as any).user;
    if (!auth) {
      return res.status(401).json({ error: 'Usuário não autenticado.' });
    }

    try {
      const { ownerId } = req.body;
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) {
        return res.status(400).json({ error: 'ID inválido' });
      }


      if (ownerId !== auth.id) {
        return res.status(401).json({ error: 'Usuário não é dono do evento.' });
      }

      await prisma.event.delete({ where: { id } });
      return res.status(204).send();
    } catch (error) {
      console.error('Erro ao deletar evento:', error);
      return res.status(500).json({ error: 'Erro ao deletar evento' });
    }
  }
}
