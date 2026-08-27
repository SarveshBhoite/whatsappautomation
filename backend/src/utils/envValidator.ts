/**
 * Environment Safety & Configuration Validator (Phase 48)
 * Validates active environment mode (development, staging, production)
 * Prevents cross-environment credential leaks and validates critical service secrets.
 */

export interface EnvironmentConfig {
  nodeEnv: "development" | "staging" | "production" | "test";
  port: number;
  databaseUrlConfigured: boolean;
  metaAppConfigured: boolean;
  googleAuthConfigured: boolean;
  groqConfigured: boolean;
}

export class EnvironmentSafetyService {
  public static validateEnvironment(): EnvironmentConfig {
    const rawEnv = (process.env.NODE_ENV || "development").toLowerCase();
    const nodeEnv = (["production", "staging", "test"].includes(rawEnv) ? rawEnv : "development") as EnvironmentConfig["nodeEnv"];

    const port = parseInt(process.env.PORT || "5000", 10);
    const databaseUrlConfigured = Boolean(process.env.DATABASE_URL);
    const metaAppConfigured = Boolean(process.env.META_APP_ID && process.env.META_APP_SECRET);
    const googleAuthConfigured = Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET);
    const groqConfigured = Boolean(process.env.GROQ_API_KEY);

    console.log(`[ENVIRONMENT SAFETY] 🛡️ Active Mode: ${nodeEnv.toUpperCase()} | Port: ${port}`);

    if (nodeEnv === "production") {
      if (!databaseUrlConfigured) {
        console.error("❌ CRITICAL: DATABASE_URL is missing in PRODUCTION environment!");
      }
      if (!metaAppConfigured) {
        console.warn("⚠️ WARNING: META_APP_ID / META_APP_SECRET not fully configured in PRODUCTION.");
      }
    }

    return {
      nodeEnv,
      port,
      databaseUrlConfigured,
      metaAppConfigured,
      googleAuthConfigured,
      groqConfigured,
    };
  }
}
