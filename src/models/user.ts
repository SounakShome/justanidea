import { Schema, model, models } from "mongoose";

const UserSchema = new Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
    },
    username: {
        type: String,
    },
    password: {
        type: String,
        default: "null",
        required: true,
    },
    role: {
        type: String,
        required: true,
        default: "admin",
    },
    onboarding: {
        type: Boolean,
        required: true,
        default: false,
    },
    verified: {
        type: Boolean,
        required: true,
        default: false,
    },
    company: {
      type: [String],
      required: true,
      default: null,
    }
  },
  { timestamps: true }
);

const User = models.User || model("User", UserSchema);
export default User;
export type UserSession = {
  email: string;
  username: string | null;
  role: string;
};