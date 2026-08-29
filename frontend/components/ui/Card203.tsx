
"use client";
import React from "react";

type Props = {{
  title?: string;
  description?: string;
}};

export default function Card203({{ title="Card203", description="Reusable production component"}}: Props) {{
  return (
    <section className="rounded-xl border p-4">
      <h2>{{title}}</h2>
      <p>{{description}}</p>
      <button>Action</button>
    </section>
  );
}}
