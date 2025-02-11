"use server";

import "./styles.css";

export default async function Home() {
  return (
    <main
      style={{
        fontFamily: "Arial, sans-serif",
        margin: "0",
        padding: "0",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "space-between",
        backgroundColor: "#f5f5f5",
      }}
    >
      <header
        style={{
          width: "100%",
          padding: "20px",
          backgroundColor: "#007bff",
          color: "white",
          textAlign: "center",
          fontSize: "1.5em",
          fontWeight: "bold",
        }}
      >
        <div>
          You have reached&nbsp;{" "}
          <code
            style={{
              backgroundColor: "#333",
              color: "#fff",
              padding: "5px",
              borderRadius: "5px",
            }}
          >
            twlg.net
          </code>
        </div>
      </header>

      <div
        style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <a
          href="./control_panel"
          style={{
            padding: "15px 30px",
            backgroundColor: "#28a745",
            color: "white",
            borderRadius: "8px",
            textDecoration: "none",
            fontSize: "1.2em",
            fontWeight: "bold",
            boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
            transition: "transform 0.2s ease, box-shadow 0.2s ease",
          }}
        >
          Control Panel
        </a>
      </div>

      <footer
        style={{
          width: "100%",
          padding: "10px",
          backgroundColor: "#333",
          color: "#ccc",
          textAlign: "center",
        }}
      >
        <p style={{margin: 0}}>Footer content here</p>
      </footer>
    </main>
  );
}
