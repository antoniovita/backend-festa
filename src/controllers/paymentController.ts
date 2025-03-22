import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import Stripe from 'stripe';

const prisma = new PrismaClient();

const stripeClient = new Stripe(process.env.STRIPE_SECRET_KEY!, { 
  apiVersion: '2025-02-24.acacia' 
});

export class PaymentController {

  static createPayment = async (req: Request, res: Response) => {
    try {
      const { userId, eventId, price, method, currency } = req.body;
      const amount = Math.round(price * 100);
      const paymentMethodTypes = [ method.toLowerCase() ];

      const paymentIntent = await stripeClient.paymentIntents.create({
        amount,
        currency: currency.toLowerCase(),
        payment_method_types: paymentMethodTypes,
        metadata: {
          userId,
          eventId,
          method,
        },
      });

      return res.status(201).json({ clientSecret: paymentIntent.client_secret });
    } catch (error) {
      console.error("Erro ao criar Payment Intent:", error);
      return res.status(500).json({ message: "Erro ao criar Payment Intent", error });
    }
  };

  static createPaymentRecord = async (req: Request, res: Response) => {
    try {
      const dateTime = new Date();
      const { userId, eventId, price, method, currency } = req.body;
      const payment = await prisma.payment.create({
        data: {
          userId,
          eventId,
          price,
          method,
          currency,
          date: dateTime,
        },
      });
      return res.status(201).json(payment);
    } catch (error) {
      console.error("Erro ao criar registro de pagamento:", error);
      return res.status(500).json({ error: "Erro ao criar registro de pagamento." });
    }
  };

//adm rota protegida
  static getAllPayments = async (req: Request, res: Response) => {
    const auth = (req as any).user;
    if (!auth) {
      return res.status(401).json({ error: 'Usuário não autenticado.' });
    }

    const adm = await prisma.user.findUnique({ where: { id: auth.id } });
    if (!adm) {
      return res.status(404).json({ error: 'Usuário não encontrado.' });
    }

    if (adm.type === "adm") {
      const payments = await prisma.payment.findMany();
      return res.status(200).json(payments);
    } else {
      return res.status(403).json({ error: 'Acesso negado. Somente administradores podem acessar os pagamentos.' });
    }
  };

  // adm rota protegida
  static getPaymentById = async (req: Request, res: Response) => {
    try {
      const auth = (req as any).user;
      if (!auth) {
        return res.status(401).json({ error: 'Usuário não autenticado.' });
      }
      const adm = await prisma.user.findUnique({ where: { id: auth.id } });
      if (!adm) {
        return res.status(404).json({ error: 'Usuário não encontrado.' });
      }

      if (adm.type === "adm") {
        const { id } = req.params;
        const payment = await prisma.payment.findUnique({
          where: { id },
          include: { user: true, event: true, tickets: true },
        });

        if (!payment) {
          return res.status(404).json({ error: "Pagamento não encontrado." });
        }

        return res.status(200).json(payment);
      } else {
        return res.status(403).json({ error: 'Acesso negado. Somente administradores podem acessar os pagamentos.' });
      }
    } catch (error) {
      console.error("Erro ao buscar o pagamento:", error);
      return res.status(500).json({ error: "Erro ao buscar pagamento" });
    }
  };
}
