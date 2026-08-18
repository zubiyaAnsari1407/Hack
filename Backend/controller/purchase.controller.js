const Purchase = require("../models/Purchase");

// --- CREATE: Add new purchase (with bill image) ---
module.exports.createPurchase = async (req, res) => {
  try {
    const {
      productName,
      category,
      brand,
      price,
      purchaseDate,
      store,
      warrantyPeriod,
      returnDeadline,
      notes,
    } = req.body;

    const newPurchase = new Purchase({
      userId: req.body.userId, // later: replace with logged-in user id from auth
      productName,
      category,
      brand,
      price,
      purchaseDate,
      store,
      warrantyPeriod,
      returnDeadline,
      notes,
      billImageUrl: req.file ? req.file.path : null, // comes from multer/cloudinary
    });

    await newPurchase.save();
    res.status(201).json({
      success: true,
      message: "Purchase added successfully",
      data: newPurchase,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// --- READ: Get all purchases (optionally by user) ---
module.exports.getAllPurchases = async (req, res) => {
  try {
    const filter = req.query.userId ? { userId: req.query.userId } : {};
    const purchases = await Purchase.find(filter).sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: purchases });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// --- READ: Get single purchase by ID ---
module.exports.getPurchaseById = async (req, res) => {
  try {
    const purchase = await Purchase.findById(req.params.id);
    if (!purchase) {
      return res
        .status(404)
        .json({ success: false, message: "Purchase not found" });
    }
    res.status(200).json({ success: true, data: purchase });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// --- UPDATE: Edit a purchase ---
module.exports.updatePurchase = async (req, res) => {
  try {
    const updateData = { ...req.body };
    if (req.file) {
      updateData.billImageUrl = req.file.path;
    }

    const updatedPurchase = await Purchase.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!updatedPurchase) {
      return res
        .status(404)
        .json({ success: false, message: "Purchase not found" });
    }

    res.status(200).json({ success: true, data: updatedPurchase });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// --- DELETE: Remove a purchase ---
module.exports.deletePurchase = async (req, res) => {
  try {
    const deleted = await Purchase.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res
        .status(404)
        .json({ success: false, message: "Purchase not found" });
    }
    res.status(200).json({ success: true, message: "Purchase deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
};
