/**
 * Payout Calculator Service
 * Transparent insurance payout calculation with explicit factor breakdown
 * For PMFBY hackathon demonstration
 */

/**
 * Calculate insurance payout with transparent breakdown
 * @param {Object} farm - Farm object with insurance details
 * @param {Object} yieldLossData - Yield loss estimation from yieldLossEstimator
 * @param {Object} disasterContext - Additional disaster context
 * @returns {Object} Payout calculation with detailed breakdown
 */
export function calculatePayout(farm, yieldLossData, disasterContext = {}) {
  const { insuranceValue } = farm;
  const { yieldLoss, ndviDrop, disasterType } = yieldLossData;

  // Base payout: Insurance Value × (Yield Loss / 100)
  const basePayout = insuranceValue * (yieldLoss / 100);

  // Explicit adjustment factors for transparency
  const factors = {
    weather: {
      value:
        disasterContext.heavyRainfall || disasterType === "flood" ? 1.1 : 1.0,
      label:
        disasterContext.heavyRainfall || disasterType === "flood"
          ? "Heavy Rainfall Recorded (+10%)"
          : "Normal Weather Conditions",
      applied: disasterContext.heavyRainfall || disasterType === "flood",
    },
    government: {
      value: 1.0,
      label: "Standard MSP (Minimum Support Price)",
      applied: true,
    },
    market: {
      value: 0.95,
      label: "Current Market Adjustment (-5%)",
      applied: true,
    },
  };

  // Calculate final payout with all factors
  const finalPayout =
    basePayout *
    factors.weather.value *
    factors.government.value *
    factors.market.value;

  // Determine recommendation based on payout amount
  let recommendation;
  if (finalPayout > 200000) {
    recommendation = "Requires senior officer approval (>₹2 Lakh)";
  } else if (finalPayout > 100000) {
    recommendation = "Standard approval process";
  } else {
    recommendation = "Fast-track approval eligible";
  }

  // Generate step-by-step calculation for UI display
  const calculationSteps = [
    {
      step: 1,
      description: "Base Payout Calculation",
      formula: `₹${formatCurrency(insuranceValue)} × ${yieldLoss.toFixed(1)}% yield loss`,
      result: `₹${formatCurrency(basePayout)}`,
    },
    {
      step: 2,
      description: "Weather Factor",
      formula: `₹${formatCurrency(basePayout)} × ${factors.weather.value} (${factors.weather.label})`,
      result: `₹${formatCurrency(basePayout * factors.weather.value)}`,
    },
    {
      step: 3,
      description: "Government Rate",
      formula: `× ${factors.government.value} (${factors.government.label})`,
      result: `₹${formatCurrency(basePayout * factors.weather.value * factors.government.value)}`,
    },
    {
      step: 4,
      description: "Market Adjustment",
      formula: `× ${factors.market.value} (${factors.market.label})`,
      result: `₹${formatCurrency(finalPayout)}`,
    },
  ];

  return {
    farmId: farm.id,
    farmerName: farm.farmerName,
    basePayout: Math.round(basePayout),
    factors,
    finalPayout: Math.round(finalPayout),
    calculationSteps,
    breakdown: {
      insuranceValue,
      yieldLossPercentage: yieldLoss,
      ndviDrop,
      weatherFactor: factors.weather.value,
      govtFactor: factors.government.value,
      marketFactor: factors.market.value,
    },
    recommendation,
    // For UI display
    summary: `Final Payout: ₹${formatCurrency(Math.round(finalPayout))} (${yieldLoss.toFixed(1)}% yield loss)`,
  };
}

/**
 * Calculate regional payout total
 * @param {Array} payouts - Array of individual payout objects
 * @returns {Object} Aggregated regional statistics
 */
export function calculateRegionalPayout(payouts) {
  const total = payouts.reduce((sum, p) => sum + p.finalPayout, 0);
  const average = payouts.length > 0 ? total / payouts.length : 0;
  const max =
    payouts.length > 0 ? Math.max(...payouts.map((p) => p.finalPayout)) : 0;
  const min =
    payouts.length > 0 ? Math.min(...payouts.map((p) => p.finalPayout)) : 0;

  // Distribution by range
  const distribution = {
    range1: payouts.filter((p) => p.finalPayout < 100000).length, // <₹1L
    range2: payouts.filter(
      (p) => p.finalPayout >= 100000 && p.finalPayout < 200000,
    ).length, // ₹1-2L
    range3: payouts.filter(
      (p) => p.finalPayout >= 200000 && p.finalPayout < 300000,
    ).length, // ₹2-3L
    range4: payouts.filter((p) => p.finalPayout >= 300000).length, // >₹3L
  };

  return {
    totalPayout: Math.round(total),
    totalPayoutCrores: (total / 10000000).toFixed(2),
    averagePayout: Math.round(average),
    maxPayout: Math.round(max),
    minPayout: Math.round(min),
    farmsWithPayout: payouts.length,
    distribution,
    formattedTotal: `₹${formatCurrency(Math.round(total))}`,
    formattedAverage: `₹${formatCurrency(Math.round(average))}`,
  };
}

/**
 * Format currency for display (Indian numbering system)
 * @param {number} amount - Amount to format
 * @returns {string} Formatted currency string
 */
function formatCurrency(amount) {
  // Indian numbering: 1,00,000 instead of 100,000
  return amount.toLocaleString("en-IN");
}

/**
 * Get payout range category
 * @param {number} payout - Payout amount
 * @returns {Object} Category with label and color
 */
export function getPayoutCategory(payout) {
  if (payout < 100000) {
    return {
      category: "low",
      label: "< ₹1 Lakh",
      color: "#10b981",
      range: "0-1L",
    };
  } else if (payout < 200000) {
    return {
      category: "medium",
      label: "₹1-2 Lakh",
      color: "#f59e0b",
      range: "1-2L",
    };
  } else if (payout < 300000) {
    return {
      category: "high",
      label: "₹2-3 Lakh",
      color: "#f97316",
      range: "2-3L",
    };
  } else {
    return {
      category: "critical",
      label: "> ₹3 Lakh",
      color: "#ef4444",
      range: "3L+",
    };
  }
}

/**
 * Batch calculate payouts for multiple farms
 * @param {Array} farmsWithYieldLoss - Array of farms with yield loss data
 * @param {Object} disasterContext - Disaster context (same for all)
 * @returns {Array} Array of payout calculations
 */
export function batchCalculatePayouts(
  farmsWithYieldLoss,
  disasterContext = {},
) {
  return farmsWithYieldLoss
    .filter((farm) => farm.yieldLossData && farm.yieldLossData.affected)
    .map((farm) => calculatePayout(farm, farm.yieldLossData, disasterContext));
}

/**
 * Generate payout summary for officer dashboard
 * @param {Object} farm - Farm object
 * @param {Object} payoutData - Payout calculation result
 * @returns {Object} Summary for UI card
 */
export function generatePayoutSummary(farm, payoutData) {
  return {
    farmId: farm.id,
    farmerName: farm.farmerName,
    village: farm.administrativeData.village,
    area: `${farm.area} Ha`,
    yieldLoss: `${payoutData.breakdown.yieldLossPercentage.toFixed(1)}%`,
    ndviDrop: `${payoutData.breakdown.ndviDrop.toFixed(1)}%`,
    insuranceValue: `₹${formatCurrency(farm.insuranceValue)}`,
    recommendedPayout: `₹${formatCurrency(payoutData.finalPayout)}`,
    status: "pending",
    priority: payoutData.finalPayout > 200000 ? "high" : "normal",
  };
}
