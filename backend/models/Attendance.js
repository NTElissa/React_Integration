import mongoose from "mongoose";

const attendanceSchema = new mongoose.Schema(
  {
    enrollmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Enrollment",
      required: true
    },
    date: {
      type: Date,
      required: true
    },
    status: {
      type: String,
      enum: ["present", "absent", "late", "excused"],
      required: true
    },
    remarks: String,
    recordedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    }
  },
  { timestamps: true }
);

// One attendance record per enrollment per school day.
attendanceSchema.index(
  { enrollmentId: 1, date: 1 },
  { unique: true }
);

attendanceSchema.index({ date: 1, status: 1 });

export default mongoose.model("Attendance", attendanceSchema);