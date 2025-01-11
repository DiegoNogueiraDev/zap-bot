import express from 'express';
import { createAuth } from '../controllers/AuthController';

const router = express.Router();

router.post('/auth', createAuth); // Rota para criar autenticação

// Adicione outras rotas como login, refresh token, etc.

export default router;