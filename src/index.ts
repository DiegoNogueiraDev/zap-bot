import express from 'express';
import connectDB from './config/database';
import whatsAppRoutes from './routes/whatsAppRoutes'; // Importa as rotas do WhatsApp

const app = express();
app.use(express.json());
connectDB();

// Integrando as rotas
app.use('/api', whatsAppRoutes); // Adiciona as rotas do WhatsApp

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});