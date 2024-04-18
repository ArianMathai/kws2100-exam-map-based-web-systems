import { FeatureLike } from "ol/Feature";
import { Circle, Icon, Stroke, Style } from "ol/style";
import { VehicleFeatures } from "./trainTypes";

export function trainStyle(f: FeatureLike, resolution: number) {
  const trainFeature = f as VehicleFeatures;
  const radius = Math.min(2000 / resolution, 5);

  // Check the delay of the train
  const train = trainFeature.getProperties();

  console.log("DELAY: " + train.delay);

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
        radius: radius + 5, // Adjust the radius to fit the icon
        stroke: new Stroke({
          color: train.delay > 0 ? "Red" : "Green",
          width: 2,
        }),
      }),
    }),
  ];
}
