"use client";
import React,{useState} from "react";
export default function StreamComp132(){
 const [text,setText]=useState("");
 return <section className="rounded-xl border p-4"><h3>StreamComp132</h3><textarea value={text} onChange={e=>setText(e.target.value)} className="w-full border p-2"/></section>;
}
