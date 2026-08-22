import prisma from "./utils/prisma";

async function runSeed() {
  console.log("Seeding credentials into database...");

  try {
    // 1. Create Default Organization
    const org = await (prisma.organization as any).upsert({
      where: { id: "demo-org-123" },
      update: {},
      create: {
        id: "demo-org-123",
        name: "Default Agency",
        enabledModules: [
          "whatsapp", "instagram", "gmb", "gmail", "linkedin", "youtube", "google_ads", "meta_ads", "reviews", "ai_agent", "tools"
        ]
      },
    });
    console.log(`✓ Organization created/verified: ${org.name} (${org.id})`);

    // 2. Create Client Admin User
    const clientAdmin = await (prisma.user as any).upsert({
      where: { email: "admin@default.com" },
      update: { password: "admin123", role: "admin" },
      create: {
        id: "demo-user-123",
        email: "admin@default.com",
        name: "Admin User",
        password: "admin123",
        role: "admin",
        organizationId: org.id,
      },
    });
    console.log(`✓ Client Admin User seeded: ${clientAdmin.email}`);

    // 3. Create Super Admin User
    const superAdmin = await (prisma.user as any).upsert({
      where: { email: "superadmin@automationcrm.com" },
      update: { password: "admin123", role: "super_admin" },
      create: {
        id: "super-admin-123",
        email: "superadmin@automationcrm.com",
        name: "Super Admin",
        password: "admin123",
        role: "super_admin",
        organizationId: org.id,
      },
    });
    console.log(`✓ Super Admin User seeded: ${superAdmin.email}`);

    console.log("SUCCESS: All credentials seeded cleanly!");
  } catch (error) {
    console.error("Seeding error:", error);
  } finally {
    await prisma.$disconnect();
  }
}

runSeed();
