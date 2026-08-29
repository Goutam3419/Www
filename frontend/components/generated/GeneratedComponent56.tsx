
"use client";
import React,{useState} from "react";
export default function GeneratedComponent56(){
 const [title,setTitle]=useState("Component");
 return <section className="rounded-xl border p-4"><h3>{title}</h3><input value={title} onChange={e=>setTitle(e.target.value)} className="w-full border p-2"/></section>;
}
