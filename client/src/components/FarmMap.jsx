import { useEffect, useRef, useState, useCallback } from "react";
import maplibregl from "maplibre-gl";
import MapControls from "./MapControls";
import {
  farmsToGeoJSON,
  getVisibleFarms,
  getFarmHealthStatus,
  formatNDVI,
} from "../utils/mapHelpers";

const FarmMap = ({ farms, onVisibleFarmsChange }) => {
  const mapContainer = useRef(null);
  const mapRef = useRef(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [currentLayer, setCurrentLayer] = useState("satellite");
  const [ndviData, setNdviData] = useState({});
  const [farmHealthMap, setFarmHealthMap] = useState({});

  // Map control handlers
  const handleZoomIn = () => {
    if (mapRef.current) {
      mapRef.current.zoomIn();
    }
  };

  const handleZoomOut = () => {
    if (mapRef.current) {
      mapRef.current.zoomOut();
    }
  };

  const handleResetView = () => {
    if (mapRef.current) {
      mapRef.current.flyTo({
        center: [74.198, 16.715],
        zoom: 17,
        duration: 1500,
      });
    }
  };

  const handleToggleLayer = (layer) => {
    if (!mapRef.current) return;
    const map = mapRef.current;

    if (layer === "satellite") {
      map.setLayoutProperty("osm-layer", "visibility", "none");
      map.setLayoutProperty("satellite-layer", "visibility", "visible");
    } else {
      map.setLayoutProperty("satellite-layer", "visibility", "none");
      map.setLayoutProperty("osm-layer", "visibility", "visible");
    }
    setCurrentLayer(layer);
  };

  // Fetch latest NDVI data for all farms
  const fetchNDVIData = useCallback(async () => {
    try {
      const healthMap = {};

      for (const farm of farms) {
        try {
          const response = await fetch(
            `http://localhost:3000/api/farms/${farm.id}/ndvi/latest`,
          );
          if (response.ok) {
            const data = await response.json();
            if (data.success) {
              const health = getFarmHealthStatus(
                data.data.ndvi,
                farm.baselineNDVI,
              );
              healthMap[farm.id] = {
                ...data.data,
                health,
              };
            }
          } else if (response.status === 404) {
            // NDVI data not generated yet - this is normal on first load
            // Silently skip without logging error
            continue;
          }
        } catch (err) {
          // Only log non-404 errors
          if (!err.message.includes("404")) {
            console.error(`Error fetching NDVI for farm ${farm.id}:`, err);
          }
        }
      }

      setFarmHealthMap(healthMap);
      setNdviData(healthMap);
    } catch (error) {
      console.error("Error fetching NDVI data:", error);
    }
  }, [farms]);

  // Update visible farms based on viewport
  const updateVisibleFarms = useCallback(() => {
    if (!mapRef.current || !farms || farms.length === 0) return;

    const bounds = mapRef.current.getBounds();
    const visibleFarms = getVisibleFarms(farms, bounds);
    if (onVisibleFarmsChange) {
      onVisibleFarmsChange(visibleFarms);
    }
  }, [farms, onVisibleFarmsChange]);

  // Initialize map
  useEffect(() => {
    if (mapRef.current) return; // Initialize map only once

    const map = new maplibregl.Map({
      container: mapContainer.current,
      style: {
        version: 8,
        sources: {
          osm: {
            type: "raster",
            tiles: ["https://tile.openstreetmap.org/{z}/{x}/{y}.png"],
            tileSize: 256,
            attribution: "© OpenStreetMap contributors",
          },
          satellite: {
            type: "raster",
            tiles: [
              "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
            ],
            tileSize: 256,
            attribution: "© Esri",
          },
        },
        layers: [
          {
            id: "satellite-layer",
            type: "raster",
            source: "satellite",
            minzoom: 0,
            maxzoom: 22,
          },
          {
            id: "osm-layer",
            type: "raster",
            source: "osm",
            minzoom: 0,
            maxzoom: 22,
            layout: {
              visibility: "none", // Hidden by default, satellite is shown
            },
          },
        ],
      },
      center: [74.198, 16.715],
      zoom: 17,
    });

    mapRef.current = map;

    map.on("load", () => {
      console.log("Map loaded successfully");
      setMapLoaded(true);

      // Auto-fit to farm bounds if farms are available
      if (farms && farms.length > 0) {
        const bounds = new maplibregl.LngLatBounds();
        farms.forEach((farm) => {
          farm.polygon.forEach((coord) => {
            // coord is [lat, lng], bounds.extend expects [lng, lat]
            bounds.extend([coord[1], coord[0]]);
          });
        });

        map.fitBounds(bounds, {
          padding: 50,
          maxZoom: 16,
          duration: 0, // Instant fit on initial load
        });
      }
    });

    map.on("error", (e) => {
      console.error("Map error:", e);
    });

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  // Add/update farm polygons when farms data changes
  useEffect(() => {
    if (!mapLoaded || !mapRef.current || !farms || farms.length === 0) return;

    const map = mapRef.current;
    const sourceId = "farms-source";
    const layerId = "farms-layer";
    const outlineLayerId = "farms-outline";

    // Remove existing layers and source if they exist
    if (map.getLayer(outlineLayerId)) map.removeLayer(outlineLayerId);
    if (map.getLayer(layerId)) map.removeLayer(layerId);
    if (map.getSource(sourceId)) map.removeSource(sourceId);

    // Add farms as GeoJSON source
    map.addSource(sourceId, {
      type: "geojson",
      data: farmsToGeoJSON(farms),
    });

    // Add fill layer for farm polygons - Green overlay
    map.addLayer({
      id: layerId,
      type: "fill",
      source: sourceId,
      paint: {
        "fill-color": "#4CAF50", // Green fill
        "fill-opacity": 0.5,
      },
    });

    // Add outline layer - Yellow border
    map.addLayer({
      id: outlineLayerId,
      type: "line",
      source: sourceId,
      paint: {
        "line-color": "#FFEB3B", // Yellow border
        "line-width": 3,
        "line-opacity": 0.9,
      },
    });

    // Add click interaction with custom styled popup showing HEALTH STATUS
    map.on("click", layerId, (e) => {
      const feature = e.features[0];
      const { id, farmerName, crop, location, baselineNDVI } =
        feature.properties;
      const farmHealth = farmHealthMap[id];
      const healthInfo = farmHealth?.health || getFarmHealthStatus(null, null);

      new maplibregl.Popup({
        closeButton: true,
        closeOnClick: true,
        maxWidth: "300px",
        className: "custom-popup",
      })
        .setLngLat(e.lngLat)
        .setHTML(
          `
          <div style="
            padding: 16px;
            font-family: 'IBM Plex Sans', sans-serif;
            background: linear-gradient(135deg, #FAF8F3 0%, #FFFFFF 100%);
            border-radius: 8px;
            border: 3px solid ${healthInfo.color};
          ">
            <div style="
              font-family: 'Playfair Display', serif;
              font-size: 18px;
              font-weight: 600;
              color: #5C4033;
              margin-bottom: 8px;
              text-transform: capitalize;
            ">${farmerName}</div>
            
            <!-- Health Status Badge -->
            <div style="
              display: inline-block;
              padding: 4px 12px;
              background: ${healthInfo.color};
              color: white;
              border-radius: 12px;
              font-size: 11px;
              font-weight: 700;
              text-transform: uppercase;
              margin-bottom: 12px;
              letter-spacing: 0.5px;
            ">${healthInfo.label}</div>
            
            <div style="display: flex; flex-direction: column; gap: 8px;">
              <div style="
                display: flex;
                align-items: center;
                gap: 8px;
                padding: 8px;
                background: rgba(74, 124, 78, 0.1);
                border-radius: 6px;
              ">
                <span style="font-size: 16px;">🌾</span>
                <div>
                  <div style="font-size: 10px; color: #757575; text-transform: uppercase; letter-spacing: 0.5px;">Crop</div>
                  <div style="font-size: 14px; font-weight: 600; color: #2F5233; text-transform: capitalize;">${crop}</div>
                </div>
              </div>
              
              <div style="
                display: flex;
                align-items: center;
                gap: 8px;
                padding: 8px;
                background: rgba(212, 175, 55, 0.08);
                border-radius: 6px;
              ">
                <span style="font-size: 16px;">📍</span>
                <div>
                  <div style="font-size: 10px; color: #757575; text-transform: uppercase; letter-spacing: 0.5px;">Location</div>
                  <div style="font-size: 13px; font-weight: 500; color: #6D4C3D;">${location}</div>
                </div>
              </div>
            </div>
            
            <!-- NDVI Health Info -->
            ${
              farmHealth
                ? `
            <div style="
              margin-top: 12px;
              padding: 10px;
              background: rgba(${healthInfo.status === "severe" || healthInfo.status === "critical" ? "220, 38, 38" : "74, 124, 78"}, 0.1);
              border-radius: 6px;
              border-left: 3px solid ${healthInfo.color};
            ">
              <div style="font-size: 10px; color: #757575; text-transform: uppercase; margin-bottom: 4px;">Crop Health (NDVI)</div>
              <div style="display: flex; justify-content: space-between; align-items: center;">
                <div>
                  <span style="font-size: 16px; font-weight: 700; color: ${healthInfo.color};">${formatNDVI(farmHealth.ndvi)}</span>
                  <span style="font-size: 11px; color: #999; margin-left: 4px;">/ ${formatNDVI(baselineNDVI)}</span>
                </div>
                <div style="font-size: 20px;">${healthInfo.status === "healthy" ? "✓" : healthInfo.status === "severe" ? "🚨" : "⚠️"}</div>
              </div>
            </div>
            `
                : ""
            }
          </div>
        `,
        )
        .addTo(map);
    });

    // Change cursor on hover
    map.on("mouseenter", layerId, () => {
      map.getCanvas().style.cursor = "pointer";
    });

    map.on("mouseleave", layerId, () => {
      map.getCanvas().style.cursor = "";
    });

    // Update visible farms after adding layers
    updateVisibleFarms();
  }, [farms, mapLoaded, farmHealthMap, updateVisibleFarms]);

  // Fetch NDVI data when farms or map loads
  useEffect(() => {
    if (mapLoaded && farms && farms.length > 0) {
      fetchNDVIData();

      // Set up periodic refresh (every 60 seconds)
      const intervalId = setInterval(fetchNDVIData, 60000);
      return () => clearInterval(intervalId);
    }
  }, [mapLoaded, farms, fetchNDVIData]);

  // Listen to map movement events
  useEffect(() => {
    if (!mapRef.current) return;

    const map = mapRef.current;

    map.on("moveend", updateVisibleFarms);
    map.on("zoomend", updateVisibleFarms);

    return () => {
      map.off("moveend", updateVisibleFarms);
      map.off("zoomend", updateVisibleFarms);
    };
  }, [updateVisibleFarms]);

  return (
    <div className="relative w-full h-full">
      <div
        ref={mapContainer}
        className="w-full h-full"
        style={{
          minHeight: "500px",
          backgroundColor: "var(--color-neutral-300)",
        }}
      />

      {/* Map Controls Overlay */}
      {mapLoaded && (
        <MapControls
          onZoomIn={handleZoomIn}
          onZoomOut={handleZoomOut}
          onResetView={handleResetView}
          onToggleLayer={handleToggleLayer}
        />
      )}
    </div>
  );
};

export default FarmMap;
