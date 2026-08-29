
"use client";
import React,{useState} from "react";
export default function AuthComponent65(){
 const [email,setEmail]=useState("");
 return <div className='rounded-xl border p-4'><h2>AuthComponent65</h2><input value={email} onChange={e=>setEmail(e.target.value)} className='border p-2 w-full'/></div>;
}
