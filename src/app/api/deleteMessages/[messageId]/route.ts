import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/options";
import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User";
import { NextRequest, NextResponse } from "next/server";

export async function DELETE(request: NextRequest) {
  // Accessing messageId from the dynamic URL part
  const messageId = request.nextUrl.pathname.split("/").pop(); // Extracting messageId from the URL path

  if (!messageId) {
    return NextResponse.json(
      { success: false, message: "Message ID is missing" },
      { status: 400 }
    );
  }

  await dbConnect();

  const session = await getServerSession(authOptions);
  const user = session?.user;

  if (!session || !user) {
    return NextResponse.json(
      { success: false, message: "Not authenticated" },
      { status: 401 }
    );
  }

  try {
    const updateResult = await UserModel.updateOne(
      { _id: user._id },
      { $pull: { messages: { _id: messageId } } }
    );

    if (updateResult.modifiedCount === 0) {
      return NextResponse.json(
        { message: "Message not found or already deleted", success: false },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: "Message deleted", success: true },
      { status: 200 }
    );
  } catch (error) {
    console.log("Unexpected error", error);
    return NextResponse.json(
      { success: false, message: "Failed to delete a message" },
      { status: 500 }
    );
  }
}
