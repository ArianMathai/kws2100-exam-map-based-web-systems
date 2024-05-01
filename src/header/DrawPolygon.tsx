import { useContext, useEffect, useMemo, useState } from "react";
import { MapContext, drawingLayer } from "../context/MapContext";
import VectorSource, { VectorSourceEvent } from "ol/source/Vector";
import { Draw } from "ol/interaction";
import React from "react";
import { Geometry, Point, Polygon } from "ol/geom";
import { Feature } from "ol";
import { containsExtent } from "ol/extent";

interface DrawPolygonProps {
  vectorSource: VectorSource<Feature<Geometry>>;
  setFeaturesWithinPolygon: (feature: Feature<Geometry>[]) => void;
  setIsBoxOpen: (isBoxOpen: boolean) => void;
  setShowInfoMessage: (showInfoMessage: boolean) => void;
}

function DrawPolygon({
  vectorSource,
  setFeaturesWithinPolygon,
  setIsBoxOpen,
  setShowInfoMessage,
}: DrawPolygonProps) {
  const { map, setVectorLayers, drawingLayer } = useContext(MapContext);
  const [source, setSource] = useState<VectorSource | undefined>();
  const draw = useMemo(() => new Draw({ source, type: "Polygon" }), [source]);

  //Draw polygon and highlight features within
  const handleDrawingPolygon = (e: VectorSourceEvent) => {
    const polygonFeature = e.feature;
    const polygonGeometry = polygonFeature?.getGeometry() as Polygon;
    const polygonExtent = polygonGeometry.getExtent(); // Get the extent of the polygon
    const features = vectorSource.getFeatures();
    const featuresWithinPolygon: Feature[] = [];

    features.forEach((f: Feature) => {
      const pointGeometry = f.getGeometry();
      if (pointGeometry instanceof Point) {
        if (containsExtent(polygonExtent, pointGeometry.getExtent())) {
          if (
            polygonGeometry.intersectsCoordinate(pointGeometry.getCoordinates())
          ) {
            featuresWithinPolygon.push(f);
          }
        }
      }
    });

    if (featuresWithinPolygon.length > 0) {
      setFeaturesWithinPolygon(featuresWithinPolygon);
      setIsBoxOpen(true);
    } else {
      //Logic to handle if someone draws without catching any buses.
      setShowInfoMessage(true);
      setTimeout(() => {
        drawingLayer.getSource()?.clear(); // Set showInfoMessage to false after the timeout
      }, 3000);

      setTimeout(() => {
        setShowInfoMessage(false);
      }, 5000);
    }

    map.removeInteraction(draw);
  };
  function handleClick() {
    if (source) {
      map.addInteraction(draw);
      source.once("addfeature", handleDrawingPolygon);
    }
  }

  useEffect(() => {
    if (drawingLayer) {
      setSource(drawingLayer.getSource()!);
    }
  }, []);

  return <button onClick={handleClick}>Draw an Area to List Buses</button>;
}

export default DrawPolygon;
