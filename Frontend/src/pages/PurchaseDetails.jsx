import { ShoppingBag } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { getPurchaseById } from "../services/api";
import { formatDate } from "../utils/dateHelper";

function PurchaseDetails() {
  const navigate = useNavigate();
  const { id } = useParams(); // Mongo _id is a string, no Number() cast

  const [purchase, setPurchase] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchPurchase();
  }, [id]);

  const fetchPurchase = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await getPurchaseById(id);
      if (res.success) {
        setPurchase(res.data);
      } else {
        setError(res.message || "Purchase not found.");
      }
    } catch (err) {
      console.error(err);
      setError("Could not load this purchase. It may not exist.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="page-loading">Loading purchase...</div>;
  }

  if (error || !purchase) {
    return (
      <div className="purchase-details-page">
        <button className="back-purchases-btn" onClick={() => navigate("/purchases")}>
          ← Back to Purchases
        </button>

        <div className="empty-state">
          <ShoppingBag size={45} />
          <h3>Purchase not found</h3>
          <p>{error || "The purchase you're looking for doesn't exist."}</p>
        </div>
      </div>
    );
  }

  const warrantyActive =
    purchase.warrantyExpiryDate &&
    new Date(purchase.warrantyExpiryDate) > new Date();

  return (
    <div className="purchase-details-page">
      <div className="purchase-details-header">
        <div>
          <div className="purchase-details-label">PURCHASE DETAILS</div>
          <h1>{purchase.productName}</h1>
          <p>Complete information about your purchase</p>
        </div>

        <button className="back-purchases-btn" onClick={() => navigate("/purchases")}>
          ← Back to Purchases
        </button>
      </div>

      <div className="purchase-details-grid">
        <div className="purchase-main-card">
          <div className="purchase-product-section">
            <div className="purchase-product-icon">🛍️</div>
            <div>
              <h2>{purchase.productName}</h2>
              <span>{purchase.category}</span>
            </div>
          </div>

          <div className="details-section">
            <h3>Purchase Information</h3>
            <div className="details-info-grid">
              <div className="detail-item">
                <span>Store</span>
                <strong>{purchase.store || "N/A"}</strong>
              </div>
              <div className="detail-item">
                <span>Purchase Date</span>
                <strong>{formatDate(purchase.purchaseDate)}</strong>
              </div>
              <div className="detail-item">
                <span>Amount</span>
                <strong>₹{purchase.price?.toLocaleString("en-IN")}</strong>
              </div>
              <div className="detail-item">
                <span>Category</span>
                <strong>{purchase.category}</strong>
              </div>
            </div>
          </div>

          {purchase.warrantyExpiryDate && (
            <div className="details-section">
              <h3>Warranty</h3>
              <div className="warranty-detail-box">
                <div className="detail-icon">🛡️</div>
                <div>
                  <span>Warranty Period</span>
                  <strong>
                    {purchase.warrantyPeriod
                      ? `${purchase.warrantyPeriod} Months`
                      : "N/A"}
                  </strong>
                </div>
                <div className="warranty-expiry">
                  <span>Expires</span>
                  <strong>{formatDate(purchase.warrantyExpiryDate)}</strong>
                </div>
              </div>
            </div>
          )}

          {purchase.returnDeadline && (
            <div className="details-section">
              <h3>Return Information</h3>
              <div className="return-detail-box">
                <div className="detail-icon">↩</div>
                <div>
                  <span>Return Deadline</span>
                  <strong>{formatDate(purchase.returnDeadline)}</strong>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="purchase-side-column">
          <div className="purchase-price-card">
            <span>Total Purchase Amount</span>
            <h2>₹{purchase.price?.toLocaleString("en-IN")}</h2>
            <p>Paid at {purchase.store || "store"}</p>
          </div>

          <div className="purchase-status-card">
            <h3>Purchase Status</h3>
            <div className="status-row">
              <span>Warranty</span>
              <strong className={warrantyActive ? "status-active" : ""}>
                {purchase.warrantyExpiryDate
                  ? warrantyActive
                    ? "Active"
                    : "Expired"
                  : "Not Applicable"}
              </strong>
            </div>
            <div className="status-row">
              <span>Return</span>
              <strong className="status-return">
                {purchase.returnDeadline
                  ? new Date(purchase.returnDeadline) > new Date()
                    ? "Available"
                    : "Expired"
                  : "Not Applicable"}
              </strong>
            </div>
            <div className="status-row">
              <span>Receipt</span>
              <strong className="status-active">
                {purchase.billImageUrl ? "Available" : "Not Uploaded"}
              </strong>
            </div>
          </div>

          <div className="receipt-preview-card">
            <div>
              <div className="receipt-preview-icon">🧾</div>
              <div>
                <h3>Receipt</h3>
                <p>Original purchase receipt</p>
              </div>
            </div>

            <button
              disabled={!purchase.billImageUrl}
              onClick={() => window.open(purchase.billImageUrl, "_blank")}
            >
              {purchase.billImageUrl ? "View Receipt" : "No Receipt Uploaded"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PurchaseDetails;