"use server";

import mongoose from "mongoose";

const connectDB = async () => {
    if (mongoose.connections[0].readyState) {
        return;
    }
    try {
        const mongoURI = process.env.MONGO_URI;
        if (!mongoURI) {
            throw new Error("MONGO_DISEASE environment variable is not defined");
        }
        await mongoose.connect(mongoURI);
        console.log("connection establish");
    } catch (error) {
        console.log("connection failed");
        throw new Error(`connection failed: ${error}`);
    }
};

export default connectDB;
