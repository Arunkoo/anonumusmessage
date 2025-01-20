import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/options";
import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User";

import mongoose from "mongoose";

export async function GET(request: Request) {
  await dbConnect();

  const session = await getServerSession(authOptions);
  // console.log("Get Message session", session);

  if (!session || !session.user) {
    return Response.json(
      {
        success: false,
        message: "Not authenticated",
      },
      { status: 401 }
    );
  }
  const user = session.user._id;

  const userId = new mongoose.Types.ObjectId(user);
  console.log("aggregated Id", userId);
  try {
    // aggregation Pipeline
    const user = await UserModel.aggregate([
      { $match: { _id: userId } },
      { $unwind: "$messages" },
      { $sort: { "messages.createdAt": -1 } },
      { $group: { _id: "$_id", messages: { $push: "$messages" } } },
    ]);

    if (!user || user.length === 0) {
      return Response.json(
        {
          success: false,
          message: "No Messages Found For This User",
        },
        { status: 401 }
      );
    }
    return Response.json(
      {
        success: true,
        message: user[0].messages,
      },
      { status: 200 }
    );
  } catch (error) {
    console.log("unexpected error", error);
    return Response.json(
      {
        success: false,
        message: "Failed to reterive a messages",
      },
      { status: 500 }
    );
  }
}
