"use server";

import "./styles.css";

export default async function Home() {
  return (
    <main>
      <header>
        <div>
          you have reached&nbsp; <code>twlg.net</code>
        </div>
      </header>

      <div>
        <a href="./control_panel">control panel</a>
      </div>

      <footer>
        <p>Footer content here</p>
      </footer>
    </main>
  );
}
