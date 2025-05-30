import type {Metadata} from "next";

export const metadata: Metadata = {
  title: "TWLG.NET",
  description: "Generated by create next app",
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
