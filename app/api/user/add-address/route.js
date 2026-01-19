import connectDB from "@/config/db";
import Address from "@/models/Address";
import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";


export async function POST(request) {
  try {
    const { userId } = getAuth(request)
    const { address } = await request.json()

    await connectDB()
    const newAddess = await Address.create({...address, userId})

    return NextResponse.json({ message: "Address added successfully", success: true, newAddess })
    
  } catch (error) {
    return NextResponse.json({ message: error.message, success: false })
  
  }
}