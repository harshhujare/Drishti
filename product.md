# PMFBY

## Product

### Farm Map

1. the goal of this app to efficiently implement PMFBY 
2. this system will integrate with currunt working of pradhan mantri fasal bima yojana
3. this system will hwalp government detect the disaster like flood, drought, etc and estimate yield loss of crop using ndiv data provided by satalite 
4. we are making prototype of the system so we can fake the satalite data and test the system

5. we should able to create a fake demo in which we will depict the flood situation and estimate the yield loss of crop and and generate an insurance claim for the farmer 

# working of the system 

1. the GEE will provide the satalite data of the farm  with ndiv 
2. system will keep track of the ndiv 
3. if ndiv drops in the threshold value then system will generate a alert 
4. an ai resoning model will analyse the satalite data and estimate the yield loss of crop 
5. we estimate an ensurance claim for the farmer 
6. we will use human in the loop approach to validate the ai resoning model and ensurance amount 

# Currunt working of PMFBY (mannually)
Case 1: Disease is widespread in the area (most common outcome)
If pest/disease affects large part of the Insurance Unit (IU) (village/block):
👉 Farmers do NOT apply individually

Process:
Govt conducts Crop Cutting Experiments (CCEs)

Average yield of IU calculated

If yield < threshold yield
→ ALL insured farmers in that IU get payout

Even farmers whose fields look fine still get money.
And farmers with heavy loss get the same rate as others.

This is area insurance logic.
🌱 Case 2: Disease affects only a few farms (localized damage)

This is tricky and many people misunderstand.

PMFBY allows individual claims only under “Localized Calamity” category.
But:

Scheme mainly lists:

Hailstorm

Landslide

Inundation (flood pockets)

Pest/disease is rarely accepted as localized claim unless state notifies it.

If state allows it:
Farmer must:

Inform within 72 hours of noticing damage

Use:

CSC

Insurance company number

Agriculture officer

Provide:

Farm details

Crop type

Approx damage

Then:

Field officer visits
Geo-tagged photos taken
Report prepared
Insurer processes individual payout
This is slow and often disputed.


PMFBY Hackathon Implementation Plan 🚀
Goal: Build a polished, demonstrable Regional Disaster Payout System for the hackathon. Focus: Visual impact, clear logic transparency, and "Human-in-the-Loop" workflow.

🏗️ Demo Scenario Specification
Region: Shahuwadi Tehsil, Kolhapur
Total Farmers: 50
Disaster: Flood
Affected: 40 Farmers (>30% NDVI Drop)
Unaffected: 10 Farmers (<30% NDVI Drop)
Phase 1: Data & Simulation Updates (Immediate)
1.1 Update Test Data Generator
File: 
scripts/generateTestData.js

Modify script to generate exactly 50 farms in Shahuwadi.
Logic:
Create 40 farms with 
injectDisasterEvent('flood')
 (NDVI drop > 35%).
Create 10 farms with healthy data.
Ensure all farms are properly linked to Shahuwadi Tehsil.
1.2 "Fake AI" Yield Estimation Logic
File: services/yieldLossEstimator.js [NEW]

Threshold: IF ndviDrop > 30% THEN affected.
Logic:
if (ndviDrop > 30) {
    yieldLoss = ndviDrop * 1.5; // Correlation boost
    confidence = 85 + (ndviDrop / 10);
    status = 'Affected';
} else {
    yieldLoss = 0;
    status = 'Unaffected';
}
Phase 2: Logic & Transparency (Core Feature)
2.1 Payout Calculator Service
File: services/payoutCalculator.js [NEW]

Implement the Tiered Payout Formula with explicit factors to show judges.
Formula:
basePayout = insuranceValue * (yieldLoss / 100);
// Explicit Factors (to be displayed in UI)
weatherFactor = 1.1; // "Heavy Rainfall Recorded"
govtRate = 1.0;      // "Standard MSP"
marketRate = 0.95;   // "Current Market Adjustment"
finalPayout = basePayout * weatherFactor * govtRate * marketRate;
Output: Detailed object containing the breakdown for the UI.
2.2 Payout Logic Visualization
File: components/PayoutBreakdown.jsx [NEW]

A visual card showing the calculation steps.
"Show Math" style: ₹2,50,000 × 65% Loss = ₹1,62,500 × 1.1 (Weather) × 1.0 (Govt) = ₹1,78,750
Phase 3: Regional Dashboard & Map
3.1 Regional Statistics Dashboard
File: components/RegionalHealthDashboard.jsx [NEW]

Top Metrics:
Total Registered: 50
Affected: 40
Est. Payout: ₹X.XX Cr
Charts:
Pie Chart: Affected vs Healthy
Bar Chart: Severity Distribution (Moderate/Severe/Total)
3.2 Visual Map Enhancements
File: 
components/FarmMap.jsx

Ensure explicit color coding:
🔴 Red: Severe (>50% drop)
🟠 Orange: Moderate (30-50% drop)
🟢 Green: Healthy
Add "Region Overlay" to highlight Shahuwadi boundary (optional visual polish).
Phase 4: Officer Approval Workflow (The "Human" Element)
4.1 Officer Dashboard
File: layouts/OfficerDashboard.jsx [NEW]

Split view: Map on left, List of Claims on right.
Filter: "Pending Review" (default).
4.2 Individual Approval Interface
File: components/ClaimActionCard.jsx [NEW]

"Tinder-style" or Scrollable List for individual processing.
Actions: [Approve] [Reject] [Flag for Inspection]
On Approve:
Show satisfying "Stamp" animation.
Move to "Approved" list.
Update Regional Payout Total in real-time.
✅ Proposed Verification Plan
Automated Verification
Run node scripts/generateTestData.js and verify output console logs show 40 affected / 10 healthy.
Run unit test on payoutCalculator.js to verify formula matches the manual example.
User Manual Verification
Open Dashboard: Verify 50 farms loaded.
Trigger Flood: Click "Simulate Flood" button (to be added to DemoControls).
Verify Map: Check for ~40 red/orange polygons.
Check Calculation: Click a red farm, verify the "Payout Breakdown" card shows the specific math (Weather/Govt rates).
Approve: Click "Approve" on a farmer. Verify status changes and it drops from the "Pending" list.
