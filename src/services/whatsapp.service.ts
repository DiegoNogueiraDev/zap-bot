import makeWASocket, { 
  DisconnectReason,
  useMultiFileAuthState,
  makeInMemoryStore,
  proto,
  WASocket
} from '@adiwajshing/baileys';
import { Boom } from '@hapi/boom';
import { logger } from '../config/whatsapp.config';
import type { Logger } from 'pino';
import P from 'pino';
import fs from 'fs';
import path from 'path';
import qrcode from 'qrcode-terminal';

class WhatsAppService {
  private sock: WASocket | undefined;
  private store: ReturnType<typeof makeInMemoryStore>;
  private qr: string = '';
  private messages: proto.IWebMessageInfo[] = [];
  private AUTH_FOLDER = 'auth_info_baileys';
  private STORE_FOLDER = '.store';
  private reconnectAttempts = 0;
  private MAX_RECONNECT_ATTEMPTS = 5;

  constructor() {
    // Ensure directories exist
    [this.AUTH_FOLDER, this.STORE_FOLDER].forEach(dir => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
        logger.info(`Diretório ${dir} criado`);
      }
    });

    this.store = makeInMemoryStore({});
    const storeFile = path.join(this.STORE_FOLDER, 'store.json');
    this.store.readFromFile(storeFile);
    
    setInterval(() => {
      this.store.writeToFile(storeFile);
    }, 10000);
  }

  async connect() {
    try {
      logger.info('Iniciando conexão com WhatsApp...');
      
      const { state, saveCreds } = await useMultiFileAuthState(this.AUTH_FOLDER);
      logger.info('Estado de autenticação carregado');
      
      // Criar socket com mais informações de debug
      this.sock = makeWASocket({
        printQRInTerminal: false, // Vamos gerenciar o QR manualmente
        auth: state,
        browser: ['WhatsApp Bot', 'Firefox', '2.0.0'],
        // @ts-ignore
        logger: P({ 
          level: process.env.NODE_ENV === 'production' ? 'error' : 'debug'
        })
      });

      this.store.bind(this.sock.ev);

      // Gerenciamento de conexão
      this.sock.ev.on('connection.update', async (update: any) => {
        const { connection, lastDisconnect, qr } = update;
        logger.info('Atualização de conexão:', { 
          connection, 
          hasQR: !!qr,
          disconnectReason: lastDisconnect?.error?.message,
          attempts: this.reconnectAttempts
        });

        if (qr) {
          // Gerar QR code no terminal
          qrcode.generate(qr, { small: true });
          this.qr = qr;
          logger.info('Novo QR Code gerado. Por favor, escaneie com seu WhatsApp');
        }

        if (connection === 'close') {
          const statusCode = (lastDisconnect?.error as Boom)?.output?.statusCode;
          const shouldReconnect = statusCode !== DisconnectReason.loggedOut;
          
          logger.warn('Conexão fechada:', { 
            statusCode,
            reason: lastDisconnect?.error?.message,
            shouldReconnect,
            attempts: this.reconnectAttempts
          });

          if (shouldReconnect && this.reconnectAttempts < this.MAX_RECONNECT_ATTEMPTS) {
            this.reconnectAttempts++;
            logger.info(`Tentativa de reconexão ${this.reconnectAttempts} de ${this.MAX_RECONNECT_ATTEMPTS}`);
            setTimeout(() => this.connect(), 3000 * this.reconnectAttempts);
          } else if (this.reconnectAttempts >= this.MAX_RECONNECT_ATTEMPTS) {
            logger.error('Número máximo de tentativas de reconexão atingido');
            await this.clearCredentials();
            this.reconnectAttempts = 0;
            this.connect();
          }
        } else if (connection === 'open') {
          this.reconnectAttempts = 0;
          logger.info('Conexão estabelecida com sucesso!');
        }
      });

      // Atualização de credenciais
      this.sock.ev.on('creds.update', async () => {
        logger.info('Credenciais atualizadas');
        await saveCreds();
      });

      // Recebimento de mensagens
      this.sock.ev.on('messages.upsert', (m: any) => {
        this.messages.push(...m.messages);
        logger.info('Nova mensagem recebida:', {
          from: m.messages[0]?.key?.remoteJid,
          type: m.type,
          messageType: Object.keys(m.messages[0]?.message || {})[0]
        });
      });

    } catch (error) {
      logger.error('Erro durante a conexão:', error);
      throw error;
    }
  }

  private async clearCredentials() {
    try {
      logger.info('Limpando credenciais...');
      const files = fs.readdirSync(this.AUTH_FOLDER);
      for (const file of files) {
        fs.unlinkSync(path.join(this.AUTH_FOLDER, file));
      }
      logger.info('Credenciais removidas com sucesso');
    } catch (error) {
      logger.error('Erro ao limpar credenciais:', error);
    }
  }

  async sendMessage(to: string, message: string) {
    try {
      if (!this.sock) throw new Error('WhatsApp não está conectado');
      
      await this.sock.sendMessage(to, { text: message });
      logger.info(`Mensagem enviada com sucesso para ${to}`);
      return { success: true, message: 'Mensagem enviada com sucesso' };
    } catch (error) {
      logger.error('Erro ao enviar mensagem:', error);
      throw error;
    }
  }

  getQR() {
    return this.qr;
  }

  async logout() {
    try {
      if (!this.sock) throw new Error('WhatsApp não está conectado');

      await this.sock.logout();
      await this.clearCredentials();
      logger.info('Desconectado com sucesso');
      return { success: true, message: 'Desconectado com sucesso' };
    } catch (error) {
      logger.error('Erro ao desconectar:', error);
      throw error;
    }
  }

  getMessages() {
    return this.messages;
  }
}

export default new WhatsAppService();