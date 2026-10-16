import mongoose from "mongoose";
import Payment from "../models/Payment.js";
import Invoice from "../models/Invoice.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const recordPayment = asyncHandler(async (req, res) => {
  const {
    invoiceId,
    receiptNumber,
    amount,
    method,
    transactionReference
  } = req.body;

  if (!mongoose.isValidObjectId(invoiceId)) {
    return res.status(400).json({
      success: false,
      message: "Valid invoice ID is required"
    });
  }

  if (!receiptNumber?.trim()) {
    return res.status(400).json({
      success: false,
      message: "Receipt number is required"
    });
  }

  if (!Number.isSafeInteger(amount) || amount <= 0) {
    return res.status(400).json({
      success: false,
      message: "Payment amount must be a positive integer in the smallest currency unit"
    });
  }

  const allowedMethods = [
    "cash",
    "bank_transfer",
    "mobile_money",
    "card",
    "other"
  ];

  if (!allowedMethods.includes(method)) {
    return res.status(400).json({
      success: false,
      message: "Invalid payment method"
    });
  }

  // Authentication middleware must populate req.user.
  if (!req.user?._id) {
    return res.status(401).json({
      success: false,
      message: "Authentication is required"
    });
  }

  const session = await mongoose.startSession();

  try {
    let createdPayment;

    await session.withTransaction(async () => {
      // Atomic conditional update prevents concurrent overpayment.
      const invoice = await Invoice.findOneAndUpdate(
        {
          _id: invoiceId,
          status: { $in: ["unpaid", "partially_paid"] },
          $expr: {
            $lte: [
              { $add: ["$amountPaid", amount] },
              "$amountDue"
            ]
          }
        },
        [
          {
            $set: {
              amountPaid: { $add: ["$amountPaid", amount] },
              status: {
                $cond: [
                  { $eq: [{ $add: ["$amountPaid", amount] }, "$amountDue"] },
                  "paid",
                  "partially_paid"
                ]
              }
            }
          }
        ],
        { new: true, session }
      );

      if (!invoice) {
        const existingInvoice = await Invoice.findById(invoiceId).session(session);

        if (!existingInvoice) {
          const error = new Error("Invoice not found");
          error.statusCode = 404;
          throw error;
        }

        const error = new Error(
          "Invoice is cancelled, already paid, or the payment exceeds its balance"
        );
        error.statusCode = 409;
        throw error;
      }

      const [payment] = await Payment.create(
        [{
          receiptNumber,
          invoiceId,
          amount,
          method,
          transactionReference,
          receivedBy: req.user._id,
          status: "completed"
        }],
        { session }
      );

      createdPayment = payment;
    });

    res.status(201).json({
      success: true,
      message: "Payment recorded successfully",
      data: createdPayment
    });
  } finally {
    await session.endSession();
  }
});

export const getPayments = asyncHandler(async (req, res) => {
  const filter = {};

  if (req.query.invoiceId) {
    if (!mongoose.isValidObjectId(req.query.invoiceId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid invoice ID"
      });
    }

    filter.invoiceId = req.query.invoiceId;
  }

  if (req.query.status) {
    if (!["completed", "reversed"].includes(req.query.status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid payment status"
      });
    }

    filter.status = req.query.status;
  }

  const payments = await Payment.find(filter)
    .populate("invoiceId", "invoiceNumber amountDue amountPaid status")
    .populate("receivedBy", "name email role")
    .sort({ paymentDate: -1 })
    .limit(100)
    .lean();

  res.json({ success: true, data: payments });
});