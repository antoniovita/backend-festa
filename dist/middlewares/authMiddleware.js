"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticate = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const key = process.env.JWT_SECRET;
if (!key) {
    throw new Error("JWT_SECRET não está definido no .env.");
}
const authenticate = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            res.status(401).json({ error: "User não autenticado." });
            return;
        }
        const token = authHeader.split(' ')[1];
        const decoded = jsonwebtoken_1.default.verify(token, key);
        req.user = decoded;
        return next();
    }
    catch (error) {
        console.error("Erro na autenticação:", error);
        res.status(403).json({ error: "Token inválido." });
        return;
    }
};
exports.authenticate = authenticate;
exports.default = exports.authenticate;
//# sourceMappingURL=authMiddleware.js.map