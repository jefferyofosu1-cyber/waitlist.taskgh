// Test env resilience
import { getServerEnv } from "./src/lib/env";

console.log("Simulating Build Phase...");
process.env.NEXT_PHASE = "phase-production-build";
// Critical secrets that were causing the crash
delete process.env.BREVO_SENDER_EMAIL;
delete process.env.FLASHSMS_API_KEY;

try {
  const env = getServerEnv();
  console.log("SUCCESS: Build phase env check passed without throwing.");
  console.log("SENDER_EMAIL (should be empty):", env.brevoSenderEmail === "" ? "PASS" : "FAIL");
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
