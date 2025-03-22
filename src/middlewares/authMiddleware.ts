import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const key = process.env.JWT_SECRET;

if (!key) {
    throw new Error("JWT_SECRET não está definido no .env.");
}

export const authenticate = (req: Request, res: Response, next: NextFunction): void => { 
    try {
        const authHeader = req.headers.authorization;
        
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            res.status(401).json({ error: "User não autenticado." });
            return;
        }

        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, key);
        (req as any).user = decoded;
        
        return next();

    } catch (error) {
        console.error("Erro na autenticação:", error);
        res.status(403).json({ error: "Token inválido." });
        return;
    }
};

export default authenticate;
