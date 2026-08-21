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
      },
    });
    console.log(`✓ Organization created/verified: ${org.name} (${org.id})`);

    // 2. Create Client Admin / Super Admin User
    const clientAdmin = await (prisma.user as any).upsert({
      where: { email: "info.jdsolutions2018@gmail.com" },
      update: { password: "Jisnu123", role: "super_admin" },
      create: {
        email: "info.jdsolutions2018@gmail.com",
        name: "Admin User",
        password: "Jisnu123",
        role: "super_admin",
        organizationId: org.id,
      },
    });
    console.log(`✓ Client Admin User seeded: ${clientAdmin.email}`);

    // 3. Create Super Admin User
    const superAdmin = await (prisma.user as any).upsert({
      where: { email: "superadmin@automationcrm.com" },
      update: { password: "Jisnu123", role: "super_admin" },
      create: {
        email: "superadmin@automationcrm.com",
        name: "Super Admin",
        password: "Jisnu123",
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
