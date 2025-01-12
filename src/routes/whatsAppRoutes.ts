import { Router, RequestHandler } from 'express';
import { initializeClient, sendMessage, logout } from '../controllers/WhatsAppController';

const router = Router();

router.post('/whatsapp/initialize', initializeClient as RequestHandler);
router.post('/whatsapp/send', sendMessage as RequestHandler);
router.post('/whatsapp/logout', logout as RequestHandler);

export default router;