import {
  GoogleSignInButton,
  GithubSignInButton,
  SignOutButton,
} from "@/app/components/signInButtons/signInButtons";

import {auth} from "@/lib/auth";
import {redirect} from "next/navigation";

export default async function Signin() {
  const session = await auth();

  if (session) {
    // Redirect to the home page if the user is already signed in
    redirect("/");
  }

  return (
    <main>
      <div>
        <a href="./">To home</a>
        <h1>Sign in</h1>
        <div className="sign-in-buttons">
          <GoogleSignInButton />
          <GithubSignInButton />
        </div>
      </div>
    </main>
  );
}
