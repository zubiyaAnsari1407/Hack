const express = require("express");
const router = express.Router();
const { upload } = require("../cloudConfig");
const purchaseController = require("../controller/purchase.controller");

// CREATE - add new purchase with bill image (field name: "billImage")
router.post("/", upload.single("billImage"), purchaseController.createPurchase);

// READ - get all purchases (supports ?userId=xxx filter)
router.get("/", purchaseController.getAllPurchases);

// READ - get single purchase
router.get("/:id", purchaseController.getPurchaseById);

// UPDATE - edit purchase (optionally replace bill image)
router.put("/:id", upload.single("billImage"), purchaseController.updatePurchase);

// DELETE - remove purchase
router.delete("/:id", purchaseController.deletePurchase);

module.exports = router;
