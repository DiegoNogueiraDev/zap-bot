import Logout from '../models/Logout';
import { Request, Response } from 'express';

export const createLogout = async (req: Request, res: Response) => {
    const newLogout = new Logout(req.body);
    try {
        const savedLogout = await newLogout.save();
        res.status(201).json(savedLogout);
    } catch (error) {
        res.status(500).json(error);
    }
};