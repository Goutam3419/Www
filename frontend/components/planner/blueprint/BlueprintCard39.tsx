
"use client";
import React,{useState} from "react";
export default function BlueprintCard39(){
 const [text,setText]=useState("");
 return <section className="rounded-xl border p-4"><h3>BlueprintCard39</h3><textarea value={text} onChange={e=>setText(e.target.value)} className="w-full border p-2"/></section>;
}
