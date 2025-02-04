"use client"

import "./styles.css"
import { handleGoogleSignIn } from "@/lib/googleSignInServerAction";
import { handleGitHubSignIn } from "@/lib/githubSignInServerAction";
import { handleSignOut } from "@/lib/signOutServerAction";

export function GoogleSignInButton() {
  return (
    <button
      onClick={() => handleGoogleSignIn()}
      className="google"
    >
      Sign in with Google
    </button>
  );
}

export function GithubSignInButton() {
  return (
    <button
      onClick={() => handleGitHubSignIn()}
      className="github"
    >
      Sign in with GitHub
    </button>
  );
}


export function SignOutButton() {
  return (
    <button
      onClick={() => handleSignOut()}
      className="signout"
    >
      Sign out
    </button>
  );
}