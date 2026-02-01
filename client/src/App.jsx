import { useState, useCallback } from "react";
import FarmMap from "./components/FarmMap";
import FarmersList from "./components/FarmersList";
import StatsPanel from "./components/StatsPanel";
import AlertsPanel from "./components/AlertsPanel";
import DivisionSelector from "./components/DivisionSelector";
import SearchBar from "./components/SearchBar";
import NDVIDashboard from "./pages/NDVIDashboard";
import { useFarms } from "./hooks/useFarms";
import toast from "react-hot-toast";
import "./App.css";

function App() {
  const {
    farms,
    loading,
    error,
    updateFilters,
    filters,
    pagination,
    nextPage,
    prevPage,
    searchQuery,
    updateSearch,
  } = useFarms({
    district: "Kolhapur",
  });
  const [visibleFarms, setVisibleFarms] = useState([]);
  const [currentView, setCurrentView] = useState("map"); // 'map' or 'ndvi'
  const [selectedFarmId, setSelectedFarmId] = useState(null);

  const handleVisibleFarmsChange = useCallback((newVisibleFarms) => {
    setVisibleFarms(newVisibleFarms);
  }, []);

  const handleAlertClick = useCallback((alert) => {
    setSelectedFarmId(alert.farmId);
    setCurrentView("ndvi");
    toast.success(`Viewing ${alert.farmerName}'s farm`);
  }, []);

  // Enhanced loading state with agricultural spinner
  if (loading) {
    return (
      <div
        className="flex items-center justify-center h-screen"
        style={{ backgroundColor: "var(--bg-primary)" }}
      >
        <div className="text-center animate-fadeIn">
          {/* Custom agricultural spinner - circular field pattern */}
          <div className="relative w-24 h-24 mx-auto mb-6">
            <div
              className="absolute inset-0 rounded-full border-4 border-t-transparent animate-spin"
              style={{
                borderColor: "var(--color-gold-300)",
                borderTopColor: "transparent",
                animationDuration: "1.2s",
              }}
            ></div>
            <div
              className="absolute inset-2 rounded-full border-4 border-b-transparent animate-spin"
              style={{
                borderColor: "var(--color-green-400)",
                borderBottomColor: "transparent",
                animationDuration: "1.5s",
                animationDirection: "reverse",
              }}
            ></div>
            <div
              className="absolute inset-0 flex items-center justify-center text-2xl"
              style={{ color: "var(--color-brown-600)" }}
            >
              🌾
            </div>
          </div>
          <p
            className="font-display text-xl mb-2"
            style={{ color: "var(--text-primary)" }}
          >
            Loading Farm Data
          </p>
          <p
            className="font-body text-sm"
            style={{ color: "var(--text-muted)" }}
          >
            Connecting to agricultural intelligence system...
          </p>
        </div>
      </div>
    );
  }

  // Enhanced error state
  if (error) {
    return (
      <div
        className="flex items-center justify-center h-screen"
        style={{ backgroundColor: "var(--bg-primary)" }}
      >
        <div
          className="max-w-md p-8 rounded-xl animate-scaleIn"
          style={{
            backgroundColor: "var(--bg-secondary)",
            border: "2px solid var(--color-error)",
            boxShadow: "var(--shadow-lg)",
          }}
        >
          <div className="text-center mb-4 text-4xl">⚠️</div>
          <h2
            className="font-display text-2xl mb-3 text-center"
            style={{ color: "var(--color-error)" }}
          >
            Connection Error
          </h2>
          <p
            className="font-body mb-4 text-center"
            style={{ color: "var(--text-secondary)" }}
          >
            {error}
          </p>
          <div
            className="text-sm p-3 rounded-lg"
            style={{
              backgroundColor: "var(--color-cream-dark)",
              color: "var(--text-muted)",
            }}
          >
            <p className="font-mono">
              💡 Ensure the backend server is running:
            </p>
            <code className="block mt-2 font-mono text-xs">
              cd c:\Documents\sold_projects\PMFBY
              <br />
              npm start
            </code>
          </div>
        </div>
      </div>
    );
  }

  // NDVI Dashboard View
  if (currentView === "ndvi") {
    return (
      <div className="h-screen flex flex-col">
        {/* Navigation Header */}
        <header
          className="relative overflow-hidden field-pattern"
          style={{
            background:
              "linear-gradient(135deg, var(--color-brown-700) 0%, var(--color-brown-600) 50%, var(--color-brown-500) 100%)",
            boxShadow: "var(--shadow-lg)",
            borderBottom: "3px solid var(--color-gold-500)",
          }}
        >
          <div className="container mx-auto px-8 py-4 relative z-10">
            <div className="flex items-center justify-between">
              <div>
                <h1
                  className="font-display text-3xl font-bold tracking-wide"
                  style={{
                    color: "var(--text-inverse)",
                    textShadow: "2px 2px 4px rgba(0,0,0,0.3)",
                  }}
                >
                  PMFBY
                </h1>
                <p
                  className="font-body text-sm opacity-90"
                  style={{ color: "var(--color-gold-200)" }}
                >
                  Phase 1: NDVI Satellite Data Monitoring
                </p>
              </div>

              <button
                onClick={() => setCurrentView("map")}
                className="px-4 py-2 rounded-lg font-medium transition-all hover:scale-105"
                style={{
                  backgroundColor: "var(--color-gold-500)",
                  color: "var(--color-brown-800)",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
                }}
              >
                🗺️ View Map
              </button>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-auto">
          <NDVIDashboard />
        </div>
      </div>
    );
  }

  // Map View (default)
  return (
    <div className="app-container">
      {/* Header with compact components */}
      <header className="header">
        {/* Logo Section */}
        <div className="header-logo">
          <h1>PMFBY</h1>
          <p>Pradhan Mantri Fasal Bima Yojana</p>
        </div>

        {/* Compact Division Selector */}
        <DivisionSelector
          onSelectionChange={updateFilters}
          currentFilters={filters}
          compact
        />

        {/* Compact Search Bar */}
        <SearchBar
          searchQuery={searchQuery}
          onSearchChange={updateSearch}
          compact
        />

        {/* Compact Stats Panel */}
        <StatsPanel farms={visibleFarms} allFarms={farms} compact />

        {/* Icon-only Alerts Panel */}
        <AlertsPanel onAlertClick={handleAlertClick} iconOnly />

        {/* NDVI Dashboard Button */}
        <button
          onClick={() => setCurrentView("ndvi")}
          className="px-4 py-2 rounded-lg font-medium transition-all hover:scale-105"
          style={{
            backgroundColor: "var(--color-gold-500)",
            color: "var(--color-brown-800)",
            boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
            fontSize: "0.875rem",
            fontWeight: 600,
            border: "none",
            cursor: "pointer",
          }}
        >
          🛰️ NDVI
        </button>
      </header>

      {/* Main Content Area */}
      <div className="main-content">
        {/* Left Sidebar with Farmers List */}
        <aside className="sidebar-left">
          <FarmersList
            farms={visibleFarms}
            pagination={pagination}
            onNextPage={nextPage}
            onPrevPage={prevPage}
          />
        </aside>

        {/* Map Container */}
        <main className="map-container">
          <FarmMap
            farms={farms}
            onVisibleFarmsChange={handleVisibleFarmsChange}
          />
        </main>
      </div>
    </div>
  );
}

export default App;
