import { FeatureLike } from "ol/Feature";
import { Circle, Fill, Icon, Stroke, Style } from "ol/style";
import { VehicleFeatures } from "../trains/trainTypes";

export function trainStationStyle(f: FeatureLike, resolution: number) {
  const radius = Math.min(6000 / resolution, 20);
  return [
    new Style({
      image: new Circle({
        radius,
        fill: new Fill({ color: "white" }),
        stroke: new Stroke({ color: "black", width: 3 }),
      }),
    }),
    ...(resolution < 100
      ? [
          new Style({
            image: new Icon({
              src: "/kws-exam-2024/boat.svg",
              scale: radius / 10, // Adjust scale based on radius
            }),
          }),
        ]
      : []),
  ];
}

export function circleStyling(f: FeatureLike, resolution: number) {
  return new Style({
    fill: new Fill({ color: "rgba(255, 0, 0, 0.2)" }),
    stroke: new Stroke({ color: "red", width: 2 }),
  });
}
export function busStyle(f: FeatureLike, resolution: number) {
  const busFeature = f as VehicleFeatures;
  const radius = Math.min(2000 / resolution, 5);

  const bus = busFeature.getProperties();

  return [
    // Style for the icon
    new Style({
      image: new Icon({
        src: "/kws-exam-2024/bus.svg",
        scale: radius / 10, // Adjust scale based on radius
      }),
    }),
    // Style for the stroke around the icon
    new Style({
      image: new Circle({
        radius: radius + 7, // Adjust the radius to fit the icon
        stroke: new Stroke({
          color: bus.delay > 0 ? "Red" : "Green",
          width: 2,
        }),
      }),
    }),
  ];
}
export function trainStyle(f: FeatureLike, resolution: number) {
  const trainFeature = f as VehicleFeatures;
  const radius = Math.min(2000 / resolution, 5);

  // Check the delay of the train
  const train = trainFeature.getProperties();

  return [
    // Style for the icon
    new Style({
      image: new Icon({
        src: "/kws-exam-2024/train.png",
        scale: radius / 10, // Adjust scale based on radius
      }),
    }),
    // Style for the stroke around the icon
    new Style({
      image: new Circle({
        radius: radius + 6, // Adjust the radius to fit the icon
        stroke: new Stroke({
          color: train.delay > 0 ? "Red" : "Green",
          width: 2,
        }),
      }),
    }),
  ];
}
