"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";
import { isManagerForCountry } from "@/lib/types";

async function verifyManager() {
  const user = await getSessionUser();
  if (!user || (user.role !== "MANAGER" && user.role !== "ADMIN")) {
    throw new Error("Unauthorized: Manager access required.");
  }
  return user;
}

export async function updateCreatorStatusByManagerAction(
  creatorProfileId: string,
  status: string,
  statusMessage?: string
) {
  const manager = await verifyManager();

  const profile = await prisma.creatorProfile.findUnique({
    where: { id: creatorProfileId },
  });

  if (!profile) {
    throw new Error("Creator profile not found.");
  }

  // Enforce country scoping for managers (admins bypass)
  if (manager.role === "MANAGER" && !isManagerForCountry(manager.assignedCountry, profile.country)) {
    throw new Error(`Unauthorized: You are only permitted to manage creators in ${manager.assignedCountry}.`);
  }

  const updateData: any = { status };
  if (statusMessage !== undefined) {
    updateData.statusMessage = statusMessage.trim() || null;
  }

  if (status !== "PENDING_REVIEW" && !profile.viewedAt) {
    updateData.viewedAt = new Date();
  }

  await prisma.creatorProfile.update({
    where: { id: creatorProfileId },
    data: updateData,
  });

  revalidatePath("/manager/dashboard");
  revalidatePath(`/manager/creators/${creatorProfileId}`);
  revalidatePath("/creator/dashboard");
  revalidatePath("/admin/dashboard");
}

export async function markCreatorAsViewedByManagerAction(creatorProfileId: string) {
  const manager = await verifyManager();

  const profile = await prisma.creatorProfile.findUnique({
    where: { id: creatorProfileId },
  });

  if (!profile) return;

  if (manager.role === "MANAGER" && !isManagerForCountry(manager.assignedCountry, profile.country)) {
    return;
  }

  if (profile.status === "PENDING_REVIEW") {
    await prisma.creatorProfile.update({
      where: { id: creatorProfileId },
      data: {
        status: "VIEWED",
        viewedAt: new Date(),
        statusMessage:
          profile.statusMessage ||
          `Your ${profile.country} talent manager has opened and is actively reviewing your portfolio.`,
      },
    });
    revalidatePath("/manager/dashboard");
    revalidatePath(`/manager/creators/${creatorProfileId}`);
    revalidatePath("/creator/dashboard");
  } else if (!profile.viewedAt) {
    await prisma.creatorProfile.update({
      where: { id: creatorProfileId },
      data: { viewedAt: new Date() },
    });
    revalidatePath(`/manager/creators/${creatorProfileId}`);
  }
}

export async function saveManagerReviewAction(
  creatorProfileId: string,
  rating: number | null,
  notes: string
) {
  const manager = await verifyManager();

  const profile = await prisma.creatorProfile.findUnique({
    where: { id: creatorProfileId },
  });

  if (!profile) throw new Error("Creator not found");

  if (manager.role === "MANAGER" && !isManagerForCountry(manager.assignedCountry, profile.country)) {
    throw new Error(`Unauthorized: You are only permitted to manage creators in ${manager.assignedCountry}.`);
  }

  await prisma.creatorProfile.update({
    where: { id: creatorProfileId },
    data: {
      adminRating: rating,
      adminNotes: notes.trim() || null,
    },
  });

  revalidatePath(`/manager/creators/${creatorProfileId}`);
  revalidatePath(`/admin/creators/${creatorProfileId}`);
}

export async function assignCreatorToProjectByManagerAction(
  projectId: string,
  creatorProfileId: string,
  payout?: string,
  notes?: string
) {
  const manager = await verifyManager();

  const [creator, project] = await Promise.all([
    prisma.creatorProfile.findUnique({ where: { id: creatorProfileId } }),
    prisma.project.findUnique({ where: { id: projectId } }),
  ]);

  if (!creator || !project) {
    throw new Error("Creator or Project not found.");
  }

  // Check that manager has jurisdiction over the creator
  if (manager.role === "MANAGER" && !isManagerForCountry(manager.assignedCountry, creator.country)) {
    throw new Error(`Unauthorized: You can only assign creators located in ${manager.assignedCountry}.`);
  }

  // Check project matches creator's country or is Global
  if (project.country !== "Global" && project.country.toLowerCase() !== creator.country.toLowerCase()) {
    throw new Error(`Country Mismatch: Creator is in ${creator.country} but this campaign is designated for ${project.country}.`);
  }

  await prisma.projectAssignment.upsert({
    where: {
      projectId_creatorProfileId: {
        projectId,
        creatorProfileId,
      },
    },
    update: {
      payout: payout || project.budget || null,
      notes: notes || null,
      status: "ASSIGNED",
      assignedByUserId: manager.id,
    },
    create: {
      projectId,
      creatorProfileId,
      payout: payout || project.budget || null,
      notes: notes || null,
      status: "ASSIGNED",
      assignedByUserId: manager.id,
    },
  });

  await prisma.creatorProfile.update({
    where: { id: creatorProfileId },
    data: {
      status: "HIRED",
      statusMessage: `You have been hired for ${project.title}! Your weekly deliverables are confirmed.`,
    },
  });

  revalidatePath("/manager/dashboard");
  revalidatePath(`/manager/creators/${creatorProfileId}`);
  revalidatePath("/manager/projects");
  revalidatePath("/creator/dashboard");
  revalidatePath("/admin/dashboard");
}

export async function removeCreatorAssignmentByManagerAction(assignmentId: string) {
  const manager = await verifyManager();

  const assignment = await prisma.projectAssignment.findUnique({
    where: { id: assignmentId },
    include: { creatorProfile: true },
  });

  if (!assignment) return;

  if (manager.role === "MANAGER" && !isManagerForCountry(manager.assignedCountry, assignment.creatorProfile.country)) {
    throw new Error("Unauthorized: Assignment outside of your assigned country.");
  }

  await prisma.projectAssignment.delete({
    where: { id: assignmentId },
  });

  revalidatePath("/manager/projects");
  revalidatePath("/manager/dashboard");
  revalidatePath("/creator/dashboard");
  revalidatePath("/admin/projects");
}
