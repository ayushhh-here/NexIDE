"use server";

import { db } from "@/lib/db";
import { currentUser } from "@/modules/auth/actions";

/**
 * Load the current user's chat history (most recent messages), oldest first
 * so it renders top-to-bottom in the same order it was sent.
 */
export const getChatHistory = async (limit = 50) => {
  const user = await currentUser();
  if (!user?.id) return [];

  try {
    const history = await db.chatMessage.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      take: limit,
    });

    return history.reverse();
  } catch (error) {
    console.error("Error loading chat history:", error);
    return [];
  }
};

/**
 * Persist a single chat message (user or assistant) for the current user.
 */
export const saveChatMessage = async (
  role: "user" | "assistant",
  content: string
) => {
  const user = await currentUser();
  if (!user?.id) return null;

  try {
    return await db.chatMessage.create({
      data: {
        userId: user.id,
        role,
        content,
      },
    });
  } catch (error) {
    console.error("Error saving chat message:", error);
    return null;
  }
};

/**
 * Clear the current user's chat history.
 */
export const clearChatHistory = async () => {
  const user = await currentUser();
  if (!user?.id) return { success: false };

  try {
    await db.chatMessage.deleteMany({ where: { userId: user.id } });
    return { success: true };
  } catch (error) {
    console.error("Error clearing chat history:", error);
    return { success: false };
  }
};
