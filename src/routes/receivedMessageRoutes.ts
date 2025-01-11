import express from 'express';
import { createReceivedMessage } from '../controllers/ReceivedMessageController';

const router = express.Router();

router.post('/received-message', createReceivedMessage); // Rota para criar mensagem recebida

export default router;