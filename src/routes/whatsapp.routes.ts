// src/routes/whatsapp.routes.ts
import { Router } from 'express';
import * as WhatsAppController from '../controllers/whatsapp.controller';

const router = Router();

/**
 * @swagger
 * /api/whatsapp/send:
 *   post:
 *     summary: Send WhatsApp message
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               to:
 *                 type: string
 *               message:
 *                 type: string
 */
router.post('/send', WhatsAppController.sendMessage);

/**
 * @swagger
 * /api/whatsapp/qr:
 *   get:
 *     summary: Get QR code for WhatsApp Web
 */
router.get('/qr', WhatsAppController.getQR);

/**
 * @swagger
 * /api/whatsapp/logout:
 *   post:
 *     summary: Logout from WhatsApp
 */
router.post('/logout', WhatsAppController.logout);

/**
 * @swagger
 * /api/whatsapp/messages:
 *   get:
 *     summary: Get received messages
 */
router.get('/messages', WhatsAppController.getMessages);

export default router;