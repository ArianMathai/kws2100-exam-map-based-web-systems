import {
  MutableRefObject,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { MapBrowserEvent, Overlay } from "ol";
import { MapContext } from "../context/MapContext";
import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import { GeoJSON } from "ol/format";
import React from "react";
import { FeatureLike } from "ol/Feature";
import { trainstationStyle } from "../style/styles";
import { useTrainData } from "./useTrainData";
import { Cluster } from "ol/source";
import { TrainstationFeature } from "./trainTypes";
import { useBusData } from "../Busses/useBusData";

function TrainStationsCheckbox({
  checked,
  setChecked,
}: {
  checked: boolean;
  setChecked: (checked: boolean) => void;
}) {
  const { map, setVectorLayers, vectorLayers } = useContext(MapContext);
  const [hoveredTrainstation, setHoveredTrainstation] = useState<
    TrainstationFeature | undefined
  >(undefined);

  const { trainLayer, trainTrailLayer } = useTrainData();

  const overlay = useMemo(() => new Overlay({}), []);
  const overlayRef = useRef() as MutableRefObject<HTMLDivElement>;

  const trainStationSource = new VectorSource({
    url: "/kws-exam-2024/Jernbanestasjoner.json",
    format: new GeoJSON(),
  });

  const clusterSource = new Cluster({
    source: trainStationSource,
    distance: 30,
    minDistance: 10,
  });

  const trainstationLayer = new VectorLayer({
    className: "trainstationLayer",
    source: clusterSource,
    style: trainstationStyle,
  });

  function handlePointerMove(e: MapBrowserEvent<PointerEvent>) {
    const features: FeatureLike[] = [];
    map.forEachFeatureAtPixel(e.pixel, (f) => features.push(f), {
      hitTolerance: 6,
      layerFilter: (l) => l === trainstationLayer,
    });

    if (features.length === 1) {
      const hoveredFeature = features[0] as TrainstationFeature;

      if (hoveredFeature.get("features").length === 1) {
        const clusterFeatures = hoveredFeature.get("features");
        setHoveredTrainstation(clusterFeatures[0]);
        overlay.setPosition(e.coordinate);
      }
    } else {
      setHoveredTrainstation(undefined);
      overlay.setPosition(undefined);
    }
  }

  useEffect(() => {
    overlay.setElement(overlayRef.current);
    map.addOverlay(overlay);

    return () => {
      map.removeOverlay(overlay);
    };
  }, []);

  useEffect(() => {
    if (checked && trainLayer && trainTrailLayer) {
      setVectorLayers((old) => [
        ...old,
        trainstationLayer,
        trainLayer,
        trainTrailLayer,
      ]);
      map.on("pointermove", handlePointerMove);
    }
    return () => {
      setVectorLayers((old) =>
        old.filter(
          (layer) =>
            layer !== trainLayer &&
            layer !== trainTrailLayer &&
            layer !== trainstationLayer,
        ),
      );
      map.un("pointermove", handlePointerMove);
    };
  }, [checked, trainLayer, trainTrailLayer]);

  return (
    <div>
      <label className="trainStationsCheckboxLabel">
        <input
            className="checkbox"
          type="checkbox"
          checked={checked}
          onChange={(e) => setChecked(e.target.checked)}
        />
        {!checked ? "Show" : "Hide"} Trains and stations
      </label>
      <div ref={overlayRef} className={"overlay"}>
        <p>Train station: {hoveredTrainstation?.getProperties().navn}</p>
      </div>
    </div>
  );
}

export default TrainStationsCheckbox;
