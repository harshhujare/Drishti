import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Boundary polygon provided by user
const BOUNDARY = [
  [16.713014674656513, 74.19346219529133],
  [16.71129990029675, 74.19827199353445],
  [16.707171881293117, 74.19143287244015],
  [16.705647478823355, 74.19729933576573],
];

function isPointInPolygon(point, polygon) {
  const [lat, lng] = point;
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const [lat_i, lng_i] = polygon[i];
    const [lat_j, lng_j] = polygon[j];
    const intersect =
      lng_i > lng !== lng_j > lng &&
      lat < ((lat_j - lat_i) * (lng - lng_i)) / (lng_j - lng_i) + lat_i;
    if (intersect) inside = !inside;
  }
  return inside;
}

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

function generateRandomPoint(bounds) {
  const lat = bounds.minLat + Math.random() * (bounds.maxLat - bounds.minLat);
  const lng = bounds.minLng + Math.random() * (bounds.maxLng - bounds.minLng);
  return [lat, lng];
}

function generateFarmPlot(centerLat, centerLng, farmArea) {
  const hectareToMeters = Math.sqrt(farmArea * 10000);
  const latOffset = hectareToMeters / 2 / 111000;
  const lngOffset = hectareToMeters / 2 / 106000;
  const randomFactor = 0.7 + Math.random() * 0.6;

  return [
    [centerLat - latOffset, centerLng - lngOffset * randomFactor],
    [centerLat - latOffset * randomFactor, centerLng + lngOffset],
    [centerLat + latOffset, centerLng + lngOffset * randomFactor],
    [centerLat + latOffset * randomFactor, centerLng - lngOffset],
  ];
}

function generateAllFarmCoordinates(totalFarms, boundary, farmAreas) {
  const bounds = getPolygonBounds(boundary);
  const farmCoordinates = [];
  const minDistance = 0.0005;

  let attempts = 0;
  const maxAttempts = totalFarms * 150;

  while (farmCoordinates.length < totalFarms && attempts < maxAttempts) {
    attempts++;
    const point = generateRandomPoint(bounds);

    if (!isPointInPolygon(point, boundary)) continue;

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

    if (tooClose) continue;

    const farmIndex = farmCoordinates.length;
    const area = farmAreas[farmIndex] || 2.5;
    const polygon = generateFarmPlot(point[0], point[1], area);

    farmCoordinates.push({
      center: point,
      polygon: polygon,
    });
  }

  return farmCoordinates;
}

// Read and parse farms.js
const farmsPath = path.join(__dirname, "..", "data", "farms.js");
let farmsContent = fs.readFileSync(farmsPath, "utf8");

// Extract current farm areas
const areaRegex = /area:\s*([\d.]+)/g;
const currentAreas = [];
let match;
while ((match = areaRegex.exec(farmsContent)) !== null) {
  currentAreas.push(parseFloat(match[1]));
}

console.log(`Found ${currentAreas.length} farms in file`);
console.log("Generating new coordinates within boundary...");

// Generate coordinates
const coordinates = generateAllFarmCoordinates(
  currentAreas.length,
  BOUNDARY,
  currentAreas,
);
console.log(`Generated ${coordinates.length} farm plots`);

// Replace polygons - use multiline regex to match complete polygon arrays including trailing comma
let farmIndex = 0;
const updatedContent = farmsContent.replace(
  /polygon:\s*\[\r?\n[\s\S]*?\r?\n\s*\],/g,
  (match) => {
    if (farmIndex >= coordinates.length) return match;

    const coord = coordinates[farmIndex];
    farmIndex++;

    // Preserve the exact whitespace style
    return `polygon: [\r\n      [${coord.polygon[0][0]}, ${coord.polygon[0][1]}],\r\n      [${coord.polygon[1][0]}, ${coord.polygon[1][1]}],\r\n      [${coord.polygon[2][0]}, ${coord.polygon[2][1]}],\r\n      [${coord.polygon[3][0]}, ${coord.polygon[3][1]}],\r\n    ],`;
  },
);

// Write back
fs.writeFileSync(farmsPath, updatedContent, "utf8");
console.log(`\n✅ Successfully updated ${farmIndex} farms`);
console.log(`✅ All farms are now within the specified boundary`);
console.log(`\n📍 Boundary coordinates:`);
BOUNDARY.forEach((coord, i) => {
  console.log(`   Point ${i + 1}: ${coord[0]}, ${coord[1]}`);
});
