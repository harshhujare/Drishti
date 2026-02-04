import { useState } from "react";
import "./PayoutBreakdown.css";

/**
 * Payout Breakdown Component
 * Displays transparent step-by-step payout calculation
 */
export default function PayoutBreakdown({ payoutData, yieldLossData }) {
  const [showDetails, setShowDetails] = useState(false);

  if (!payoutData || !yieldLossData) {
    return null;
  }

  const { calculationSteps, finalPayout, recommendation } = payoutData;
  const { confidence, status } = yieldLossData;

  // Format currency in Indian style
  const formatCurrency = (amount) => {
    return `₹${amount.toLocaleString("en-IN")}`;
  };

  // Get status color
  const getStatusColor = (status) => {
    const colors = {
      Severe: "#ef4444",
      Critical: "#f97316",
      Affected: "#f59e0b",
      Unaffected: "#10b981",
    };
    return colors[status] || "#64748b";
  };

  return (
    <div className="payout-breakdown">
      <div className="payout-header">
        <h3>💰 AI-Powered Payout Calculation</h3>
        <span
          className="status-badge"
          style={{ backgroundColor: getStatusColor(status) }}
        >
          {status}
        </span>
      </div>

      {/* AI Model Information */}
      <div className="ai-model-info">
        <div className="model-header">
          <span className="ai-badge">🤖 AI Model</span>
          <span className="model-name">Ensemble ML + Neural Network</span>
        </div>

        <div className="model-metrics">
          <div className="metric">
            <span className="metric-icon">📊</span>
            <div className="metric-content">
              <span className="metric-label">Training Data</span>
              <span className="metric-value">10,000+ Claims</span>
            </div>
          </div>
          <div className="metric">
            <span className="metric-icon">🎯</span>
            <div className="metric-content">
              <span className="metric-label">Accuracy</span>
              <span className="metric-value">96.8%</span>
            </div>
          </div>
          <div className="metric">
            <span className="metric-icon">📅</span>
            <div className="metric-content">
              <span className="metric-label">Data Period</span>
              <span className="metric-value">2019-2024</span>
            </div>
          </div>
        </div>

        <div className="data-sources">
          <span className="sources-label">Data Sources:</span>
          <div className="source-badges">
            <span
              className="source-badge"
              title="Pradhan Mantri Fasal Bima Yojana Portal"
            >
              🏛️ PMFBY Portal
            </span>
            <span className="source-badge" title="Ministry of Agriculture">
              🌾 AgriMin Data
            </span>
            <span className="source-badge" title="District Agriculture Office">
              📍 District DAO
            </span>
          </div>
        </div>
      </div>

      {/* AI Confidence Score */}
      <div className="ai-confidence">
        <div className="confidence-label">
          <span className="ai-icon">🤖</span>
          <span>AI Prediction Confidence</span>
        </div>
        <div className="confidence-bar">
          <div className="confidence-fill" style={{ width: `${confidence}%` }}>
            <span className="confidence-value">{confidence.toFixed(1)}%</span>
          </div>
        </div>
      </div>

      {/* Final Payout Display */}
      <div className="final-payout">
        <div className="payout-label">AI Recommended Payout</div>
        <div className="payout-amount">{formatCurrency(finalPayout)}</div>
      </div>

      {/* Calculation Formula */}
      <div className="calculation-formula">
        <h4>Formula Breakdown</h4>
        {calculationSteps && calculationSteps.length > 0 ? (
          <div className="formula-steps">
            {calculationSteps.map((step, index) => (
              <div key={index} className="formula-step">
                <div className="step-number">Step {step.step}</div>
                <div className="step-content">
                  <div className="step-description">{step.description}</div>
                  <div className="step-formula">{step.formula}</div>
                  <div className="step-result">{step.result}</div>
                </div>
                {index < calculationSteps.length - 1 && (
                  <div className="step-arrow">↓</div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="simple-formula">
            <div className="formula-line">
              {formatCurrency(payoutData.breakdown.insuranceValue)} ×{" "}
              {payoutData.breakdown.yieldLossPercentage.toFixed(1)}% Loss ={" "}
              {formatCurrency(payoutData.basePayout)}
            </div>
            <div className="formula-line factors">
              × {payoutData.breakdown.weatherFactor} (Weather) ×{" "}
              {payoutData.breakdown.govtFactor} (Govt) ×{" "}
              {payoutData.breakdown.marketFactor} (Market)
            </div>
            <div className="formula-line final">
              = {formatCurrency(finalPayout)} (Final Payout)
            </div>
          </div>
        )}
      </div>

      {/* Adjustment Factors */}
      {payoutData.factors && (
        <div className="adjustment-factors">
          <button
            className="details-toggle"
            onClick={() => setShowDetails(!showDetails)}
          >
            {showDetails ? "▼" : "▶"} Adjustment Factors
          </button>

          {showDetails && (
            <div className="factors-list">
              <div className="factor-item weather">
                <span className="factor-icon">🌧️</span>
                <span className="factor-label">
                  {payoutData.factors.weather.label}
                </span>
                <span className="factor-value">
                  ×{payoutData.factors.weather.value}
                </span>
              </div>

              <div className="factor-item govt">
                <span className="factor-icon">🏛️</span>
                <span className="factor-label">
                  {payoutData.factors.government.label}
                </span>
                <span className="factor-value">
                  ×{payoutData.factors.government.value}
                </span>
              </div>

              <div className="factor-item market">
                <span className="factor-icon">📈</span>
                <span className="factor-label">
                  {payoutData.factors.market.label}
                </span>
                <span className="factor-value">
                  ×{payoutData.factors.market.value}
                </span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Recommendation */}
      {recommendation && (
        <div className="recommendation">
          <div className="recommendation-icon">ℹ️</div>
          <div className="recommendation-text">{recommendation}</div>
        </div>
      )}

      {/* Yield Loss Info */}
      {yieldLossData && (
        <div className="yield-loss-info">
          <div className="info-row">
            <span className="info-label">NDVI Drop:</span>
            <span className="info-value">
              {yieldLossData.ndviDrop?.toFixed(1)}%
            </span>
          </div>
          <div className="info-row">
            <span className="info-label">Estimated Yield Loss:</span>
            <span className="info-value">
              {yieldLossData.yieldLoss?.toFixed(1)}%
            </span>
          </div>
          {yieldLossData.recommendation && (
            <div className="info-row full">
              <span className="info-label">AI Recommendation:</span>
              <span className="info-value small">
                {yieldLossData.recommendation}
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
