"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const eventController_1 = require("../controllers/eventController");
const authMiddleware_1 = __importDefault(require("../middlewares/authMiddleware"));
const uploadRoute_1 = require("../routes/uploadRoute");
const router = (0, express_1.Router)();
// rotas públicas
router.get('/', eventController_1.EventController.getAllEvents);
router.get('/:id', eventController_1.EventController.getEventById);
// rotas protegidas por autenticação (requerem autenticação)
router.post('/', authMiddleware_1.default, uploadRoute_1.upload.single("image"), eventController_1.EventController.createEvent);
router.put('/:id', authMiddleware_1.default, uploadRoute_1.upload.single("image"), eventController_1.EventController.updateEvent);
router.delete('/:id', authMiddleware_1.default, eventController_1.EventController.deleteEvent);
exports.default = router;
//# sourceMappingURL=eventRoutes.js.map