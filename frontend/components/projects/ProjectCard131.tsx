"use client";
import React,{useState} from "react";
export default function ProjectCard131(){
 const [name,setName]=useState("");
 return <section className="rounded-xl border p-4"><h3>ProjectCard131</h3><input value={name} onChange={e=>setName(e.target.value)} className="w-full border p-2"/></section>;
}
