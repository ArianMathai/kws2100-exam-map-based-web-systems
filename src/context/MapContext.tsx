import { Map, View } from "ol";
import React, { Dispatch, SetStateAction } from "react";
import { Layer } from "ol/layer";
import { useGeographic } from "ol/proj";
import { Feature } from "ol/render/webgl/MixedGeometryBatch";
import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import { OverviewMap, defaults as defaultControls } from "ol/control.js";
import TileLayer from "ol/layer/Tile";
import { OSM } from "ol/source";
import {
  DragRotateAndZoom,
  defaults as defaultInteractions,
} from "ol/interaction.js";

useGeographic();

const overviewMapControl = new OverviewMap({
  className: "ol-overviewmap ol-custom-overviewmap",
  layers: [
    new TileLayer({
      source: new OSM({
        url: "https://tile.thunderforest.com/cycle/{z}/{x}/{y}.png?apikey=26f56b9de62747af8fa317c6c28d281d",
      }),
    }),
  ],
  view: new View({
    projection: "EPSG:4326",
    center: [10, 59],
    zoom: 8,
  }),
  collapseLabel: "\u00BB",
  collapsed: false,
});
export const map = new Map({
  controls: defaultControls().extend([overviewMapControl]),
  interactions: defaultInteractions().extend([new DragRotateAndZoom()]),
  target: "map",
  view: new View({
    //projection: 'EPSG:3857',
    projection: "EPSG:4326",
    center: [10, 59],
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
}>({
  map,
  setBaseLayer: () => {},
  vectorLayers: [],
  setVectorLayers: () => {},
  drawingLayer,
});
