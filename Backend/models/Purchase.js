const mongoose = require("mongoose");

const purchaseSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // --- Product Info ---
    productName: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      default: "Other",
      trim: true,
    },
    brand: {
      type: String,
      trim: true,
    },

    // --- Purchase Info ---
    price: {
      type: Number,
      required: true,
    },
    purchaseDate: {
      type: Date,
      required: true,
    },
    store: {
      type: String,
      trim: true,
    },

    // --- Warranty & Return Info ---
    warrantyPeriod: {
      type: Number, // in months
      default: 0,
    },
    warrantyExpiryDate: {
      type: Date,
    },
    returnDeadline: {
      type: Date,
    },

    // --- Bill / AI Extraction Info ---
    billImageUrl: {
      type: String,
    },
    extractedRawText: {
      type: String,
    },

    // --- Status Tracking ---
    status: {
      type: String,
      enum: ["active", "warranty expired", "returned"],
      default: "active",
    },
    reminderSent: {
      type: Boolean,
      default: false,
    },
    notes: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true }
);

// Auto-calculate warrantyExpiryDate before saving, if not manually set
purchaseSchema.pre("save", function () {
  if (this.purchaseDate && this.warrantyPeriod && !this.warrantyExpiryDate) {
    const expiry = new Date(this.purchaseDate);
    expiry.setMonth(expiry.getMonth() + this.warrantyPeriod);
    this.warrantyExpiryDate = expiry;
  }
});
module.exports = mongoose.model("Purchase", purchaseSchema);