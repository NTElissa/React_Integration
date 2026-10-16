import mongoose from "mongoose";
import Teacher from "../models/Teacher.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const createTeacher = asyncHandler(async (req, res) => {
  const {
    employeeCode,
    firstName,
    lastName,
    email,
    phone,
    qualification,
    hireDate
  } = req.body;

  if (!employeeCode?.trim() || !firstName?.trim() || !lastName?.trim()) {
    return res.status(400).json({
      success: false,
      message: "Employee code, first name and last name are required"
    });
  }

  const teacher = await Teacher.create({
    employeeCode,
    firstName,
    lastName,
    email,
    phone,
    qualification,
    hireDate
  });

  res.status(201).json({
    success: true,
    message: "Teacher created successfully",
    data: teacher
  });
});

export const getTeachers = asyncHandler(async (req, res) => {
  const teachers = await Teacher.find()
    .sort({ lastName: 1, firstName: 1 })
    .limit(100)
    .lean();

  res.json({ success: true, data: teachers });
});

export const getTeacherById = asyncHandler(async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(400).json({
      success: false,
      message: "Invalid teacher ID"
    });
  }

  const teacher = await Teacher.findById(req.params.id);

  if (!teacher) {
    return res.status(404).json({
      success: false,
      message: "Teacher not found"
    });
  }

  res.json({ success: true, data: teacher });
});

export const updateTeacher = asyncHandler(async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(400).json({
      success: false,
      message: "Invalid teacher ID"
    });
  }

  const allowedFields = [
    "employeeCode",
    "firstName",
    "lastName",
    "email",
    "phone",
    "qualification",
    "hireDate",
    "isActive"
  ];

  const updates = Object.fromEntries(
    allowedFields
      .filter((field) => req.body[field] !== undefined)
      .map((field) => [field, req.body[field]])
  );

  if (!Object.keys(updates).length) {
    return res.status(400).json({
      success: false,
      message: "No valid fields supplied"
    });
  }

  const teacher = await Teacher.findByIdAndUpdate(
    req.params.id,
    { $set: updates },
    { new: true, runValidators: true }
  );

  if (!teacher) {
    return res.status(404).json({
      success: false,
      message: "Teacher not found"
    });
  }

  res.json({
    success: true,
    message: "Teacher updated successfully",
    data: teacher
  });
});

export const deactivateTeacher = asyncHandler(async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(400).json({
      success: false,
      message: "Invalid teacher ID"
    });
  }

  const teacher = await Teacher.findByIdAndUpdate(
    req.params.id,
    { $set: { isActive: false } },
    { new: true }
  );

  if (!teacher) {
    return res.status(404).json({
      success: false,
      message: "Teacher not found"
    });
  }

  res.json({ success: true, data: teacher });
});