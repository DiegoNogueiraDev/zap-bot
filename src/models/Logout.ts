import mongoose, { Schema, Document } from 'mongoose';

export interface ILogout extends Document {
    userId: string;
    loggedOutAt: Date;
}

const LogoutSchema: Schema = new Schema({
    userId: { type: String, required: true },
    loggedOutAt: { type: Date, default: Date.now },
});

export default mongoose.model<ILogout>('Logout', LogoutSchema);