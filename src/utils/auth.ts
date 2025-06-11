"use server";

import bcryptjs from "bcryptjs";
import { prisma } from "@/lib/prisma";

export const saltAndHashPassword = async (password: string) => {
  const salt = await bcryptjs.genSalt(15);
  const hash = await bcryptjs.hash(password, salt);
  return hash;
};

export const checkUserExists = async (email: string) => {
  try {
    const user = await prisma.user.findUnique({
      where: { email: email },
      select: { onboarded: true }, 
    });
    if (!user) {
      return false;
    }
    if (user.onboarded){
      return {
        onboarding: user.onboarded,
      };
    }
    return true;
  } catch (error) {
    console.error("Error fetching user from DB:", error);
    return false;
  }
};


export const getUserFromDb = async (email: string, password: string) => {
  try {
    const user = await prisma.user.findUnique({
      where: { email: email },
    });
    if (!user) {
      return null;
    }
    const isMatch = await bcryptjs.compare(password, user.password);
    if (!isMatch) {
      return null;
    }
    const deets = {
      username: user.username,
      email: user.email,
      role: user.role,
    };
    return deets;
  } catch (error) {
    console.error("Error fetching user from DB:", error);
    return null;
  }
};
