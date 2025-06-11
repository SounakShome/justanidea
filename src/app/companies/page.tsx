"use client";

import React, { useState, useEffect } from 'react';
import { signOut } from "next-auth/react"
import { useSession } from "next-auth/react"
import { redirect } from 'next/navigation';

const Companies = () => {

  const [companies, setCompanies] = useState([])

  const { data: session } = useSession()

  useEffect(() => {
    if (!session?.user) {
      redirect('/login');
    };
    const fetchCompanies = async () => {
      try {
        // Using URL parameter for GET request instead of body
        const response = await fetch(`/api/companies?email=${session.user?.email}`, 
          {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            }
          }
        )
        if (!response.ok) {
          throw new Error('Network response was not ok')
        }
        const data = await response.json()
        setCompanies([data.message])
      } catch (error) {
        console.error('Error fetching companies:', error)
      }
    }

    fetchCompanies()
  }, [session?.user])

  return (
    <div>
      <div className="p-6 max-w-7xl mx-auto">
        <header className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Companies Dashboard</h1>
          <button onClick={() => signOut()} className="cursor-pointer bg-destructive text-destructive-foreground hover:bg-destructive/90 px-4 py-2 rounded-md text-sm font-medium transition-colors">
            Logout
          </button>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Company cards */}
          <div className="bg-card text-card-foreground p-6 rounded-lg shadow-sm border">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-xl font-semibold">Acme Corp</h2>
              <span className="bg-primary/10 text-primary text-xs px-2 py-1 rounded-full">Active</span>
            </div>
            <p className="text-muted-foreground mb-4">Technology solutions and services</p>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">42 employees</span>
              <button className="text-primary hover:underline text-sm font-medium">View details →</button>
            </div>
          </div>

          <div className="bg-card text-card-foreground p-6 rounded-lg shadow-sm border">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-xl font-semibold">Globex</h2>
              <span className="bg-primary/10 text-primary text-xs px-2 py-1 rounded-full">Active</span>
            </div>
            <p className="text-muted-foreground mb-4">Manufacturing and distribution</p>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">128 employees</span>
              <button className="text-primary hover:underline text-sm font-medium">View details →</button>
            </div>
          </div>

          <div className="bg-card text-card-foreground p-6 rounded-lg shadow-sm border">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-xl font-semibold">Soylent Corp</h2>
              <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full">Pending</span>
            </div>
            <p className="text-muted-foreground mb-4">Food processing and production</p>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">89 employees</span>
              <button className="text-primary hover:underline text-sm font-medium">View details →</button>
            </div>
          </div>

          <div className="bg-card text-card-foreground p-6 rounded-lg shadow-sm border flex items-center justify-center">
            <button className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="16" />
                <line x1="8" y1="12" x2="16" y2="12" />
              </svg>
              Add Company
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Companies