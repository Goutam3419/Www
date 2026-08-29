"use client";
import React,{useState} from "react";
export default function PlannerCard81(){
 const [v,setV]=useState("");
 return <section className="rounded-xl border p-4"><h3>PlannerCard81</h3><textarea value={v} onChange={e=>setV(e.target.value)} className="w-full border p-2"/></section>;
}
