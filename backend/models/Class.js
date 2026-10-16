import mongoose from "mongoose";

const classSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    level: {
      type: String,
      required: true
    },
    section: {
      type: String,
      default: "A"
    },
    academicYearId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AcademicYear",
      required: true
    },
    classTeacherId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Teacher",
      default: null
    },
    capacity: {
      type: Number,
      min: 1,
      default: 40
    },
    isActive: {
      type: Boolean,
      default: true
    }
  },
  { timestamps: true }
);

classSchema.index(
  { name: 1, section: 1, academicYearId: 1 },
  { unique: true }
);

export default mongoose.model("Class", classSchema);