import mongoose from "mongoose";
import Result from "../models/Result.js";
import Exam from "../models/Exam.js";
import Enrollment from "../models/Enrollment.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const createResult = asyncHandler(async (req, res) => {
  const { examId, enrollmentId, marksObtained, grade, remarks } = req.body;

  if (
    !mongoose.isValidObjectId(examId) ||
    !mongoose.isValidObjectId(enrollmentId)
  ) {
    return res.status(400).json({
      success: false,
      message: "Valid exam and enrollment IDs are required"
    });
  }

  if (!Number.isFinite(marksObtained) || marksObtained < 0) {
    return res.status(400).json({
      success: false,
      message: "Marks must be a valid non-negative number"
    });
  }

  const [exam, enrollment] = await Promise.all([
    Exam.findById(examId),
    Enrollment.findById(enrollmentId)
  ]);

  if (!exam || !enrollment) {
    return res.status(404).json({
      success: false,
      message: "Exam or enrollment not found"
    });
  }

  if (exam.status === "draft") {
    return res.status(400).json({
      success: false,
      message: "Results cannot be recorded for a draft exam"
    });
  }

  if (
    String(exam.classId) !== String(enrollment.classId) ||
    String(exam.academicYearId) !== String(enrollment.academicYearId)
  ) {
    return res.status(400).json({
      success: false,
      message: "Enrollment does not belong to this exam's class and academic year"
    });
  }

  if (marksObtained > exam.maxMarks) {
    return res.status(400).json({
      success: false,
      message: `Marks cannot exceed ${exam.maxMarks}`
    });
  }

  if (!req.user?._id) {
    return res.status(401).json({
      success: false,
      message: "Authentication is required"
    });
  }

  const result = await Result.create({
    examId,
    enrollmentId,
    marksObtained,
    grade,
    remarks,
    recordedBy: req.user._id
  });

  res.status(201).json({
    success: true,
    message: "Result recorded successfully",
    data: result
  });
});

export const getResults = asyncHandler(async (req, res) => {
  const filter = {};

  for (const field of ["examId", "enrollmentId"]) {
    if (req.query[field]) {
      if (!mongoose.isValidObjectId(req.query[field])) {
        return res.status(400).json({
          success: false,
          message: `Invalid ${field}`
        });
      }

      filter[field] = req.query[field];
    }
  }

  const results = await Result.find(filter)
    .populate("examId", "name maxMarks passMarks term")
    .populate({
      path: "enrollmentId",
      populate: [
        { path: "studentId", select: "studentCode firstName lastName" },
        { path: "classId", select: "name level section" }
      ]
    })
    .sort({ createdAt: -1 })
    .limit(200)
    .lean();

  res.json({ success: true, data: results });
});