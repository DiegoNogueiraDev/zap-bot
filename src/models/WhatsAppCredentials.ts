import mongoose, { Schema, Document } from 'mongoose';

export interface IWhatsAppCredentials extends Document {
    userId: string;
    authCredentials: any; // Credenciais do Baileys
    updatedAt: Date;
}

const WhatsAppCredentialsSchema: Schema = new Schema({
    userId: { type: String, required: true, unique: true },
    authCredentials: { type: Schema.Types.Mixed, required: true },
    updatedAt: { type: Date, default: Date.now }
});

export default mongoose.model<IWhatsAppCredentials>('WhatsAppCredentials', WhatsAppCredentialsSchema);