import {
  MutableRefObject,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Feature, MapBrowserEvent, Overlay } from "ol";
import { MapContext } from "../context/MapContext";
import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import { GeoJSON } from "ol/format";
import React from "react";
import { FeatureLike } from "ol/Feature";
import { Circle, Fill, Stroke, Style } from "ol/style";
import {useTrainData} from "./useTrainData";

type TrainstationProperties = {
  navn: string;
};
type TrainstationFeature = {
  getProperties(): TrainstationProperties;
} & Feature;

function trainstationStyle() {
  return new Style({
    image: new Circle({
      stroke: new Stroke({ color: "white", width: 2 }),
      fill: new Fill({ color: "rgb(5,116,129)" }),
      radius: 5,
    }),
  });
}
const hoveredColor = "rgb(3,11,141)";
function hoveredTrainstationStyle() {
  return new Style({
    image: new Circle({
      stroke: new Stroke({ color: "white", width: 2 }),
      fill: new Fill({ color: hoveredColor }),
      radius: 8,
    }),
  });
}
function TrainStationsCheckbox() {
  const { map, setVectorLayers } = useContext(MapContext);
  const [checked, setChecked] = useState(false);
  const [hoveredTrainstation, setHoveredTrainstation] =
    useState<TrainstationFeature>();
  const [clickedFeature, setClickedFeature] = useState<
    TrainstationFeature | undefined
  >(undefined);

  const {trainLayer, trainTrailLayer} = useTrainData();

  const overlay = useMemo(() => new Overlay({}), []);
  const overlayRef = useRef() as MutableRefObject<HTMLDivElement>;

  const trainstationLayer = new VectorLayer({
    className: "trainstationLayer",
    source: new VectorSource({
      url: "/kws-exam-2024/Jernbanestasjoner.json",
      format: new GeoJSON(),
    }),
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
      setHoveredTrainstation(hoveredFeature);
      setClickedFeature(hoveredFeature);
      overlay.setPosition(e.coordinate);
    } else {
      setHoveredTrainstation(undefined);
      setClickedFeature(undefined);
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
    hoveredTrainstation?.setStyle(hoveredTrainstationStyle());
    return () => hoveredTrainstation?.setStyle(undefined);
  }, [hoveredTrainstation]);

  useEffect(() => {
    if (checked) {
      setVectorLayers((old) => [...old, trainstationLayer]);
      map.on("pointermove", handlePointerMove);
    }
    return () => {
      setVectorLayers((old) => old.filter((old) => old != trainstationLayer));
      map.un("pointermove", handlePointerMove);
    };
  }, [checked]);

  useEffect(() => {
    if (checked){
      setVectorLayers((old) => [...old, trainLayer, trainTrailLayer])
    }
  }, [checked]);



  return (
    <div>
      <label className="trainStationsCheckboxLabel">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => setChecked(e.target.checked)}
        />
        {!checked ? "Show" : "Hide"} Trains and train stations
      </label>
      <div ref={overlayRef} className={"overlay"}>
        <p>Togstasjon: {clickedFeature?.getProperties().navn}</p>
      </div>
    </div>
  );
}

export default TrainStationsCheckbox;
