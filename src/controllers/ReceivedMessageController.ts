import ReceivedMessage from '../models/ReceivedMessage';
import { Request, Response } from 'express';

export const createReceivedMessage = async (req: Request, res: Response) => {  
    const newMessage = new ReceivedMessage(req.body);
    try {
        const savedMessage = await newMessage.save();
        res.status(201).json(savedMessage);
    } catch (error) {
        res.status(500).json(error);
    }
};