import { useMemo } from "react";

const StatsPanel = ({ farms, allFarms, compact = false }) => {
  // Calculate statistics
  const stats = useMemo(() => {
    const totalFarms = allFarms?.length || 0;
    const visibleFarms = farms?.length || 0;

    // Calculate total area (sum of polygon boundary points as proxy)
    const totalArea =
      farms?.reduce((sum, farm) => sum + (farm.polygon?.length || 0), 0) || 0;

    // Crop distribution
    const cropCounts = {};
    farms?.forEach((farm) => {
      const crop = farm.crop || "Unknown";
      cropCounts[crop] = (cropCounts[crop] || 0) + 1;
    });

    const topCrop = Object.entries(cropCounts).sort((a, b) => b[1] - a[1])[0];

    return {
      totalFarms,
      visibleFarms,
      totalArea,
      topCrop: topCrop ? topCrop[0] : "N/A",
      topCropCount: topCrop ? topCrop[1] : 0,
    };
  }, [farms, allFarms]);

  // Compact variant for header
  if (compact) {
    return (
      <div className="header-stats">
        {/* Visible Farms */}
        <div className="compact-stat-card">
          <span className="stat-icon">📍</span>
          <span className="stat-value">{stats.visibleFarms}</span>
        </div>

        {/* Top Crop */}
        <div className="compact-stat-card">
          <span className="stat-icon">🌾</span>
          <span className="stat-value capitalize">{stats.topCrop}</span>
        </div>

        {/* Area Coverage */}
        <div className="compact-stat-card">
          <span className="stat-icon">📊</span>
          <span className="stat-value">{stats.totalArea}</span>
        </div>
      </div>
    );
  }

  // Original full variant for sidebar/overlay
  return (
    <div
      className="absolute top-6 left-6 z-50 p-5 rounded-xl glass-effect animate-scaleIn"
      style={{
        minWidth: "280px",
        boxShadow: "var(--shadow-lg)",
        backdropFilter: "blur(12px)",
        background: "rgba(255, 255, 255, 0.85)",
        border: "1px solid rgba(212, 175, 55, 0.3)",
      }}
    >
      <h3
        className="font-display text-xl font-semibold mb-4"
        style={{
          color: "var(--color-brown-700)",
          borderBottom: "2px solid var(--color-gold-400)",
          paddingBottom: "8px",
        }}
      >
        Farm Statistics
      </h3>

      <div className="space-y-3">
        {/* Visible Farms */}
        <div
          className="p-3 rounded-lg"
          style={{ backgroundColor: "rgba(212, 175, 55, 0.1)" }}
        >
          <div className="flex items-center justify-between">
            <span
              className="font-body text-sm"
              style={{ color: "var(--text-muted)" }}
            >
              In View
            </span>
            <span
              className="font-display text-2xl font-bold"
              style={{ color: "var(--color-brown-700)" }}
            >
              {stats.visibleFarms}
            </span>
          </div>
          <div className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>
            of {stats.totalFarms} total farms
          </div>
        </div>

        {/* Top Crop */}
        <div
          className="p-3 rounded-lg"
          style={{ backgroundColor: "rgba(74, 124, 78, 0.1)" }}
        >
          <div className="flex items-center justify-between mb-1">
            <span
              className="font-body text-sm"
              style={{ color: "var(--text-muted)" }}
            >
              Primary Crop
            </span>
            <span className="text-lg">🌾</span>
          </div>
          <div
            className="font-display text-lg font-semibold capitalize"
            style={{ color: "var(--color-green-700)" }}
          >
            {stats.topCrop}
          </div>
          <div className="text-xs" style={{ color: "var(--text-muted)" }}>
            {stats.topCropCount} farm{stats.topCropCount !== 1 ? "s" : ""}
          </div>
        </div>

        {/* Area Coverage */}
        <div
          className="p-3 rounded-lg"
          style={{ backgroundColor: "rgba(139, 69, 19, 0.08)" }}
        >
          <div className="flex items-center justify-between mb-1">
            <span
              className="font-body text-sm"
              style={{ color: "var(--text-muted)" }}
            >
              Coverage Points
            </span>
            <span className="text-lg">📍</span>
          </div>
          <div
            className="font-display text-lg font-semibold"
            style={{ color: "var(--color-brown-600)" }}
          >
            {stats.totalArea}
          </div>
          <div className="text-xs" style={{ color: "var(--text-muted)" }}>
            boundary markers
          </div>
        </div>
      </div>

      {/* Subtle decorative element */}
      <div
        className="mt-4 pt-3"
        style={{ borderTop: "1px solid rgba(212, 175, 55, 0.2)" }}
      >
        <div
          className="text-xs text-center font-mono"
          style={{ color: "var(--text-light)" }}
        >
          Live Data • Real-time Updates
        </div>
      </div>
    </div>
  );
};

export default StatsPanel;
