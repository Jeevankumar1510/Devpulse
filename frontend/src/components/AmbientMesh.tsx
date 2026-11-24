"use client";

import React from "react";

export function AmbientMesh() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10">
      {/* Moving Ambient Glowing Orb 1 */}
      <div
        className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-primary/15 blur-3xl animate-float-slow"
        style={{ animationDuration: "8s" }}
      />
      {/* Moving Ambient Glowing Orb 2 */}
      <div
        className="absolute top-1/3 -right-32 w-96 h-96 rounded-full bg-cyan-500/12 blur-3xl animate-float-reverse"
        style={{ animationDuration: "9s" }}
      />
      {/* Moving Ambient Glowing Orb 3 */}
      <div
        className="absolute -bottom-32 left-1/4 w-[28rem] h-[28rem] rounded-full bg-indigo-500/10 blur-3xl animate-float-delayed"
        style={{ animationDuration: "7s" }}
      />
    </div>
  );
}
