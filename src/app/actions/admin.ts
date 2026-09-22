"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { getSessionUser, hashPassword } from "@/lib/auth";

async function verifyAdmin() {
  const user = await getSessionUser();
  if (!user || user.role !== "ADMIN") {
    throw new Error("Unauthorized: Super Admin access required.");
  }
  return user;
}

export async function createManagerAction(formData: FormData) {
  await verifyAdmin();

  const name = (formData.get("name") as string)?.trim();
  const email = (formData.get("email") as string)?.toLowerCase().trim();
  const password = formData.get("password") as string;
  
  const rawCountry = formData.get("assignedCountry") as string;
  const rawCountries = formData.getAll("assignedCountries") as string[];
  let assignedCountry = "";
  if (rawCountries && rawCountries.length > 0) {
    assignedCountry = rawCountries.map((c) => c.trim()).filter(Boolean).join(", ");
  } else if (rawCountry) {
    assignedCountry = rawCountry.trim();
  }

  if (!name || !email || !password || !assignedCountry) {
    throw new Error("All fields including at least one assigned country are required.");
  }

  const existing = await prisma.user.findUnique({
    where: { email },
  });

  if (existing) {
    throw new Error("A user with this email address already exists.");
  }

  const passwordHash = await hashPassword(password);

  await prisma.user.create({
    data: {
      name,
      email,
      passwordHash,
      role: "MANAGER",
      assignedCountry,
    },
  });

  revalidatePath("/admin/managers");
  revalidatePath("/admin/dashboard");
}

export async function deleteManagerAction(managerId: string) {
  await verifyAdmin();

  await prisma.user.delete({
    where: { id: managerId },
  });

  revalidatePath("/admin/managers");
  revalidatePath("/admin/dashboard");
}

export async function updateCreatorStatusAction(
  creatorProfileId: string,
  status: string,
  statusMessage?: string
) {
  await verifyAdmin();

  const updateData: any = { status };
  if (statusMessage !== undefined) {
    updateData.statusMessage = statusMessage.trim() || null;
  }

  if (status !== "PENDING_REVIEW") {
    const existing = await prisma.creatorProfile.findUnique({
      where: { id: creatorProfileId },
      select: { viewedAt: true },
    });
    if (!existing?.viewedAt) {
      updateData.viewedAt = new Date();
    }
  }

  await prisma.creatorProfile.update({
    where: { id: creatorProfileId },
    data: updateData,
  });

  revalidatePath("/admin/dashboard");
  revalidatePath(`/admin/creators/${creatorProfileId}`);
  revalidatePath("/manager/dashboard");
  revalidatePath("/creator/dashboard");
}

export async function markCreatorAsViewedAction(creatorProfileId: string) {
  await verifyAdmin();

  const profile = await prisma.creatorProfile.findUnique({
    where: { id: creatorProfileId },
  });

  if (!profile) return;

  if (profile.status === "PENDING_REVIEW") {
    await prisma.creatorProfile.update({
      where: { id: creatorProfileId },
      data: {
        status: "VIEWED",
        viewedAt: new Date(),
        statusMessage:
          profile.statusMessage ||
          "Talent scouts have opened and are actively reviewing your portfolio.",
      },
    });
    revalidatePath("/admin/dashboard");
    revalidatePath(`/admin/creators/${creatorProfileId}`);
    revalidatePath("/creator/dashboard");
  } else if (!profile.viewedAt) {
    await prisma.creatorProfile.update({
      where: { id: creatorProfileId },
      data: { viewedAt: new Date() },
    });
    revalidatePath(`/admin/creators/${creatorProfileId}`);
  }
}

export async function saveAdminReviewAction(
  creatorProfileId: string,
  rating: number | null,
  notes: string
) {
  await verifyAdmin();

  await prisma.creatorProfile.update({
    where: { id: creatorProfileId },
    data: {
      adminRating: rating,
      adminNotes: notes.trim() || null,
    },
  });

  revalidatePath(`/admin/creators/${creatorProfileId}`);
}

export async function createProjectAction(formData: FormData) {
  await verifyAdmin();

  const title = (formData.get("title") as string)?.trim();
  const brand = (formData.get("brand") as string)?.trim();
  const description = (formData.get("description") as string)?.trim();
  const deliverables = (formData.get("deliverables") as string)?.trim();
  const country = (formData.get("country") as string)?.trim() || "Global";
  const targetPlatforms = (formData.get("targetPlatforms") as string)?.trim() || "TikTok, Instagram Reels, YouTube Shorts";
  const budget = (formData.get("budget") as string)?.trim() || null;
  const deadline = (formData.get("deadline") as string)?.trim() || null;
  const niches = (formData.get("niches") as string)?.trim() || "All Niches";

  if (!title || !brand || !deliverables) {
    throw new Error("Title, Brand, and Deliverables are required.");
  }

  await prisma.project.create({
    data: {
      title,
      brand,
      description: description || "No detailed description provided.",
      deliverables,
      country,
      targetPlatforms,
      budget,
      deadline,
      niches,
      status: "ACTIVE",
    },
  });

  revalidatePath("/admin/projects");
  revalidatePath("/manager/projects");
  revalidatePath("/creator/dashboard");
}

export async function assignCreatorToProjectAction(
  projectId: string,
  creatorProfileId: string,
  payout?: string,
  notes?: string
) {
  const admin = await verifyAdmin();

  const [creator, project] = await Promise.all([
    prisma.creatorProfile.findUnique({ where: { id: creatorProfileId } }),
    prisma.project.findUnique({ where: { id: projectId } }),
  ]);

  if (!creator || !project) {
    throw new Error("Creator or Project not found.");
  }

  if (project.country !== "Global" && project.country.toLowerCase() !== creator.country.toLowerCase()) {
    throw new Error(`Country Mismatch: Creator is located in ${creator.country} but this project is specifically designated for ${project.country}.`);
  }

  await prisma.projectAssignment.upsert({
    where: {
      projectId_creatorProfileId: {
        projectId,
        creatorProfileId,
      },
    },
    update: {
      payout: payout || null,
      notes: notes || null,
      status: "ASSIGNED",
      assignedByUserId: admin.id,
    },
    create: {
      projectId,
      creatorProfileId,
      payout: payout || null,
      notes: notes || null,
      status: "ASSIGNED",
      assignedByUserId: admin.id,
    },
  });

  await prisma.creatorProfile.update({
    where: { id: creatorProfileId },
    data: {
      status: "HIRED",
      statusMessage: "You have been matched and assigned to a new campaign!",
    },
  });

  revalidatePath("/admin/dashboard");
  revalidatePath(`/admin/creators/${creatorProfileId}`);
  revalidatePath("/admin/projects");
  revalidatePath("/manager/dashboard");
  revalidatePath("/creator/dashboard");
}

export async function removeCreatorAssignmentAction(assignmentId: string) {
  await verifyAdmin();

  await prisma.projectAssignment.delete({
    where: { id: assignmentId },
  });

  revalidatePath("/admin/projects");
  revalidatePath("/admin/dashboard");
  revalidatePath("/manager/projects");
  revalidatePath("/creator/dashboard");
}

export async function updateProjectAction(projectId: string, formData: FormData) {
  await verifyAdmin();

  const title = (formData.get("title") as string)?.trim();
  const brand = (formData.get("brand") as string)?.trim();
  const description = (formData.get("description") as string)?.trim();
  const deliverables = (formData.get("deliverables") as string)?.trim();
  const country = (formData.get("country") as string)?.trim() || "Global";
  const targetPlatforms = (formData.get("targetPlatforms") as string)?.trim() || "TikTok, Instagram Reels, YouTube Shorts";
  const budget = (formData.get("budget") as string)?.trim() || null;
  const deadline = (formData.get("deadline") as string)?.trim() || null;
  const niches = (formData.get("niches") as string)?.trim() || "All Niches";
  const status = (formData.get("status") as string)?.trim() || "ACTIVE";

  if (!title || !brand || !deliverables) {
    throw new Error("Title, Brand, and Deliverables are required.");
  }

  await prisma.project.update({
    where: { id: projectId },
    data: {
      title,
      brand,
      description: description || "No detailed description provided.",
      deliverables,
      country,
      targetPlatforms,
      budget,
      deadline,
      niches,
      status,
    },
  });

  revalidatePath("/admin/projects");
  revalidatePath("/manager/projects");
  revalidatePath("/creator/dashboard");
}

export async function deleteProjectAction(projectId: string) {
  await verifyAdmin();

  await prisma.project.delete({
    where: { id: projectId },
  });

  revalidatePath("/admin/projects");
  revalidatePath("/manager/projects");
  revalidatePath("/creator/dashboard");
}

export async function createCountryAction(formData: FormData) {
  await verifyAdmin();

  const name = (formData.get("name") as string)?.trim();
  const code = (formData.get("code") as string)?.trim().toUpperCase() || null;
  const currency = (formData.get("currency") as string)?.trim().toUpperCase() || null;
  const defaultRate = (formData.get("defaultRate") as string)?.trim() || null;

  if (!name) {
    throw new Error("Country name is required.");
  }

  const existing = await prisma.country.findUnique({
    where: { name },
  });

  if (existing) {
    throw new Error(`Country "${name}" already exists.`);
  }

  await prisma.country.create({
    data: {
      name,
      code,
      currency,
      defaultRate,
      isActive: true,
    },
  });

  revalidatePath("/admin/countries");
  revalidatePath("/admin/projects");
  revalidatePath("/admin/managers");
  revalidatePath("/creator/profile/edit");
}

export async function deleteCountryAction(countryId: string) {
  await verifyAdmin();

  await prisma.country.delete({
    where: { id: countryId },
  });

  revalidatePath("/admin/countries");
  revalidatePath("/admin/projects");
  revalidatePath("/admin/managers");
  revalidatePath("/creator/profile/edit");
}

export async function toggleCountryActiveAction(countryId: string, isActive: boolean) {
  await verifyAdmin();

  await prisma.country.update({
    where: { id: countryId },
    data: { isActive },
  });

  revalidatePath("/admin/countries");
}

export async function updateOnboardingConfigAction(formData: FormData) {
  await verifyAdmin();

  const welcomeTitle = (formData.get("welcomeTitle") as string)?.trim() || "Welcome to the Amora Creator Team!";
  const welcomeMessage = (formData.get("welcomeMessage") as string)?.trim() || "";
  
  const requireContract = formData.get("requireContract") === "true" || formData.get("requireContract") === "on";
  const contractTitle = (formData.get("contractTitle") as string)?.trim() || "Creator Service Agreement";
  const contractTerms = (formData.get("contractTerms") as string)?.trim() || "";
  const contractLink = (formData.get("contractLink") as string)?.trim() || null;

  const requireDiscord = formData.get("requireDiscord") === "true" || formData.get("requireDiscord") === "on";
  const discordInviteUrl = (formData.get("discordInviteUrl") as string)?.trim() || "https://discord.gg/amora-creators";
  const discordDescription = (formData.get("discordDescription") as string)?.trim() || "";

  const requirePaymentInfo = formData.get("requirePaymentInfo") === "true" || formData.get("requirePaymentInfo") === "on";
  const paymentInstructions = (formData.get("paymentInstructions") as string)?.trim() || "";

  const requireDriveAccess = formData.get("requireDriveAccess") === "true" || formData.get("requireDriveAccess") === "on";
  const driveUrl = (formData.get("driveUrl") as string)?.trim() || null;
  const driveInstructions = (formData.get("driveInstructions") as string)?.trim() || "";

  await prisma.onboardingConfig.upsert({
    where: { id: "default" },
    update: {
      welcomeTitle,
      welcomeMessage,
      requireContract,
      contractTitle,
      contractTerms,
      contractLink,
      requireDiscord,
      discordInviteUrl,
      discordDescription,
      requirePaymentInfo,
      paymentInstructions,
      requireDriveAccess,
      driveUrl,
      driveInstructions,
    },
    create: {
      id: "default",
      country: "Global",
      welcomeTitle,
      welcomeMessage,
      requireContract,
      contractTitle,
      contractTerms,
      contractLink,
      requireDiscord,
      discordInviteUrl,
      discordDescription,
      requirePaymentInfo,
      paymentInstructions,
      requireDriveAccess,
      driveUrl,
      driveInstructions,
    },
  });

  revalidatePath("/admin/onboarding");
  revalidatePath("/creator/dashboard");
}

