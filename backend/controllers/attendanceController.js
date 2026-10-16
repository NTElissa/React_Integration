import mongoose from "mongoose";
import Attendance from "../models/Attendance.js";
import Enrollment from "../models/Enrollment.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const validStatuses = ["present", "absent", "late", "excused"];

export const recordAttendance = asyncHandler(async (req, res) => {
  const { enrollmentId, date, status, remarks } = req.body;

  if (!mongoose.isValidObjectId(enrollmentId)) {
    return res.status(400).json({
      success: false,
      message: "Valid enrollment ID is required"
    });
  }

  if (!date || Number.isNaN(Date.parse(date))) {
    return res.status(400).json({
      success: false,
      message: "Valid attendance date is required"
    });
  }

  if (!validStatuses.includes(status)) {
    return res.status(400).json({
      success: false,
      message: "Invalid attendance status"
    });
  }

  const enrollment = await Enrollment.findOne({
    _id: enrollmentId,
    status: "active"
  });

  if (!enrollment) {
    return res.status(404).json({
      success: false,
      message: "Active enrollment not found"
    });
  }

  // In production, obtain this from the authenticated user,
  // never from a client-supplied recordedBy value.
  const recordedBy = req.user?._id;

  if (!recordedBy) {
    return res.status(401).json({
      success: false,
      message: "Authentication is required"
    });
  }

  const attendance = await Attendance.create({
    enrollmentId,
    date: new Date(date),
    status,
    remarks,
    recordedBy
  });

  res.status(201).json({
    success: true,
    message: "Attendance recorded successfully",
    data: attendance
  });
});

export const getAttendance = asyncHandler(async (req, res) => {
  const filter = {};

  if (req.query.enrollmentId) {
    if (!mongoose.isValidObjectId(req.query.enrollmentId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid enrollment ID"
      });
    }

    filter.enrollmentId = req.query.enrollmentId;
  }

  if (req.query.status) {
    if (!validStatuses.includes(req.query.status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid attendance status"
      });
    }

    filter.status = req.query.status;
  }

  if (req.query.date) {
    const start = new Date(req.query.date);

    if (Number.isNaN(start.getTime())) {
      return res.status(400).json({
        success: false,
        message: "Invalid date"
      });
    }

    start.setUTCHours(0, 0, 0, 0);
    const end = new Date(start);
    end.setUTCDate(end.getUTCDate() + 1);

    filter.date = { $gte: start, $lt: end };
  }

  const attendance = await Attendance.find(filter)
    .populate({
      path: "enrollmentId",
      populate: [
        { path: "studentId", select: "studentCode firstName lastName" },
        { path: "classId", select: "name level section" }
      ]
    })
    .sort({ date: -1 })
    .limit(200)
    .lean();

  res.json({ success: true, data: attendance });
});

export const updateAttendance = asyncHandler(async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(400).json({
      success: false,
      message: "Invalid attendance ID"
    });
  }

  const updates = {};

  if (req.body.status !== undefined) {
    if (!validStatuses.includes(req.body.status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid attendance status"
      });
    }

    updates.status = req.body.status;
  }

  if (req.body.remarks !== undefined) {
    updates.remarks = req.body.remarks;
  }

  if (!Object.keys(updates).length) {
    return res.status(400).json({
      success: false,
      message: "Provide a status or remarks to update"
    });
  }

  const attendance = await Attendance.findByIdAndUpdate(
    req.params.id,
    { $set: updates },
    { new: true, runValidators: true }
  );

  if (!attendance) {
    return res.status(404).json({
      success: false,
      message: "Attendance record not found"
    });
  }

  res.json({ success: true, data: attendance });
});