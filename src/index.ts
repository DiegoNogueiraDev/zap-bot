import express from 'express';
import connectDB from './config/database';
import authRoutes from './routes/authRoutes';
import sentMessageRoutes from './routes/sentMessageRoutes';
import receivedMessageRoutes from './routes/receivedMessageRoutes';
import logoutRoutes from './routes/logoutRoutes';
import qrCodeLogRoutes from './routes/qrCodeLogRoutes';
const app = express();
app.use(express.json());
connectDB();

// Integrando as rotas
app.use('/api', authRoutes);
app.use('/api', sentMessageRoutes);
app.use('/api', receivedMessageRoutes);
app.use('/api', logoutRoutes);
app.use('/api', qrCodeLogRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});