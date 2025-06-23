"use client";

import Lottie from 'lottie-react';
import loading from "@/../public/loading.json";


export default function Loading() {
    
    return (
        <div className="flex items-center justify-center h-screen">
            <Lottie animationData={loading} loop={true} />
        </div>
    );
}