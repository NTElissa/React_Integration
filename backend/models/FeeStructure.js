import mongoose from "mongoose";

const feeStructureSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true
    },
    classId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Class",
      required: true
    },
    academicYearId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AcademicYear",
      required: true
    },
    term: {
      type: String,
      required: true
    },
    amount: {
      type: Number,
      required: true,
      min: 0
    },
    currency: {
      type: String,
      default: "RWF"
    },
    isActive: {
      type: Boolean,
      default: true
    }
  },
  { timestamps: true }
);

feeStructureSchema.index(
  { name: 1, classId: 1, academicYearId: 1, term: 1 },
  { unique: true }
);

export default mongoose.model("FeeStructure", feeStructureSchema);