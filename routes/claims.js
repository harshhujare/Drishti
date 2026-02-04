/**
 * Claims API Routes
 * Handles insurance claim submissions and officer approvals
 */

import express from "express";
import {
  getClaims,
  getClaimById,
  getClaimsByFarmId,
  createClaim,
  approveClaim,
  rejectClaim,
  flagClaim,
  getClaimsStats,
  autoGenerateClaimsFromAlerts,
} from "../data/claims.js";
import { getActiveAlerts } from "../data/alerts.js";
import { getFarms } from "../data/farms.js";
import { estimateYieldLoss } from "../services/yieldLossEstimator.js";
import { calculatePayout } from "../services/payoutCalculator.js";

const router = express.Router();

/**
 * GET /api/claims
 * Get all claims with optional status filter
 */
router.get("/claims", (req, res) => {
  try {
    const { status } = req.query;
    const claims = getClaims(status || "all");

    res.json({
      success: true,
      count: claims.length,
      claims,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch claims",
      error: error.message,
    });
  }
});

/**
 * GET /api/claims/stats
 * Get claims statistics
 */
router.get("/claims/stats", (req, res) => {
  try {
    const stats = getClaimsStats();

    res.json({
      success: true,
      stats,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch claims statistics",
      error: error.message,
    });
  }
});

/**
 * GET /api/claims/:id
 * Get single claim by ID
 */
router.get("/claims/:id", (req, res) => {
  try {
    const claim = getClaimById(req.params.id);

    if (!claim) {
      return res.status(404).json({
        success: false,
        message: "Claim not found",
      });
    }

    res.json({
      success: true,
      claim,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch claim",
      error: error.message,
    });
  }
});

/**
 * GET /api/claims/farm/:farmId
 * Get claims for a specific farm
 */
router.get("/claims/farm/:farmId", (req, res) => {
  try {
    const farmId = parseInt(req.params.farmId);
    const claims = getClaimsByFarmId(farmId);

    res.json({
      success: true,
      count: claims.length,
      claims,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch farm claims",
      error: error.message,
    });
  }
});

/**
 * POST /api/claims
 * Create a new claim
 */
router.post("/claims", (req, res) => {
  try {
    const claim = createClaim(req.body);

    res.status(201).json({
      success: true,
      message: "Claim created successfully",
      claim,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to create claim",
      error: error.message,
    });
  }
});

/**
 * PUT /api/claims/:id/approve
 * Approve a claim
 */
router.put("/claims/:id/approve", (req, res) => {
  try {
    const { officerName } = req.body;
    const claim = approveClaim(req.params.id, officerName);

    if (!claim) {
      return res.status(404).json({
        success: false,
        message: "Claim not found",
      });
    }

    res.json({
      success: true,
      message: `Claim approved for ${claim.farmerName}`,
      claim,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to approve claim",
      error: error.message,
    });
  }
});

/**
 * PUT /api/claims/:id/reject
 * Reject a claim
 */
router.put("/claims/:id/reject", (req, res) => {
  try {
    const { officerName, reason } = req.body;
    const claim = rejectClaim(req.params.id, officerName, reason);

    if (!claim) {
      return res.status(404).json({
        success: false,
        message: "Claim not found",
      });
    }

    res.json({
      success: true,
      message: `Claim rejected for ${claim.farmerName}`,
      claim,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to reject claim",
      error: error.message,
    });
  }
});

/**
 * PUT /api/claims/:id/flag
 * Flag a claim for inspection
 */
router.put("/claims/:id/flag", (req, res) => {
  try {
    const { officerName, reason } = req.body;
    const claim = flagClaim(req.params.id, officerName, reason);

    if (!claim) {
      return res.status(404).json({
        success: false,
        message: "Claim not found",
      });
    }

    res.json({
      success: true,
      message: `Claim flagged for ${claim.farmerName}`,
      claim,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to flag claim",
      error: error.message,
    });
  }
});

/**
 * POST /api/claims/auto-generate
 * Auto-generate claims from active alerts (for demo setup)
 */
router.post("/claims/auto-generate", (req, res) => {
  try {
    const alerts = getActiveAlerts();
    const farms = getFarms();

    const claims = autoGenerateClaimsFromAlerts(
      alerts,
      farms,
      { estimateYieldLoss },
      { calculatePayout },
    );

    res.json({
      success: true,
      message: `Generated ${claims.length} claims from active alerts`,
      count: claims.length,
      claims,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to auto-generate claims",
      error: error.message,
    });
  }
});

export default router;
