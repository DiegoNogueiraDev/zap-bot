import SentMessage from '../models/SentMessage';
import { Request, Response } from 'express';

export const createSentMessage = async (req: Request, res: Response) => {
    const newMessage = new SentMessage(req.body);
    try {
        const savedMessage = await newMessage.save();
        res.status(201).json(savedMessage);
    } catch (error) {
        res.status(500).json(error);
    }
};