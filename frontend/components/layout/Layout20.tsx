
import React from "react";

export default function Layout20({{ children }}: {{ children: React.ReactNode }}) {{
  return (
    <div className="min-h-screen">
      <main>{{children}}</main>
    </div>
  );
}}
