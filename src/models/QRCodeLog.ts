import mongoose, { Schema, Document } from 'mongoose';

export interface IQRCodeLog extends Document {
    userId: string;
    qrCode: string;
    generatedAt: Date;
}

const QRCodeLogSchema: Schema = new Schema({
    userId: { type: String, required: true },
    qrCode: { type: String, required: true },
    generatedAt: { type: Date, default: Date.now },
});

export default mongoose.model<IQRCodeLog>('QRCodeLog', QRCodeLogSchema);