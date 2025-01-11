import Auth from '../models/Auth';
import { Request, Response } from 'express'; 

export const createAuth = async (req: Request, res: Response) => { 
    const newAuth = new Auth(req.body);
    try {
        const savedAuth = await newAuth.save();
        res.status(201).json(savedAuth);
    } catch (error) {
        res.status(500).json(error);
    }
};

// Adicione outros métodos como login, refresh token, etc.