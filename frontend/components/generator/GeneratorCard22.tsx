
"use client";
import React,{useState} from "react";
export default function GeneratorCard22(){
 const [name,setName]=useState("");
 return <section className="rounded-xl border p-4"><h3>GeneratorCard22</h3><input value={name} onChange={e=>setName(e.target.value)} className="w-full border p-2"/></section>;
}
