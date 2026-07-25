"use server";

import { db } from "@/lib/db";
import { TemplateFolder } from "../lib/path-to-json";
import { currentUser } from "@/modules/auth/actions";





export const getPlaygroundById = async(id:string)=>{
    const user = await currentUser();
    if (!user?.id) return null;

    try {
        // Scope by userId as well as id so a user can't load a
        // playground they don't own just by knowing/guessing its id.
        const playground = await db.playground.findUnique({
            where:{ id, userId: user.id },
            select:{
                id:true,
                title:true,
                templateFiles:{
                    select:{
                        content:true
                    }
                }
            }
        })
        return playground;
    } catch (error) {
        console.error(error)
        return null;
    }
}

export const SaveUpdatedCode = async(playgroundId:string , data:TemplateFolder)=>{
    const user = await currentUser();
  if (!user?.id) throw new Error("Unauthorized");

  try {
    // Verify the playground actually belongs to the current user before
    // writing to it - previously this only checked "are you logged in?",
    // not "is this your playground?", so any user could overwrite
    // another user's saved code if they knew the playground id.
    const owned = await db.playground.findUnique({
      where: { id: playgroundId, userId: user.id },
      select: { id: true },
    });
    if (!owned) throw new Error("Playground not found or you do not have access to it");

    const updatedPlayground = await db.templateFile.upsert({
        where:{
            playgroundId
        },
        update:{
            content:JSON.stringify(data)
        },
        create:{
            playgroundId,
            content:JSON.stringify(data)
        }
    })

    return updatedPlayground;
  } catch (error) {
    console.error("SaveUpdatedCode error:", error);
    // Re-throw (rather than returning null) so callers - e.g. usePlayground's
    // saveTemplateData - know the save actually failed instead of showing a
    // "Changes saved successfully" toast for a save that silently no-op'd.
    throw error;
  }
}
