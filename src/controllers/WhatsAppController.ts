import { Request, Response } from 'express';
import WhatsAppClient from '../services/WhatsAppClient';
import QRCodeLog from '../models/QRCodeLog';
import Logout from '../models/Logout';

// Mapa para armazenar instâncias de clientes por usuário
const clients = new Map<string, WhatsAppClient>();

export const initializeClient = async (req: Request, res: Response) => {
    try {
        const { userId } = req.body;
        
        if (!userId) {
            return res.status(400).json({ error: 'userId é obrigatório' });
        }

        // Verifica se já existe um cliente para este usuário
        if (clients.has(userId)) {
            return res.status(400).json({ error: 'Cliente já está inicializado para este usuário' });
        }

        const client = new WhatsAppClient();
        await client.initialize(userId);
        clients.set(userId, client);

        res.status(200).json({ 
            message: 'Cliente WhatsApp inicializado com sucesso',
            userId 
        });
    } catch (error) {
        console.error('Erro ao inicializar cliente:', error);
        res.status(500).json({ error: 'Erro ao inicializar o cliente WhatsApp' });
    }
};

export const sendMessage = async (req: Request, res: Response) => {
    try {
        const { userId, to, content } = req.body;
        
        if (!userId || !to || !content) {
            return res.status(400).json({ error: 'userId, to e content são obrigatórios' });
        }

        const client = clients.get(userId);
        if (!client) {
            return res.status(404).json({ error: 'Cliente não encontrado' });
        }

        await client.sendMessage(to, content);
        res.status(200).json({ message: 'Mensagem enviada com sucesso' });
    } catch (error) {
        console.error('Erro ao enviar mensagem:', error);
        res.status(500).json({ error: 'Erro ao enviar mensagem' });
    }
};

export const logout = async (req: Request, res: Response) => {
    try {
        const { userId } = req.body;
        
        if (!userId) {
            return res.status(400).json({ error: 'userId é obrigatório' });
        }

        const client = clients.get(userId);
        if (!client) {
            return res.status(404).json({ error: 'Cliente não encontrado' });
        }

        client.disconnect();
        clients.delete(userId);

        await Logout.create({ userId, loggedOutAt: new Date() });

        res.status(200).json({ message: 'Logout realizado com sucesso' });
    } catch (error) {
        console.error('Erro ao realizar logout:', error);
        res.status(500).json({ error: 'Erro ao realizar logout' });
    }
};

export const logQRCode = async (req: Request, res: Response) => {
    const { userId, qrCode } = req.body; // Supondo que o userId e qrCode são enviados no corpo da requisição
    const newQRCodeLog = new QRCodeLog({ userId, qrCode, generatedAt: new Date() }); // Cria um novo log de QR Code
    try {
        await newQRCodeLog.save(); // Salva no MongoDB
        res.status(201).json({ message: 'QR Code registrado com sucesso.' });
    } catch (error) {
        res.status(500).json({ error: 'Erro ao registrar QR Code.' });
    }
};