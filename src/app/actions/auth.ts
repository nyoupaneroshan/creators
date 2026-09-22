"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { hashPassword, verifyPassword, setSessionCookie, clearSessionCookie } from "@/lib/auth";
import { Role } from "@/lib/types";

export interface ActionResponse {
  error?: string;
  success?: boolean;
}

export async function loginAction(formData: FormData): Promise<ActionResponse> {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!email || !password) {
    return { error: "Please enter your email and password." };
  }

  const user = await prisma.user.findUnique({
    where: { email: email.toLowerCase().trim() },
    include: { creatorProfile: true },
  });

  if (!user) {
    return { error: "No account found with this email." };
  }

  const isValid = await verifyPassword(password, user.passwordHash);
  if (!isValid) {
    return { error: "Incorrect password. Please try again." };
  }

  await setSessionCookie({
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role as Role,
    assignedCountry: user.assignedCountry || null,
    creatorProfileId: user.creatorProfile?.id || null,
  });

  if (user.role === "ADMIN") {
    redirect("/admin/dashboard");
  } else if (user.role === "MANAGER") {
    redirect("/manager/dashboard");
  } else {
    redirect("/creator/dashboard");
  }
}

export async function quickDemoLoginAction(email: string) {
  const user = await prisma.user.findUnique({
    where: { email: email.toLowerCase().trim() },
    include: { creatorProfile: true },
  });

  if (!user) {
    throw new Error("Demo user not found");
  }

  await setSessionCookie({
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role as Role,
    assignedCountry: user.assignedCountry || null,
    creatorProfileId: user.creatorProfile?.id || null,
  });

  if (user.role === "ADMIN") {
    redirect("/admin/dashboard");
  } else if (user.role === "MANAGER") {
    redirect("/manager/dashboard");
  } else {
    redirect("/creator/dashboard");
  }
}

export async function logoutAction() {
  await clearSessionCookie();
  redirect("/login");
}

export interface CreatorRegistrationData {
  name: string;
  email: string;
  password: string;
  country: string;
  platforms: string[];
  phone?: string;
  location?: string;
  bio?: string;
  niches: string[];
  rateExpectation?: string;
  instagramHandle?: string;
  instagramFollowers?: string;
  tiktokHandle?: string;
  tiktokFollowers?: string;
  youtubeHandle?: string;
  youtubeSubscribers?: string;
  portfolioUrl?: string;
  sampleVideos: Array<{
    title: string;
    url: string;
    description?: string;
  }>;
}

export async function registerCreatorAction(data: CreatorRegistrationData): Promise<ActionResponse> {
  try {
    const existing = await prisma.user.findUnique({
      where: { email: data.email.toLowerCase().trim() },
    });

    if (existing) {
      return { error: "An account with this email address already exists. Please sign in instead." };
    }

    if (!data.password || data.password.length < 6) {
      return { error: "Password must be at least 6 characters long." };
    }

    const passwordHash = await hashPassword(data.password);

    const formatInstagram = data.instagramHandle
      ? data.instagramHandle.startsWith("http")
        ? data.instagramHandle
        : `https://instagram.com/${data.instagramHandle.replace("@", "")}`
      : undefined;

    const formatTiktok = data.tiktokHandle
      ? data.tiktokHandle.startsWith("http")
        ? data.tiktokHandle
        : `https://tiktok.com/@${data.tiktokHandle.replace("@", "")}`
      : undefined;

    const formatYoutube = data.youtubeHandle
      ? data.youtubeHandle.startsWith("http")
        ? data.youtubeHandle
        : `https://youtube.com/@${data.youtubeHandle.replace("@", "")}`
      : undefined;

    const processedVideos = (data.sampleVideos || [])
      .filter((v) => v.url && v.url.trim().length > 0)
      .map((v) => {
        let platform = "DIRECT";
        const urlLower = v.url.toLowerCase();
        if (urlLower.includes("youtube.com") || urlLower.includes("youtu.be")) platform = "YOUTUBE";
        else if (urlLower.includes("tiktok.com")) platform = "TIKTOK";
        else if (urlLower.includes("vimeo.com")) platform = "VIMEO";
        else if (urlLower.includes("loom.com")) platform = "LOOM";

        return {
          title: v.title.trim() || "Sample Content Reel",
          url: v.url.trim(),
          description: v.description?.trim() || null,
          platform,
        };
      });

    const selectedCountry = data.country || "Nepal";
    const selectedPlatforms = data.platforms && data.platforms.length > 0
      ? data.platforms.join(", ")
      : "TikTok, Instagram Reels";

    // Create user and creator profile in transaction
    const newUser = await prisma.user.create({
      data: {
        name: data.name.trim(),
        email: data.email.toLowerCase().trim(),
        passwordHash,
        role: "CREATOR",
        creatorProfile: {
          create: {
            country: selectedCountry,
            location: data.location?.trim() || null,
            phone: data.phone?.trim() || null,
            bio: data.bio?.trim() || null,
            niches: data.niches.length > 0 ? data.niches.join(", ") : "UGC, Lifestyle",
            platforms: selectedPlatforms,
            rateExpectation: data.rateExpectation?.trim() || (selectedCountry === "Nepal" || selectedCountry === "India" ? `$75 / week (${selectedCountry})` : "$100 / week (Amora Global)"),
            instagramHandle: data.instagramHandle?.replace("@", "").trim() || null,
            instagramUrl: formatInstagram,
            instagramFollowers: data.instagramFollowers?.trim() || null,
            tiktokHandle: data.tiktokHandle?.replace("@", "").trim() || null,
            tiktokUrl: formatTiktok,
            tiktokFollowers: data.tiktokFollowers?.trim() || null,
            youtubeHandle: data.youtubeHandle?.replace("@", "").trim() || null,
            youtubeUrl: formatYoutube,
            youtubeSubscribers: data.youtubeSubscribers?.trim() || null,
            portfolioUrl: data.portfolioUrl?.trim() || null,
            status: "PENDING_REVIEW",
            statusMessage: `Application received! Your ${selectedCountry} talent manager is queued to review your profile and videos.`,
            sampleVideos: {
              create: processedVideos,
            },
          },
        },
      },
      include: {
        creatorProfile: true,
      },
    });

    await setSessionCookie({
      id: newUser.id,
      email: newUser.email,
      name: newUser.name,
      role: "CREATOR",
      assignedCountry: null,
      creatorProfileId: newUser.creatorProfile?.id,
    });

    revalidatePath("/admin/dashboard");
    revalidatePath("/manager/dashboard");
    return { success: true };
  } catch (err: any) {
    console.error("Registration error:", err);
    return { error: err.message || "Something went wrong creating your account." };
  }
}

export async function getActiveCountriesAction(): Promise<
  Array<{ name: string; defaultRate: string | null }>
> {
  try {
    const list = await prisma.country.findMany({
      where: { isActive: true },
      orderBy: { name: "asc" },
      select: { name: true, defaultRate: true },
    });
    return list;
  } catch {
    return [];
  }
}

