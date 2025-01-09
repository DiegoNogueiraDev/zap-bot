import { Request, Response } from 'express';
import WhatsAppService from '../services/whatsapp.service';

interface WhatsAppMessageRequest {
  to: string;
  message: string;
}

export const sendMessage = async (req: Request, res: Response) => {
  try {
    const { to, message } = req.body as WhatsAppMessageRequest;
    const result = await WhatsAppService.sendMessage(to, message);
    res.json(result);
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Erro ao enviar mensagem',
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    });
  }
};

export const getQR = (req: Request, res: Response) => {
  try {
    const qr = WhatsAppService.getQR();
    res.json({ success: true, data: qr });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Erro ao obter QR code',
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    });
  }
};

export const logout = async (req: Request, res: Response) => {
  try {
    const result = await WhatsAppService.logout();
    res.json(result);
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Erro ao desconectar',
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    });
  }
};

export const getMessages = (req: Request, res: Response) => {
  try {
    const messages = WhatsAppService.getMessages();
    res.json({ success: true, data: messages });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Erro ao obter mensagens',
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    });
  }
};