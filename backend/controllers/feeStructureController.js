import mongoose from "mongoose";
import FeeStructure from "../models/FeeStructure.js";
import Class from "../models/Class.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const createFeeStructure = asyncHandler(async (req, res) => {
  const {
    name,
    classId,
    academicYearId,
    term,
    amount,
    currency
  } = req.body;

  if (
    !name?.trim() ||
    !term?.trim() ||
    !mongoose.isValidObjectId(classId) ||
    !mongoose.isValidObjectId(academicYearId)
  ) {
    return res.status(400).json({
      success: false,
      message: "Name, term, valid class ID and academic year ID are required"
    });
  }

  if (!Number.isSafeInteger(amount) || amount < 0) {
    return res.status(400).json({
      success: false,
      message: "Amount must be a non-negative integer in the smallest currency unit"
    });
  }

  const schoolClass = await Class.findOne({
    _id: classId,
    academicYearId,
    isActive: true
  });

  if (!schoolClass) {
    return res.status(400).json({
      success: false,
      message: "Active class for this academic year not found"
    });
  }

  const fee = await FeeStructure.create({
    name,
    classId,
    academicYearId,
    term,
    amount,
    currency: currency || "RWF"
  });

  res.status(201).json({
    success: true,
    message: "Fee structure created successfully",
    data: fee
  });
});

export const getFeeStructures = asyncHandler(async (req, res) => {
  const filter = {};

  for (const field of ["classId", "academicYearId"]) {
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

  if (req.query.term) filter.term = req.query.term;
  if (req.query.isActive !== undefined) {
    if (!["true", "false"].includes(req.query.isActive)) {
      return res.status(400).json({
        success: false,
        message: "isActive must be true or false"
      });
    }

    filter.isActive = req.query.isActive === "true";
  }

  const fees = await FeeStructure.find(filter)
    .populate("classId", "name level section")
    .populate("academicYearId", "name")
    .sort({ createdAt: -1 })
    .limit(100)
    .lean();

  res.json({ success: true, data: fees });
});