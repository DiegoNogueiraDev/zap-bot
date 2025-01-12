// 📄 WhatsAppBot.ts (Parte 1)
// 📝 Documentação completa do arquivo. Esta parte cobre a configuração inicial e a definição de variáveis e tipos.

import makeWASocket, { DisconnectReason } from '@whiskeysockets/baileys';
import { MongoClient } from 'mongodb';
import { useMongoDBAuthState } from 'mongo-baileys';
import pino from 'pino';
import dotenv from 'dotenv';

// 🔧 Carrega variáveis de ambiente do arquivo .env para o processo
dotenv.config();
console.log('📝 Variáveis de ambiente carregadas');

// 🔗 Configuração do MongoDB
// A URI do MongoDB e o nome do banco de dados são lidos das variáveis de ambiente
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017';
const DB_NAME = process.env.DB_NAME || 'whatsapp-bot';
console.log(`📊 Configuração MongoDB:\n  URI: ${MONGODB_URI}\n  Database: ${DB_NAME}`);

/**
 * 📄 Interface para o documento de autenticação armazenado no MongoDB.
 * - _id: Identificador único do documento.
 * - creds: Credenciais do WhatsApp (tokens de sessão, etc.).
 * - keys: Chaves de criptografia usadas na comunicação.
 */
interface AuthDocument {
    _id: string;
    creds: any;
    keys: Map<any, any>;
}

// ⚠️ Parte 1 documentada!
// A próxima parte incluirá a classe principal "WhatsAppBot" com seus métodos e eventos.
// 📄 WhatsAppBot.ts (Parte 2)
// 📝 Continuação da documentação da classe principal WhatsAppBot.

class WhatsAppBot {
    private sock: any; // 🔌 Socket do WhatsApp utilizado para comunicação
    private mongoClient: MongoClient | null = null; // 🔗 Conexão com o MongoDB
    public isConnected: boolean; // 📡 Indica se o bot está conectado ao WhatsApp
    private reconnectAttempts: number = 0; // 🔄 Tentativas de reconexão após falha
    private readonly MAX_RECONNECT_ATTEMPTS = 5; // 🔄 Limite máximo de tentativas de reconexão
    private readonly RECONNECT_INTERVAL = 5000; // ⏳ Intervalo entre tentativas de reconexão (em milissegundos)
    private keepAliveInterval: NodeJS.Timeout | null = null; // 📡 Intervalo de keep-alive para manter a conexão ativa
    private connectionCheckInterval: NodeJS.Timeout | null = null; // 📶 Verificação periódica da conexão
    private readonly DB_NAME = process.env.DB_NAME || 'whatsapp-bot'; // 🗄️ Nome do banco de dados utilizado

    /**
     * 🔧 Construtor da classe WhatsAppBot.
     * Inicializa o cliente do MongoDB e configura os estados iniciais do bot.
     */
    constructor() {
        console.log('🔧 Inicializando WhatsAppBot...');
        this.sock = null;
        this.mongoClient = new MongoClient(MONGODB_URI);
        this.isConnected = false;
        console.log('✨ WhatsAppBot inicializado');
    }

    // ⚙️ Métodos de configuração e ciclo de vida serão documentados na próxima parte.

    /**
         * 🖥️ Método startConnectionMonitoring()
         * Esse método inicia dois intervalos periódicos para garantir que a conexão com o WhatsApp permaneça estável:
         * - keepAliveInterval: envia um sinal de "keep-alive" a cada 30 segundos, garantindo que a conexão não expire por inatividade.
         * - connectionCheckInterval: verifica o estado da conexão a cada 15 segundos e, caso detecte instabilidade, chama o método de reconexão.
         */
    private startConnectionMonitoring() {
        // 🕒 Intervalo de keep-alive para enviar sinais periódicos ao servidor do WhatsApp.
        this.keepAliveInterval = setInterval(() => {
            if (this.sock?.ws?.readyState === 1) { // 🖥️ Verifica se o WebSocket está aberto.
                this.sock.ws.ping(); // 📡 Envia um sinal de "ping" para manter a conexão ativa.
                console.log('📡 Keep-alive enviado');
            }
        }, 30000); // ⏰ Intervalo de 30 segundos.

        // 🕵️‍♂️ Intervalo para verificar a estabilidade da conexão.
        this.connectionCheckInterval = setInterval(() => {
            if (this.sock?.ws?.readyState !== 1) { // 🖥️ Se o WebSocket não estiver em estado "aberto"...
                console.log('⚠️ Conexão instável detectada');
                this.handleReconnect(); // 🔄 Chama o método de reconexão.
            }
        }, 15000); // ⏰ Intervalo de 15 segundos.
    }

    // ⚙️ Métodos de configuração e ciclo de vida serão documentados na próxima parte.

    /**
     * 🛑 Método stopConnectionMonitoring
     * Finaliza o monitoramento da conexão com o servidor do WhatsApp.
     * Esse método é chamado para interromper os intervalos de verificação de conexão e envio de keep-alive.
     */
    private stopConnectionMonitoring() {
        // 📡 Se o keep-alive estiver ativo, interrompe o intervalo.
        if (this.keepAliveInterval) clearInterval(this.keepAliveInterval);

        // 📶 Se o monitoramento de conexão estiver ativo, interrompe o intervalo.
        if (this.connectionCheckInterval) clearInterval(this.connectionCheckInterval);

        // 🔄 Reseta as variáveis de controle dos intervalos para null.
        this.keepAliveInterval = null;
        this.connectionCheckInterval = null;

        console.log('🛑 Monitoramento de conexão interrompido');
    }


    /**
     * 🔄 Método handleReconnect
     * Gerencia o processo de reconexão ao servidor do WhatsApp em caso de perda de conexão.
     * Utiliza uma lógica de backoff exponencial para tentar reconectar várias vezes antes de desistir.
     */
    private async handleReconnect() {
        if (this.reconnectAttempts < this.MAX_RECONNECT_ATTEMPTS) {
            this.reconnectAttempts++;
            const delay = this.RECONNECT_INTERVAL * Math.pow(2, this.reconnectAttempts - 1);
            console.log(`🔄 Tentativa de reconexão ${this.reconnectAttempts}/${this.MAX_RECONNECT_ATTEMPTS} em ${delay / 1000}s`);

            // ⏳ Pausa antes de tentar reconectar novamente, com um tempo de espera progressivo.
            await new Promise(resolve => setTimeout(resolve, delay));

            try {
                // 🔄 Reseta a conexão antes de tentar reconectar.
                await this.resetConnection();
                console.log('⏳ Tentando reconectar...');
                await this.connect();
            } catch (error) {
                console.error('❌ Falha na reconexão:', error);
            }
        } else {
            console.error('⛔ Máximo de tentativas de reconexão atingido.');
            await this.disconnect();
        }
    }
         

    /**
     * 🔄 Método resetConnection
     * Reseta a conexão do socket e libera recursos relacionados ao WebSocket.
     * Esse método é chamado antes de tentar reconectar ou quando a conexão precisa ser reiniciada.
     */
    private async resetConnection() {
        try {
            if (this.sock) {
                // 🛑 Remove todos os listeners de eventos para evitar conflitos.
                this.sock.ev.removeAllListeners();

                // 🔌 Fecha o WebSocket sem forçar o logout.
                if (this.sock.ws) {
                    this.sock.ws.close();
                }

                // 🚫 Define o socket como null para indicar que a conexão foi encerrada.
                this.sock = null;
            }

            // ❌ Marca o estado como desconectado.
            this.isConnected = false;
            console.log('🔄 Conexão resetada');
        } catch (error) {
            // ⚠️ Captura e exibe erros que possam ocorrer durante o processo de reset.
            console.error('⚠️ Erro ao resetar conexão:', error);
        }
    }   
    

    /**
         * 🔗 Método ensureMongoConnection
         * Garante que a conexão com o banco de dados MongoDB esteja ativa.
         * Se a conexão estiver inativa, o método tenta reconectar.
         * Se a conexão falhar, um erro será lançado.
         */
    private async ensureMongoConnection(): Promise<void> {
        try {
            // 📡 Verifica se o cliente MongoDB já está instanciado.
            if (!this.mongoClient) {
                console.log('🔄 Criando nova conexão MongoDB...');
                this.mongoClient = new MongoClient(MONGODB_URI);
            }

            // ✅ Tenta verificar a conexão atual com o banco de dados.
            try {
                await this.mongoClient.db().admin().ping();
                console.log('✅ Conexão MongoDB existente verificada');
            } catch (error) {
                // 🔄 Se a verificação falhar, tenta reconectar.
                console.log('🔄 Reconectando ao MongoDB...');
                await this.mongoClient.connect();
                console.log('✅ Nova conexão MongoDB estabelecida');
            }
        } catch (error) {
            // ❌ Se houver um erro na conexão, lança uma exceção.
            console.error('❌ Erro ao conectar ao MongoDB:', error);
            throw new Error('Falha ao conectar com MongoDB');
        }
    }
    
    
    /**
     * 🔐 Método getAuthState
     * Obtém o estado de autenticação do MongoDB, garantindo que o bot consiga recuperar a sessão existente.
     * Caso o cliente MongoDB não esteja inicializado, lança um erro.
     * Verifica a collection de autenticação no banco de dados e utiliza o helper `useMongoDBAuthState` para carregar o estado.
     * @returns O estado de autenticação carregado do MongoDB.
     * @throws Lança um erro se o estado de autenticação for inválido ou se houver falha na obtenção.
     */
    private async getAuthState() {
        // 🚨 Garante que o cliente MongoDB está inicializado.
        if (!this.mongoClient) {
            throw new Error('Cliente MongoDB não inicializado');
        }

        try {
            // 📁 Obtém a collection "auth" do banco de dados.
            const collection = this.mongoClient.db(this.DB_NAME).collection<AuthDocument>('auth');
            console.log('📁 Collection de autenticação selecionada');

            // 🔐 Carrega o estado de autenticação usando o helper `useMongoDBAuthState`.
            const authState = await useMongoDBAuthState(collection as any);
            console.log('🔐 Estado de autenticação carregado');

            // 🚨 Verifica se o estado de autenticação é válido.
            if (!authState || !authState.state) {
                throw new Error('Estado de autenticação inválido');
            }

            // ✅ Retorna o estado de autenticação carregado.
            return authState;
        } catch (error) {
            // ❌ Captura e exibe erros que possam ocorrer durante a obtenção do estado de autenticação.
            console.error('❌ Erro ao obter estado de autenticação:', error);
            throw new Error('Falha ao obter estado de autenticação');
        }
    }

    /**
     * 🚀 Método connect
     * Inicia o processo de conexão do bot com o WhatsApp usando o estado de autenticação salvo no MongoDB.
     * Configura o socket do WhatsApp, aguardando a conexão e tratando eventos importantes durante o ciclo de vida da conexão.
     * @throws Lança um erro se ocorrer alguma falha durante o processo de conexão.
     */
    async connect() {
        try {
            console.log('🚀 Iniciando processo de conexão...');

            // 🔄 Garante que a conexão com o MongoDB está ativa.
            await this.ensureMongoConnection();

            // 🚨 Verifica se o cliente MongoDB está inicializado corretamente.
            if (!this.mongoClient) {
                throw new Error('MongoDB client não está inicializado');
            }

            // 📁 Obtém a coleção de autenticação no MongoDB.
            const collection = this.mongoClient.db(this.DB_NAME).collection('auth');

            // 🔐 Carrega o estado de autenticação usando o helper `useMongoDBAuthState`.
            const { state, saveCreds } = await useMongoDBAuthState(collection as any);

            // 📲 Configura o socket do WhatsApp com as credenciais carregadas.
            this.sock = makeWASocket({
                printQRInTerminal: true, // Exibe o QR Code no terminal para autenticação.
                auth: state, // Usa o estado de autenticação carregado.
                logger: pino({ level: 'silent' }), // Configura o logger para minimizar logs.
                browser: ['Zap Bot', 'Chrome', '1.0.0'], // Define informações do cliente para a sessão do WhatsApp.
                connectTimeoutMs: 60000, // Tempo limite para conexão.
                keepAliveIntervalMs: 30000, // Intervalo para manter a conexão viva.
                defaultQueryTimeoutMs: 60000, // Tempo limite para consultas.
                retryRequestDelayMs: 5000, // Tempo de espera entre tentativas de reconexão.
                markOnlineOnConnect: false // Evita marcar o bot como online ao conectar.
            });

            // ⏳ Aguarda o estabelecimento da conexão com o servidor do WhatsApp.
            await new Promise<void>((resolve, reject) => {
                // 🕒 Configura um timeout para evitar espera indefinida.
                const connectionTimeout = setTimeout(() => {
                    reject(new Error('Timeout ao aguardar conexão'));
                }, 60000);

                // 📡 Monitora as atualizações de conexão do socket.
                this.sock?.ev.on('connection.update', (update: any) => {
                    const { connection, lastDisconnect } = update;

                    if (connection === 'open') {
                        // 🟢 Conexão estabelecida com sucesso.
                        clearTimeout(connectionTimeout);
                        resolve();
                    } else if (connection === 'close') {
                        // 🔴 Conexão fechada, verifica o status de desconexão.
                        const statusCode = lastDisconnect?.error?.output?.statusCode;

                        // 🚨 Se não for um logout intencional, rejeita a promessa.
                        if (statusCode !== DisconnectReason.loggedOut) {
                            clearTimeout(connectionTimeout);
                            reject(new Error(`Conexão fechada com status: ${statusCode}`));
                        }
                    }
                });
            });

            // 🎯 Configura os listeners de eventos e monitora a conexão.
            await this.setupEventListeners(saveCreds);
            this.isConnected = true; // ✅ Marca o bot como conectado.
            console.log('✨ Conexão estabelecida com sucesso');

        } catch (error) {
            // ❌ Trata erros que possam ocorrer durante o processo de conexão.
            console.error('❌ Erro durante conexão:', error);

            // 🔌 Desconecta de forma segura se ocorrer um erro.
            await this.safeDisconnect();
            throw error;
        }
    }

    /**
     * 📡 Método setupEventListeners
     * Configura os event listeners do socket do WhatsApp para monitorar eventos importantes durante a conexão.
     * Monitora eventos como conexão aberta, fechada e erros de WebSocket.
     * @param saveCreds Função para salvar as credenciais de autenticação quando atualizadas.
     */
    private async setupEventListeners(saveCreds: () => Promise<void>): Promise<void> {
        if (!this.sock) return; // 🚨 Garante que o socket está inicializado antes de configurar os listeners.

        // ✅ Listener para evento de WebSocket aberto.
        if (this.sock.ws) {
            this.sock.ws.on('open', () => {
                console.log('✅ WebSocket conectado');
            });

            // ❌ Listener para evento de WebSocket fechado.
            this.sock.ws.on('close', (code: number, reason: string) => {
                console.log(`❌ WebSocket fechado (${code}): ${reason}`);
                if (this.isConnected) {
                    this.handleReconnect(); // 🔄 Tenta reconectar se a conexão estiver ativa.
                }
            });

            // ⚠️ Listener para erros de WebSocket.
            this.sock.ws.on('error', (error: Error) => {
                console.error('❌ Erro no WebSocket:', error);
                if (this.isConnected) {
                    this.handleReconnect(); // 🔄 Tenta reconectar em caso de erro.
                }
            });
        }
    }

   /**
     * 📡 Método handleConnectionUpdate
     * Monitora as atualizações de estado da conexão do bot com o WhatsApp.
     * Este método é chamado sempre que há mudanças na conexão, como abertura, fechamento ou exibição do QR Code.
     * @param update Informações sobre o estado da conexão.
    */
   private handleConnectionUpdate(update: any) {

        const { connection, lastDisconnect, qr } = update;

        // 📱 Exibe o QR Code no terminal, se disponível.
        if (qr) {
            console.log('📱 QR Code disponível! Escaneie para conectar.');
        }

        // 🟢 Conexão aberta com sucesso.
        if (connection === 'open') {
            this.isConnected = true;
            this.reconnectAttempts = 0;
            console.log('🟢 Conectado ao WhatsApp!');
        }

        // 🔴 Conexão fechada.
        if (connection === 'close') {
            this.isConnected = false;

            // 📝 Obtém o motivo da desconexão.
            const reason = lastDisconnect?.error?.message || 'Motivo desconhecido';
            console.log(`🔴 Conexão fechada. Motivo: ${reason}`);

            // 🔄 Tenta reconectar apenas se não for um logout intencional.
            if (lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut) {
                console.log('🔄 Tentando reconectar...');
                this.handleReconnect();
            } else {
                console.log('⛔ Logout detectado - Reconexão não será tentada.');
            }
        }
    }
            
    /**
     * 📩 Método handleMessage
     * Este método é acionado sempre que o bot recebe uma nova mensagem no WhatsApp.
     * Ele processa a mensagem recebida e exibe informações importantes no console, como o remetente, o conteúdo da mensagem e o horário.
     * @param msg Objeto que contém as mensagens recebidas do WhatsApp.
     */
    private handleMessage(msg: any) {
        try {
            // 📩 Extrai a primeira mensagem do array de mensagens recebidas.
            const message = msg.messages[0];

            // 🧩 Verifica se a mensagem não foi enviada pelo próprio bot.
            if (!message?.key?.fromMe) {
                // 📄 Exibe detalhes da mensagem no console.
                console.log('📩 Nova mensagem:', {
                    from: message.key.remoteJid, // Remetente da mensagem.
                    content: message.message?.conversation || 
                            message.message?.extendedTextMessage?.text || 
                            'Mensagem não textual', // Conteúdo da mensagem.
                    timestamp: new Date(message.messageTimestamp * 1000) // Horário em que a mensagem foi enviada.
                });
            }
        } catch (error) {
            // ❌ Trata erros que possam ocorrer durante o processamento da mensagem.
            console.error('❌ Erro ao processar mensagem:', error);
        }
    }

    /**
     * 📤 Método sendMessage
     * Envia uma mensagem de texto para um número específico no WhatsApp.
     * Verifica se o bot está conectado antes de tentar enviar a mensagem.
     * @param to Número de telefone do destinatário (formato internacional).
     * @param text Texto da mensagem a ser enviada.
     * @throws Lança um erro se o bot não estiver conectado ou se houver falha no envio da mensagem.
     */
    async sendMessage(to: string, text: string) {
        // 🚨 Verifica se o bot está conectado antes de enviar a mensagem.
        if (!this.isConnected) {
            throw new Error('WhatsApp não está conectado');
        }

        try {
            // 📱 Formata o número do destinatário para o formato correto.
            const number = to.includes('@s.whatsapp.net') ? to : `${to}@s.whatsapp.net`;

            // ✉️ Envia a mensagem para o destinatário.
            await this.sock.sendMessage(number, { text });
            console.log(`✅ Mensagem enviada para ${to}: "${text}"`);
        } catch (error) {
            // ❌ Trata erros que possam ocorrer durante o envio da mensagem.
            console.error(`❌ Erro ao enviar mensagem para ${to}:`, error);
            throw error;
        }
    }

    /**
     * 🔌 Método disconnect
     * Desconecta o bot do WhatsApp, interrompendo qualquer monitoramento ou conexão ativa.
     * Também fecha a conexão com o MongoDB e limpa recursos utilizados.
     * @throws Lança um erro se ocorrer falha durante o processo de desconexão.
     */
    async disconnect() {
        try {
            // 🛑 Interrompe o monitoramento de conexão.
            this.stopConnectionMonitoring();

            // 🔄 Reseta a conexão do bot.
            await this.resetConnection();

            // 🗄️ Fecha a conexão com o MongoDB, se estiver ativa.
            if (this.mongoClient) {
                await this.mongoClient.close();
                this.mongoClient = null;
            }

            console.log('👋 Desconectado com sucesso');
        } catch (error) {
            // ❌ Trata erros que possam ocorrer durante a desconexão.
            console.error('❌ Erro na desconexão:', error);
            throw error;
        }
    }

    /**
     * 🔐 Método safeDisconnect
     * Realiza uma desconexão segura do bot, garantindo que todos os recursos sejam liberados corretamente.
     * Remove os listeners de eventos do socket, faz logout do WhatsApp e encerra a conexão.
     */
        private async safeDisconnect(): Promise<void> {
            try {
                // 🔌 Remove todos os listeners de eventos do socket.
                if (this.sock) {
                    this.sock.ev.removeAllListeners();

                    // 🚪 Faz logout do WhatsApp, se necessário.
                    await this.sock.logout().catch((err: Error) => console.error('Erro ao fazer logout:', err));

                    // 🔄 Encerra a conexão do socket.
                    await this.sock.end().catch((err: Error) => console.error('Erro ao encerrar conexão:', err));
                    this.sock = null;
                }

                // 🗄️ Fecha a conexão com o MongoDB, se estiver ativa.
                if (this.mongoClient) {
                    await this.mongoClient.close();
                    this.mongoClient = null;
                }

                // ⚙️ Marca o bot como desconectado.
                this.isConnected = false;
            } catch (error) {
                // ❌ Trata erros que possam ocorrer durante a desconexão segura.
                console.error('❌ Erro durante desconexão:', error);
            }
        }
    }

    /**
    * 🏁 Função principal (main)
    * Inicia o bot, conecta ao WhatsApp e envia uma mensagem de teste.
    * Também trata o encerramento do processo para garantir que o bot seja desconectado corretamente.
    */
    async function main() {
        const bot = new WhatsAppBot(); // 🔧 Cria uma nova instância do bot.

        try {
            // 🚀 Conecta o bot ao WhatsApp.
            await bot.connect();

            // ⏱️ Aguarda 30 segundos antes de enviar a mensagem de teste.
            await new Promise(resolve => setTimeout(resolve, 30000));

            // ✉️ Envia uma mensagem de teste se o bot estiver conectado.
            if (bot.isConnected) {
                await bot.sendMessage('5511999999999', 'Teste de mensagem!');
            }

            // ⏹️ Mantém o processo ativo para capturar interrupções do usuário.
            process.stdin.resume();

            // 🛑 Trata o evento de encerramento do processo (Ctrl+C).
            process.on('SIGINT', async () => {
                console.log('\n🛑 Encerrando...');
                await bot.disconnect(); // 🔌 Desconecta o bot.
                process.exit(0); // 🚪 Encerra o processo com sucesso.
            });

        } catch (error) {
            // ❌ Trata erros fatais que possam ocorrer durante a execução.
            console.error('❌ Erro fatal:', error);

            // 🔌 Desconecta o bot em caso de erro.
            await bot.disconnect();
            process.exit(1); // 🚨 Encerra o processo com erro.
        }
    }

    // 🏁 Inicia a função principal apenas se o arquivo for executado diretamente.
    if (require.main === module) {
    main().catch(error => {
        // ❌ Trata erros não capturados na função principal.
        console.error('❌ Erro não tratado:', error);
        process.exit(1); // 🚨 Encerra o processo com erro.
    });
}

export default WhatsAppBot;
