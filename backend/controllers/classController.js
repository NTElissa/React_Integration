import mongoose from "mongoose";
import Class from "../models/Class.js";
import AcademicYear from "../models/AcademicYear.js";
import Teacher from "../models/Teacher.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const createClass = asyncHandler(async (req, res) => {
  const {
    name,
    level,
    section,
    academicYearId,
    classTeacherId,
    capacity
  } = req.body;

  if (!name?.trim() || !level?.trim() || !academicYearId) {
    return res.status(400).json({
      success: false,
      message: "Name, level and academic year are required"
    });
  }

  if (!mongoose.isValidObjectId(academicYearId)) {
    return res.status(400).json({
      success: false,
      message: "Invalid academic year ID"
    });
  }

  const year = await AcademicYear.findById(academicYearId);

  if (!year) {
    return res.status(404).json({
      success: false,
      message: "Academic year not found"
    });
  }

  if (classTeacherId) {
    if (!mongoose.isValidObjectId(classTeacherId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid class teacher ID"
      });
    }

    const teacher = await Teacher.findOne({
      _id: classTeacherId,
      isActive: true
    });

    if (!teacher) {
      return res.status(400).json({
        success: false,
        message: "Active class teacher not found"
      });
    }
  }

  const schoolClass = await Class.create({
    name,
    level,
    section,
    academicYearId,
    classTeacherId: classTeacherId || null,
    capacity
  });

  res.status(201).json({
    success: true,
    message: "Class created successfully",
    data: schoolClass
  });
});

export const getClasses = asyncHandler(async (req, res) => {
  const filter = {};

  if (req.query.academicYearId) {
    if (!mongoose.isValidObjectId(req.query.academicYearId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid academic year ID"
      });
    }

    filter.academicYearId = req.query.academicYearId;
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

  const classes = await Class.find(filter)
    .populate("academicYearId", "name")
    .populate("classTeacherId", "firstName lastName employeeCode")
    .sort({ level: 1, name: 1, section: 1 })
    .limit(100)
    .lean();

  res.json({ success: true, data: classes });
});

export const getClassById = asyncHandler(async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(400).json({
      success: false,
      message: "Invalid class ID"
    });
  }

  const schoolClass = await Class.findById(req.params.id)
    .populate("academicYearId", "name")
    .populate("classTeacherId", "firstName lastName employeeCode");

  if (!schoolClass) {
    return res.status(404).json({
      success: false,
      message: "Class not found"
    });
  }

  res.json({ success: true, data: schoolClass });
});

export const updateClass = asyncHandler(async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(400).json({
      success: false,
      message: "Invalid class ID"
    });
  }

  const allowedFields = [
    "name",
    "level",
    "section",
    "classTeacherId",
    "capacity",
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

  if (updates.classTeacherId) {
    if (!mongoose.isValidObjectId(updates.classTeacherId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid class teacher ID"
      });
    }

    const teacher = await Teacher.findOne({
      _id: updates.classTeacherId,
      isActive: true
    });

    if (!teacher) {
      return res.status(400).json({
        success: false,
        message: "Active class teacher not found"
      });
    }
  }

  const schoolClass = await Class.findByIdAndUpdate(
    req.params.id,
    { $set: updates },
    { new: true, runValidators: true }
  );

  if (!schoolClass) {
    return res.status(404).json({
      success: false,
      message: "Class not found"
    });
  }

  res.json({ success: true, data: schoolClass });
});