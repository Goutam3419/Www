
"use client";
import React,{useState} from "react";
export default function AuthComponent61(){
 const [email,setEmail]=useState("");
 return <div className='rounded-xl border p-4'><h2>AuthComponent61</h2><input value={email} onChange={e=>setEmail(e.target.value)} className='border p-2 w-full'/></div>;
}
