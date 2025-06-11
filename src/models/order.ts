import mongoose from "mongoose";

const OrderSchema = new mongoose.Schema({
    customerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'customer',
        required: true,
        unique: true
    },
    shipping: {
        type: String,
        required: true
    },
    products: [
        {
            productId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'products',
                required: true,
                unique: true
            },
            variant: {
                type: [Object],
                required: true
            },
            quantity: {
                type: Number,
                default: 1,
            },
        },
    ],
    amount: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        default: 'Pending',
        required: true
    }
}, {timestamps: true});


export default mongoose.models.Order || mongoose.model("Order", OrderSchema);