import connectDB from "@/config/db";
import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import Address from "@/models/Address";

export async function GET(request) {
  try {
    const { userId } = getAuth(request);

    await connectDB();

    const addresses = await Address.find({ userId });

    return NextResponse.json({ addresses, success: true });
  } catch (error) {
    return NextResponse.json({ message: error.message, success: false });
  }
}
