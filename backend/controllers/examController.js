import mongoose from "mongoose";
import Exam from "../models/Exam.js";
import Class from "../models/Class.js";
import Subject from "../models/Subject.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const createExam = asyncHandler(async (req, res) => {
  const {
    name,
    classId,
    subjectId,
    academicYearId,
    term,
    examDate,
    maxMarks,
    passMarks
  } = req.body;

  const ids = [classId, subjectId, academicYearId];

  if (!ids.every((id) => mongoose.isValidObjectId(id))) {
    return res.status(400).json({
      success: false,
      message: "Valid class, subject and academic year IDs are required"
    });
  }

  if (!name?.trim() || !term?.trim()) {
    return res.status(400).json({
      success: false,
      message: "Exam name and term are required"
    });
  }

  if (
    !Number.isFinite(maxMarks) ||
    !Number.isFinite(passMarks) ||
    maxMarks <= 0 ||
    passMarks < 0 ||
    passMarks > maxMarks
  ) {
    return res.status(400).json({
      success: false,
      message: "Exam marks must be valid and pass marks cannot exceed maximum marks"
    });
  }

  const schoolClass = await Class.findOne({
    _id: classId,
    academicYearId,
    isActive: true
  });

  const subject = await Subject.findOne({
    _id: subjectId,
    isActive: true
  });

  if (!schoolClass || !subject) {
    return res.status(400).json({
      success: false,
      message: "Active class or subject not found"
    });
  }

  const exam = await Exam.create({
    name,
    classId,
    subjectId,
    academicYearId,
    term,
    examDate,
    maxMarks,
    passMarks
  });

  res.status(201).json({
    success: true,
    message: "Exam created successfully",
    data: exam
  });
});

export const getExams = asyncHandler(async (req, res) => {
  const filter = {};

  for (const field of ["classId", "subjectId", "academicYearId"]) {
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

  if (req.query.term) {
    filter.term = req.query.term;
  }

  const exams = await Exam.find(filter)
    .populate("classId", "name level section")
    .populate("subjectId", "name code")
    .populate("academicYearId", "name")
    .sort({ examDate: -1 })
    .limit(100)
    .lean();

  res.json({ success: true, data: exams });
});

export const updateExamStatus = asyncHandler(async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(400).json({
      success: false,
      message: "Invalid exam ID"
    });
  }

  const allowedStatuses = ["draft", "published", "completed"];

  if (!allowedStatuses.includes(req.body.status)) {
    return res.status(400).json({
      success: false,
      message: "Invalid exam status"
    });
  }

  const exam = await Exam.findByIdAndUpdate(
    req.params.id,
    { $set: { status: req.body.status } },
    { new: true, runValidators: true }
  );

  if (!exam) {
    return res.status(404).json({
      success: false,
      message: "Exam not found"
    });
  }

  res.json({ success: true, data: exam });
});