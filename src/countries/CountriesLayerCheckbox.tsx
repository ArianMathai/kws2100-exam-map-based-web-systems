import React, { useContext, useEffect, useState } from "react";
import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import { GeoJSON } from "ol/format";
import { MapContext } from "../context/MapContext";

function CountriesLayerCheckbox() {
  const { setVectorLayers, checked, setChecked } = useContext(MapContext);

  const countriesLayer = new VectorLayer({
    className: "countriesLayer",
    source: new VectorSource({
      url: "/kws-exam-2024/countries.json",
      format: new GeoJSON(),
    }),
  });

  useEffect(() => {
    if (checked) {
      setVectorLayers((old) => [...old, countriesLayer]);
    }
    return () => {
      setVectorLayers((layers) =>
        layers.filter((old) => old != countriesLayer),
      );
    };
  }, [checked]);

  return (
    <>
      <div>
        <label className="checkboxLabel">
          <input
            className="checkbox"
            type="checkbox"
            checked={checked}
            onChange={(e) => setChecked(e.target.checked)}
          />
          {!checked ? "Show" : "Hide"} Countries
        </label>
      </div>
    </>
  );
}
export default CountriesLayerCheckbox;
