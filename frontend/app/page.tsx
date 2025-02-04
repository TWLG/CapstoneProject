"use server";

import {auth} from "@/lib/auth";
import "./styles.css";
import {SignOutButton} from "./components/signInButtons/signInButtons";

export default async function Home() {
  const session = await auth();

  return (
    <main>
      <header>
        <div>
          you have reached&nbsp; <code>twlg.net</code>
        </div>

        <ul>
          <li>{session?.user?.roles}</li>
          <li>{session?.user?.email}</li>
          <li>{JSON.stringify(session, null, 2)}</li>
        </ul>
      </header>

      <div>
        {session ? (
          <div>
            {session.user.role === "admin" && <a href="./admin">To admin</a>}
            <div>
              <a href="./control_panel">control panel</a>
              <SignOutButton />
            </div>
          </div>
        ) : (
          <div>
            <a href="./signin">Sign in</a>
          </div>
        )}
      </div>

      <footer>
        <p>Footer content here</p>
      </footer>
    </main>
  );
}
