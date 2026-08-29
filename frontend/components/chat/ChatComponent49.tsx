
"use client";
import React,{useState} from "react";
export default function ChatComponent49(){
 const [m,setM]=useState("");
 return <div className='rounded-xl border p-4'><h2>ChatComponent49</h2><textarea value={m} onChange={e=>setM(e.target.value)} className='border p-2 w-full'/></div>;
}
