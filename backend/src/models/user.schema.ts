import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type UserDocument = User & Document;

@Schema({
  timestamps: true,
  toJSON: {
    transform: (doc, ret) => {
      (ret as any).id = ret._id.toString();
      delete (ret as any)._id;
      delete (ret as any).__v;
      delete (ret as any).password;
      return ret;
    },
  },
})
export class User {
  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ required: true, unique: true, lowercase: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop({ default: 50 })
  coins: number;

  @Prop([{ type: Types.ObjectId, ref: 'User' }])
  invitedFriends: Types.ObjectId[];

  @Prop([
    {
      title: { type: String, required: true },
      description: String,
      tags: [String],
      url: String,
      savedAt: Date,
    },
  ])
  favourites: Array<{
    title: string;
    description?: string;
    tags?: string[];
    url?: string;
    savedAt?: Date;
  }>;

  @Prop({ trim: true })
  phone?: string;

  @Prop({ trim: true })
  location?: string;

  @Prop({ trim: true })
  company?: string;

  @Prop({ trim: true })
  website?: string;

  @Prop({ trim: true })
  bio?: string;

  @Prop({ trim: true })
  avatar?: string;

  @Prop({ default: 0 })
  profileCompletion: number;

  @Prop()
  createdAt?: Date;

  @Prop()
  updatedAt?: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);
