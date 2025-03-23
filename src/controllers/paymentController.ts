import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import Stripe from 'stripe';

const prisma = new PrismaClient();

const stripeClient = new Stripe(process.env.STRIPE_SECRET_KEY!, { 
  apiVersion: '2025-02-24.acacia' 
});

export class PaymentController {

    // cria o pagamento e ja cria o registro na db
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

      const paymentRecord = await prisma.payment.create({
        data: {
          userId,
          eventId,
          price,
          method,
          currency,
          date: new Date(),
        },
      });

   res.status(201).json({ clientSecret: paymentIntent.client_secret, paymentRecord });
   return;
    } catch (error) {
      console.error("Erro ao criar Payment Intent:", error);
   res.status(500).json({ message: "Erro ao criar Payment Intent", error });
   return;
    }
  };

  //cria individualmente um registro de um pagamento sem que haja o pagamento.
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
   res.status(201).json(payment);
   return;
    } catch (error) {
      console.error("Erro ao criar registro de pagamento:", error);
   res.status(500).json({ error: "Erro ao criar registro de pagamento." });
   return;
    }
  };

//adm rota protegida
  static getAllPayments = async (req: Request, res: Response) => {
    const auth = (req as any).user;
    if (!auth) {
   res.status(401).json({ error: 'Usuário não autenticado.' });
   return;
    }

    const adm = await prisma.user.findUnique({ where: { id: auth.id } });
    if (!adm) {
   res.status(404).json({ error: 'Usuário não encontrado.' });
   return;
    }

    if (adm.type === "adm") {
      const payments = await prisma.payment.findMany();
   res.status(200).json(payments);
   return;
    } else {
   res.status(403).json({ error: 'Acesso negado. Somente administradores podem acessar os pagamentos.' });
   return;
    }
  };

  // adm rota protegida
  static getPaymentById = async (req: Request, res: Response) => {
    try {
      const auth = (req as any).user;
      if (!auth) {
     res.status(401).json({ error: 'Usuário não autenticado.' });
     return;
      }
      const adm = await prisma.user.findUnique({ where: { id: auth.id } });
      if (!adm) {
     res.status(404).json({ error: 'Usuário não encontrado.' });
     return;
      }

      if (adm.type === "adm") {
        const { id } = req.params;
        const payment = await prisma.payment.findUnique({
          where: { id },
          include: { user: true, event: true, tickets: true },
        });

        if (!payment) {
       res.status(404).json({ error: "Pagamento não encontrado." });
       return;
        }

     res.status(200).json(payment);
     return;
      } else {
     res.status(403).json({ error: 'Acesso negado. Somente administradores podem acessar os pagamentos.' });
     return;
      }
    } catch (error) {
      console.error("Erro ao buscar o pagamento:", error);
   res.status(500).json({ error: "Erro ao buscar pagamento" });
   return;
    }
  };
}
