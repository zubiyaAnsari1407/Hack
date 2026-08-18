import { useState } from "react";
import { X, Upload } from "lucide-react";
import { createPurchase } from "../services/api";

function AddPurchaseModal({ onClose, onSuccess }) {
  const [form, setForm] = useState({
    productName: "",
    category: "Electronics",
    brand: "",
    price: "",
    purchaseDate: "",
    store: "",
    warrantyPeriod: "",
    returnDeadline: "",
    notes: "",
  });
  const [billImage, setBillImage] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    setBillImage(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!form.productName || !form.price || !form.purchaseDate) {
      setError("Product name, price and purchase date are required.");
      return;
    }

    try {
      setSubmitting(true);

      const formData = new FormData();
      // TEMP: hardcoded userId until auth is built
      formData.append("userId", "000000000000000000000000");
      Object.entries(form).forEach(([key, value]) => {
        if (value !== "") formData.append(key, value);
      });
      if (billImage) formData.append("billImage", billImage);

      const res = await createPurchase(formData);

      if (res.success) {
        onSuccess();
        onClose();
      } else {
        setError(res.message || "Something went wrong.");
      }
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.message ||
          "Could not add purchase. Check backend connection."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Add Purchase</h2>
          <button className="modal-close" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-row">
            <label>Product Name *</label>
            <input
              type="text"
              name="productName"
              value={form.productName}
              onChange={handleChange}
              placeholder="e.g. HP Laptop"
            />
          </div>

          <div className="form-row-group">
            <div className="form-row">
              <label>Category</label>
              <select name="category" value={form.category} onChange={handleChange}>
                <option>Electronics</option>
                <option>Clothing</option>
                <option>Home</option>
                <option>Other</option>
              </select>
            </div>

            <div className="form-row">
              <label>Brand</label>
              <input
                type="text"
                name="brand"
                value={form.brand}
                onChange={handleChange}
                placeholder="e.g. HP"
              />
            </div>
          </div>

          <div className="form-row-group">
            <div className="form-row">
              <label>Price (₹) *</label>
              <input
                type="number"
                name="price"
                value={form.price}
                onChange={handleChange}
                placeholder="52000"
              />
            </div>

            <div className="form-row">
              <label>Store</label>
              <input
                type="text"
                name="store"
                value={form.store}
                onChange={handleChange}
                placeholder="Amazon"
              />
            </div>
          </div>

          <div className="form-row-group">
            <div className="form-row">
              <label>Purchase Date *</label>
              <input
                type="date"
                name="purchaseDate"
                value={form.purchaseDate}
                onChange={handleChange}
              />
            </div>

            <div className="form-row">
              <label>Warranty (months)</label>
              <input
                type="number"
                name="warrantyPeriod"
                value={form.warrantyPeriod}
                onChange={handleChange}
                placeholder="12"
              />
            </div>
          </div>

          <div className="form-row">
            <label>Return Deadline</label>
            <input
              type="date"
              name="returnDeadline"
              value={form.returnDeadline}
              onChange={handleChange}
            />
          </div>

          <div className="form-row">
            <label>Bill / Receipt Image</label>
            <label className="file-upload-box">
              <Upload size={18} />
              <span>{billImage ? billImage.name : "Click to upload"}</span>
              <input
                type="file"
                accept="image/*,.pdf"
                onChange={handleFileChange}
                hidden
              />
            </label>
          </div>

          <div className="form-row">
            <label>Notes</label>
            <textarea
              name="notes"
              value={form.notes}
              onChange={handleChange}
              rows={2}
              placeholder="Optional notes..."
            />
          </div>

          {error && <p className="form-error">{error}</p>}

          <div className="modal-actions">
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={submitting}>
              {submitting ? "Saving..." : "Save Purchase"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddPurchaseModal;