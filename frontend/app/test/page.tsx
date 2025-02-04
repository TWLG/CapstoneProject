"use client";

import {useSession} from "next-auth/react";

export default function Profile() {
  const {data: session, status} = useSession();

  if (status === "loading") return <div>Loading...</div>;
  if (!session) return <div>You are not signed in.</div>;

  return (
    <div>
      <h1>Welcome, {session.user?.email}</h1>
    </div>
  );
}
