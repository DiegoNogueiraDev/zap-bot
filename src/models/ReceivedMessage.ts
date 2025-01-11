import mongoose, { Schema, Document } from 'mongoose';

export interface IReceivedMessage extends Document {
    from: string;
    message: string;
    receivedAt: Date;
}

const ReceivedMessageSchema: Schema = new Schema({
    from: { type: String, required: true },
    message: { type: String, required: true },
    receivedAt: { type: Date, default: Date.now },
});

export default mongoose.model<IReceivedMessage>('ReceivedMessage', ReceivedMessageSchema);