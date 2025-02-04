import {NextRequest, NextResponse} from "next/server";
import {auth} from "@/lib/auth";

export async function POST(req: NextRequest) {
  console.log("req.method", req.method);
  if (req.method !== "POST") {
    console.log("Method Not Allowed", req.method);
    return NextResponse.json({message: "Method Not Allowed"}, {status: 405});
  }

  try {
    const session = await auth();

    // Check if the user is authenticated and has admin role
    if (!session || session.user.role !== "admin") {
      return NextResponse.json(
        {message: "Forbidden: Admin access required"},
        {status: 403}
      );
    }

    const {userIdOrEmail, newRole} = await req.json();

    if (!userIdOrEmail || !newRole) {
      return NextResponse.json(
        {message: "Missing required fields"},
        {status: 400}
      );
    }

    if (newRole === "admin") {
      return NextResponse.json(
        {message: "you may not create admins"},
        {status: 400}
      );
    }

    const db = (await clientPromise).db();
    const usersCollection = db.collection("users");

    // Update user role
    const result = await usersCollection.updateOne(
      {$or: [{_id: userIdOrEmail}, {email: userIdOrEmail}]},
      {$set: {role: newRole}}
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({message: "User not found"}, {status: 404});
    }

    if (result.modifiedCount === 0) {
      return NextResponse.json({message: "Role not changed"}, {status: 400});
    }

    return NextResponse.json(
      {message: "User role updated successfully"},
      {status: 200}
    );
  } catch (error) {
    console.error("Error updating user role:", error);
    return NextResponse.json({message: "Internal Server Error"}, {status: 500});
  }
}
