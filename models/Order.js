import mongoose from 'mongoose';

const OrderSchema = new mongoose.Schema({
  userId: {
    type: String, 
    required: true,
    ref: 'User'
  },
  items: [{
    product: {
      type: String, required: true, ref: 'Product'
    },
    quantity: { type: Number, required: true },
    
  }],
  amount: { type: Number, required: true },
  address: { type: String, required: true, ref: 'Address' },
  status: { type: String, default: 'Order Placed' }, 
  date: { type: Number, default: Date.now, required: true },

});

const Order = mongoose.models.Order || mongoose.model('Order', OrderSchema);

export default Order;