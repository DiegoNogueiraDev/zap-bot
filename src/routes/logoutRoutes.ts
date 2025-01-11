import express from 'express';
import { createLogout } from '../controllers/LogoutController';

const router = express.Router();

router.post('/logout', createLogout); // Rota para logout

export default router;