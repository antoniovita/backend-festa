import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class EventController {
  static async createEvent(req: Request, res: Response) {
    const auth = (req as any).user;
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
      const { name, description, place, price, quantity, type, date, startTime, endTime, imgUrl } = req.body;

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

      if (type === 'private' && quantity > 200) {   //limite de 200 para o type private
         res.status(400).json({ error: 'Eventos privados têm limite de 200 pessoas.' });
         return;
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
          date: parsedDate,
          status: 'active',
          startTime: parsedStartTime,
          endTime: parsedEndTime,
          imgUrl
        },
      });
      
      const user = await prisma.user.findUnique({ where: { id: ownerId } });
      if (user && user.type === 'user') {
        await prisma.user.update({
          where: { id: ownerId },
          data: { type: 'owner' },
        });
      }

       res.status(201).json(event);
       return;
    } catch (error) {
      console.error('Erro ao criar evento:', error);
       res.status(500).json({ error: 'Erro ao criar evento' });
       return;
    }
  }

  static async getAllEvents(_req: Request, res: Response) {
    try {
      const events = await prisma.event.findMany({ where: { type: 'public' } });
       res.status(200).json(events);
       return;
    } catch (error) {
      console.error('Erro ao buscar eventos:', error);
       res.status(500).json({ error: 'Erro ao buscar eventos' });
       return;
    }
  }

  static async getEventById(req: Request, res: Response) {
    try {
      const id = req.params.id
      if (!id) {
         res.status(400).json({ error: 'É necessário o id.' });
         return;
      }

      const event = await prisma.event.findUnique({ where: { id } });
      if (!event) {
         res.status(404).json({ error: 'Evento não encontrado' });
         return;
      }

       res.status(200).json(event);
       return;
    } catch (error) {
      console.error('Erro ao buscar evento:', error);
       res.status(500).json({ error: 'Erro ao buscar evento' });
       return;
    }
  }

  static async updateEvent(req: Request, res: Response) {
    const auth = (req as any).user;
    if (!auth) {
       res.status(401).json({ error: 'Usuário não autenticado.' });
       return;
    }

    try {
        const id = req.params.id
        if (!id) {
           res.status(400).json({ error: 'É necessário o id.' });
           return;
        }

        const eventFind = await prisma.event.findUnique({ where: { id } });
        if (!eventFind) {
          res.status(404).json({ error: 'Evento não encontrado.' });
          return;
        }

        const ownerId = eventFind.ownerId;
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

      const event = await prisma.event.update({
        where: { id },
        data: { name, description, place, price, quantity, date: parsedDate, startTime: parsedStartTime, endTime: parsedEndTime },
      });

       res.status(200).json(event);
       return;
    } catch (error) {
      console.error('Erro ao atualizar evento:', error);
       res.status(500).json({ error: 'Erro ao atualizar evento' });
       return;
    }
  }

  static async deleteEvent(req: Request, res: Response) {
    const auth = (req as any).user;
    if (!auth) {
       res.status(401).json({ error: 'Usuário não autenticado.' });
       return;
    }

    try {
      const id = req.params.id
      if (!id) {
         res.status(400).json({ error: 'É preciso do ID.' });
         return;
      }

        const eventFind = await prisma.event.findUnique({ where: { id } });
        if (!eventFind) {
          res.status(404).json({ error: 'Evento não encontrado.' });
          return;
        }

        const ownerId = eventFind.ownerId;

      if (ownerId !== auth.id) {
         res.status(401).json({ error: 'Usuário não é dono do evento.' });
         return;
      }

      await prisma.event.delete({ where: { id } });
       res.status(204).send();
       return;
    } catch (error) {
      console.error('Erro ao deletar evento:', error);
       res.status(500).json({ error: 'Erro ao deletar evento' });
       return;
    }
  }
}
