"use client";
import React,{useState} from "react";
export default function CodeCard43(){
 const [v,setV]=useState("Route");
 return <section className="rounded-xl border p-4"><h3>{v}</h3><input value={v} onChange={e=>setV(e.target.value)} className="w-full border p-2"/></section>;
}
