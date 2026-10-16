import mongoose from "mongoose";

const invoiceSchema = new mongoose.Schema(
  {
    invoiceNumber: {
      type: String,
      required: true,
      unique: true
    },
    enrollmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Enrollment",
      required: true
    },
    feeStructureId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "FeeStructure",
      required: true
    },
    amountDue: {
      type: Number,
      required: true,
      min: 0
    },
    amountPaid: {
      type: Number,
      default: 0,
      min: 0
    },
    dueDate: Date,
    status: {
      type: String,
      enum: ["unpaid", "partially_paid", "paid", "cancelled"],
      default: "unpaid"
    }
  },
  { timestamps: true }
);

invoiceSchema.index({ enrollmentId: 1, status: 1 });

invoiceSchema.virtual("balance").get(function () {
  return this.amountDue - this.amountPaid;
});

invoiceSchema.set("toJSON", { virtuals: true });
invoiceSchema.set("toObject", { virtuals: true });

export default mongoose.model("Invoice", invoiceSchema);