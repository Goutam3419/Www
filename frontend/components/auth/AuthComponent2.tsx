
"use client";
import React,{useState} from "react";
export default function AuthComponent2(){
 const [email,setEmail]=useState("");
 return <div className='rounded-xl border p-4'><h2>AuthComponent2</h2><input value={email} onChange={e=>setEmail(e.target.value)} className='border p-2 w-full'/></div>;
}
