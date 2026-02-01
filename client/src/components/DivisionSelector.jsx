/**
 * PMFBY Division Selector Component
 * Cascading dropdowns for administrative division filtering
 */

import React, { useState, useEffect } from "react";

export default function DivisionSelector({
  onSelectionChange,
  currentFilters = {},
  compact = false,
}) {
  const [districts, setDistricts] = useState([]);
  const [tehsils, setTehsils] = useState([]);
  const [villages, setVillages] = useState([]);

  const [selectedDistrict, setSelectedDistrict] = useState("");
  const [selectedTehsil, setSelectedTehsil] = useState("");
  const [selectedVillage, setSelectedVillage] = useState("");

  const [loading, setLoading] = useState(false);

  const API_BASE_URL = "http://localhost:3000/api";

  // Fetch Districts on mount
  useEffect(() => {
    fetchDistricts();
  }, []);

  // Sync local state with parent filters
  useEffect(() => {
    if (
      currentFilters.district !== undefined &&
      currentFilters.district !== selectedDistrict
    ) {
      setSelectedDistrict(currentFilters.district || "");
      if (currentFilters.district) {
        fetchTehsils(currentFilters.district);
      }
    }
    if (
      currentFilters.tehsil !== undefined &&
      currentFilters.tehsil !== selectedTehsil
    ) {
      setSelectedTehsil(currentFilters.tehsil || "");
      if (currentFilters.tehsil) {
        fetchVillages(currentFilters.tehsil);
      }
    }
    if (
      currentFilters.village !== undefined &&
      currentFilters.village !== selectedVillage
    ) {
      setSelectedVillage(currentFilters.village || "");
    }
  }, [currentFilters.district, currentFilters.tehsil, currentFilters.village]);

  // Notify parent of selection changes
  // Removed useEffect to prevent infinite loop
  // onSelectionChange is now called directly in handlers

  const fetchDistricts = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/divisions/districts`);
      const data = await res.json();
      if (data.success) setDistricts(data.data);
    } catch (err) {
      console.error("Error fetching districts:", err);
    }
  };

  const fetchTehsils = async (district) => {
    try {
      setLoading(true);
      const res = await fetch(
        `${API_BASE_URL}/divisions/tehsils?district=${district}`,
      );
      const data = await res.json();
      if (data.success) setTehsils(data.data);
    } catch (err) {
      console.error("Error fetching tehsils:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchVillages = async (tehsil) => {
    try {
      setLoading(true);
      const res = await fetch(
        `${API_BASE_URL}/divisions/villages?tehsil=${tehsil}`,
      );
      const data = await res.json();
      if (data.success) setVillages(data.data);
    } catch (err) {
      console.error("Error fetching villages:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDistrictChange = (e) => {
    e.preventDefault();
    e.stopPropagation();

    try {
      const district = e.target.value;

      // Batch state updates
      setSelectedDistrict(district);
      setSelectedTehsil("");
      setSelectedVillage("");
      setTehsils([]);
      setVillages([]);

      // Notify parent
      if (onSelectionChange) {
        onSelectionChange({
          district: district,
          tehsil: "",
          village: "",
        });
      }

      // Fetch child divisions
      if (district) {
        fetchTehsils(district);
      }
    } catch (error) {
      console.error("Error in handleDistrictChange:", error);
    }
  };

  const handleTehsilChange = (e) => {
    e.preventDefault();
    e.stopPropagation();

    try {
      const tehsil = e.target.value;
      setSelectedTehsil(tehsil);
      setSelectedVillage("");
      setVillages([]);

      if (onSelectionChange) {
        onSelectionChange({
          district: selectedDistrict,
          tehsil: tehsil,
          village: "",
        });
      }

      if (tehsil) {
        fetchVillages(tehsil);
      }
    } catch (error) {
      console.error("Error in handleTehsilChange:", error);
    }
  };

  const handleVillageChange = (e) => {
    e.preventDefault();
    e.stopPropagation();

    try {
      const village = e.target.value;
      setSelectedVillage(village);

      if (onSelectionChange) {
        onSelectionChange({
          district: selectedDistrict,
          tehsil: selectedTehsil,
          village: village,
        });
      }
    } catch (error) {
      console.error("Error in handleVillageChange:", error);
    }
  };

  const handleClear = () => {
    setSelectedDistrict("");
    setSelectedTehsil("");
    setSelectedVillage("");
    setTehsils([]);
    setVillages([]);

    onSelectionChange({
      district: "",
      tehsil: "",
      village: "",
    });
  };

  const selectStyle = `
    block w-full px-3 py-2 
    bg-white border border-brown-300 rounded-lg 
    text-brown-800 text-sm focus:outline-none focus:ring-2 focus:ring-green-500
    disabled:bg-gray-100 disabled:text-gray-400
  `;

  // Compact variant for header
  if (compact) {
    return (
      <div className="header-division">
        <span className="compact-division-label">📍</span>
        <select
          value={selectedDistrict}
          onChange={handleDistrictChange}
          className="compact-division-select"
        >
          <option value="">District</option>
          {districts.map((d) => (
            <option key={d} value={d}>
              {d}
            </option>
          ))}
        </select>

        <select
          value={selectedTehsil}
          onChange={handleTehsilChange}
          disabled={!selectedDistrict}
          className="compact-division-select"
        >
          <option value="">{selectedDistrict ? "Taluka" : "Taluka"}</option>
          {tehsils.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>

        <select
          value={selectedVillage}
          onChange={handleVillageChange}
          disabled={!selectedTehsil}
          className="compact-division-select"
        >
          <option value="">{selectedTehsil ? "Village" : "Village"}</option>
          {villages.map((v) => (
            <option key={v} value={v}>
              {v}
            </option>
          ))}
        </select>
      </div>
    );
  }

  // Original full variant for sidebar
  return (
    <div className="bg-white/90 backdrop-blur-sm p-4 rounded-xl border border-brown-200 shadow-lg mb-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-display font-semibold text-brown-800 flex items-center gap-2">
          <span>📍</span> Region Filter
        </h3>
        {(selectedDistrict || selectedTehsil || selectedVillage) && (
          <button
            type="button"
            onClick={handleClear}
            className="text-xs text-red-600 hover:text-red-800 font-medium underline"
          >
            Clear Selection
          </button>
        )}
      </div>

      <div className="flex flex-col gap-3">
        {/* District Selector */}
        <div>
          <label className="block text-xs font-semibold text-brown-600 mb-1 ml-1">
            District
          </label>
          <select
            value={selectedDistrict}
            onChange={handleDistrictChange}
            className={selectStyle}
          >
            <option value="">All Districts</option>
            {districts.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </div>

        {/* Tehsil/Taluka Selector */}
        <div>
          <label className="block text-xs font-semibold text-brown-600 mb-1 ml-1">
            Tehsil / Taluka
          </label>
          <select
            value={selectedTehsil}
            onChange={handleTehsilChange}
            disabled={!selectedDistrict}
            className={selectStyle}
          >
            <option value="">
              {selectedDistrict ? "All Tehsils" : "Select District First"}
            </option>
            {tehsils.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>

        {/* Village Selector */}
        <div>
          <label className="block text-xs font-semibold text-brown-600 mb-1 ml-1">
            Village
          </label>
          <select
            value={selectedVillage}
            onChange={handleVillageChange}
            disabled={!selectedTehsil}
            className={selectStyle}
          >
            <option value="">
              {selectedTehsil ? "All Villages" : "Select Tehsil First"}
            </option>
            {villages.map((v) => (
              <option key={v} value={v}>
                {v}
              </option>
            ))}
          </select>
        </div>
      </div>

      {loading && (
        <div className="mt-2 text-center text-xs text-brown-500 animate-pulse">
          Loading regional data...
        </div>
      )}
    </div>
  );
}
