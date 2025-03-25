"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserController = void 0;
const client_1 = require("@prisma/client");
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const prisma = new client_1.PrismaClient();
// falta a parte da recuperação do perfil e reset de senha
class UserController {
}
exports.UserController = UserController;
_a = UserController;
UserController.registerUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
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
        const usernameFind = yield prisma.user.findFirst({ where: { username } });
        if (usernameFind) {
            res.status(400).json({ error: 'Username já em uso.' });
            return;
        }
        const emailFind = yield prisma.user.findUnique({ where: { email } });
        if (emailFind) {
            res.status(400).json({ error: 'Email já está em uso.' });
            return;
        }
        const hashedPassword = yield bcrypt_1.default.hash(password, 10);
        const cpfNumber = Number(cpf);
        const user = yield prisma.user.create({
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
        const token = jsonwebtoken_1.default.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 3600000,
            sameSite: 'strict'
        });
        res.status(201).json({ user, token });
        return;
    }
    catch (error) {
        console.error("Erro ao registrar usuário:", error);
        res.status(500).json({ error: 'Erro ao registrar usuário.' });
        return;
    }
});
UserController.loginUserWithEmail = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
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
        const user = yield prisma.user.findUnique({ where: { email } });
        if (!user) {
            res.status(404).json({ error: "Usuário não encontrado." });
            return;
        }
        const isMatch = yield bcrypt_1.default.compare(password, user.password);
        if (!isMatch) {
            res.status(401).json({ error: "Credenciais inválidas." });
            return;
        }
        const token = jsonwebtoken_1.default.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 3600000,
            sameSite: 'strict'
        });
        res.status(200).json({ token });
        return;
    }
    catch (error) {
        console.error("Erro no login:", error);
        res.status(500).json({ error: "Erro interno do servidor." });
        return;
    }
});
//middleware
UserController.updateUserInfo = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const auth = req.user;
        if (!auth) {
            res.status(401).json({ error: "Usuário não autenticado." });
            return;
        }
        if (auth.id !== id) {
            res.status(403).json({ error: "Acesso não autorizado." });
            return;
        }
        const { name, phone, imgUrl } = req.body;
        const updatedUser = yield prisma.user.update({
            where: { id },
            data: {
                name,
                phone,
                imgUrl,
            },
        });
        res.status(200).json(updatedUser);
        return;
    }
    catch (error) {
        console.error("Erro ao atualizar usuário:", error);
        res.status(500).json({ error: "Erro ao atualizar usuário." });
        return;
    }
});
UserController.logoutUser = (_req, res) => {
    res.clearCookie('token');
    res.status(200).json({ message: "Logout realizado com sucesso." });
    return;
};
//# sourceMappingURL=userController.js.map