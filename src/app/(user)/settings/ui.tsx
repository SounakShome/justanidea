"use client";

import { useState } from "react";
import Profile from "./profile/page";
import Account from "./account/page";
import Company from "./company/page";
import Notifications from "./notifications/page";
import Menubar from "@/components/menubar";

interface CompanyData {
  Name: string;
  Industry: string;
  GSTIN: string;
  CompanySize: string;
  Address: string;
  CompanyWebsite: string;
}

interface SessionData {
  user: {
    company: CompanyData; 
  };
}

export default function UI({session}: {session: SessionData}) {

  const [page, setPage] = useState("account");


  return (
    <>
      <div>
        <Menubar setPage={setPage} />
      </div>
      <div className="flex flex-col gap-4 max-w-screen flex-wrap mx-auto p-4">
        {/* <div className="flex items-center justify-between p-2 rounded-lg">
          <div className="flex space-x-4">
            <button className={`hover:bg-gray-300 ${page === "profile" ? "bg-gray-300" : ""} hover:cursor-pointer px-2 py-1 rounded-lg`} onClick={() => setPage("profile")}>Profile</button>
            <button className={`hover:bg-gray-300 ${page === "account" ? "bg-gray-300" : ""} hover:cursor-pointer px-2 py-1 rounded-lg`} onClick={() => setPage("account")}>Account</button>
            <button className={`hover:bg-gray-300 ${page === "company" ? "bg-gray-300" : ""} hover:cursor-pointer px-2 py-1 rounded-lg`} onClick={() => setPage("company")}>Company</button>
            <button className={`hover:bg-gray-300 ${page === "notifications" ? "bg-gray-300" : ""} hover:cursor-pointer px-2 py-1 rounded-lg`} onClick={() => setPage("notifications")}>Notifications</button>
          </div>
        </div> */}
        <div className="p-4 bg-white rounded-lg shadow-md">
          {page === "profile" && <Profile />}
          {page === "account" && <Account />}
          {page === "company" && <Company data={session.user.company} />}
          {page === "notifications" && <Notifications />}
        </div>
      </div>
    </>
  )
}