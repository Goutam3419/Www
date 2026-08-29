
"use client";
import React,{useState} from "react";
export default function WriterCard22(){
 const [code,setCode]=useState("// code");
 return <section className="rounded-xl border p-4"><h3>WriterCard22</h3><textarea value={code} onChange={e=>setCode(e.target.value)} className="w-full border p-2 h-32"/></section>;
}
