import React, { useContext, useEffect, useMemo, useState } from "react";
import VectorSource, { VectorSourceEvent } from "ol/source/Vector";
import { Draw } from "ol/interaction";
import { trainStationStyle } from "../../style/styles";
import { MapContext } from "../../context/MapContext";

export function DrawTrainStationButton() {
  const { map, drawingLayer } = useContext(MapContext);
  const [source, setSource] = useState<VectorSource | undefined>();
  const draw = useMemo(() => new Draw({ source, type: "Point" }), [source]);

  function handleClick() {
    if (source) {
      map.addInteraction(draw);
      source.once("addfeature", handleAddFeature);
    }
  }

  function handleAddFeature(e: VectorSourceEvent) {
    e.feature?.setStyle(trainStationStyle);
    map.removeInteraction(draw);
  }

  useEffect(() => {
    if (drawingLayer) {
      setSource(drawingLayer.getSource()!);
    }
  }, []);

  return <button onClick={handleClick}>Draw train station</button>;
}

export default DrawTrainStationButton;
