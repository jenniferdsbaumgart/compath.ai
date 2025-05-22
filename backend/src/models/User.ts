import { Schema, model, Document } from 'mongoose';

interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  coins: number;
  createdAt: Date;
}

const userSchema: Schema = new Schema<IUser>({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: true,
  },
  coins: {
    type: Number,
    default: 200,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default model<IUser>('User', userSchema);