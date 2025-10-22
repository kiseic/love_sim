"use client";

import { LoveSimulationForm } from "./components/love-simulation/LoveSimulationForm";
import { useEffect } from "react";
export default function Home() {
  useEffect(() => {
    sessionStorage.clear();
    console.log('sessionStorage cleared');
  }, []);
  return (
    <div className="min-h-screen bg-background">
      <LoveSimulationForm />
    </div>
  );
}
