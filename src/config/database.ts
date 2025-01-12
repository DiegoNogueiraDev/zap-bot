import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const connectDB = async () => {
    try {
        const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/zap-bot';
        
        await mongoose.connect(mongoUri, {
            // As opções abaixo não são mais necessárias no Mongoose 6+,
            // mas você pode mantê-las se estiver usando uma versão anterior
            // useNewUrlParser: true,
            // useUnifiedTopology: true,
            // useCreateIndex: true,
            // useFindAndModify: false
        });

        console.log('MongoDB conectado com sucesso!');

        mongoose.connection.on('error', (err) => {
            console.error('Erro na conexão MongoDB:', err);
        });

        mongoose.connection.on('disconnected', () => {
            console.log('MongoDB desconectado');
        });

    } catch (error) {
        console.error('Erro ao conectar ao MongoDB:', error);
        process.exit(1);
    }
};

export default connectDB;