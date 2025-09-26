import mongoose, { Schema, HydratedDocument, model } from 'mongoose';

// Define the User interface
export interface IUser {
  _id: mongoose.Types.ObjectId;
  name: string;
  email: string;
  password: string;
  coins: number;
  invitedFriends: mongoose.Types.ObjectId[];
  favourites: Array<{
    title: string;
    description?: string;
    tags?: string[];
    url?: string;
    savedAt?: Date;
  }>;
  phone?: string;
  location?: string;
  company?: string;
  website?: string;
  bio?: string;
  avatar?: string;
  profileCompletion: number;
  createdAt: Date;
}

const userSchema = new Schema<IUser>({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true },
  coins: { type: Number, default: 50 },
  invitedFriends: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  favourites: [{
    title: { type: String, required: true },
    description: String,
    tags: [String],
    url: String,
    savedAt: Date,
  }],
  phone: { type: String, trim: true },
  location: { type: String, trim: true },
  company: { type: String, trim: true },
  website: { type: String, trim: true },
  bio: { type: String, trim: true },
  avatar: { type: String, trim: true },
  profileCompletion: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
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

export type UserDocument = HydratedDocument<IUser>;
export default model<IUser>('User', userSchema);