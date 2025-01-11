import mongoose, { Schema, Document } from 'mongoose';

export interface ISentMessage extends Document {
    to: string;
    message: string;
    placeholders: Record<string, string>;
    sentAt: Date;
}

const SentMessageSchema: Schema = new Schema({
    to: { type: String, required: true },
    message: { type: String, required: true },
    placeholders: { type: Object, default: {} },
    sentAt: { type: Date, default: Date.now },
});

export default mongoose.model<ISentMessage>('SentMessage', SentMessageSchema);