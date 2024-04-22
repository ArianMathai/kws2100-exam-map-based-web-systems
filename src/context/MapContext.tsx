import { Map, View } from "ol";
import React, { Dispatch, SetStateAction } from "react";
import { Layer } from "ol/layer";
import { useGeographic } from "ol/proj";
import { Feature } from "ol/render/webgl/MixedGeometryBatch";
import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";

useGeographic();

export const map = new Map({ view: new View({ center: [10, 59], zoom: 8 }) });

const source = new VectorSource({});
export const drawingLayer = new VectorLayer({ source });

export const MapContext = React.createContext<{
  map: Map;
  setBaseLayer: (baseLayer: Layer) => void;
  vectorLayers: Layer[];
  setVectorLayers: Dispatch<SetStateAction<Layer[]>>;
  drawingLayer: VectorLayer<VectorSource>;
}>({
  map,
  setBaseLayer: () => {},
  vectorLayers: [],
  setVectorLayers: () => {},
  drawingLayer,
});
