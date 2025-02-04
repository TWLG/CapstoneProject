"use server";

import { signIn } from "./auth";

export const handleGitHubSignIn = async () => {
    try {
        await signIn("github", {redirectTo: "/"});
    } catch (error) {
        throw (error);
    }
};