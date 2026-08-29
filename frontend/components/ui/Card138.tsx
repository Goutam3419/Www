
"use client";
import React from "react";

type Props = {{
  title?: string;
  description?: string;
}};

export default function Card138({{ title="Card138", description="Reusable production component"}}: Props) {{
  return (
    <section className="rounded-xl border p-4">
      <h2>{{title}}</h2>
      <p>{{description}}</p>
      <button>Action</button>
    </section>
  );
}}
