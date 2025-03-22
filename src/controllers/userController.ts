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
        return res.status(400).json({ error: 'Formato de email inválido.' });
      }

      if (!cpf || cpf.toString().length !== 11) {
        return res.status(400).json({ error: 'CPF inválido. Deve conter 11 dígitos.' });
      }

      if (!password || password.length < 6) {
        return res.status(400).json({ error: 'A senha deve ter pelo menos 6 caracteres.' });
      }

      const usernameFind = await prisma.user.findFirst({ where: { username } });
      if (usernameFind) {
        return res.status(400).json({ error: 'Username já em uso.' });
      }

      const emailFind = await prisma.user.findUnique({ where: { email } });
      if (emailFind) {
        return res.status(400).json({ error: 'Email já está em uso.' });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      
      const user = await prisma.user.create({
        data: {
          email,
          password: hashedPassword,
          cpf,
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

      return res.status(201).json({ user, token });
    } catch (error) {
      console.error("Erro ao registrar usuário:", error);
      return res.status(500).json({ error: 'Erro ao registrar usuário.' });
    }
  }


  static loginUserWithEmail = async (req: Request, res: Response) => {
    try {
      const { email, password } = req.body;
      
      if (!email || !password) {
        return res.status(400).json({ error: "Email e senha são campos obrigatórios." });
      }
      
      const emailRegex = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({ error: 'Formato de email inválido.' });
      }
      
      const user = await prisma.user.findUnique({ where: { email } });
      if (!user) {
        return res.status(404).json({ error: "Usuário não encontrado." });
      }
      
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(401).json({ error: "Credenciais inválidas." });
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
      
      return res.status(200).json({ token });
    } catch (error) {
      console.error("Erro no login:", error);
      return res.status(500).json({ error: "Erro interno do servidor." });
    }
  }

//middleware
  static updateUserInfo = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const auth = (req as any).user;
      if (!auth) {
        return res.status(401).json({ error: "Usuário não autenticado." });
      }
      if (auth.id !== id) {
        return res.status(403).json({ error: "Acesso não autorizado." });
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

      return res.status(200).json(updatedUser);
    } catch (error) {
      console.error("Erro ao atualizar usuário:", error);
      return res.status(500).json({ error: "Erro ao atualizar usuário." });
    }
  };

  static logoutUser = (_req: Request, res: Response) => {
    res.clearCookie('token');
    return res.status(200).json({ message: "Logout realizado com sucesso." });
  }

}
