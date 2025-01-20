import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User";
import bcrypt from "bcryptjs";
import { sendVerificationEmail } from "@/helpers/sendVerificationEmail";

export async function POST(request: Request) {
  // connecting to db,WHY? becoz next js is EDGE running framework which run the server again and again..
  await dbConnect();
  try {
    const { username, email, Password } = await request.json();
    const existingUserVerifiedByUsername = await UserModel.findOne({
      username,
      isVerified: true,
    });
    if (existingUserVerifiedByUsername) {
      return Response.json(
        {
          success: false,
          message: "Username is already taken",
        },
        { status: 400 }
      );
    }
    const existingUserByEmail = await UserModel.findOne({ email });
    const VerifyCode = Math.floor(100000 + Math.random() * 900000).toString();
    // the email is presented in database ...
    if (existingUserByEmail) {
      // this means that email is present in database and is verified..
      if (existingUserByEmail.isVerified) {
        return Response.json(
          {
            success: false,
            message: "User already exist with this email",
          },
          { status: 400 }
        );
      }
      //   this means that email is present but not verified,So we have to verify it..
      else {
        const hashedPassword = await bcrypt.hash(Password, 10);
        existingUserByEmail.password = hashedPassword;
        existingUserByEmail.verifyCode = VerifyCode;
        existingUserByEmail.verifyCodeExpires = new Date(Date.now() + 3600000);
        await existingUserByEmail.save();
      }
    }
    //this means user doesn't exist with this email so we have to create new user in database...
    else {
      const hashedPassword = await bcrypt.hash(Password, 10);
      const expiryDate = new Date();
      expiryDate.setHours(expiryDate.getHours() + 1);
      const newUser = new UserModel({
        username,
        email,
        password: hashedPassword,
        verifyCode: VerifyCode,
        verifyCodeExpires: expiryDate,
        isVerified: false,
        isAcceptingMesssage: true,
        messages: [],
      });

      await newUser.save();
    }

    //send Verification email
    const emailResponse = await sendVerificationEmail(
      email,
      username,
      VerifyCode
    );
    // this means that email is not sended ..
    if (!emailResponse.success) {
      return Response.json(
        {
          success: false,
          message: emailResponse.message,
        },
        { status: 500 }
      );
    }
    // .....
    return Response.json(
      {
        success: true,
        message: "User registered successfully, Please verify your email",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error registring user", error);
    return Response.json(
      {
        success: false,
        message: "Error registering user",
      },
      { status: 500 }
    );
  }
}
