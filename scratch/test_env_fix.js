// Test env resilience (JS version)
const { getServerEnv } = require("./src/lib/env");

console.log("Simulating Build Phase...");
process.env.NEXT_PHASE = "phase-production-build";
// Critical secrets that were causing the crash
const originalEmail = process.env.BREVO_SENDER_EMAIL;
delete process.env.BREVO_SENDER_EMAIL;

try {
  const env = getServerEnv();
  console.log("SUCCESS: Build phase env check passed without throwing.");
} catch (e) {
  console.error("FAILURE: Build phase env check threw error:", e.message);
  process.exit(1);
}

console.log("\nSimulating Production Runtime...");
delete process.env.NEXT_PHASE;
delete process.env.CI;

try {
  getServerEnv();
  console.error("FAILURE: Runtime env check should have thrown an error but didn't.");
  process.exit(1);
} catch (e) {
  console.log("SUCCESS: Runtime env check correctly threw error:", e.message);
}

// Restore for later tests if needed
process.env.BREVO_SENDER_EMAIL = originalEmail;
