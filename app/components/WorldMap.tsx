"use client";

import { useRouter } from "next/navigation";
import Map, { Marker, NavigationControl } from "react-map-gl/mapbox";
import "mapbox-gl/dist/mapbox-gl.css";
import { VIBE_CONFIG } from "../lib/mock-data";
import { VibeTag } from "../lib/types";

const TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN!;

export type MapPin = {
  id: string | number;
  city: string;
  country: string;
  lng: number;
  lat: number;
  vibe: VibeTag;
};

function SpherePin({ color, colorLight, colorDark, label }: {
  color: string;
  colorLight: string;
  colorDark: string;
  label: string;
}) {
  const id = `sp-${color.replace("#", "")}`;
  return (
    <svg
      width="34"
      height="42"
      viewBox="0 0 34 42"
      style={{ display: "block", overflow: "visible" }}
    >
      <defs>
        {/* Main sphere gradient: 4 stops for real depth */}
        <radialGradient id={`${id}-body`} cx="36%" cy="28%" r="74%">
          <stop offset="0%"  stopColor="white"      stopOpacity="0.92" />
          <stop offset="22%" stopColor={colorLight}                     />
          <stop offset="62%" stopColor={color}                          />
          <stop offset="100%" stopColor={colorDark}                     />
        </radialGradient>
        {/* Inner depth shadow */}
        <radialGradient id={`${id}-depth`} cx="60%" cy="70%" r="65%">
          <stop offset="0%"  stopColor={colorDark}  stopOpacity="0.45" />
          <stop offset="100%" stopColor={colorDark} stopOpacity="0"    />
        </radialGradient>
      </defs>

      {/* Cast shadow on the map surface */}
      <ellipse cx="17" cy="40" rx="7.5" ry="2.2" fill="rgba(0,0,0,0.22)" />

      {/* Outer glow halo */}
      <circle cx="17" cy="17" r="15" fill={color} opacity="0.16" />

      {/* Sphere body */}
      <circle
        cx="17" cy="17" r="12"
        fill={`url(#${id}-body)`}
        stroke="rgba(255,255,255,0.88)"
        strokeWidth="1.8"
      />

      {/* Inner depth overlay — darkens bottom-right for 3D feel */}
      <circle cx="17" cy="17" r="12" fill={`url(#${id}-depth)`} />

      <title>{label}</title>
    </svg>
  );
}

export default function WorldMap({
  pins,
  initialZoom = 1.5,
  initialCenter = [10, 20] as [number, number],
}: {
  pins: MapPin[];
  initialZoom?: number;
  initialCenter?: [number, number];
}) {
  const router = useRouter();

  return (
    <div className="w-full h-full rounded-xl overflow-hidden">
      <Map
        mapboxAccessToken={TOKEN}
        initialViewState={{
          longitude: initialCenter[0],
          latitude: initialCenter[1],
          zoom: initialZoom,
        }}
        style={{ width: "100%", height: "100%" }}
        mapStyle="mapbox://styles/mapbox/outdoors-v12"
      >
        <NavigationControl position="bottom-right" />

        {pins.map((pin) => {
          const cfg = VIBE_CONFIG[pin.vibe];
          return (
            <Marker
              key={pin.id}
              longitude={pin.lng}
              latitude={pin.lat}
              anchor="center"
              onClick={(e: { originalEvent: MouseEvent }) => {
                e.originalEvent.stopPropagation();
                router.push(`/trips/${pin.id}`);
              }}
            >
              <div title={`${pin.city}, ${pin.country}`} style={{ cursor: "pointer" }}>
                <SpherePin
                  color={cfg.mapColor}
                  colorLight={cfg.mapColorLight}
                  colorDark={cfg.mapColorDark}
                  label={`${pin.city}, ${pin.country}`}
                />
              </div>
            </Marker>
          );
        })}
      </Map>
    </div>
  );
}
