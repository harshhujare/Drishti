import { useState, useEffect } from "react";
import FarmMap from "../components/FarmMap";
import ClaimActionCard from "../components/ClaimActionCard";
import RegionalHealthDashboard from "../components/RegionalHealthDashboard";
import PayoutBreakdown from "../components/PayoutBreakdown";
import "./OfficerDashboard.css";

const API_BASE = "http://localhost:3000/api";

/**
 * Officer Dashboard Layout
 * Split view with map on left, claims list on right
 * For human-in-the-loop approval workflow
 */
export default function OfficerDashboard() {
  const [claims, setClaims] = useState([]);
  const [stats, setStats] = useState(null);
  const [filter, setFilter] = useState("pending");
  const [loading, setLoading] = useState(true);
  const [selectedClaim, setSelectedClaim] = useState(null);
  const [showDashboard, setShowDashboard] = useState(false);
  const [farms, setFarms] = useState([]);
  const [alerts, setAlerts] = useState([]);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    loadClaims();
  }, [filter]);

  const loadData = async () => {
    try {
      // Load farms - API returns array directly
      const farmsRes = await fetch(`${API_BASE}/farms`);
      const farmsData = await farmsRes.json();
      // Handle both array response and object with farms property
      const farmsArray = Array.isArray(farmsData)
        ? farmsData
        : farmsData.farms || [];
      setFarms(farmsArray);

      // Load alerts
      const alertsRes = await fetch(`${API_BASE}/alerts`);
      const alertsData = await alertsRes.json();
      setAlerts(alertsData.alerts || []);

      // Auto-generate claims if none exist
      const claimsRes = await fetch(`${API_BASE}/claims`);
      const claimsData = await claimsRes.json();

      if (!claimsData.claims || claimsData.claims.length === 0) {
        // Auto-generate claims from alerts
        await fetch(`${API_BASE}/claims/auto-generate`, { method: "POST" });
      }

      await loadClaims();
      await loadStats();
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadClaims = async () => {
    try {
      const url =
        filter === "all"
          ? `${API_BASE}/claims`
          : `${API_BASE}/claims?status=${filter}`;
      const res = await fetch(url);
      const data = await res.json();
      setClaims(data.claims || []);
    } catch (error) {
      console.error("Error loading claims:", error);
    }
  };

  const loadStats = async () => {
    try {
      const res = await fetch(`${API_BASE}/claims/stats`);
      const data = await res.json();
      setStats(data.stats);
    } catch (error) {
      console.error("Error loading stats:", error);
    }
  };

  const handleApprove = async (claimId) => {
    try {
      await fetch(`${API_BASE}/claims/${claimId}/approve`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ officerName: "Demo Officer" }),
      });

      // Reload after animation completes
      setTimeout(() => {
        loadClaims();
        loadStats();
      }, 1000);
    } catch (error) {
      console.error("Error approving claim:", error);
    }
  };

  const handleReject = async (claimId, reason) => {
    try {
      await fetch(`${API_BASE}/claims/${claimId}/reject`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ officerName: "Demo Officer", reason }),
      });

      setTimeout(() => {
        loadClaims();
        loadStats();
      }, 1000);
    } catch (error) {
      console.error("Error rejecting claim:", error);
    }
  };

  const handleFlag = async (claimId) => {
    try {
      await fetch(`${API_BASE}/claims/${claimId}/flag`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          officerName: "Demo Officer",
          reason: "Requires field inspection",
        }),
      });

      setTimeout(() => {
        loadClaims();
        loadStats();
      }, 1000);
    } catch (error) {
      console.error("Error flagging claim:", error);
    }
  };

  const handleViewDetails = (claim) => {
    setSelectedClaim(claim);
  };

  const formatCurrency = (amount) => {
    return `₹${(amount || 0).toLocaleString("en-IN")}`;
  };

  const getFilterCount = (status) => {
    if (!stats) return 0;
    const counts = {
      pending: stats.pending,
      approved: stats.approved,
      rejected: stats.rejected,
      flagged: stats.flagged,
      all: stats.total,
    };
    return counts[status] || 0;
  };

  if (loading) {
    return (
      <div className="officer-dashboard loading">
        <div className="loading-content">
          <div className="spinner"></div>
          <span>Loading Officer Dashboard...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="officer-dashboard">
      {/* Header */}
      <header className="dashboard-header">
        <div className="header-left">
          <h1>👨‍💼 Officer Dashboard</h1>
          <span className="location-badge">Shahuwadi Tehsil, Kolhapur</span>
        </div>
        <div className="header-right">
          <button
            className="back-btn"
            onClick={() =>
              window.dispatchEvent(
                new CustomEvent("navigate-to", { detail: "map" }),
              )
            }
          >
            🗺️ Back to Map
          </button>
          <button
            className={`toggle-btn ${showDashboard ? "active" : ""}`}
            onClick={() => setShowDashboard(!showDashboard)}
          >
            📊 {showDashboard ? "Hide Stats" : "Show Stats"}
          </button>
        </div>
      </header>

      {/* Stats Summary Bar */}
      {stats && (
        <div className="stats-bar">
          <div className="stat-item">
            <span className="stat-icon">📋</span>
            <span className="stat-label">Total Claims</span>
            <span className="stat-value">{stats.total}</span>
          </div>
          <div className="stat-item pending">
            <span className="stat-icon">⏳</span>
            <span className="stat-label">Pending</span>
            <span className="stat-value">{stats.pending}</span>
          </div>
          <div className="stat-item approved">
            <span className="stat-icon">✅</span>
            <span className="stat-label">Approved</span>
            <span className="stat-value">{stats.approved}</span>
          </div>
          <div className="stat-item payout">
            <span className="stat-icon">💰</span>
            <span className="stat-label">Approved Payout</span>
            <span className="stat-value">
              {formatCurrency(stats.totalPayout)}
            </span>
          </div>
        </div>
      )}

      {/* Regional Dashboard (Collapsible) */}
      {showDashboard && (
        <div className="regional-section">
          <RegionalHealthDashboard farms={farms} alerts={alerts} />
        </div>
      )}

      {/* Map Section - Temporarily removed to fix scroll issue
      <div className="map-section-full">
        <div className="section-header">
          <h2>🗺️ Farm Map</h2>
          <span className="farm-count">{farms.length} Farms</span>
        </div>
        <div className="map-container">
          <FarmMap farms={farms} alerts={alerts} />
        </div>
      </div>
      */}

      {/* Claims Section - Full Width Below */}
      <div className="claims-section-full">
        <div className="section-header">
          <h2>📝 Insurance Claims</h2>
          <span className="claims-count">
            {claims.length} {filter === "all" ? "Total" : filter}
          </span>
        </div>

        {/* Filter Tabs */}
        <div className="filter-tabs">
          {["pending", "approved", "rejected", "flagged", "all"].map(
            (status) => (
              <button
                key={status}
                className={`filter-tab ${filter === status ? "active" : ""}`}
                onClick={() => setFilter(status)}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
                <span className="tab-count">{getFilterCount(status)}</span>
              </button>
            ),
          )}
        </div>

        {/* Claims Grid */}
        <div className="claims-grid">
          {claims.length === 0 ? (
            <div className="empty-state">
              <span className="empty-icon">📭</span>
              <span className="empty-text">
                No {filter === "all" ? "" : filter} claims found
              </span>
            </div>
          ) : (
            claims.map((claim) => (
              <ClaimActionCard
                key={claim.id}
                claim={claim}
                onApprove={handleApprove}
                onReject={handleReject}
                onFlag={handleFlag}
                onViewDetails={handleViewDetails}
              />
            ))
          )}
        </div>
      </div>

      {/* Payout Details Modal */}
      {selectedClaim && (
        <div className="modal-overlay" onClick={() => setSelectedClaim(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Payout Details - {selectedClaim.farmerName}</h3>
              <button
                className="close-btn"
                onClick={() => setSelectedClaim(null)}
              >
                ✕
              </button>
            </div>
            <div className="modal-body">
              <PayoutBreakdown
                payoutData={selectedClaim.payoutData}
                yieldLossData={selectedClaim.yieldLossData}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
