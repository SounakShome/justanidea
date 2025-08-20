"use client";

import { ReactNode, useEffect } from "react";
import { useAuthStore } from "@/stores";

interface StoreProviderProps {
  children: ReactNode;
}

export function StoreProvider({ children }: StoreProviderProps){
    
    const { isAuthenticated, user } = useAuthStore();

    useEffect(() => {

    }, [])

    return (
        <>
            {children}
        </>
    );
}