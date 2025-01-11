import mongoose, { Schema, Document } from 'mongoose';

export interface IAuth extends Document {
    userId: string;
    refreshToken: string;
    accessToken: string;
    createdAt: Date;
    expiresAt: Date;
}

const AuthSchema: Schema = new Schema({
    userId: { type: String, required: true, unique: true },
    refreshToken: { type: String, required: true },
    accessToken: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
    expiresAt: { type: Date, required: true },
});

export default mongoose.model<IAuth>('Auth', AuthSchema);