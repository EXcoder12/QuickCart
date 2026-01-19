import mongoose from 'mongoose';

const OrderSchema = new mongoose.Schema({
  userId: {
    type: String, 
    required: true,
    ref: 'user'
  },
  items: [{
    product: {
      type: String, required: true, ref: 'product'
    },
    quantity: { type: Number, required: true },
    
  }],
  amount: { type: Number, required: true },
  address: { type: String, required: true, ref: 'address' },
  status: { type: String, default: 'Order Placed' }, 
  date: { type: Number, default: Date.now, required: true },

});

const Order = mongoose.models.Order || mongoose.model('Order', OrderSchema);

export default Order;