"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";

export async function updateCreatorProfileAction(formData: FormData) {
  const user = await getSessionUser();
  if (!user || !user.creatorProfileId) {
    throw new Error("Unauthorized");
  }

  const country = formData.get("country") as string;
  const platforms = formData.get("platforms") as string;
  const phone = formData.get("phone") as string;
  const location = formData.get("location") as string;
  const bio = formData.get("bio") as string;
  const niches = formData.get("niches") as string;
  const rateExpectation = formData.get("rateExpectation") as string;

  const instagramHandle = formData.get("instagramHandle") as string;
  const instagramFollowers = formData.get("instagramFollowers") as string;
  const tiktokHandle = formData.get("tiktokHandle") as string;
  const tiktokFollowers = formData.get("tiktokFollowers") as string;
  const youtubeHandle = formData.get("youtubeHandle") as string;
  const youtubeSubscribers = formData.get("youtubeSubscribers") as string;
  const portfolioUrl = formData.get("portfolioUrl") as string;

  const updateData: any = {
    phone: phone?.trim() || null,
    location: location?.trim() || null,
    bio: bio?.trim() || null,
    niches: niches?.trim() || "UGC, Lifestyle",
    rateExpectation: rateExpectation?.trim() || null,
    instagramHandle: instagramHandle?.replace("@", "").trim() || null,
    instagramUrl: instagramHandle ? `https://instagram.com/${instagramHandle.replace("@", "").trim()}` : null,
    instagramFollowers: instagramFollowers?.trim() || null,
    tiktokHandle: tiktokHandle?.replace("@", "").trim() || null,
    tiktokUrl: tiktokHandle ? `https://tiktok.com/@${tiktokHandle.replace("@", "").trim()}` : null,
    tiktokFollowers: tiktokFollowers?.trim() || null,
    youtubeHandle: youtubeHandle?.replace("@", "").trim() || null,
    youtubeUrl: youtubeHandle ? `https://youtube.com/@${youtubeHandle.replace("@", "").trim()}` : null,
    youtubeSubscribers: youtubeSubscribers?.trim() || null,
    portfolioUrl: portfolioUrl?.trim() || null,
  };

  if (country?.trim()) {
    updateData.country = country.trim();
  }
  if (platforms?.trim()) {
    updateData.platforms = platforms.trim();
  }

  await prisma.creatorProfile.update({
    where: { id: user.creatorProfileId },
    data: updateData,
  });

  revalidatePath("/creator/dashboard");
  revalidatePath("/creator/profile/edit");
  revalidatePath("/admin/creators/" + user.creatorProfileId);
}

export async function addSampleVideoAction(formData: FormData) {
  const user = await getSessionUser();
  if (!user || !user.creatorProfileId) {
    throw new Error("Unauthorized");
  }

  const title = (formData.get("title") as string)?.trim() || "Sample Content";
  const url = (formData.get("url") as string)?.trim();
  const description = (formData.get("description") as string)?.trim() || null;

  if (!url) {
    throw new Error("Please provide a valid video URL.");
  }

  let platform = "DIRECT";
  const urlLower = url.toLowerCase();
  if (urlLower.includes("youtube.com") || urlLower.includes("youtu.be")) platform = "YOUTUBE";
  else if (urlLower.includes("tiktok.com")) platform = "TIKTOK";
  else if (urlLower.includes("vimeo.com")) platform = "VIMEO";
  else if (urlLower.includes("loom.com")) platform = "LOOM";

  await prisma.sampleVideo.create({
    data: {
      creatorProfileId: user.creatorProfileId,
      title,
      url,
      platform,
      description,
    },
  });

  revalidatePath("/creator/dashboard");
  revalidatePath("/admin/creators/" + user.creatorProfileId);
}

export async function deleteSampleVideoAction(videoId: string) {
  const user = await getSessionUser();
  if (!user || !user.creatorProfileId) {
    throw new Error("Unauthorized");
  }

  // Ensure user owns this video
  const video = await prisma.sampleVideo.findUnique({
    where: { id: videoId },
  });

  if (video && video.creatorProfileId === user.creatorProfileId) {
    await prisma.sampleVideo.delete({
      where: { id: videoId },
    });
    revalidatePath("/creator/dashboard");
    revalidatePath("/admin/creators/" + user.creatorProfileId);
  }
}

async function checkAndUpdateOnboardingStatus(profileId: string) {
  const [profile, config] = await Promise.all([
    prisma.creatorProfile.findUnique({ where: { id: profileId } }),
    prisma.onboardingConfig.findUnique({ where: { id: "default" } }),
  ]);

  if (!profile) return;

  const requiresContract = config?.requireContract ?? true;
  const requiresDiscord = config?.requireDiscord ?? true;
  const requiresPayment = config?.requirePaymentInfo ?? true;

  const contractDone = !requiresContract || Boolean(profile.contractSignedAt);
  const discordDone = !requiresDiscord || Boolean(profile.discordJoinedAt);
  const paymentDone = !requiresPayment || Boolean(profile.payoutDetails && profile.payoutDetails.trim().length > 0);

  const isComplete = contractDone && discordDone && paymentDone;

  if (profile.onboardingComplete !== isComplete) {
    await prisma.creatorProfile.update({
      where: { id: profileId },
      data: { onboardingComplete: isComplete },
    });
  }
}

export async function signContractAction(legalName: string) {
  const user = await getSessionUser();
  if (!user || !user.creatorProfileId) {
    throw new Error("Unauthorized");
  }

  const name = legalName?.trim();
  if (!name || name.length < 2) {
    throw new Error("Please enter your full legal name to sign the agreement.");
  }

  await prisma.creatorProfile.update({
    where: { id: user.creatorProfileId },
    data: {
      contractSignedAt: new Date(),
      contractSignedName: name,
    },
  });

  await checkAndUpdateOnboardingStatus(user.creatorProfileId);

  revalidatePath("/creator/dashboard");
  revalidatePath(`/admin/creators/${user.creatorProfileId}`);
  revalidatePath(`/manager/creators/${user.creatorProfileId}`);
}

export async function confirmDiscordJoinedAction() {
  const user = await getSessionUser();
  if (!user || !user.creatorProfileId) {
    throw new Error("Unauthorized");
  }

  await prisma.creatorProfile.update({
    where: { id: user.creatorProfileId },
    data: {
      discordJoinedAt: new Date(),
    },
  });

  await checkAndUpdateOnboardingStatus(user.creatorProfileId);

  revalidatePath("/creator/dashboard");
  revalidatePath(`/admin/creators/${user.creatorProfileId}`);
  revalidatePath(`/manager/creators/${user.creatorProfileId}`);
}

export async function savePayoutDetailsAction(payoutDetails: string) {
  const user = await getSessionUser();
  if (!user || !user.creatorProfileId) {
    throw new Error("Unauthorized");
  }

  const details = payoutDetails?.trim();
  if (!details || details.length < 3) {
    throw new Error("Please provide valid payout details.");
  }

  await prisma.creatorProfile.update({
    where: { id: user.creatorProfileId },
    data: {
      payoutDetails: details,
    },
  });

  await checkAndUpdateOnboardingStatus(user.creatorProfileId);

  revalidatePath("/creator/dashboard");
  revalidatePath(`/admin/creators/${user.creatorProfileId}`);
  revalidatePath(`/manager/creators/${user.creatorProfileId}`);
}

