import makeWASocket, {
    Browsers,
    WASocket,
    makeInMemoryStore,
} from '@whiskeysockets/baileys';
import qrcode from 'qrcode-terminal';
import WhatsAppCredentials from '../models/WhatsAppCredentials';


class WhatsAppClient {
    private sock: WASocket | null;
    private isConnected: boolean;
    private userId: string;

    constructor() {
        this.sock = null;
        this.isConnected = false;
        this.userId = '';
    }

    async initialize(userId: string): Promise<void> {
        try {
            this.userId = userId;
            const credentials = await this.getStoredCredentials();
            this.sock = await this.createConnection(credentials);
            this.setupEventListeners();
        } catch (error) {
            console.error('Erro na inicialização do WhatsApp:', error);
            throw error;
        }
    }

    private async getStoredCredentials(): Promise<any | null> {
        try {
            const credentials = await WhatsAppCredentials.findOne({ userId: this.userId });
            console.log('Credenciais recuperadas:', credentials); // Log para depuração
            return credentials?.authCredentials || null;
        } catch (error) {
            console.error('Erro ao buscar credenciais:', error);
            return null;
        }
    }

    private async createConnection(credentials: any | null): Promise<WASocket> {
        const keyStore = makeInMemoryStore({});
        const socketConfig = {
            browser: Browsers.ubuntu('Chrome'),
            printQRInTerminal: !credentials,
            auth: credentials ? credentials : { creds: {}, keys: keyStore }
        };

        return makeWASocket(socketConfig);
    }

    private setupEventListeners(): void {
        if (!this.sock) return;

        // Evento de atualização de credenciais
        this.sock.ev.on('creds.update', async (credentials: any) => {
            await this.saveCredentials(credentials);
        });

        // Evento de QR Code
        this.sock.ev.on('connection.update', (update: any) => {
            const qr = update.qr; // Verifique se o QR Code está disponível no objeto de atualização
            if (qr) {
                qrcode.generate(qr, { small: true });
                console.log('\nPor favor, escaneie o QR Code para conectar ao WhatsApp\n');
            }
        });

        // Evento de atualização de conexão
        this.sock.ev.on('connection.update', (update: any) => {
            const { connection } = update;
            this.isConnected = connection === 'open';
            
            if (connection === 'open') {
                console.log('Conexão estabelecida com sucesso!');
            } else if (connection === 'close') {
                console.log('Conexão encerrada');
            }
        });

        // Evento de mensagens
        this.sock.ev.on('messages.upsert', this.handleNewMessage.bind(this));
    }

    private async saveCredentials(credentials: any): Promise<void> {
        try {
            await WhatsAppCredentials.findOneAndUpdate(
                { userId: this.userId },
                {
                    userId: this.userId,
                    authCredentials: credentials,
                    updatedAt: new Date()
                },
                { upsert: true, new: true }
            );
            console.log('Credenciais salvas com sucesso');
        } catch (error) {
            console.error('Erro ao salvar credenciais:', error);
            throw error;
        }
    }

    private handleNewMessage(messageUpdate: any): void {
        const message = messageUpdate.messages[0];
        if (!message?.key?.fromMe) {
            console.log('Nova mensagem recebida:', {
                from: message.key.remoteJid,
                message: message.message?.conversation || 
                         message.message?.extendedTextMessage?.text || 
                         'Mensagem não textual'
            });
        }
    }

    async sendMessage(to: string, content: string): Promise<void> {
        if (!this.isConnected || !this.sock) {
            throw new Error('Cliente não está conectado ao WhatsApp');
        }

        try {
            await this.sock.sendMessage(to, { text: content });
            console.log(`Mensagem enviada para ${to}`);
        } catch (error) {
            console.error('Erro ao enviar mensagem:', error);
            throw error;
        }
    }

    public disconnect(): void {
        if (this.sock) {
            this.sock.end(new Error('Desconectado pelo usuário'));
            this.sock = null;
            this.isConnected = false;
            console.log('Desconectado do WhatsApp');
        }
    }
}

export default WhatsAppClient;