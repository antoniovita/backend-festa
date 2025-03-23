import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();


// falta a parte da recuperação do perfil e reset de senha
export class UserController {

  static registerUser = async (req: Request, res: Response) => {
    const { email, password, cpf, phone, username, name, imgUrl } = req.body;

    try {
      const emailRegex = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;
      if (!emailRegex.test(email)) {
         res.status(400).json({ error: 'Formato de email inválido.' });
         return;
      }

      if (!cpf || cpf.toString().length !== 11) {
         res.status(400).json({ error: 'CPF inválido. Deve conter 11 dígitos.' });
         return;
      }

      if (!password || password.length < 6) {
         res.status(400).json({ error: 'A senha deve ter pelo menos 6 caracteres.' });
         return;
      }

      const usernameFind = await prisma.user.findFirst({ where: { username } });
      if (usernameFind) {
         res.status(400).json({ error: 'Username já em uso.' });
         return;
      }

      const emailFind = await prisma.user.findUnique({ where: { email } });
      if (emailFind) {
         res.status(400).json({ error: 'Email já está em uso.' });
         return;
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const cpfNumber = Number(cpf);
      
      const user = await prisma.user.create({
        data: {
          email,
          password: hashedPassword,
          cpf: cpfNumber,
          phone,
          username,
          name,
          imgUrl,
          type: 'user'
        },
      });

      const token = jwt.sign(
        { id: user.id, email: user.email },
        process.env.JWT_SECRET!,
        { expiresIn: '1h' }
      );

      res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 3600000,
        sameSite: 'strict'
      });

       res.status(201).json({ user, token });
       return;
    } catch (error) {
      console.error("Erro ao registrar usuário:", error);
       res.status(500).json({ error: 'Erro ao registrar usuário.' });
       return;
    }
  }


  static loginUserWithEmail = async (req: Request, res: Response) => {
    try {
      const { email, password } = req.body;
      
      if (!email || !password) {
         res.status(400).json({ error: "Email e senha são campos obrigatórios." });
         return;
      }
      
      const emailRegex = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;
      if (!emailRegex.test(email)) {
         res.status(400).json({ error: 'Formato de email inválido.' });
         return;
      }
      
      const user = await prisma.user.findUnique({ where: { email } });
      if (!user) {
         res.status(404).json({ error: "Usuário não encontrado." });
         return;
      }
      
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
         res.status(401).json({ error: "Credenciais inválidas." });
         return;
      }
      
      const token = jwt.sign(
        { id: user.id, email: user.email },
        process.env.JWT_SECRET!,
        { expiresIn: '1h' }
      );

      res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 3600000,
        sameSite: 'strict'
      });
      
       res.status(200).json({ token });
       return;
    } catch (error) {
      console.error("Erro no login:", error);
       res.status(500).json({ error: "Erro interno do servidor." });
       return;
    }
  }

//middleware
  static updateUserInfo = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const auth = (req as any).user;
      if (!auth) {
         res.status(401).json({ error: "Usuário não autenticado." });
         return;
      }
      if (auth.id !== id) {
         res.status(403).json({ error: "Acesso não autorizado." });
         return;
      }

      const { name, phone, imgUrl } = req.body;

      const updatedUser = await prisma.user.update({
        where: { id },
        data: {
          name,
          phone,
          imgUrl,
        },
      });

       res.status(200).json(updatedUser);
       return;
    } catch (error) {
      console.error("Erro ao atualizar usuário:", error);
       res.status(500).json({ error: "Erro ao atualizar usuário." });
       return;
    }
  };

  static logoutUser = (_req: Request, res: Response) => {
    res.clearCookie('token');
     res.status(200).json({ message: "Logout realizado com sucesso." });
     return;
  }

}
