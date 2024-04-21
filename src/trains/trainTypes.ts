import { Feature } from "ol";
import { Point } from "ol/geom";

interface coordinates {
  latitude: number;
  longitude: number;
}

interface lineRef {
  lineRef: string;
}

export enum OccupancyStatus {
  SeatsAvailable = "SEATS_AVAILABLE",
  StandingRoomOnly = "STANDING_ROOM_ONLY",
  LimitedStanding = "LIMITED_STANDING",
  Full = "FULL",
  Unknown = "UNKNOWN",
}

export interface Train {
  line: lineRef;
  vehicleId: string;
  delay: number;
  location: coordinates;
  lastUpdated: string;
  history: coordinates[];
}

export type TrainFeatures = { getProperties(): Vehicle } & Feature<Point>;

export interface Vehicle {
  line: lineRef;
  vehicleId: string;
  delay: number;
  lastUpdated: string;
  location: coordinates;
  destinationName: string;
  inCongestion: boolean;
  originName: string;
  occupancy: OccupancyStatus;
}

export type VehicleFeatures = { getProperties(): Vehicle } & Feature<Point>;
