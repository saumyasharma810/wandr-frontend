"use client";

import Map, { Marker, NavigationControl } from "react-map-gl/mapbox";
import "mapbox-gl/dist/mapbox-gl.css";
import { VIBE_CONFIG } from "../lib/mock-data";
import { VibeTag } from "../lib/types";

const TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN!;

export type CountryMapProps = {
  city: string;
  lng: number;
  lat: number;
  vibe: VibeTag;
};

function GradientPin({ color, colorLight, colorDark, city }: {
  color: string;
  colorLight: string;
  colorDark: string;
  city: string;
}) {
  const id = `pin-${color.replace("#", "")}`;
  // Elegant teardrop path: rounder head, crisp tip
  const body = "M20 2C11.2 2 4 9.2 4 18c0 12.6 16 36 16 36s16-23.4 16-36C36 9.2 28.8 2 20 2z";

  return (
    <svg
      width="40"
      height="56"
      viewBox="0 0 40 56"
      style={{ display: "block", overflow: "visible" }}
    >
      <defs>
        {/* Body gradient: light top-left → base → dark bottom */}
        <linearGradient id={`${id}-body`} x1="18%" y1="0%" x2="82%" y2="100%">
          <stop offset="0%"   stopColor={colorLight} />
          <stop offset="42%"  stopColor={color}      />
          <stop offset="100%" stopColor={colorDark}  />
        </linearGradient>

        {/* Shine overlay: bright top-left streak */}
        <radialGradient id={`${id}-shine`} cx="34%" cy="24%" r="52%">
          <stop offset="0%"  stopColor="white" stopOpacity="0.52" />
          <stop offset="70%" stopColor="white" stopOpacity="0.06" />
          <stop offset="100%" stopColor="white" stopOpacity="0"   />
        </radialGradient>

        {/* Drop shadow filter */}
        <filter id={`${id}-shadow`} x="-30%" y="-10%" width="160%" height="140%">
          <feDropShadow dx="0" dy="4" stdDeviation="3.5"
            floodColor={colorDark} floodOpacity="0.38" />
        </filter>
      </defs>

      {/* Cast shadow on the map surface */}
      <ellipse cx="20" cy="53.5" rx="6.5" ry="2" fill="rgba(0,0,0,0.2)" />

      {/* Pin body */}
      <path
        d={body}
        fill={`url(#${id}-body)`}
        stroke="rgba(255,255,255,0.82)"
        strokeWidth="1.6"
        filter={`url(#${id}-shadow)`}
      />

      {/* Shine layer on top of body */}
      <path d={body} fill={`url(#${id}-shine)`} />

      {/* Inner circle — white ring */}
      <circle cx="20" cy="18" r="7.5" fill="white" opacity="0.92" />

      {/* Inner circle fill — tinted with light color for warmth */}
      <circle cx="20" cy="18" r="5" fill={colorLight} opacity="0.65" />

      {/* Tiny specular dot on inner circle */}
      <circle cx="17.5" cy="15.5" r="1.8" fill="white" opacity="0.7" />

      <title>{city}</title>
    </svg>
  );
}

export default function CountryMap({ city, lng, lat, vibe }: CountryMapProps) {
  const cfg = VIBE_CONFIG[vibe];

  return (
    <div className="w-full h-full rounded-xl overflow-hidden">
      <Map
        mapboxAccessToken={TOKEN}
        initialViewState={{
          longitude: lng,
          latitude: lat,
          zoom: 5,
        }}
        style={{ width: "100%", height: "100%" }}
        mapStyle="mapbox://styles/mapbox/outdoors-v12"
      >
        <NavigationControl position="bottom-right" />

        <Marker longitude={lng} latitude={lat} anchor="bottom">
          <GradientPin
            color={cfg.mapColor}
            colorLight={cfg.mapColorLight}
            colorDark={cfg.mapColorDark}
            city={city}
          />
        </Marker>
      </Map>
    </div>
  );
}
