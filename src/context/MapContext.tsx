import { Map, View } from "ol";
import React, { Dispatch, SetStateAction } from "react";
import { Layer } from "ol/layer";
import { fromLonLat } from "ol/proj";
import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";

export const map = new Map({
  view: new View({
    center: fromLonLat([10, 59]),
    zoom: 8,
  }),
});

const source = new VectorSource({});
export const drawingLayer = new VectorLayer({ source });

export const MapContext = React.createContext<{
  map: Map;
  setBaseLayer: (baseLayer: Layer) => void;
  vectorLayers: Layer[];
  setVectorLayers: Dispatch<SetStateAction<Layer[]>>;
  drawingLayer: VectorLayer<VectorSource>;
  checked: boolean;
  setChecked: Dispatch<SetStateAction<boolean>>;
}>({
  map,
  setBaseLayer: () => {},
  vectorLayers: [],
  setVectorLayers: () => {},
  drawingLayer,
  checked: false,
  setChecked: () => {},
});
