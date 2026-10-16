import mongoose from "mongoose";
import Student from "../models/Student.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const createStudent = asyncHandler(async (req, res) => {
  const {
    studentCode,
    firstName,
    lastName,
    dateOfBirth,
    gender,
    email,
    phone,
    address,
    guardian,
    admissionDate
  } = req.body;

  if (!studentCode?.trim() || !firstName?.trim() || !lastName?.trim()) {
    return res.status(400).json({
      success: false,
      message: "Student code, first name and last name are required"
    });
  }

  const student = await Student.create({
    studentCode,
    firstName,
    lastName,
    dateOfBirth,
    gender,
    email,
    phone,
    address,
    guardian,
    admissionDate
  });

  res.status(201).json({
    success: true,
    message: "Student registered successfully",
    data: student
  });
});

export const getStudents = asyncHandler(async (req, res) => {
  const page = Math.max(1, Number.parseInt(req.query.page, 10) || 1);
  const limit = Math.min(
    100,
    Math.max(1, Number.parseInt(req.query.limit, 10) || 10)
  );

  const filter = {};

  if (req.query.search) {
    const search = String(req.query.search).trim().slice(0, 100);
    const escaped = search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const regex = new RegExp(escaped, "i");

    filter.$or = [
      { studentCode: regex },
      { firstName: regex },
      { lastName: regex }
    ];
  }

  if (req.query.isActive !== undefined) {
    if (!["true", "false"].includes(req.query.isActive)) {
      return res.status(400).json({
        success: false,
        message: "isActive must be true or false"
      });
    }

    filter.isActive = req.query.isActive === "true";
  }

  const [students, total] = await Promise.all([
    Student.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
    Student.countDocuments(filter)
  ]);

  res.json({
    success: true,
    data: students,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    }
  });
});

export const getStudentById = asyncHandler(async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(400).json({
      success: false,
      message: "Invalid student ID"
    });
  }

  const student = await Student.findById(req.params.id);

  if (!student) {
    return res.status(404).json({
      success: false,
      message: "Student not found"
    });
  }

  res.json({ success: true, data: student });
});

export const updateStudent = asyncHandler(async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(400).json({
      success: false,
      message: "Invalid student ID"
    });
  }

  const allowedFields = [
    "studentCode",
    "firstName",
    "lastName",
    "dateOfBirth",
    "gender",
    "email",
    "phone",
    "address",
    "guardian",
    "admissionDate"
  ];

  const updates = {};

  for (const field of allowedFields) {
    if (req.body[field] !== undefined) {
      updates[field] = req.body[field];
    }
  }

  if (Object.keys(updates).length === 0) {
    return res.status(400).json({
      success: false,
      message: "No valid fields supplied for update"
    });
  }

  const student = await Student.findByIdAndUpdate(
    req.params.id,
    { $set: updates },
    { new: true, runValidators: true }
  );

  if (!student) {
    return res.status(404).json({
      success: false,
      message: "Student not found"
    });
  }

  res.json({
    success: true,
    message: "Student updated successfully",
    data: student
  });
});

export const deactivateStudent = asyncHandler(async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(400).json({
      success: false,
      message: "Invalid student ID"
    });
  }

  const student = await Student.findByIdAndUpdate(
    req.params.id,
    { $set: { isActive: false } },
    { new: true, runValidators: true }
  );

  if (!student) {
    return res.status(404).json({
      success: false,
      message: "Student not found"
    });
  }

  res.json({
    success: true,
    message: "Student deactivated successfully",
    data: student
  });
});