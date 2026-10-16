import mongoose from "mongoose";
import Invoice from "../models/Invoice.js";
import Enrollment from "../models/Enrollment.js";
import FeeStructure from "../models/FeeStructure.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const createInvoice = asyncHandler(async (req, res) => {
  const { enrollmentId, feeStructureId, invoiceNumber, dueDate } = req.body;

  if (
    !mongoose.isValidObjectId(enrollmentId) ||
    !mongoose.isValidObjectId(feeStructureId)
  ) {
    return res.status(400).json({
      success: false,
      message: "Valid enrollment and fee structure IDs are required"
    });
  }

  if (!invoiceNumber?.trim()) {
    return res.status(400).json({
      success: false,
      message: "Invoice number is required"
    });
  }

  const [enrollment, fee] = await Promise.all([
    Enrollment.findById(enrollmentId),
    FeeStructure.findOne({ _id: feeStructureId, isActive: true })
  ]);

  if (!enrollment || !fee) {
    return res.status(404).json({
      success: false,
      message: "Enrollment or active fee structure not found"
    });
  }

  if (
    String(enrollment.classId) !== String(fee.classId) ||
    String(enrollment.academicYearId) !== String(fee.academicYearId)
  ) {
    return res.status(400).json({
      success: false,
      message: "Fee structure does not match the enrollment's class and academic year"
    });
  }

  const invoice = await Invoice.create({
    invoiceNumber,
    enrollmentId,
    feeStructureId,
    amountDue: fee.amount,
    amountPaid: 0,
    dueDate,
    status: fee.amount === 0 ? "paid" : "unpaid"
  });

  res.status(201).json({
    success: true,
    message: "Invoice created successfully",
    data: invoice
  });
});

export const getInvoices = asyncHandler(async (req, res) => {
  const filter = {};

  for (const field of ["enrollmentId", "feeStructureId"]) {
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
    const allowed = ["unpaid", "partially_paid", "paid", "cancelled"];

    if (!allowed.includes(req.query.status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid invoice status"
      });
    }

    filter.status = req.query.status;
  }

  const invoices = await Invoice.find(filter)
    .populate({
      path: "enrollmentId",
      populate: [
        { path: "studentId", select: "studentCode firstName lastName" },
        { path: "classId", select: "name level section" }
      ]
    })
    .populate("feeStructureId", "name term amount currency")
    .sort({ createdAt: -1 })
    .limit(100)
    .lean();

  res.json({ success: true, data: invoices });
});