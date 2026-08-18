import {
  Upload,
  FileText,
  CheckCircle2,
  Clock,
  Sparkles,
  Save,
  X,
} from "lucide-react";

import { useState } from "react";
import { createPurchase } from "../services/api";

function Receipts() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [extractedData, setExtractedData] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);

  const handleFile = (file) => {
    if (!file) return;

    const allowedTypes = ["image/jpeg", "image/png", "application/pdf"];
    if (!allowedTypes.includes(file.type)) {
      alert("Please upload a JPG, PNG or PDF file.");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      alert("File size must be less than 10MB.");
      return;
    }

    setSelectedFile(file);
    setExtractedData(null);
  };

  const handleFileChange = (e) => handleFile(e.target.files[0]);
  const handleDragOver = (e) => {
    e.preventDefault();
    setDragActive(true);
  };
  const handleDragLeave = () => setDragActive(false);
  const handleDrop = (e) => {
    e.preventDefault();
    setDragActive(false);
    handleFile(e.dataTransfer.files[0]);
  };

  // NOTE: backend doesn't have a real OCR/extraction endpoint yet.
  // This just pre-fills an editable form so the user can confirm/correct
  // before actually saving to the database.
  const processReceipt = () => {
    if (!selectedFile) return;
    setIsProcessing(true);

    setTimeout(() => {
      setIsProcessing(false);
      setExtractedData({
        productName: "",
        store: "",
        price: "",
        purchaseDate: "",
        category: "Electronics",
        warrantyPeriod: "",
        returnDeadline: "",
      });
    }, 1500);
  };

  const removeFile = () => {
    setSelectedFile(null);
    setExtractedData(null);
    setSaveError(null);
  };

  const handleFieldChange = (field, value) => {
    setExtractedData({ ...extractedData, [field]: value });
  };

  const savePurchase = async () => {
    setSaveError(null);

    if (!extractedData.productName || !extractedData.price || !extractedData.purchaseDate) {
      setSaveError("Product name, price and purchase date are required.");
      return;
    }

    try {
      setSaving(true);
      const formData = new FormData();
      formData.append("userId", "000000000000000000000000"); // TEMP until auth
      Object.entries(extractedData).forEach(([key, value]) => {
        if (value !== "") formData.append(key, value);
      });
      if (selectedFile) formData.append("billImage", selectedFile);

      const res = await createPurchase(formData);

      if (res.success) {
        alert("Purchase saved successfully!");
        removeFile();
      } else {
        setSaveError(res.message || "Something went wrong.");
      }
    } catch (err) {
      console.error(err);
      setSaveError(
        err.response?.data?.message || "Could not save purchase. Check backend connection."
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="receipts-page">
      <div className="page-heading">
        <div>
          <div className="ai-label">
            <Sparkles size={14} />
            AI POWERED
          </div>
          <h1>Receipts</h1>
          <p>Upload your bills and enter purchase information.</p>
        </div>
      </div>

      {!extractedData && (
        <div className="receipt-upload-section">
          <div
            className={`upload-box ${dragActive ? "drag-active" : ""}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <div className="upload-icon">
              <Upload size={30} />
            </div>
            <h2>Upload your receipt</h2>
            <p>Drag & drop your receipt here or click to browse</p>

            <label htmlFor="receipt-file" className="choose-file-btn">
              <Upload size={16} />
              Choose File
            </label>
            <input
              id="receipt-file"
              type="file"
              accept=".jpg,.jpeg,.png,.pdf"
              onChange={handleFileChange}
              hidden
            />
            <span className="upload-hint">JPG • PNG • PDF • Maximum 10MB</span>
          </div>

          {selectedFile && (
            <div className="selected-file">
              <div className="selected-file-icon">
                <FileText size={20} />
              </div>
              <div className="selected-file-info">
                <strong>{selectedFile.name}</strong>
                <span>{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</span>
              </div>
              <button className="remove-file-btn" onClick={removeFile}>
                <X size={17} />
              </button>
            </div>
          )}

          {selectedFile && (
            <button
              className="process-receipt-btn"
              onClick={processReceipt}
              disabled={isProcessing}
            >
              {isProcessing ? (
                <>
                  <span className="spinner"></span>
                  Preparing form...
                </>
              ) : (
                <>
                  <Sparkles size={17} />
                  Continue
                </>
              )}
            </button>
          )}
        </div>
      )}

      {isProcessing && (
        <div className="processing-card">
          <div className="processing-animation">
            <Sparkles size={30} />
          </div>
          <h2>Preparing your form...</h2>
          <p>Fill in the purchase details on the next screen.</p>

          <div className="processing-steps">
            <div className="processing-step completed">
              <CheckCircle2 size={17} />
              Receipt uploaded
            </div>
            <div className="processing-step active">
              <Sparkles size={17} />
              Preparing form
            </div>
            <div className="processing-step">
              <Save size={17} />
              Ready to save
            </div>
          </div>
        </div>
      )}

      {extractedData && (
        <div className="extraction-section">
          <div className="extraction-header">
            <div>
              <div className="ai-label">
                <Sparkles size={14} />
                CONFIRM DETAILS
              </div>
              <h2>Purchase Information</h2>
              <p>Fill in the details before saving the purchase.</p>
            </div>
          </div>

          <div className="extracted-card">
            <div className="extracted-grid">
              <div className="extracted-field">
                <label>Product Name *</label>
                <input
                  type="text"
                  value={extractedData.productName}
                  onChange={(e) => handleFieldChange("productName", e.target.value)}
                  placeholder="e.g. HP Laptop"
                />
              </div>

              <div className="extracted-field">
                <label>Store</label>
                <input
                  type="text"
                  value={extractedData.store}
                  onChange={(e) => handleFieldChange("store", e.target.value)}
                  placeholder="e.g. Amazon"
                />
              </div>

              <div className="extracted-field">
                <label>Price (₹) *</label>
                <input
                  type="number"
                  value={extractedData.price}
                  onChange={(e) => handleFieldChange("price", e.target.value)}
                  placeholder="52000"
                />
              </div>

              <div className="extracted-field">
                <label>Category</label>
                <select
                  value={extractedData.category}
                  onChange={(e) => handleFieldChange("category", e.target.value)}
                >
                  <option>Electronics</option>
                  <option>Clothing</option>
                  <option>Home</option>
                  <option>Other</option>
                </select>
              </div>

              <div className="extracted-field">
                <label>Purchase Date *</label>
                <input
                  type="date"
                  value={extractedData.purchaseDate}
                  onChange={(e) => handleFieldChange("purchaseDate", e.target.value)}
                />
              </div>

              <div className="extracted-field">
                <label>Warranty (months)</label>
                <input
                  type="number"
                  value={extractedData.warrantyPeriod}
                  onChange={(e) => handleFieldChange("warrantyPeriod", e.target.value)}
                  placeholder="12"
                />
              </div>

              <div className="extracted-field">
                <label>Return Deadline</label>
                <input
                  type="date"
                  value={extractedData.returnDeadline}
                  onChange={(e) => handleFieldChange("returnDeadline", e.target.value)}
                />
              </div>
            </div>

            {saveError && <p className="form-error">{saveError}</p>}

            <div className="extraction-actions">
              <button className="edit-extraction-btn" onClick={removeFile}>
                <X size={16} />
                Cancel
              </button>

              <button
                className="save-extraction-btn"
                onClick={savePurchase}
                disabled={saving}
              >
                <Save size={16} />
                {saving ? "Saving..." : "Save Purchase"}
              </button>
            </div>
          </div>
        </div>
      )}

      {!selectedFile && !extractedData && (
        <div className="recent-receipts">
          <div className="card-header">
            <div>
              <h2>Recent Receipts</h2>
              <p className="card-subtitle">Purchases with an uploaded bill will appear here</p>
            </div>
          </div>
          <p style={{ color: "#94a3b8", fontSize: "12px", marginTop: "10px" }}>
            Tip: check the Purchases page to view saved receipts.
          </p>
        </div>
      )}
    </div>
  );
}

export default Receipts;