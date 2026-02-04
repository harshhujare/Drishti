/**
 * Generate realistic farm plot coordinates within a boundary polygon
 * This script distributes all farms within the specified area
 */

// Boundary polygon provided by user
const BOUNDARY = [
  [16.713014674656513, 74.19346219529133],
  [16.71129990029675, 74.19827199353445],
  [16.707171881293117, 74.19143287244015],
  [16.705647478823355, 74.19729933576573],
];

/**
 * Check if a point is inside a polygon using ray casting algorithm
 */
function isPointInPolygon(point, polygon) {
  const [lat, lng] = point;
  let inside = false;

  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const [lat_i, lng_i] = polygon[i];
    const [lat_j, lng_j] = polygon[j];

    const intersect =
      lng_i > lng &&
      lng_j <= lng &&
      (lat - lat_i) * (lng_j - lng_i) < (lat_j - lat_i) * (lng - lng_i);

    if (intersect) inside = !inside;
  }

  return inside;
}

/**
 * Calculate bounds of the polygon
 */
function getPolygonBounds(polygon) {
  const lats = polygon.map((p) => p[0]);
  const lngs = polygon.map((p) => p[1]);

  return {
    minLat: Math.min(...lats),
    maxLat: Math.max(...lats),
    minLng: Math.min(...lngs),
    maxLng: Math.max(...lngs),
  };
}

/**
 * Generate a random point within the polygon bounds
 */
function generateRandomPoint(bounds) {
  const lat = bounds.minLat + Math.random() * (bounds.maxLat - bounds.minLat);
  const lng = bounds.minLng + Math.random() * (bounds.maxLng - bounds.minLng);
  return [lat, lng];
}

/**
 * Generate a small farm plot polygon around a center point
 * Farm size is approximately 30-100 meters on each side
 */
function generateFarmPlot(centerLat, centerLng, area) {
  // Convert area (hectares) to approximate side length in degrees
  // 1 hectare ≈ 100m x 100m
  // At latitude ~16.7°, 1 degree lat ≈ 111km, 1 degree lng ≈ 106km
  const hectareToMeters = Math.sqrt(area * 10000);
  const latOffset = hectareToMeters / 2 / 111000; // meters to degrees
  const lngOffset = hectareToMeters / 2 / 106000;

  // Add some randomness to plot shape (not perfectly square)
  const randomFactor = 0.7 + Math.random() * 0.6; // 0.7 to 1.3

  return [
    [centerLat - latOffset, centerLng - lngOffset * randomFactor],
    [centerLat - latOffset * randomFactor, centerLng + lngOffset],
    [centerLat + latOffset, centerLng + lngOffset * randomFactor],
    [centerLat + latOffset * randomFactor, centerLng - lngOffset],
  ];
}

/**
 * Generate coordinates for all farms
 */
function generateAllFarmCoordinates(totalFarms, boundary) {
  const bounds = getPolygonBounds(boundary);
  const farmCoordinates = [];
  const minDistance = 0.0005; // Minimum distance between farm centers (~50 meters)

  let attempts = 0;
  const maxAttempts = totalFarms * 100;

  while (farmCoordinates.length < totalFarms && attempts < maxAttempts) {
    attempts++;

    // Generate random center point
    const point = generateRandomPoint(bounds);

    // Check if point is within boundary
    if (!isPointInPolygon(point, boundary)) {
      continue;
    }

    // Check minimum distance from existing farms
    let tooClose = false;
    for (const existing of farmCoordinates) {
      const distance = Math.sqrt(
        Math.pow(point[0] - existing.center[0], 2) +
          Math.pow(point[1] - existing.center[1], 2),
      );
      if (distance < minDistance) {
        tooClose = true;
        break;
      }
    }

    if (tooClose) {
      continue;
    }

    // Random farm area between 1.5 and 5.0 hectares
    const area = 1.5 + Math.random() * 3.5;

    // Generate farm plot polygon
    const polygon = generateFarmPlot(point[0], point[1], area);

    farmCoordinates.push({
      center: point,
      polygon: polygon,
      area: parseFloat(area.toFixed(1)),
    });
  }

  return farmCoordinates;
}

// Generate coordinates for all farms
console.log("Generating farm coordinates within boundary...");
const coordinates = generateAllFarmCoordinates(464, BOUNDARY);
console.log(`Generated ${coordinates.length} farm plots`);

// Export for use in update script
export { coordinates, BOUNDARY };
