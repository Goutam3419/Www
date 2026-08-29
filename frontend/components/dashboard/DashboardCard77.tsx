
"use client";
import React,{useState} from "react";
export default function DashboardCard77(){
 const [v,setV]=useState("");
 return <div className='rounded-xl border p-4'><h2>DashboardCard77</h2><input value={v} onChange={e=>setV(e.target.value)} className='border p-2 w-full'/></div>;
}
