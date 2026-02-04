import { useState, useEffect } from "react";
import "./RegionalHealthDashboard.css";

/**
 * Regional Health Dashboard Component
 * Displays aggregated statistics, charts, and payout estimates for Shahuwadi Tehsil
 */
export default function RegionalHealthDashboard({ farms, alerts }) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (farms && farms.length > 0) {
      calculateStats();
    } else {
      // Handle empty or no farms - set default stats to avoid infinite loading
      setStats({
        totalFarms: 0,
        affectedFarms: 0,
        healthyFarms: 0,
        affectedPercentage: "0.0",
        totalEstimatedPayout: 0,
        payoutInCrores: "0.00",
        severityDistribution: { severe: 0, moderate: 0, healthy: 0 },
        avgPayoutPerFarm: 0,
      });
      setLoading(false);
    }
  }, [farms, alerts]);

  const calculateStats = () => {
    setLoading(true);

    // Count affected vs healthy based on alerts
    const affectedFarmIds = new Set(
      (alerts || [])
        .filter((a) => a.status === "active" && a.severity !== "low")
        .map((a) => a.farmId),
    );

    const affected = farms.filter((f) => affectedFarmIds.has(f.id));
    const healthy = farms.filter((f) => !affectedFarmIds.has(f.id));

    // Calculate severity distribution
    const severityDist = {
      severe: 0,
      moderate: 0,
      healthy: healthy.length,
    };

    (alerts || []).forEach((alert) => {
      if (alert.status !== "active") return;
      if (alert.dropPercentage >= 50) {
        severityDist.severe++;
      } else if (alert.dropPercentage >= 30) {
        severityDist.moderate++;
      }
    });

    // Estimate total payout (simplified calculation)
    let totalEstimatedPayout = 0;
    affected.forEach((farm) => {
      const alert = (alerts || []).find((a) => a.farmId === farm.id);
      if (alert) {
        const yieldLoss = Math.min(alert.dropPercentage * 1.5, 100);
        const basePayout = farm.insuranceValue * (yieldLoss / 100);
        const finalPayout = basePayout * 1.1 * 1.0 * 0.95; // Weather × Govt × Market
        totalEstimatedPayout += finalPayout;
      }
    });

    setStats({
      totalFarms: farms.length,
      affectedFarms: affected.length,
      healthyFarms: healthy.length,
      affectedPercentage: ((affected.length / farms.length) * 100).toFixed(1),
      totalEstimatedPayout: Math.round(totalEstimatedPayout),
      payoutInCrores: (totalEstimatedPayout / 10000000).toFixed(2),
      severityDistribution: severityDist,
      avgPayoutPerFarm:
        affected.length > 0
          ? Math.round(totalEstimatedPayout / affected.length)
          : 0,
    });

    setLoading(false);
  };

  const formatCurrency = (amount) => {
    return `₹${amount.toLocaleString("en-IN")}`;
  };

  if (loading || !stats) {
    return (
      <div className="regional-dashboard loading">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <span>Analyzing regional data...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="regional-dashboard">
      {/* Header */}
      <div className="dashboard-header">
        <div className="header-content">
          <h2>📊 Regional Health Dashboard</h2>
          <span className="region-badge">Shahuwadi Tehsil</span>
        </div>
        <div className="last-updated">
          <span>🛰️ Satellite Data: Live</span>
        </div>
      </div>

      {/* Top Metrics */}
      <div className="metrics-grid">
        <div className="metric-card total">
          <div className="metric-icon">🌾</div>
          <div className="metric-content">
            <span className="metric-label">Total Registered</span>
            <span className="metric-value">{stats.totalFarms}</span>
            <span className="metric-unit">Farms</span>
          </div>
        </div>

        <div className="metric-card affected">
          <div className="metric-icon">⚠️</div>
          <div className="metric-content">
            <span className="metric-label">Affected Farms</span>
            <span className="metric-value">{stats.affectedFarms}</span>
            <span className="metric-unit">
              {stats.affectedPercentage}% of total
            </span>
          </div>
        </div>

        <div className="metric-card healthy">
          <div className="metric-icon">✅</div>
          <div className="metric-content">
            <span className="metric-label">Healthy Farms</span>
            <span className="metric-value">{stats.healthyFarms}</span>
            <span className="metric-unit">No action needed</span>
          </div>
        </div>

        <div className="metric-card payout">
          <div className="metric-icon">💰</div>
          <div className="metric-content">
            <span className="metric-label">Est. Total Payout</span>
            <span className="metric-value">₹{stats.payoutInCrores} Cr</span>
            <span className="metric-unit">
              {formatCurrency(stats.totalEstimatedPayout)}
            </span>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="charts-grid">
        {/* Pie Chart - Affected vs Healthy */}
        <div className="chart-card">
          <h3>Farm Status Distribution</h3>
          <div className="pie-chart-container">
            <div className="pie-chart">
              <svg viewBox="0 0 100 100">
                {/* Healthy slice */}
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="transparent"
                  stroke="#10b981"
                  strokeWidth="20"
                  strokeDasharray={`${(stats.healthyFarms / stats.totalFarms) * 251.2} 251.2`}
                  transform="rotate(-90 50 50)"
                />
                {/* Affected slice */}
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="transparent"
                  stroke="#ef4444"
                  strokeWidth="20"
                  strokeDasharray={`${(stats.affectedFarms / stats.totalFarms) * 251.2} 251.2`}
                  strokeDashoffset={`${-(stats.healthyFarms / stats.totalFarms) * 251.2}`}
                  transform="rotate(-90 50 50)"
                />
                <text
                  x="50"
                  y="45"
                  textAnchor="middle"
                  className="chart-center-value"
                >
                  {stats.totalFarms}
                </text>
                <text
                  x="50"
                  y="58"
                  textAnchor="middle"
                  className="chart-center-label"
                >
                  Farms
                </text>
              </svg>
            </div>
            <div className="pie-legend">
              <div className="legend-item">
                <span className="legend-color affected"></span>
                <span className="legend-label">Affected</span>
                <span className="legend-value">{stats.affectedFarms}</span>
              </div>
              <div className="legend-item">
                <span className="legend-color healthy"></span>
                <span className="legend-label">Healthy</span>
                <span className="legend-value">{stats.healthyFarms}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bar Chart - Severity Distribution */}
        <div className="chart-card">
          <h3>Severity Distribution</h3>
          <div className="bar-chart-container">
            <div className="bar-chart">
              {/* Severe Bar */}
              <div className="bar-group">
                <div className="bar-label">🔴 Severe (&gt;50%)</div>
                <div className="bar-wrapper">
                  <div
                    className="bar severe"
                    style={{
                      width: `${(stats.severityDistribution.severe / stats.totalFarms) * 100}%`,
                    }}
                  >
                    <span className="bar-value">
                      {stats.severityDistribution.severe}
                    </span>
                  </div>
                </div>
              </div>

              {/* Moderate Bar */}
              <div className="bar-group">
                <div className="bar-label">🟠 Moderate (30-50%)</div>
                <div className="bar-wrapper">
                  <div
                    className="bar moderate"
                    style={{
                      width: `${(stats.severityDistribution.moderate / stats.totalFarms) * 100}%`,
                    }}
                  >
                    <span className="bar-value">
                      {stats.severityDistribution.moderate}
                    </span>
                  </div>
                </div>
              </div>

              {/* Healthy Bar */}
              <div className="bar-group">
                <div className="bar-label">🟢 Healthy (&lt;30%)</div>
                <div className="bar-wrapper">
                  <div
                    className="bar healthy"
                    style={{
                      width: `${(stats.severityDistribution.healthy / stats.totalFarms) * 100}%`,
                    }}
                  >
                    <span className="bar-value">
                      {stats.severityDistribution.healthy}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="summary-section">
        <div className="summary-card">
          <div className="summary-icon">📊</div>
          <div className="summary-content">
            <span className="summary-label">Average Payout per Farm</span>
            <span className="summary-value">
              {formatCurrency(stats.avgPayoutPerFarm)}
            </span>
          </div>
        </div>
        <div className="summary-card">
          <div className="summary-icon">🌧️</div>
          <div className="summary-content">
            <span className="summary-label">Disaster Type</span>
            <span className="summary-value">Regional Flood</span>
          </div>
        </div>
        <div className="summary-card">
          <div className="summary-icon">📍</div>
          <div className="summary-content">
            <span className="summary-label">Villages Affected</span>
            <span className="summary-value">4 Villages</span>
          </div>
        </div>
      </div>
    </div>
  );
}
