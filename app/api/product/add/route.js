import connectDB from '@/config/db';
import authSeller from '@/lib/authSeller';
import { getAuth } from '@clerk/nextjs/server';
import { v2 as cloudinary } from 'cloudinary';
import { NextResponse } from 'next/server';
import Product from '@/models/Product';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(request) {
  try {
    const { userId} = getAuth(request);
    const isSeller = await authSeller(userId);
    if (!isSeller) {
      return NextResponse({ success: false, message: 'Unauthorized' }, { status: 401 });
    }
    const formData = await request.formData(); 

    const name = formData.get('name');
    const description = formData.get('description');
    const price = formData.get('price');
    const offerPrice = formData.get('offerPrice');
    const category = formData.get('category');

    const files = formData.getAll('images');

    if(!files || files.length === 0){
      return NextResponse({ success: false, message: 'no files uploaded' }, { status: 400 });
    }

    const result = await Promise.all(
      files.map(async (file) => {
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        return new Promise((resolve, reject) => {
          cloudinary.uploader.upload_stream(
            { resource_type: 'auto' },
            (error, result) => {
              if (error) {
                reject(error);
              } else {
                resolve(result);
              }
            }
          ).end(buffer);
        });
      })
    );

    const image = result.map(result => result.secure_url);

    await connectDB()
    const newProduct = await Product.create({
      name,
      description,
      price:Number(price),
      offerPrice:Number(offerPrice),
      category,
      image,
      userId,
      date: Date.now(),
    });

    return NextResponse.json({ success: true, message: 'Product added successfully', newProduct }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 401 });
  }
}