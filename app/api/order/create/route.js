import { inngest } from "@/config/inngest";
import Product from "@/models/Product";
import User from "@/models/User";
import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import connectDB from "@/config/db";


export async function POST(req) {
  try {
    const {userId} = getAuth(req)
    const { address, items } = await req.json();

    if(!address || items.length === 0) {
      return NextResponse.json({ success: false, message: 'Invalid data'});
    }

    await connectDB();

    let amount = 0;
    for (const item of items) {
      const product = await Product.findById(item.product);
      if (product) {
        amount += product.offerPrice * item.quantity;
      }
    }

    const totalAmount = amount + Math.floor(amount * 0.02); // including 2% tax

    await inngest.send({
      name: 'order/created',
      data: {
        userId,
        address,
        items,
        amount: totalAmount,
        date: Date.now()
      }
    })
    // clear user cart
    const user = await User.findById(userId);
    user.cartItems = {};
    await user.save();

    return NextResponse.json({ success: true, message: 'Order placed successfully' });
   } catch (error) {
    console.log(error);
    return NextResponse.json({ success: false, message: error.message });
  }
}