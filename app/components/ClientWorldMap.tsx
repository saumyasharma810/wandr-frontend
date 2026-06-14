"use client";

import dynamic from "next/dynamic";
import { MapPin } from "./WorldMap";

const WorldMap = dynamic(() => import("./WorldMap"), { ssr: false });

export default function ClientWorldMap({
  pins,
  initialZoom,
  initialCenter,
}: {
  pins: MapPin[];
  initialZoom?: number;
  initialCenter?: [number, number];
}) {
  return <WorldMap pins={pins} initialZoom={initialZoom} initialCenter={initialCenter} />;
}
