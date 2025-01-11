import QRCodeLog from '../models/QRCodeLog';
import { Request, Response } from 'express';

export const createQRCodeLog = async (req: Request, res: Response) => {
    const newQRCodeLog = new QRCodeLog(req.body);
    try {
        const savedQRCodeLog = await newQRCodeLog.save();
        res.status(201).json(savedQRCodeLog);
    } catch (error) {
        res.status(500).json(error);
    }
};