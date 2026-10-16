import mongoose from "mongoose";
import Enrollment from "../models/Enrollment.js";
import Student from "../models/Student.js";
import Class from "../models/Class.js";
import AcademicYear from "../models/AcademicYear.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const createEnrollment = asyncHandler(async (req, res) => {
  const { studentId, classId, academicYearId } = req.body;

  if (![studentId, classId, academicYearId].every(
    (id) => mongoose.isValidObjectId(id)
  )) {
    return res.status(400).json({
      success: false,
      message: "Valid student, class and academic year IDs are required"
    });
  }

  const [student, schoolClass, year] = await Promise.all([
    Student.findOne({ _id: studentId, isActive: true }),
    Class.findOne({
      _id: classId,
      isActive: true,
      academicYearId
    }),
    AcademicYear.findById(academicYearId)
  ]);

  if (!student || !schoolClass || !year) {
    return res.status(400).json({
      success: false,
      message: "Student, class or academic year is invalid or inactive"
    });
  }

  const enrollment = await Enrollment.create({
    studentId,
    classId,
    academicYearId
  });

  res.status(201).json({
    success: true,
    message: "Student enrolled successfully",
    data: enrollment
  });
});

export const getEnrollments = asyncHandler(async (req, res) => {
  const filter = {};

  for (const field of ["studentId", "classId", "academicYearId"]) {
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

  if (req.query.status) {
    filter.status = req.query.status;
  }

  const enrollments = await Enrollment.find(filter)
    .populate("studentId", "studentCode firstName lastName")
    .populate("classId", "name level section")
    .populate("academicYearId", "name")
    .sort({ createdAt: -1 })
    .limit(100)
    .lean();

  res.json({ success: true, data: enrollments });
});

export const updateEnrollmentStatus = asyncHandler(async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(400).json({
      success: false,
      message: "Invalid enrollment ID"
    });
  }

  const allowedStatuses = [
    "active",
    "completed",
    "transferred",
    "withdrawn"
  ];

  if (!allowedStatuses.includes(req.body.status)) {
    return res.status(400).json({
      success: false,
      message: "Invalid enrollment status"
    });
  }

  const enrollment = await Enrollment.findByIdAndUpdate(
    req.params.id,
    { $set: { status: req.body.status } },
    { new: true, runValidators: true }
  );

  if (!enrollment) {
    return res.status(404).json({
      success: false,
      message: "Enrollment not found"
    });
  }

  res.json({ success: true, data: enrollment });
});