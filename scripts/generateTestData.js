/**
 * Test Data Generation Script for PMFBY
 * Generates fake NDVI data and tests disaster detection
 */

import { getFarms } from "../data/farms.js";
import {
  generateNDVITimeSeries,
  injectDisasterEvent,
} from "../services/ndviGenerator.js";
import { storeNDVIData } from "../data/ndviData.js";
import { monitorAllFarms } from "../services/ndviMonitor.js";

/**
 * Generate healthy NDVI data for all farms
 */
function generateHealthyData() {
  console.log("🌱 Generating healthy NDVI data for all farms...\n");

  const farms = getFarms();
  let totalDataPoints = 0;

  farms.forEach((farm) => {
    // Generate 60 days of healthy NDVI data
    const ndviData = generateNDVITimeSeries(farm, 60);
    storeNDVIData(ndviData);

    totalDataPoints += ndviData.length;

    console.log(
      `✅ Farm ${farm.id} (${farm.farmerName}): ${ndviData.length} data points`,
    );
    console.log(`   Baseline NDVI: ${farm.baselineNDVI}`);
    console.log(`   Latest NDVI: ${ndviData[ndviData.length - 1].ndvi}`);
    console.log(
      `   Health: ${getHealthEmoji(ndviData[ndviData.length - 1].ndvi, farm.baselineNDVI)}\n`,
    );
  });

  console.log(
    `📊 Total: ${totalDataPoints} NDVI data points generated for ${farms.length} farms\n`,
  );
  console.log("=".repeat(60) + "\n");
}

/**
 * Inject disaster scenarios for testing
 */
function generateDisasterScenarios() {
  console.log("🌊 Injecting HACKATHON FLOOD SCENARIO for Shahuwadi...\n");

  const farms = getFarms();

  // Randomly select 40 farms for flood disaster
  const shuffled = [...farms].sort(() => Math.random() - 0.5);
  const affectedFarms = shuffled.slice(0, 40);
  const healthyFarms = shuffled.slice(40, 50);

  console.log(`⚡ DISASTER SCENARIO: Regional Flood in Shahuwadi Tehsil`);
  console.log(`📊 Total Farms: 50`);
  console.log(`🔴 Affected: 40 farms (80%)`);
  console.log(`🟢 Healthy: 10 farms (20%)\n`);

  let severeCount = 0;
  let moderateCount = 0;

  // Inject flood disaster on affected farms
  affectedFarms.forEach((farm, index) => {
    // Vary severity: 60-90% (ensures >30% NDVI drop)
    const severity = 0.6 + Math.random() * 0.3;
    const isSevere = severity > 0.75;

    if (isSevere) severeCount++;
    else moderateCount++;

    const farmData = generateNDVITimeSeries(farm, 60);
    const floodData = injectDisasterEvent(farmData, {
      type: "flood",
      startDay: 15, // 15 days ago
      duration: 7, // 7-day flood event
      severity: severity,
    });
    storeNDVIData(floodData);

    if (index < 3) {
      // Show first 3 as examples
      const expectedDrop = (severity * 50).toFixed(1);
      console.log(
        `  ${isSevere ? "🔴" : "🟠"} Farm ${farm.id} (${farm.farmerName}): ${(severity * 100).toFixed(0)}% severity → ~${expectedDrop}% NDVI drop`,
      );
    }
  });

  console.log(`  ... and ${affectedFarms.length - 3} more affected farms\n`);
  console.log(`📈 Severity Distribution:`);
  console.log(`   🔴 Severe (>75%): ${severeCount} farms`);
  console.log(`   🟠 Moderate (60-75%): ${moderateCount} farms\n`);

  // Generate healthy data for remaining 10 farms
  healthyFarms.forEach((farm, index) => {
    const farmData = generateNDVITimeSeries(farm, 60);
    storeNDVIData(farmData);

    if (index < 2) {
      // Show first 2 as examples
      console.log(
        `  🟢 Farm ${farm.id} (${farm.farmerName}): Healthy - No disaster`,
      );
    }
  });

  console.log(`  ... and ${healthyFarms.length - 2} more healthy farms\n`);
  console.log("=".repeat(60) + "\n");
}

/**
 * Run monitoring and check alerts
 */
function testAlertGeneration() {
  console.log("🔍 Running NDVI monitoring to generate alerts...\n");

  const results = monitorAllFarms();

  console.log("📊 Monitoring Results:");
  console.log(`   Farms checked: ${results.farmsChecked}`);
  console.log(`   New alerts generated: ${results.alertsGenerated}`);
  console.log(`   Errors: ${results.errors.length}\n`);

  if (results.newAlerts.length > 0) {
    console.log("🚨 Generated Alerts:\n");
    results.newAlerts.forEach((alert, index) => {
      console.log(
        `${index + 1}. ${getSeverityEmoji(alert.severity)} ${alert.farmerName}`,
      );
      console.log(`   Severity: ${alert.severity.toUpperCase()}`);
      console.log(`   NDVI Drop: ${alert.dropPercentage.toFixed(1)}%`);
      console.log(
        `   Current: ${alert.currentNDVI.toFixed(3)} → Baseline: ${alert.baselineNDVI.toFixed(3)}`,
      );
      console.log(`   Message: ${alert.message}\n`);
    });
  } else {
    console.log(
      "ℹ️  No new alerts generated (farms may already have active alerts)\n",
    );
  }

  console.log("=".repeat(60) + "\n");
}

/**
 * Get health status emoji
 */
function getHealthEmoji(currentNDVI, baselineNDVI) {
  const dropPercent = ((baselineNDVI - currentNDVI) / baselineNDVI) * 100;

  if (dropPercent < 10) return "💚 Healthy";
  if (dropPercent < 25) return "💛 Warning";
  if (dropPercent < 50) return "🧡 Critical";
  return "❤️  Severe";
}

/**
 * Get severity emoji
 */
function getSeverityEmoji(severity) {
  const emojiMap = {
    low: "💚",
    medium: "💛",
    high: "🧡",
    critical: "🔴",
  };
  return emojiMap[severity] || "⚪";
}

/**
 * Main execution
 */
function main() {
  console.clear();
  console.log("\n" + "=".repeat(60));
  console.log("🛰️  PMFBY Test Data Generator");
  console.log("   Satellite-Based Crop Insurance System");
  console.log("=".repeat(60) + "\n");

  try {
    // Step 1: Generate healthy baseline data
    generateHealthyData();

    // Step 2: Inject disaster scenarios
    generateDisasterScenarios();

    // Step 3: Run monitoring to generate alerts
    testAlertGeneration();

    console.log("✅ Test data generation complete!");
    console.log("🌐 View results in the UI:");
    console.log("   - Map view: http://localhost:5173");
    console.log("   - NDVI Dashboard: Click 'NDVI' button in header\n");
  } catch (error) {
    console.error("❌ Error generating test data:", error);
    process.exit(1);
  }
}

// Run the script
main();
