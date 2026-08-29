
"use client";
import React from "react";

type Props = {{
  title?: string;
  description?: string;
}};

export default function Card127({{ title="Card127", description="Reusable production component"}}: Props) {{
  return (
    <section className="rounded-xl border p-4">
      <h2>{{title}}</h2>
      <p>{{description}}</p>
      <button>Action</button>
    </section>
  );
}}
