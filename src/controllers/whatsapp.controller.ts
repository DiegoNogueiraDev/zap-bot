// src/controllers/whatsapp.controller.ts
import { Request, Response } from 'express';
import WhatsAppService from '../services/whatsapp.service';
import { WhatsAppMessage } from '../types/whatsapp.types';

export const sendMessage = async (req: Request, res: Response) => {
  try {
    const messageData: WhatsAppMessage = req.body;
    const result = await WhatsAppService.sendMessage(messageData);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error sending message' });
  }
};

export const getQR = (req: Request, res: Response) => {
  try {
    const qr = WhatsAppService.getQR();
    res.json({ success: true, data: qr });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error getting QR code' });
  }
};

export const logout = async (req: Request, res: Response) => {
  try {
    const result = await WhatsAppService.logout();
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error logging out' });
  }
};

export const getMessages = (req: Request, res: Response) => {
  try {
    const messages = WhatsAppService.getMessages();
    res.json({ success: true, data: messages });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error getting messages' });
  }
};

