import { Feature } from "ol";
import { Point } from "ol/geom";

interface coordinates {
  latitude: number;
  longitude: number;
}

interface lineRef {
  lineRef: string;
}

export interface Vehicle {
  line: lineRef;
  vehicleId: string;
  delay: number;
  lastUpdated: string;
  location: coordinates;
}

export type VehicleFeatures = { getProperties(): Vehicle } & Feature<Point>;
