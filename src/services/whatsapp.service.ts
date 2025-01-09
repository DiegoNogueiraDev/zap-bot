// src/services/whatsapp.service.ts
import makeWASocket, { 
    DisconnectReason,
    useMultiFileAuthState,
    makeInMemoryStore,
    proto
  } from '@adiwajshing/baileys';
  import { Boom } from '@hapi/boom';
  import { logger } from '../config/whatsapp.config';
  import { WhatsAppMessage } from '../types/whatsapp.types';
  
  class WhatsAppService {
    private sock: any;
    private store: any;
    private qr: string = '';
    private messages: proto.IWebMessageInfo[] = [];
  
    constructor() {
      this.store = makeInMemoryStore({});
      this.store.readFromFile('./baileys_store.json');
      setInterval(() => {
        this.store.writeToFile('./baileys_store.json');
      }, 10000);
    }
  
    async connect() {
      const { state, saveCreds } = await useMultiFileAuthState('auth_info_baileys');
      
      this.sock = makeWASocket({
        printQRInTerminal: true,
        auth: state,
        logger: logger
      });
  
      this.store.bind(this.sock.ev);
  
      this.sock.ev.on('connection.update', async (update: any) => {
        const { connection, lastDisconnect, qr } = update;
  
        if (qr) {
          this.qr = qr;
        }
  
        if (connection === 'close') {
          const shouldReconnect = (lastDisconnect?.error as Boom)?.output?.statusCode !== DisconnectReason.loggedOut;
          if (shouldReconnect) {
            await this.connect();
          }
        }
      });
  
      this.sock.ev.on('creds.update', saveCreds);
  
      this.sock.ev.on('messages.upsert', (m: any) => {
        this.messages.push(...m.messages);
      });
    }
  
    async sendMessage(data: WhatsAppMessage) {
      try {
        const { to, message } = data;
        await this.sock.sendMessage(to, { text: message });
        return { success: true, message: 'Message sent successfully' };
      } catch (error) {
        logger.error('Error sending message:', error);
        throw error;
      }
    }
  
    getQR() {
      return this.qr;
    }
  
    async logout() {
      try {
        await this.sock.logout();
        return { success: true, message: 'Logged out successfully' };
      } catch (error) {
        logger.error('Error logging out:', error);
        throw error;
      }
    }
  
    getMessages() {
      return this.messages;
    }
  }
  
  export default new WhatsAppService();