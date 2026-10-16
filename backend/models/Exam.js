import mongoose from "mongoose";

const examSchema = new mongoose.Schema(
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
    subjectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Subject",
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
    examDate: Date,
    maxMarks: {
      type: Number,
      required: true,
      min: 0
    },
    passMarks: {
      type: Number,
      required: true,
      min: 0
    },
    status: {
      type: String,
      enum: ["draft", "published", "completed"],
      default: "draft"
    }
  },
  { timestamps: true }
);

examSchema.index({
  classId: 1,
  subjectId: 1,
  academicYearId: 1,
  term: 1
});

export default mongoose.model("Exam", examSchema);