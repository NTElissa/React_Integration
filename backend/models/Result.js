import mongoose from "mongoose";

const resultSchema = new mongoose.Schema(
  {
    examId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Exam",
      required: true
    },
    enrollmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Enrollment",
      required: true
    },
    marksObtained: {
      type: Number,
      required: true,
      min: 0
    },
    grade: String,
    remarks: String,
    recordedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    }
  },
  { timestamps: true }
);

resultSchema.index(
  { examId: 1, enrollmentId: 1 },
  { unique: true }
);

export default mongoose.model("Result", resultSchema);