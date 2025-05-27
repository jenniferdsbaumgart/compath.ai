import { Schema, model, Document } from "mongoose";

export interface IUser extends Document {
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
  invitedFriends: string[];
  favourites?: {
    title: string;
    description?: string;
    tags?: string[];
    url?: string;
    savedAt?: Date;
  }[];
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
  favourites: [
    {
      title: {
        type: String,
        required: true,
        trim: true,
      },
      description: String,
      tags: [String],
      url: String,
      savedAt: { type: Date, default: Date.now },
    },
  ],
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
  invitedFriends: [{ type: Schema.Types.ObjectId, ref: 'User' }],
});

userSchema.set("toJSON", {
  transform: (doc, ret) => {
    ret.id = ret._id.toString();
    delete ret._id;
    delete ret.__v;
    delete ret.password;
    return ret;
  },
});

export default model<IUser>("User", userSchema);
