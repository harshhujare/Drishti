import { useState } from "react";
import "./ClaimActionCard.css";

/**
 * Claim Action Card Component
 * Individual claim card with approve/reject/flag actions for officer dashboard
 */
export default function ClaimActionCard({
  claim,
  onApprove,
  onReject,
  onFlag,
  onViewDetails,
}) {
  const [actionState, setActionState] = useState("idle"); // idle, approving, rejecting, flagging, approved, rejected, flagged
  const [showRejectReason, setShowRejectReason] = useState(false);
  const [rejectReason, setRejectReason] = useState("");

  const formatCurrency = (amount) => {
    return `₹${amount.toLocaleString("en-IN")}`;
  };

  const getStatusBadge = () => {
    const status = claim.yieldLossData?.status || "Unknown";
    const colors = {
      Severe: { bg: "#fef2f2", text: "#dc2626", border: "#fecaca" },
      Critical: { bg: "#fff7ed", text: "#ea580c", border: "#fed7aa" },
      Affected: { bg: "#fffbeb", text: "#d97706", border: "#fde68a" },
    };
    const style = colors[status] || {
      bg: "#f5f5f5",
      text: "#666",
      border: "#ddd",
    };
    return { status, style };
  };

  const handleApprove = async () => {
    setActionState("approving");
    setTimeout(async () => {
      setActionState("approved");
      if (onApprove) {
        await onApprove(claim.id);
      }
    }, 800);
  };

  const handleReject = async () => {
    if (!showRejectReason) {
      setShowRejectReason(true);
      return;
    }

    setActionState("rejecting");
    setTimeout(async () => {
      setActionState("rejected");
      if (onReject) {
        await onReject(claim.id, rejectReason);
      }
    }, 600);
  };

  const handleFlag = async () => {
    setActionState("flagging");
    setTimeout(async () => {
      setActionState("flagged");
      if (onFlag) {
        await onFlag(claim.id);
      }
    }, 500);
  };

  const { status, style } = getStatusBadge();

  // Show completed state with stamp
  if (["approved", "rejected", "flagged"].includes(actionState)) {
    return (
      <div className={`claim-card completed ${actionState}`}>
        <div className="stamp-overlay">
          <div className={`stamp ${actionState}`}>
            {actionState === "approved" && "✓ APPROVED"}
            {actionState === "rejected" && "✗ REJECTED"}
            {actionState === "flagged" && "🚩 FLAGGED"}
          </div>
        </div>
        <div className="card-content faded">
          <div className="farmer-info">
            <span className="farmer-name">{claim.farmerName}</span>
            <span className="payout-amount">
              {formatCurrency(claim.payoutData?.finalPayout || 0)}
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`claim-card ${actionState}`}>
      {/* Header */}
      <div className="card-header">
        <div className="farmer-details">
          <span className="farmer-icon">🌾</span>
          <div className="farmer-text">
            <span className="farmer-name">{claim.farmerName}</span>
            <span className="village-name">
              {claim.metadata?.village || "Shahuwadi"} Village
            </span>
          </div>
        </div>
        <div
          className="status-badge"
          style={{
            backgroundColor: style.bg,
            color: style.text,
            borderColor: style.border,
          }}
        >
          {status}
        </div>
      </div>

      {/* Farm Info */}
      <div className="farm-info">
        <div className="info-item">
          <span className="info-label">Farm ID</span>
          <span className="info-value">
            #{String(claim.farmId).padStart(3, "0")}
          </span>
        </div>
        <div className="info-item">
          <span className="info-label">Area</span>
          <span className="info-value">{claim.metadata?.area || "N/A"} Ha</span>
        </div>
        <div className="info-item">
          <span className="info-label">Insurance</span>
          <span className="info-value">
            {formatCurrency(claim.metadata?.insuranceValue || 0)}
          </span>
        </div>
      </div>

      {/* Loss Metrics */}
      <div className="loss-metrics">
        <div className="metric">
          <span className="metric-label">NDVI Drop</span>
          <span className="metric-value ndvi">
            {claim.yieldLossData?.ndviDrop?.toFixed(1) || "0"}%
          </span>
        </div>
        <div className="metric">
          <span className="metric-label">Est. Yield Loss</span>
          <span className="metric-value yield">
            {claim.yieldLossData?.yieldLoss?.toFixed(1) || "0"}%
          </span>
        </div>
        <div className="metric">
          <span className="metric-label">AI Confidence</span>
          <span className="metric-value confidence">
            {claim.yieldLossData?.confidence?.toFixed(1) || "0"}%
          </span>
        </div>
      </div>

      {/* Recommended Payout */}
      <div className="payout-section">
        <div className="payout-header">
          <span className="payout-icon">💰</span>
          <span className="payout-label">Recommended Payout</span>
        </div>
        <div className="payout-amount">
          {formatCurrency(claim.payoutData?.finalPayout || 0)}
        </div>
        <button
          className="view-details-btn"
          onClick={() => onViewDetails && onViewDetails(claim)}
        >
          View Calculation Details
        </button>
      </div>

      {/* Reject Reason Input */}
      {showRejectReason && (
        <div className="reject-reason-section">
          <textarea
            placeholder="Enter rejection reason..."
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            className="reject-reason-input"
          />
        </div>
      )}

      {/* Action Buttons */}
      <div className="action-buttons">
        <button
          className={`action-btn approve ${actionState === "approving" ? "loading" : ""}`}
          onClick={handleApprove}
          disabled={actionState !== "idle"}
        >
          {actionState === "approving" ? (
            <span className="btn-spinner"></span>
          ) : (
            <>
              <span className="btn-icon">✓</span>
              <span className="btn-text">Approve</span>
            </>
          )}
        </button>

        <button
          className={`action-btn reject ${actionState === "rejecting" ? "loading" : ""}`}
          onClick={handleReject}
          disabled={actionState !== "idle" && actionState !== "idle"}
        >
          {actionState === "rejecting" ? (
            <span className="btn-spinner"></span>
          ) : (
            <>
              <span className="btn-icon">✗</span>
              <span className="btn-text">
                {showRejectReason ? "Confirm" : "Reject"}
              </span>
            </>
          )}
        </button>

        <button
          className={`action-btn flag ${actionState === "flagging" ? "loading" : ""}`}
          onClick={handleFlag}
          disabled={actionState !== "idle"}
        >
          {actionState === "flagging" ? (
            <span className="btn-spinner"></span>
          ) : (
            <>
              <span className="btn-icon">🚩</span>
              <span className="btn-text">Flag</span>
            </>
          )}
        </button>
      </div>

      {/* Processing Overlay */}
      {["approving", "rejecting", "flagging"].includes(actionState) && (
        <div className="processing-overlay">
          <div className="processing-content">
            <div className="processing-spinner"></div>
            <span>Processing...</span>
          </div>
        </div>
      )}
    </div>
  );
}
