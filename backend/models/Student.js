import mongoose from "mongoose";

const studentSchema = new mongoose.Schema(
  {
    studentCode: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    firstName: {
      type: String,
      required: true,
      trim: true
    },
    lastName: {
      type: String,
      required: true,
      trim: true
    },
    dateOfBirth: Date,
    gender: {
      type: String,
      enum: ["male", "female", "other"]
    },
    email: {
      type: String,
      lowercase: true,
      trim: true
    },
    phone: String,
    address: String,
    guardian: {
      name: String,
      relationship: String,
      phone: String,
      email: String
    },
    admissionDate: {
      type: Date,
      default: Date.now
    },
    isActive: {
      type: Boolean,
      default: true
    }
  },
  { timestamps: true }
);

studentSchema.index({ lastName: 1, firstName: 1 });

export default mongoose.model("Student", studentSchema);