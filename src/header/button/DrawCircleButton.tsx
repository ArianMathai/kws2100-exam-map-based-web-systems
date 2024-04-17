import { useContext, useEffect, useMemo, useState } from "react";
import { MapContext } from "../../context/MapContext";
import VectorSource, { VectorSourceEvent } from "ol/source/Vector";
import { Draw } from "ol/interaction";
import React from "react";
import { circleStyling } from "../../style/styles";

function DrawCircleButton() {
  const { map, setVectorLayers, drawingLayer } = useContext(MapContext);
  const [source, setSource] = useState<VectorSource | undefined>();
  const draw = useMemo(() => new Draw({ source, type: "Circle" }), [source]);

  const handleClickForCircle = (e: VectorSourceEvent) => {
    const feature = e.feature;

    feature?.setStyle(circleStyling);

    map.removeInteraction(draw);
  };

  function handleClick() {
    if (source) {
      map.addInteraction(draw);
      source.once("addfeature", handleClickForCircle);
    }
  }

  useEffect(() => {
    if (drawingLayer) {
      setSource(drawingLayer.getSource()!);
    }
  }, []);

  return <button onClick={handleClick}>Click for circle</button>;
}

export default DrawCircleButton;
