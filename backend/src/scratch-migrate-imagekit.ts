import prisma from "./utils/prisma";

async function migrateDatabase() {
  console.log("========== IMAGEKIT DATABASE MIGRATION START ==========");
  
  const ikEndpoint = process.env.IMAGEKIT_URL_ENDPOINT || "https://ik.imagekit.io/automationjds";

  // 1. Update LinkedInPost table
  const posts = await prisma.linkedInPost.findMany({
    where: { mediaUrl: { not: null } }
  });

  console.log(`Found ${posts.length} LinkedIn posts with mediaUrl.`);
  let updatedPosts = 0;

  for (const post of posts) {
    if (!post.mediaUrl) continue;
    if (post.mediaUrl.includes("/uploads/linkedin/") || post.mediaUrl.includes("localhost")) {
      const filename = post.mediaUrl.split("/").pop();
      const newUrl = `${ikEndpoint}/linkedin/${filename}`;
      await prisma.linkedInPost.update({
        where: { id: post.id },
        data: { mediaUrl: newUrl }
      });
      updatedPosts++;
      console.log(`Migrated LinkedInPost [${post.id}]: ${post.mediaUrl} -> ${newUrl}`);
    }
  }

  // 2. Update LinkedInPersonalPost table
  const personalPosts = await prisma.linkedInPersonalPost.findMany({
    where: { mediaUrl: { not: null } }
  });

  console.log(`Found ${personalPosts.length} LinkedIn personal posts with mediaUrl.`);
  let updatedPersonalPosts = 0;

  for (const post of personalPosts) {
    if (!post.mediaUrl) continue;
    if (post.mediaUrl.includes("/uploads/linkedin/") || post.mediaUrl.includes("localhost")) {
      const filename = post.mediaUrl.split("/").pop();
      const newUrl = `${ikEndpoint}/linkedin/${filename}`;
      await prisma.linkedInPersonalPost.update({
        where: { id: post.id },
        data: { mediaUrl: newUrl }
      });
      updatedPersonalPosts++;
      console.log(`Migrated LinkedInPersonalPost [${post.id}]: ${post.mediaUrl} -> ${newUrl}`);
    }
  }

  // 3. Update LinkedInSchedule table
  const scheduled = await prisma.linkedInSchedule.findMany({
    where: { mediaUrl: { not: null } }
  });

  console.log(`Found ${scheduled.length} LinkedIn scheduled posts with mediaUrl.`);
  let updatedScheduled = 0;

  for (const sched of scheduled) {
    if (!sched.mediaUrl) continue;
    if (sched.mediaUrl.includes("/uploads/linkedin/") || sched.mediaUrl.includes("localhost")) {
      const filename = sched.mediaUrl.split("/").pop();
      const newUrl = `${ikEndpoint}/linkedin/${filename}`;
      await prisma.linkedInSchedule.update({
        where: { id: sched.id },
        data: { mediaUrl: newUrl }
      });
      updatedScheduled++;
      console.log(`Migrated LinkedInSchedule [${sched.id}]: ${sched.mediaUrl} -> ${newUrl}`);
    }
  }

  console.log("=======================================================");
  console.log(`Database migration complete.`);
  console.log(`Updated Posts: ${updatedPosts}`);
  console.log(`Updated Personal Posts: ${updatedPersonalPosts}`);
  console.log(`Updated Scheduled Posts: ${updatedScheduled}`);
  console.log("=======================================================");
}

migrateDatabase().catch(err => console.error(err)).finally(() => prisma.$disconnect());
