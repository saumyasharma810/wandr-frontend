declare module "react-simple-maps" {
  import { FC, ReactNode, CSSProperties } from "react";

  interface ComposableMapProps {
    projectionConfig?: {
      scale?: number;
      center?: [number, number];
      rotate?: [number, number, number];
    };
    style?: CSSProperties;
    children?: ReactNode;
  }

  interface GeographiesProps {
    geography: string | object;
    children: (args: { geographies: GeoFeature[] }) => ReactNode;
  }

  interface GeoFeature {
    rsmKey: string;
    [key: string]: unknown;
  }

  interface GeographyStyle {
    fill?: string;
    stroke?: string;
    strokeWidth?: number;
    outline?: string;
  }

  interface GeographyProps {
    key?: string;
    geography: GeoFeature;
    style?: {
      default?: GeographyStyle;
      hover?: GeographyStyle;
      pressed?: GeographyStyle;
    };
    onClick?: () => void;
  }

  interface MarkerProps {
    coordinates: [number, number];
    children?: ReactNode;
    onClick?: () => void;
    style?: CSSProperties;
  }

  export const ComposableMap: FC<ComposableMapProps>;
  export const Geographies: FC<GeographiesProps>;
  export const Geography: FC<GeographyProps>;
  export const Marker: FC<MarkerProps>;
}
