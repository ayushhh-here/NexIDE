"use server";

import { db } from "@/lib/db";
import { currentUser } from "@/modules/auth/actions";
import { revalidatePath } from "next/cache";

export const toggleStarMarked = async (
  playgroundId: string,
  isChecked: boolean
) => {
  const user = await currentUser();
  const userId = user?.id;
  if (!userId) {
    throw new Error("User Id is Required");
  }

  try {
    if (isChecked) {
      await db.starMark.create({
        data: {
          userId: userId!,
          playgroundId,
          isMarked: isChecked,
        },
      });
    } else {
        await db.starMark.delete({
        where: {
          userId_playgroundId: {
            userId,
            playgroundId: playgroundId,

          },
        },
      });
    }

     revalidatePath("/dashboard");
    return { success: true, isMarked: isChecked };
  } catch (error) {
       console.error("Error updating star mark:", error);
    return { success: false, error: "Failed to update star" };
  }
};

export const getAllPlaygroundForUser = async () => {
  const user = await currentUser();
  if (!user?.id) return [];

  try {
    const playground = await db.playground.findMany({
      where: {
        userId: user.id,
      },
      include: {
        user: true,
        starMarks:{
            where:{
                userId:user.id
            },
            select:{
                isMarked:true
            }
        }
      },
    });

    return playground;
  } catch (error) {
    console.error(error);
    return [];
  }
};

export const createPlayground = async (data: {
  title: string;
  template: "REACT" | "NEXTJS" | "EXPRESS" | "VUE" | "HONO" | "ANGULAR";
  description?: string;
}) => {
  const user = await currentUser();
  if (!user?.id) {
    throw new Error("Unauthorized");
  }

  const { template, title, description } = data;

  try {
    const playground = await db.playground.create({
      data: {
        title: title,
        description: description,
        template: template,
        userId: user.id,
      },
    });

    return playground;
  } catch (error) {
    console.error(error);
  }
};

export const deleteProjectById = async (id: string) => {
  const user = await currentUser();
  if (!user?.id) {
    throw new Error("Unauthorized");
  }

  try {
    // Scope the delete to the current user so no one can delete a
    // playground that isn't theirs just by knowing/guessing its id.
    const result = await db.playground.deleteMany({
      where: {
        id,
        userId: user.id,
      },
    });

    if (result.count === 0) {
      throw new Error("Playground not found or you do not have access to it");
    }

    revalidatePath("/dashboard");
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const editProjectById = async (
  id: string,
  data: { title: string; description: string }
) => {
  const user = await currentUser();
  if (!user?.id) {
    throw new Error("Unauthorized");
  }

  try {
    const result = await db.playground.updateMany({
      where: {
        id,
        userId: user.id,
      },
      data,
    });

    if (result.count === 0) {
      throw new Error("Playground not found or you do not have access to it");
    }

    revalidatePath("/dashboard");
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const duplicateProjectById = async (id: string): Promise<void> => {
  const user = await currentUser();
  if (!user?.id) {
    throw new Error("Unauthorized");
  }

  try {
    // Only allow duplicating playgrounds the current user actually owns.
    const originalPlayground = await db.playground.findUnique({
      where: { id, userId: user.id },
      include: { templateFiles: true },
    });

    if (!originalPlayground) {
      throw new Error("Original playground not found or you do not have access to it");
    }

    const newPlayground = await db.playground.create({
      data: {
        title: `${originalPlayground.title} (Copy)`,
        description: originalPlayground.description,
        template: originalPlayground.template,
        userId: originalPlayground.userId,
      },
    });

    // Copy the actual file content too - previously this was skipped,
    // so "duplicate" silently created an empty project with no code.
    const originalFiles = originalPlayground.templateFiles?.[0];
    if (originalFiles) {
      await db.templateFile.create({
        data: {
          playgroundId: newPlayground.id,
          content: originalFiles.content as any,
        },
      });
    }

    revalidatePath("/dashboard");
  } catch (error) {
    console.error("Error duplicating project:", error);
    throw error;
  }
};

