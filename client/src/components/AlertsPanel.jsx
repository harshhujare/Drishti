/**
 * PMFBY AlertsPanel Component
 * Floating notification panel showing active alerts with severity indicators
 */

import React, { useState } from "react";
import { useAlerts } from "../hooks/useAlerts";
import toast from "react-hot-toast";
import { formatDistanceToNow } from "date-fns";

export default function AlertsPanel({ onAlertClick, iconOnly = false }) {
  const { alerts, stats, loading, acknowledgeAlert, resolveAlert } =
    useAlerts();
  const [isExpanded, setIsExpanded] = useState(true);

  const activeAlerts = alerts.filter((a) => a.status === "active");

  const handleAcknowledge = async (alertId) => {
    try {
      await acknowledgeAlert(alertId);
      toast.success("Alert acknowledged");
    } catch (error) {
      toast.error("Failed to acknowledge alert");
    }
  };

  const handleResolve = async (alertId) => {
    try {
      await resolveAlert(alertId);
      toast.success("Alert resolved");
    } catch (error) {
      toast.error("Failed to resolve alert");
    }
  };

  // Auto-collapse when no alerts
  React.useEffect(() => {
    if (activeAlerts.length === 0 && isExpanded) {
      const timer = setTimeout(() => setIsExpanded(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [activeAlerts.length, isExpanded]);

  const getSeverityBadgeStyle = (severity) => {
    switch (severity) {
      case "critical":
        return "bg-red-600 text-white border-red-700";
      case "high":
        return "bg-orange-600 text-white border-orange-700";
      case "medium":
        return "bg-yellow-600 text-white border-yellow-700";
      case "low":
        return "bg-blue-600 text-white border-blue-700";
      default:
        return "bg-gray-600 text-white border-gray-700";
    }
  };

  const getSeverityIcon = (severity) => {
    switch (severity) {
      case "critical":
        return "🚨";
      case "high":
        return "⚠️";
      case "medium":
        return "⚡";
      case "low":
        return "ℹ️";
      default:
        return "📢";
    }
  };

  if (!stats || (activeAlerts.length === 0 && !isExpanded)) {
    return null;
  }

  // Icon-only variant for header
  if (iconOnly) {
    return (
      <div className="header-alerts">
        <button
          className="alerts-icon-button"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <span className="alert-bell">🔔</span>
          {activeAlerts.length > 0 && (
            <span className="alerts-badge">{activeAlerts.length}</span>
          )}
        </button>

        {isExpanded && (
          <div className="alerts-dropdown">
            {/* Header */}
            <div className="p-4 border-b border-brown-200 bg-cream">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xl">🔔</span>
                  <h3 className="font-display font-semibold text-brown-800">
                    Alerts
                  </h3>
                </div>
                <span className="text-xs font-semibold px-2 py-1 bg-red-100 rounded-full text-red-700">
                  {activeAlerts.length} active
                </span>
              </div>
            </div>

            {/* Alert List */}
            <div className="overflow-y-auto max-h-[400px] custom-scrollbar">
              {activeAlerts.length === 0 ? (
                <div className="p-6 text-center">
                  <div className="text-4xl mb-2">✅</div>
                  <p className="text-brown-600 font-medium">All Clear</p>
                  <p className="text-sm text-brown-500">No active alerts</p>
                </div>
              ) : (
                activeAlerts.map((alert, index) => (
                  <div
                    key={alert.id}
                    className={`p-4 border-b border-brown-200 hover:bg-cream transition-colors cursor-pointer ${
                      index % 2 === 0 ? "bg-white" : "bg-cream"
                    }`}
                    onClick={() => onAlertClick && onAlertClick(alert)}
                  >
                    {/* Alert Content */}
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">
                          {getSeverityIcon(alert.severity)}
                        </span>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-bold border ${getSeverityBadgeStyle(alert.severity)}`}
                        >
                          {alert.severity.toUpperCase()}
                        </span>
                      </div>
                      <span className="text-xs text-brown-500">
                        {formatDistanceToNow(new Date(alert.timestamp), {
                          addSuffix: true,
                        })}
                      </span>
                    </div>

                    <h4 className="font-semibold text-brown-800 mb-1 capitalize">
                      {alert.farmerName}'s Farm
                    </h4>
                    <p className="text-sm text-brown-700 leading-relaxed mb-3">
                      {alert.message}
                    </p>

                    {/* Action Buttons */}
                    <div className="flex gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAcknowledge(alert.id);
                        }}
                        className="flex-1 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg transition-colors"
                      >
                        ✓ Acknowledge
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleResolve(alert.id);
                        }}
                        className="flex-1 px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white text-xs font-semibold rounded-lg transition-colors"
                      >
                        ✓ Resolve
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    );
  }

  // Original full variant for sidebar/overlay
  return (
    <div className="fixed top-24 right-6 z-[400] max-w-md animate-slideInRight">
      {/* Header - Always Visible */}
      <div className="bg-white rounded-t-xl border-2 border-brown-300 shadow-lg">
        <div className="p-4">
          <div className="flex items-center justify-between">
            <div
              className="flex items-center gap-3 cursor-pointer"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              <div className="text-2xl">🔔</div>
              <div>
                <h3 className="font-display font-semibold text-lg text-brown-800">
                  Alerts
                </h3>
                <p className="text-xs text-brown-600">
                  {activeAlerts.length} active
                </p>
              </div>
            </div>

            {/* Severity Badges */}
            <div className="flex gap-2">
              {stats?.activeBySeverity?.critical > 0 && (
                <div className="px-2 py-1 bg-red-100 border border-red-300 rounded-full text-xs font-semibold text-red-700">
                  {stats.activeBySeverity.critical} 🚨
                </div>
              )}
              {stats?.activeBySeverity?.high > 0 && (
                <div className="px-2 py-1 bg-orange-100 border border-orange-300 rounded-full text-xs font-semibold text-orange-700">
                  {stats.activeBySeverity.high} ⚠️
                </div>
              )}
              {stats?.activeBySeverity?.medium > 0 && (
                <div className="px-2 py-1 bg-yellow-100 border border-yellow-300 rounded-full text-xs font-semibold text-yellow-700">
                  {stats.activeBySeverity.medium}
                </div>
              )}
            </div>

            {/* Expand/Collapse and Close Buttons */}
            <div className="flex items-center gap-2">
              <button
                className="text-brown-600 hover:text-brown-800 transition-colors"
                onClick={() => setIsExpanded(!isExpanded)}
              >
                {isExpanded ? "▼" : "▶"}
              </button>
              <button
                className="w-6 h-6 flex items-center justify-center rounded-full bg-brown-100 hover:bg-brown-200 text-brown-600 hover:text-brown-800 transition-colors text-sm font-bold"
                onClick={() => setIsExpanded(false)}
                title="Close alerts"
              >
                ✕
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Alert List - Collapsible */}
      {isExpanded && (
        <div className="bg-cream rounded-b-xl border-2 border-t-0 border-brown-300 shadow-lg max-h-[600px] overflow-hidden">
          {activeAlerts.length === 0 ? (
            <div className="p-6 text-center">
              <div className="text-4xl mb-2">✅</div>
              <p className="text-brown-600 font-medium">All Clear</p>
              <p className="text-sm text-brown-500">No active alerts</p>
            </div>
          ) : (
            <div className="overflow-y-auto max-h-[550px] custom-scrollbar">
              {activeAlerts.map((alert, index) => (
                <div
                  key={alert.id}
                  className={`p-4 border-b border-brown-200 hover:bg-white transition-colors cursor-pointer
                    ${index % 2 === 0 ? "bg-cream" : "bg-white"}`}
                  onClick={() => onAlertClick && onAlertClick(alert)}
                  style={{
                    animation: `slideInRight ${0.3 + index * 0.1}s ease-out`,
                  }}
                >
                  {/* Alert Header */}
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">
                        {getSeverityIcon(alert.severity)}
                      </span>
                      <div>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-bold border ${getSeverityBadgeStyle(alert.severity)}`}
                        >
                          {alert.severity.toUpperCase()}
                        </span>
                      </div>
                    </div>
                    <span className="text-xs text-brown-500">
                      {formatDistanceToNow(new Date(alert.timestamp), {
                        addSuffix: true,
                      })}
                    </span>
                  </div>

                  {/* Alert Content */}
                  <div className="mb-3">
                    <h4 className="font-semibold text-brown-800 mb-1 capitalize">
                      {alert.farmerName}'s Farm
                    </h4>
                    <p className="text-sm text-brown-700 leading-relaxed">
                      {alert.message}
                    </p>
                  </div>

                  {/* Alert Details */}
                  <div className="flex items-center gap-3 mb-3 text-xs">
                    <div className="flex items-center gap-1">
                      <span className="font-semibold text-brown-600">
                        NDVI:
                      </span>
                      <span className="text-red-600 font-bold">
                        {alert.currentNDVI.toFixed(3)}
                      </span>
                      <span className="text-brown-500">→</span>
                      <span className="text-green-600">
                        {alert.baselineNDVI.toFixed(3)}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="font-semibold text-brown-600">
                        Drop:
                      </span>
                      <span className="text-red-600 font-bold">
                        {alert.dropPercentage.toFixed(1)}%
                      </span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAcknowledge(alert.id);
                      }}
                      className="flex-1 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg transition-colors"
                    >
                      ✓ Acknowledge
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleResolve(alert.id);
                      }}
                      className="flex-1 px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white text-xs font-semibold rounded-lg transition-colors"
                    >
                      ✓ Resolve
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Loading Indicator */}
      {loading && (
        <div className="absolute top-2 right-2">
          <div className="w-3 h-3 bg-blue-600 rounded-full animate-pulse"></div>
        </div>
      )}
    </div>
  );
}
