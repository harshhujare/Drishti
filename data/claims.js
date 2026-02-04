/**
 * Claims Data Management
 * Manages insurance claim submissions and approvals
 */

import { v4 as uuidv4 } from "uuid";

// In-memory claims storage
let claimsData = [];

/**
 * Create a new claim
 * @param {Object} claimInput - Claim data
 * @returns {Object} Created claim
 */
export function createClaim(claimInput) {
  const claim = {
    id: uuidv4(),
    farmId: claimInput.farmId,
    farmerName: claimInput.farmerName,
    alertId: claimInput.alertId || null,
    yieldLossData: claimInput.yieldLossData,
    payoutData: claimInput.payoutData,
    status: "pending", // pending, approved, rejected, flagged
    submittedAt: new Date(),
    reviewedAt: null,
    reviewedBy: null,
    officerNotes: null,
    metadata: {
      village: claimInput.village,
      area: claimInput.area,
      insuranceValue: claimInput.insuranceValue,
    },
  };

  claimsData.push(claim);
  return claim;
}

/**
 * Get all claims with optional filtering
 * @param {string} filter - Filter by status (all, pending, approved, rejected, flagged)
 * @returns {Array} Filtered claims
 */
export function getClaims(filter = "all") {
  if (filter === "all") {
    return claimsData;
  }

  return claimsData.filter((claim) => claim.status === filter);
}

/**
 * Get claim by ID
 * @param {string} claimId - Claim ID
 * @returns {Object|null} Claim or null
 */
export function getClaimById(claimId) {
  return claimsData.find((claim) => claim.id === claimId) || null;
}

/**
 * Get claims by farm ID
 * @param {number} farmId - Farm ID
 * @returns {Array} Claims for the farm
 */
export function getClaimsByFarmId(farmId) {
  return claimsData.filter((claim) => claim.farmId === farmId);
}

/**
 * Update claim status
 * @param {string} claimId - Claim ID
 * @param {string} status - New status
 * @param {string} reviewedBy - Officer name
 * @param {string} notes - Optional notes
 * @returns {Object|null} Updated claim or null
 */
export function updateClaimStatus(
  claimId,
  status,
  reviewedBy = null,
  notes = null,
) {
  const claim = getClaimById(claimId);

  if (!claim) {
    return null;
  }

  claim.status = status;
  claim.reviewedAt = new Date();
  claim.reviewedBy = reviewedBy;
  if (notes) {
    claim.officerNotes = notes;
  }

  return claim;
}

/**
 * Approve claim
 * @param {string} claimId - Claim ID
 * @param {string} officerName - Officer approving the claim
 * @returns {Object|null} Approved claim or null
 */
export function approveClaim(claimId, officerName = "System Officer") {
  return updateClaimStatus(claimId, "approved", officerName, "Claim approved");
}

/**
 * Reject claim
 * @param {string} claimId - Claim ID
 * @param {string} officerName - Officer rejecting the claim
 * @param {string} reason - Rejection reason
 * @returns {Object|null} Rejected claim or null
 */
export function rejectClaim(
  claimId,
  officerName = "System Officer",
  reason = "Insufficient evidence",
) {
  return updateClaimStatus(claimId, "rejected", officerName, reason);
}

/**
 * Flag claim for inspection
 * @param {string} claimId - Claim ID
 * @param {string} officerName - Officer flagging the claim
 * @param {string} reason - Flag reason
 * @returns {Object|null} Flagged claim or null
 */
export function flagClaim(
  claimId,
  officerName = "System Officer",
  reason = "Requires field inspection",
) {
  return updateClaimStatus(claimId, "flagged", officerName, reason);
}

/**
 * Get claims statistics
 * @returns {Object} Statistics summary
 */
export function getClaimsStats() {
  const total = claimsData.length;
  const pending = claimsData.filter((c) => c.status === "pending").length;
  const approved = claimsData.filter((c) => c.status === "approved").length;
  const rejected = claimsData.filter((c) => c.status === "rejected").length;
  const flagged = claimsData.filter((c) => c.status === "flagged").length;

  const totalPayout = claimsData
    .filter((c) => c.status === "approved")
    .reduce((sum, c) => sum + c.payoutData.finalPayout, 0);

  const pendingPayout = claimsData
    .filter((c) => c.status === "pending")
    .reduce((sum, c) => sum + c.payoutData.finalPayout, 0);

  return {
    total,
    pending,
    approved,
    rejected,
    flagged,
    totalPayout: Math.round(totalPayout),
    pendingPayout: Math.round(pendingPayout),
    approvalRate: total > 0 ? ((approved / total) * 100).toFixed(1) : 0,
  };
}

/**
 * Auto-generate claims from alerts (for demo setup)
 * @param {Array} alerts - Array of alert objects
 * @param {Array} farms - Array of farm objects
 * @returns {Array} Generated claims
 */
export function autoGenerateClaimsFromAlerts(
  alerts,
  farms,
  yieldLossEstimator,
  payoutCalculator,
) {
  const generatedClaims = [];

  alerts.forEach((alert) => {
    const farm = farms.find((f) => f.id === alert.farmId);

    if (!farm || alert.severity === "low") {
      return; // Skip low-severity alerts
    }

    // Check if claim already exists
    const existingClaim = claimsData.find((c) => c.farmId === farm.id);
    if (existingClaim) {
      return; // Skip if claim already exists
    }

    // Estimate yield loss
    const yieldLossData = yieldLossEstimator.estimateYieldLoss(
      alert.currentNDVI,
      alert.baselineNDVI,
      alert.estimatedCause || "flood",
    );

    // Calculate payout
    const payoutData = payoutCalculator.calculatePayout(farm, yieldLossData, {
      heavyRainfall: alert.estimatedCause === "flood",
    });

    // Create claim
    const claim = createClaim({
      farmId: farm.id,
      farmerName: farm.farmerName,
      alertId: alert.id,
      yieldLossData,
      payoutData,
      village: farm.administrativeData?.village,
      area: farm.area,
      insuranceValue: farm.insuranceValue,
    });

    generatedClaims.push(claim);
  });

  return generatedClaims;
}

/**
 * Clear all claims (for testing)
 */
export function clearAllClaims() {
  claimsData = [];
}

export default {
  createClaim,
  getClaims,
  getClaimById,
  getClaimsByFarmId,
  updateClaimStatus,
  approveClaim,
  rejectClaim,
  flagClaim,
  getClaimsStats,
  autoGenerateClaimsFromAlerts,
  clearAllClaims,
};
