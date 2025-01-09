// src/app.ts
import express from 'express';
import swaggerUi from 'swagger-ui-express';
import swaggerDocument from '../swagger.json';
import whatsappRoutes from './routes/whatsapp.routes';
import WhatsAppService from './services/whatsapp.service';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.use('/api/whatsapp', whatsappRoutes);

WhatsAppService.connect()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error('Failed to start WhatsApp service:', error);
    process.exit(1);
  });

// tests/whatsapp.test.ts