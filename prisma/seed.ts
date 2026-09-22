import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database with simplified multi-country manager structure (Roshan -> Nepal & India)...");

  // Clean existing data
  await prisma.projectAssignment.deleteMany();
  await prisma.sampleVideo.deleteMany();
  await prisma.creatorProfile.deleteMany();
  await prisma.project.deleteMany();
  await prisma.user.deleteMany();
  await prisma.country.deleteMany();
  await prisma.onboardingConfig.deleteMany();

  const adminPasswordHash = await bcrypt.hash("admin123", 10);
  const managerPasswordHash = await bcrypt.hash("manager123", 10);
  const creatorPasswordHash = await bcrypt.hash("creator123", 10);

  // 0. Seed Countries
  const defaultCountries = [
    { name: "Nepal", code: "NP", currency: "NPR", defaultRate: "$75 / week" },
    { name: "India", code: "IN", currency: "INR", defaultRate: "$75 / week" },
    { name: "United States", code: "US", currency: "USD", defaultRate: "$100 / week" },
    { name: "United Kingdom", code: "GB", currency: "GBP", defaultRate: "$100 / week" },
    { name: "Canada", code: "CA", currency: "CAD", defaultRate: "$100 / week" },
    { name: "Australia", code: "AU", currency: "AUD", defaultRate: "$100 / week" },
    { name: "Germany", code: "DE", currency: "EUR", defaultRate: "$100 / week" },
    { name: "Global", code: "GL", currency: "USD", defaultRate: "$100 / week" },
  ];

  for (const c of defaultCountries) {
    await prisma.country.create({ data: c });
  }
  console.log(`Seeded ${defaultCountries.length} countries.`);

  // Seed Default Onboarding Config
  await prisma.onboardingConfig.create({
    data: {
      id: "default",
      country: "Global",
      welcomeTitle: "Welcome to the Amora Creator Team!",
      welcomeMessage:
        "Congratulations on being hired! Complete this quick 4-step checklist to receive your project briefs and begin your weekly video batches.",
      requireContract: true,
      contractTitle: "Amora Creator Service Agreement (15 Videos Weekly)",
      contractTerms:
        "By signing below, you agree to deliver 15 high-retention vertical short-form videos weekly according to the provided briefs. Content must be original, high resolution (1080p+), and delivered on schedule. Payouts are issued weekly upon batch approval.",
      requireDiscord: true,
      discordInviteUrl: "https://discord.gg/amora-creators",
      discordDescription:
        "Join our private Discord community to sync with Roshan, access weekly viral hooks and sound libraries, and receive real-time editing feedback.",
      requirePaymentInfo: true,
      paymentInstructions:
        "Provide your bank account details or digital wallet identifier (e.g. eSewa or Khalti in Nepal, UPI in India, or PayPal/Wise globally) to receive your weekly payments.",
      requireDriveAccess: true,
      driveUrl: "https://drive.google.com/drive/folders/amora-creator-assets",
      driveInstructions:
        "Access brand guidelines, overlay graphics, color grading LUTs, and script templates.",
    },
  });
  console.log("Seeded default OnboardingConfig.");

  // 1. Super Admin
  const admin = await prisma.user.create({
    data: {
      email: "admin@amora.io",
      name: "Global Talent Director",
      passwordHash: adminPasswordHash,
      role: "ADMIN",
    },
  });
  console.log(`Created Super Admin: ${admin.email}`);

  // 2. Location Managers
  // Roshan looks after both Nepal and India!
  const roshanManager = await prisma.user.create({
    data: {
      email: "roshan@amora.io",
      name: "Roshan Nyoupane",
      passwordHash: managerPasswordHash,
      role: "MANAGER",
      assignedCountry: "Nepal, India",
    },
  });
  console.log(`Created Manager Roshan: ${roshanManager.email} (Managing: Nepal, India)`);

  // US Manager
  const usManager = await prisma.user.create({
    data: {
      email: "manager.us@amora.io",
      name: "Jessica Miller",
      passwordHash: managerPasswordHash,
      role: "MANAGER",
      assignedCountry: "United States",
    },
  });
  console.log(`Created US Manager: ${usManager.email} (Managing: United States)`);

  // 3. Country-Specific Projects with Localized Pay Rates
  // Nepal Campaign: $75 / week (15 videos weekly)
  const projectNepal = await prisma.project.create({
    data: {
      title: "Amora Nepal — 15 Videos Weekly",
      brand: "Amora",
      description:
        "Create 15 short-form videos weekly and get paid $75 weekly for creators based in Nepal. Flexible schedule, prompt briefs provided, guaranteed weekly payout upon submission.",
      deliverables: "15 short-form videos weekly (15-60s) + raw footage",
      country: "Nepal",
      targetPlatforms: "TikTok, Instagram Reels, YouTube Shorts",
      budget: "$75 / week",
      deadline: "Weekly Ongoing",
      status: "ACTIVE",
      niches: "UGC, Lifestyle, Nepal, Video Creation",
    },
  });

  // India Campaign: $75 / week (15 videos weekly)
  const projectIndia = await prisma.project.create({
    data: {
      title: "Amora India — 15 Videos Weekly",
      brand: "Amora",
      description:
        "Create 15 short-form videos weekly and get paid $75 weekly for creators based in India. High-performing vertical reels and shorts.",
      deliverables: "15 short-form videos weekly (15-60s) with hook variations",
      country: "India",
      targetPlatforms: "Instagram Reels, YouTube Shorts",
      budget: "$75 / week",
      deadline: "Weekly Ongoing",
      status: "ACTIVE",
      niches: "UGC, Lifestyle, Hindi, Tech",
    },
  });

  // US / Global Campaign: $100 / week (15 videos weekly)
  const projectGlobal = await prisma.project.create({
    data: {
      title: "Amora Global — 15 Videos Weekly",
      brand: "Amora",
      description:
        "Create 15 videos weekly and get paid $100 for Amora Global. High-converting creator content, trending sound formats, and aesthetic showcases.",
      deliverables: "15 short-form videos weekly (15-60s) with hook variations",
      country: "Global",
      targetPlatforms: "TikTok, Instagram Reels, YouTube Shorts",
      budget: "$100 / week",
      deadline: "Weekly Ongoing",
      status: "ACTIVE",
      niches: "UGC, Lifestyle, Tech, Global",
    },
  });

  // 4. Creators & Profiles across Countries

  // --- NEPAL CREATORS ---

  // Nepal Creator 1: Aarav Sharma (HIRED for Nepal project)
  const aaravUser = await prisma.user.create({
    data: {
      email: "aarav@example.com",
      name: "Aarav Sharma",
      passwordHash: creatorPasswordHash,
      role: "CREATOR",
    },
  });

  const aaravProfile = await prisma.creatorProfile.create({
    data: {
      userId: aaravUser.id,
      country: "Nepal",
      location: "Kathmandu, Nepal",
      phone: "+977 980-1234567",
      bio: "Short-form video editor and content creator from Kathmandu. Delivers 15+ high-retention videos weekly.",
      niches: "UGC, Nepal, Lifestyle",
      platforms: "TikTok, Instagram Reels, YouTube Shorts",
      rateExpectation: "$75 / week (Nepal)",
      instagramHandle: "aaravcreations",
      instagramFollowers: "22K",
      tiktokHandle: "aarav_np",
      tiktokFollowers: "65K",
      status: "HIRED",
      statusMessage: "Hired for the Amora Nepal weekly project ($75/week)!",
      viewedAt: new Date(Date.now() - 86400000),
      contractSignedAt: new Date(Date.now() - 80000000),
      contractSignedName: "Aarav Sharma",
      discordJoinedAt: new Date(Date.now() - 75000000),
      payoutDetails: "eSewa ID: 980-1234567 (Aarav Sharma, Kathmandu Branch)",
      onboardingComplete: true,
      adminRating: 5,
      adminNotes: "Fast turnaround and high retention pacing. Excellent for Nepal weekly quota.",
    },
  });

  await prisma.sampleVideo.create({
    data: {
      creatorProfileId: aaravProfile.id,
      title: "High Retention UGC Hook & Edit",
      url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullrun.mp4",
      platform: "DIRECT",
      description: "Demonstration of pacing, captions, and hook delivery.",
    },
  });

  // Assigned by Roshan
  await prisma.projectAssignment.create({
    data: {
      projectId: projectNepal.id,
      creatorProfileId: aaravProfile.id,
      assignedByUserId: roshanManager.id,
      status: "IN_PROGRESS",
      payout: "$75 / week",
      notes: "Weekly 15 video quota active. Payout processed every Monday.",
    },
  });

  // Nepal Creator 2: Subash Karki (PENDING_REVIEW in Nepal)
  const subashUser = await prisma.user.create({
    data: {
      email: "subash@example.com",
      name: "Subash Karki",
      passwordHash: creatorPasswordHash,
      role: "CREATOR",
    },
  });

  const subashProfile = await prisma.creatorProfile.create({
    data: {
      userId: subashUser.id,
      country: "Nepal",
      location: "Pokhara, Nepal",
      phone: "+977 981-9876543",
      bio: "Outdoor and tech lifestyle filmmaker in Pokhara.",
      niches: "Lifestyle, Tech, Travel",
      platforms: "TikTok, Instagram Reels",
      rateExpectation: "$75 / week (Nepal)",
      instagramHandle: "subashvids",
      instagramFollowers: "15K",
      tiktokHandle: "subash_karki",
      tiktokFollowers: "28K",
      status: "PENDING_REVIEW",
      statusMessage: "Application received! Your manager (Roshan) will review your sample video.",
    },
  });

  await prisma.sampleVideo.create({
    data: {
      creatorProfileId: subashProfile.id,
      title: "Outdoor Cinematic Reel (Demo)",
      url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      platform: "YOUTUBE",
      description: "Natural lighting showcasing fast-cut transitions.",
    },
  });

  // --- INDIA CREATORS ---

  // India Creator 1: Priya Patel (SHORTLISTED in India)
  const priyaUser = await prisma.user.create({
    data: {
      email: "priya@example.com",
      name: "Priya Patel",
      passwordHash: creatorPasswordHash,
      role: "CREATOR",
    },
  });

  const priyaProfile = await prisma.creatorProfile.create({
    data: {
      userId: priyaUser.id,
      country: "India",
      location: "Mumbai, India",
      phone: "+91 98200-11223",
      bio: "Beauty & lifestyle UGC creator from Mumbai. Creates engaging 15s product demos and GRWM videos.",
      niches: "Beauty, Skincare, Lifestyle",
      platforms: "Instagram Reels, YouTube Shorts",
      rateExpectation: "$75 / week (India)",
      instagramHandle: "priyapatel_reels",
      instagramFollowers: "45K",
      youtubeHandle: "PriyaPatelVlogs",
      youtubeSubscribers: "18K",
      status: "SHORTLISTED",
      statusMessage: "Shortlisted by manager Roshan for the upcoming 15 videos/week batch!",
      viewedAt: new Date(Date.now() - 43200000),
      adminRating: 5,
      adminNotes: "Super clean lighting and crisp Hindi/English voiceover. Ready to assign to India project.",
    },
  });

  await prisma.sampleVideo.create({
    data: {
      creatorProfileId: priyaProfile.id,
      title: "Clean Skincare GRWM Routine (Demo)",
      url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      platform: "YOUTUBE",
      description: "Clean aesthetic product demo with clear spoken audio.",
    },
  });

  // India Creator 2: Rohan Verma (PENDING_REVIEW in India)
  const rohanUser = await prisma.user.create({
    data: {
      email: "rohan@example.com",
      name: "Rohan Verma",
      passwordHash: creatorPasswordHash,
      role: "CREATOR",
    },
  });

  const rohanProfile = await prisma.creatorProfile.create({
    data: {
      userId: rohanUser.id,
      country: "India",
      location: "Bengaluru, India",
      phone: "+91 99887-66554",
      bio: "Tech gear and workspace creator from Bengaluru. Unboxings and quick desk setup reels.",
      niches: "Tech, Gadgets, Productivity",
      platforms: "Instagram Reels, YouTube Shorts",
      rateExpectation: "$75 / week (India)",
      instagramHandle: "rohan_techreels",
      instagramFollowers: "32K",
      status: "PENDING_REVIEW",
      statusMessage: "Application received! Your manager (Roshan) will review your sample video.",
    },
  });

  await prisma.sampleVideo.create({
    data: {
      creatorProfileId: rohanProfile.id,
      title: "Desk Setup Minimalist Reel",
      url: "https://www.youtube.com/watch?v=aqz-KE-bpKQ",
      platform: "YOUTUBE",
      description: "Crisp macro shots of mechanical keyboard and ambient lighting.",
    },
  });

  // --- US CREATORS ---

  // US Creator 1: Sophia Martinez (SHORTLISTED in United States)
  const sophiaUser = await prisma.user.create({
    data: {
      email: "sophia@example.com",
      name: "Sophia Martinez",
      passwordHash: creatorPasswordHash,
      role: "CREATOR",
    },
  });

  const sophiaProfile = await prisma.creatorProfile.create({
    data: {
      userId: sophiaUser.id,
      country: "United States",
      location: "San Francisco, CA",
      phone: "+1 (415) 890-2341",
      bio: "UGC specialist passionate about clean aesthetics and product showcases.",
      niches: "Beauty, Lifestyle, UGC",
      platforms: "TikTok, Instagram Reels, YouTube Shorts",
      rateExpectation: "$100 / week (Amora Global)",
      instagramHandle: "sophiaglows",
      instagramFollowers: "84K",
      tiktokHandle: "sophiamartinez_ugc",
      tiktokFollowers: "142K",
      status: "SHORTLISTED",
      statusMessage: "Shortlisted by US manager for the 15 videos/week batch!",
      viewedAt: new Date(Date.now() - 86400000 * 2),
      adminRating: 5,
      adminNotes: "Consistent lighting and top-tier voiceover delivery.",
    },
  });

  await prisma.sampleVideo.create({
    data: {
      creatorProfileId: sophiaProfile.id,
      title: "Clean Morning Aesthetic Reel",
      url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      platform: "YOUTUBE",
      description: "Natural lighting demonstrating quick pacing and hook.",
    },
  });

  console.log("Database seeded successfully with Roshan managing Nepal and India!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
