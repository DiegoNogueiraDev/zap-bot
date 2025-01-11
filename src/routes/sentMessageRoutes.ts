import express from 'express';
import { createSentMessage } from '../controllers/SentMessageController';

const router = express.Router();

router.post('/sent-message', createSentMessage); // Rota para criar mensagem enviada

export default router;