import express from 'express';
import { logger } from './config/whatsapp.config';
import WhatsAppService from './services/whatsapp.service';
import whatsappRoutes from './routes/whatsapp.routes';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Rotas do WhatsApp
app.use('/api/whatsapp', whatsappRoutes);

// Rota de saúde
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Inicializa o serviço do WhatsApp
WhatsAppService.connect()
  .then(() => {
    logger.info('Serviço WhatsApp iniciado');
  })
  .catch((error) => {
    logger.error('Erro ao iniciar serviço WhatsApp:', error);
  });

app.listen(PORT, () => {
  logger.info(`Servidor rodando na porta ${PORT}`);
});