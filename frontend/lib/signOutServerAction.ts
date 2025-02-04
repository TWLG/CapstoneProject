"use server";
import {signOut} from "./auth";

export const handleSignOut = async () => {
  try {
    await signOut({redirectTo: "/"});
  } catch (error) {
    throw error;
  }
};
