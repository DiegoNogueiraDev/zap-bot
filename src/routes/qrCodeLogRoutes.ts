import express from 'express';
import { createQRCodeLog } from '../controllers/QRCodeLogController';

const router = express.Router();

router.post('/qr-code-log', createQRCodeLog); // Rota para criar log de QR Code

export default router;