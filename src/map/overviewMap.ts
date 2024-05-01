import { OverviewMap } from "ol/control";
import TileLayer from "ol/layer/Tile";
import { OSM } from "ol/source";
import { View } from "ol";

const thunderForestApi =
  "https://tile.thunderforest.com/cycle/{z}/{x}/{y}.png?apikey=26f56b9de62747af8fa317c6c28d281d";

export const overviewMapControl = new OverviewMap({
  className: "ol-overviewmap ol-custom-overviewmap",
  layers: [
    new TileLayer({
      source: new OSM({
        url: thunderForestApi,
      }),
    }),
  ],
  view: new View({
    center: [10, 59],
    zoom: 8,
  }),
  collapseLabel: "\u00BB",
  collapsed: false,
});

export default overviewMapControl;
