import mongoose from "mongoose";

const enrollmentSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
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
    enrollmentDate: {
      type: Date,
      default: Date.now
    },
    status: {
      type: String,
      enum: ["active", "completed", "transferred", "withdrawn"],
      default: "active"
    }
  },
  { timestamps: true }
);

// A student can have only one enrollment per academic year.
enrollmentSchema.index(
  { studentId: 1, academicYearId: 1 },
  { unique: true }
);

enrollmentSchema.index({ classId: 1, status: 1 });

export default mongoose.model("Enrollment", enrollmentSchema);