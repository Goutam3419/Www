
"use client";
import React,{useState} from "react";
export default function TreeCard88(){
 const [v,setV]=useState("");
 return <section className="rounded-xl border p-4"><h3>TreeCard88</h3><input value={v} onChange={e=>setV(e.target.value)} className="w-full border p-2"/></section>;
}
