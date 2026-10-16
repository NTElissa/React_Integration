import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },
    passwordHash: {
      type: String,
      required: true,
      select: false
    },
    role: {
      type: String,
      enum: [
        "admin",
        "teacher",
        "accountant",
        "registrar"
      ],
      required: true
    },
    teacherId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Teacher",
      default: null
    },
    isActive: {
      type: Boolean,
      default: true
    },
    lastLoginAt: Date
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);