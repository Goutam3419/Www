
"use client";
import React,{useState} from "react";
export default function WriterCard19(){
 const [code,setCode]=useState("// code");
 return <section className="rounded-xl border p-4"><h3>WriterCard19</h3><textarea value={code} onChange={e=>setCode(e.target.value)} className="w-full border p-2 h-32"/></section>;
}
