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
  console.log("🌊 Injecting disaster scenarios for testing...\n");

  const farms = getFarms();

  // Scenario 1: Severe flood on Farm 1 (Rajaram Mane)
  console.log("⚠️  SCENARIO 1: Severe Flood - Farm 1 (Rajaram Mane)");
  const farm1Data = generateNDVITimeSeries(farms[0], 60);
  const flood1 = injectDisasterEvent(farm1Data, {
    type: "flood",
    startDay: 15, // 15 days ago
    duration: 7, // 7-day flood event
    severity: 0.8, // 80% severity (very severe)
  });
  storeNDVIData(flood1);
  console.log(`   💧 Severe 7-day flood injected (80% severity)`);
  console.log(`   📉 Expected NDVI drop: ~40%`);
  console.log(`   🚨 Should trigger CRITICAL alert\n`);

  // Scenario 2: Moderate drought on Farm 2 (Sarjerao Mane)
  console.log("⚠️  SCENARIO 2: Moderate Drought - Farm 2 (Sarjerao Mane)");
  const farm2Data = generateNDVITimeSeries(farms[1], 60);
  const drought2 = injectDisasterEvent(farm2Data, {
    type: "drought",
    startDay: 20, // 20 days ago
    duration: 15, // 15-day drought
    severity: 0.6, // 60% severity (moderate)
  });
  storeNDVIData(drought2);
  console.log(`   ☀️  Moderate 15-day drought injected (60% severity)`);
  console.log(`   📉 Expected NDVI drop: ~24%`);
  console.log(`   ⚡ Should trigger WARNING alert\n`);

  // Scenario 3: Minor pest attack on Farm 3 (Vishal Rane)
  console.log("⚠️  SCENARIO 3: Minor Pest Attack - Farm 3 (Vishal Rane)");
  const farm3Data = generateNDVITimeSeries(farms[2], 60);
  const pest3 = injectDisasterEvent(farm3Data, {
    type: "pest",
    startDay: 10, // 10 days ago
    duration: 5, // 5-day pest issue
    severity: 0.4, // 40% severity (minor)
  });
  storeNDVIData(pest3);
  console.log(`   🐛 Minor 5-day pest attack injected (40% severity)`);
  console.log(`   📉 Expected NDVI drop: ~12%`);
  console.log(`   💚 Should trigger WARNING or stay healthy\n`);

  // Farm 4 stays healthy (no disaster)
  console.log("✅ SCENARIO 4: Healthy Farm - Farm 4 (Ramesh Patil)");
  const farm4Data = generateNDVITimeSeries(farms[3], 60);
  storeNDVIData(farm4Data);
  console.log(`   🌾 No disaster - healthy crop`);
  console.log(`   📈 Expected: Normal NDVI, no alerts\n`);

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
