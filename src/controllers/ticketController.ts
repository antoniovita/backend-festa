import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';

const prisma = new PrismaClient();

export class TicketController {

//cria ingresso sem pagamento
    static async createTicket(req: Request, res: Response) {
        try {
            const { paymentId, userId, eventId, status } = req.body;
            const ticket = await prisma.ticket.create({
                data: {
                  paymentId,
                  userId,
                  eventId,
                  number: uuidv4(),
                  status,
                  date: new Date()
                }
              });
              res.status(201).json(ticket);
              return;
        } catch (error) {
            console.error("Erro ao criar ticket:", error);
            res.status(500).json({ error: 'Erro ao criar ticket' });
            return;
        }
    }

// utilizada quando chamamos a funcao createPayment no paymentController
    static async createTicketForPayment( paymentId: string, userId: string, eventId: string, status: string ): Promise<any> {
        try {
          const ticket = await prisma.ticket.create({
            data: {
              paymentId,
              userId,
              eventId,
              number: uuidv4(),
              status,
              date: new Date()
            }
          });
          return ticket;
        } catch (error) {
          console.error("Erro ao criar ticket:", error);
          throw new Error('Erro ao criar ticket');
        }
      }

//get tickets pegando o id do usuario pelo auth
    static async getUserTickets(req: Request, res: Response) {
        try {
            const auth = (req as any).user;
            if (!auth) {
              res.status(401).json({ error: 'Usuário não autenticado.' });
              return;
            }

            const userId = auth.id;
            const tickets = await prisma.ticket.findMany({ where: { userId } });
            res.status(200).json(tickets);
            return;
        } catch (error) {
            res.status(500).json({ error: 'Erro ao buscar tickets' });
            return;
        }
    }

// nao precisa de autenticação
    static async getTicketById(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const ticket = await prisma.ticket.findUnique({ where: { id } });
            
            if (!ticket) {
                res.status(404).json({ error: 'Ticket não encontrado' });
                return
            };
            
            res.status(200).json(ticket);
        } catch (error) {
            res.status(500).json({ error: 'Erro ao buscar ticket' });
            return;
        }
    }

    // deleção permitida apenas para o type adm
    static async deleteTicket(req: Request, res: Response) {
        try {
            const auth = (req as any).user;
            if (!auth) {
              res.status(401).json({ error: 'Usuário não autenticado.' });
              return;
            }

            const { id } = req.params;
            
            if(auth.type === 'adm'){
                const ticket = await prisma.ticket.delete({where: {id} })
                res.status(200).json({message: 'Ticket deletado com sucesso.', ticket})
                return;
            }
            
            res.status(403).json({message: 'Acesso negado.'})
            return;

        } catch (error) {
            res.status(500).json({ error: 'Erro ao deletar ticket' });   
            return;
        }
    }

    // expire ticket usando cron job node com node cron 
    static async expireTicket(req: Request, res: Response) {
        try {
            const { eventId } = req.body;
            const now = new Date();
    
            // Busca o evento pelo ID
            const event = await prisma.event.findUnique({
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
                await prisma.ticket.updateMany({
                    where: { eventId },
                    data: { status: 'expired' },
                });
    
                res.status(200).json({ message: 'Tickets expirados com sucesso.' });
                return;
            }

            res.status(400).json({ error: 'O evento ainda não terminou, tickets não expirados.' });
            return;
        } catch (error) {
            console.error('Erro ao expirar tickets:', error);
            res.status(500).json({ error: 'Erro ao expirar tickets depois do tempo da festa.' });
            return;
        }
    }
}