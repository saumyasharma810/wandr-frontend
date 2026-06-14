"use client";

import dynamic from "next/dynamic";
import { CountryMapProps } from "./CountryMap";

const CountryMap = dynamic(() => import("./CountryMap"), { ssr: false });

export default function ClientCountryMap(props: CountryMapProps) {
  return <CountryMap {...props} />;
}
