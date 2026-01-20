import connectDB from "@/config/db";
import authSeller from "@/lib/authSeller";
import Address from "@/models/Address";
import Order from "@/models/Order";
import Product from "@/models/Product";
import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";



export async function GET(req) {
  try {
    const { userId } = getAuth(req);

    const isSeller = await authSeller(userId)

    if(!isSeller) {
      return NextResponse.json({ success: false, message: 'Unauthorized access'});
    }

    await connectDB();

    const sellerProducts = await Product.find({ userId });
    const productIds = sellerProducts.map(p => p._id.toString());

    const orders = await Order.find({"items.product": { $in: productIds }}).populate('address items.product');

    return NextResponse.json({ success: true, orders})
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message});
  }
}