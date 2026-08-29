"use client";
import React,{useState} from "react";
export default function GitHubCard165(){
 const [repo,setRepo]=useState("repo-name");
 return <section className="rounded-xl border p-4"><h3>{repo}</h3><input value={repo} onChange={e=>setRepo(e.target.value)} className="w-full border p-2"/></section>;
}
