import {
  Dispatch,
  SetStateAction,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { MapContext, drawingLayer } from "../context/MapContext";
import VectorSource, { VectorSourceEvent } from "ol/source/Vector";
import { Draw } from "ol/interaction";
import React from "react";
import { Geometry, LineString, Point, Polygon } from "ol/geom";
import { Circle } from "ol/geom";
import { TrainstationFeature } from "../trains/trainTypes";
import { Coordinate } from "ol/coordinate";
import { Feature } from "ol";

interface DrawCircleProps {
  setFeatures: Dispatch<SetStateAction<Feature<Geometry>[]>>;
  setIsBoxOpen: (isBoxOpen: boolean) => void;
  trainStationChecked: boolean;
}

function DrawCircle({
  setFeatures,
  setIsBoxOpen,
  trainStationChecked,
}: DrawCircleProps) {
  const { map, setVectorLayers, drawingLayer } = useContext(MapContext);

  const [circleSource, setSource] = useState<VectorSource | undefined>();

  const draw = useMemo(
    () => new Draw({ source: circleSource, type: "Circle" }),
    [circleSource],
  );

  const handleDrawingCircle = (e: VectorSourceEvent) => {
    const circleFeature = e.feature;
    const circleGeometry = circleFeature?.getGeometry() as Circle;
    const radius = circleGeometry.getRadius();
    const center = circleGeometry.getCenter();

    const layers = map.getLayers().getArray();
    const layer = layers.find((l) => l.getClassName() === "trainstationLayer");
    // @ts-ignore
    const source = layer ? layer.getSource() : null;

    if (!source) {
      return;
    }

    const features = source.getFeatures();
    const featuresWithinCircle: Feature<Geometry>[] = [];

    features.forEach((f: TrainstationFeature) => {
      const point = f.getGeometry() as Point;
      const coords = point.getCoordinates();
      const x = coords[0];
      const y = coords[1];

      const distance = calculateDistance(center, coords);

      if (distance <= radius) {
        /*
                const line = new LineString([center, coords]);

                // Create a new feature with the LineString geometry
                const lineFeature = new Feature({
                    geometry: line,
                });

                // Add the feature to the line source
                .addFeature(lineFeature);

                 */

        console.log("Feature ", f.getProperties());

        f.setProperties({
          distance: distance,
        });
        featuresWithinCircle.push(f);
      }
    });

    setIsBoxOpen(true);

    setFeatures(featuresWithinCircle);

    map.removeInteraction(draw);
  };

  function calculateDistance(coord1: Coordinate, coord2: Coordinate): number {
    const dx = coord1[0] - coord2[0];
    const dy = coord1[1] - coord2[1];
    return Math.sqrt(dx * dx + dy * dy);
  }

  function handleClick() {
    if (circleSource) {
      map.addInteraction(draw);
      circleSource.once("addfeature", handleDrawingCircle);
    }
  }

  useEffect(() => {
    if (drawingLayer) {
      setSource(drawingLayer.getSource()!);
    }
  }, []);

  if (!trainStationChecked) {
    return null;
  }

  return <button onClick={handleClick}>Draw Circle</button>;
}

export default DrawCircle;
