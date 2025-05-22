import { Schema, model, Document } from 'mongoose';

interface IUser extends Document {
  id: string;
  name: string;
  email: string;
  password: string;
  coins: number;
  createdAt: Date;
  phone?: string;
  location?: string;
  company?: string;
  website?: string;
  bio?: string;
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
  phone: {
    type: String,
    trim: true,
  },
  location: {
    type: String,
    trim: true,
  },
  company: {
    type: String,
    trim: true,
  },
  website: {
    type: String,
    trim: true,
  },
  bio: {
    type: String,
    trim: true,
  },
});

userSchema.set('toJSON', {
  transform: (doc, ret) => {
    ret.id = ret._id.toString();
    delete ret._id;
    delete ret.__v;
    delete ret.password;
    return ret;
  },
});

export default model<IUser>('User', userSchema);