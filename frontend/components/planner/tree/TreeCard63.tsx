
"use client";
import React,{useState} from "react";
export default function TreeCard63(){
 const [v,setV]=useState("");
 return <section className="rounded-xl border p-4"><h3>TreeCard63</h3><input value={v} onChange={e=>setV(e.target.value)} className="w-full border p-2"/></section>;
}
