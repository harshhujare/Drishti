import express from "express";
import cors from "cors";
import cron from "node-cron";
import farmsRoutes from "./routes/farmsRoutes.js";
import ndviRoutes from "./routes/ndvi.js";
import alertRoutes from "./routes/alerts.js";
import divisionRoutes from "./routes/divisions.js";
import claimsRoutes from "./routes/claims.js";
import { monitorAllFarms } from "./services/ndviMonitor.js";

const app = express();
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "http://localhost:5174",
      "http://localhost:3001",
    ],
    credentials: true,
  }),
);

app.use(express.json());

// API Routes
app.use("/api", divisionRoutes); // Administrative Division routes - MUST be before farmsRoutes to avoid collision with /:id
app.use("/api/farms", farmsRoutes);
app.use("/api", ndviRoutes); // NDVI routes
app.use("/api", alertRoutes); // Alert & Monitoring routes
app.use("/api", claimsRoutes); // Claims & Approval routes

// Health check route
app.get("/", (req, res) => {
  res.json({ message: "PMFBY API Server is running" });
});

// Cron Job: NDVI Monitoring
// In real life, satellite data updates every 3 days
// For demo: Run every 5 minutes to show real-time alerts
// Pattern: '*/5 * * * *' = every 5 minutes
// Pattern: '0 0 */3 * *' = every 3 days at midnight (production)
cron.schedule("*/5 * * * *", () => {
  console.log("\n🛰️  [Cron] Running scheduled NDVI monitoring check...");
  try {
    const results = monitorAllFarms();
    console.log(
      `✅ [Cron] Monitoring completed - ${results.farmsChecked} farms checked, ${results.alertsGenerated} alerts generated\n`,
    );
  } catch (error) {
    console.error("❌ [Cron] Monitoring failed:", error.message);
  }
});

app.listen(3000, () => {
  console.log("🌾 PMFBY API Server is running on port 3000");
  console.log("📡 NDVI Monitoring: Every 5 minutes (demo mode)");
  console.log(
    "💡 Tip: Change to '0 0 */3 * *' for 3-day production schedule\n",
  );
});
