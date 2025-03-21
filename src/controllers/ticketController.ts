import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';

const prisma = new PrismaClient();

export class TicketController {

//falta o pagamento
    static async createTicket(paymentId: number, userId: number, eventId: number, quantity: number, number: number, status: string) {
        try {
            const number = uuidv4();
            const tickets = await prisma.ticket.create({
                data: Array.from({ length: quantity }, () => ({
                    paymentId,
                    userId,
                    eventId,
                    number,
                    status
                }))
            });
            return tickets;
        } catch (error) {
            throw new Error('Erro ao criar tickets');
        }
    }

//get tickets pegando o id do usuario pelo auth
    static async getUserTickets(req: Request, res: Response) {
        try {
            const auth = (req as any).user;
            if (!auth) {
              return res.status(401).json({ error: 'Usuário não autenticado.' });
            }

            const userId = auth.id;
            const tickets = await prisma.ticket.findMany({ where: { userId } });
            return res.status(200).json(tickets);
        } catch (error) {
            return res.status(500).json({ error: 'Erro ao buscar tickets' });
        }
    }

// nao precisa de autenticação
    static async getTicketById(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const ticket = await prisma.ticket.findUnique({ where: { id: Number(id) } });
            
            if (!ticket) return res.status(404).json({ error: 'Ticket não encontrado' });
            
            return res.status(200).json(ticket);
        } catch (error) {
            return res.status(500).json({ error: 'Erro ao buscar ticket' });
        }
    }

    // deleção permitida apenas para o type adm
    static async deleteTicket(req: Request, res: Response) {
        try {
            const auth = (req as any).user;
            if (!auth) {
              return res.status(401).json({ error: 'Usuário não autenticado.' });
            }

            const { id } = req.params;
            
            if(auth.type === 'adm'){
                const ticket = await prisma.ticket.delete({where: id})
            }

            return res.status(200).json({message: 'Ticket deletado com sucesso.'})

        } catch (error) {
            return res.status(500).json({ error: 'Erro ao deletar ticket' });   
        }
    }

    // expire ticket usando cron job node com node cron FALTA FAZER
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
                return res.status(404).json({ error: 'Evento não encontrado.' });
            }
    
            // Verifica se o evento já terminou
            if (event.endTime && new Date(event.endTime) < now) {
                // Expira todos os tickets vinculados ao evento
                await prisma.ticket.updateMany({
                    where: { eventId },
                    data: { status: 'expired' },
                });
    
                return res.status(200).json({ message: 'Tickets expirados com sucesso.' });
            }
    
            return res.status(400).json({ error: 'O evento ainda não terminou, tickets não expirados.' });
        } catch (error) {
            console.error('Erro ao expirar tickets:', error);
            return res.status(500).json({ error: 'Erro ao expirar tickets depois do tempo da festa.' });
        }
    }
}