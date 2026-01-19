import { Inngest } from "inngest";
import connectDB from "./db";
import User from "@/models/User";
import Order from "@/models/Order";

export const inngest = new Inngest({ id: "quickcart-next" });

// Inngest function to save user data to a database

export const syncUserCreation = inngest.createFunction(
  { id: 'sync-user-creation' },
  {event: 'clerk/user.created'},
  async ({event}) => {
    const { id, first_name, last_name, email_addresses, image_url } = event.data;
    // Here you would add your database logic to save the user
    const userData = {
      _id: id,
      email: email_addresses[0].email_address,
      name: `${first_name} ${last_name}`,
      imageUrl: image_url,
    }

    await connectDB();
    await User.create(userData);

  }
);

// Inngest function to update user data in DB
export const syncUserUpdation = inngest.createFunction(
  { id: 'sync-user-updation' },
  {event: 'clerk/user.updated'},
  async ({event}) => {
    const { id, first_name, last_name, email_addresses, image_url } = event.data;
    const userData = {
      _id: id,
      name: `${first_name} ${last_name}`,
      email: email_addresses[0].email_address,
      imageUrl: image_url,
    }
    await connectDB();
    await User.findByIdAndUpdate(id, userData);
  }
);

// Inngest function to delete user data in DB
export const syncUserDeletion = inngest.createFunction(
  { id: 'delete-user-deletion' },
  {event: 'clerk/user.deleted'},
  async ({event}) => {
    const { id } = event.data;
    await connectDB();
    await User.findByIdAndDelete(id);
  }
);

// Inngest function to create user's order in database
export const createUserOrder = inngest.createFunction(
  {
    id: 'create-user-order',
    batchEvents: {
      maxSize: 25, 
      timeout: '5s'
    }
  },{event: 'order/created'},
  async ({events}) => {
    const orders = events.map((event) => {
      return {
        userId: event.data.userId,
        items: event.data.items,
        amount: event.data.amount,
        address: event.data.address,
        date: event.data.date,
      }
    }) 
    await connectDB();
    await Order.insertMany(orders);

    return { success: true, processed: orders.length}
  }
)