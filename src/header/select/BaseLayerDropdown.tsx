import React, { useContext, useEffect, useState } from "react";
import TileLayer from "ol/layer/Tile";
import { OSM, StadiaMaps, WMTS } from "ol/source";
import { MapContext } from "../../context/MapContext";
import { WMTSCapabilities } from "ol/format";
import { optionsFromCapabilities } from "ol/source/WMTS";

const parser = new WMTSCapabilities();

const ortoPhotoLayer = new TileLayer();

//const API_KEY = 'Token ca31ff15-2dc4-412d-8442-84ee118c23f6'

// function to parse fetched information
async function loadWmtsSource(
  url: string,
  config: {
    layer: string;
    matrixSet: string;
  },
) {
  const res = await fetch(url);
  const text = await res.text();
  const result = await parser.read(text);
  const options = optionsFromCapabilities(result, config);
  return new WMTS(options!);
}

async function loadFlyfotoLayer() {
  return await loadWmtsSource(
    "https://opencache.statkart.no/gatekeeper/gk/gk.open_nib_web_mercator_wmts_v2?SERVICE=WMTS&REQUEST=GetCapabilities",
    { layer: "Nibcache_web_mercator_v2", matrixSet: "default028mm" },
  );
}

const BaseLayerDropdown = () => {
  const baseLayerOptions = [
    {
      id: "osm",
      name: "Open Street Map",
      layer: new TileLayer({ source: new OSM() }),
    },
    {
      id: "stadia",
      name: "Stadia",
      layer: new TileLayer({ source: new StadiaMaps({ layer: "outdoors" }) }),
    },
    {
      id: "ortoPhoto",
      name: "Flyfoto",
      layer: ortoPhotoLayer,
    },
  ];
  const [selectedBaseLayer, setSelectedBaseLayer] = useState(
    baseLayerOptions[0],
  );
  const { setBaseLayer } = useContext(MapContext);

  useEffect(() => {
    loadFlyfotoLayer().then((source) => ortoPhotoLayer.setSource(source));
  }, []);

  useEffect(() => {
    console.log("selected base layer = ", selectedBaseLayer.name);
    setBaseLayer(selectedBaseLayer.layer);
  }, [selectedBaseLayer]);

  return (
    <select
      className={"baseLayer_select"}
      onChange={(e) =>
        setSelectedBaseLayer(
          baseLayerOptions.find((layer) => layer.id === e.target.value)!,
        )
      }
      value={selectedBaseLayer.id}
    >
      {baseLayerOptions.map(({ id, name }) => (
        <option value={id} key={id}>
          {name}
        </option>
      ))}
    </select>
  );
};

export default BaseLayerDropdown;
