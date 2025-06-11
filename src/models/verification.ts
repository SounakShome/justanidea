import { Schema, model, models } from 'mongoose';

const verificationSchema = new Schema(
    {
      email: {
        type: String,
        required: true,
        unique: true,
      },
      code: {
          type: Number,
          required: true,
      },
      expiration: {
          type: Date,
          required: true,
      },
    },
    { timestamps: true }
  );
  
  const Token = models.Token || model("Token", verificationSchema);
  export default Token;