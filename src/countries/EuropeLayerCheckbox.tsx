import React, { useContext, useEffect, useState } from "react";
import VectorLayer from "ol/layer/Vector";

import VectorSource from "ol/source/Vector";
import { GeoJSON } from "ol/format";
import { MapContext } from "../context/MapContext";

function EuropeLayerCheckbox() {
  const { setVectorLayers } = useContext(MapContext);
  const [checked, setChecked] = useState(false);

  const europeLayer = new VectorLayer({
    className: "europeLayer",
    source: new VectorSource({
      url: "/kws-exam-2024/Europe.json",
      format: new GeoJSON(),
    }),
  });

  useEffect(() => {
    if (checked) {
      setVectorLayers((old) => [...old, europeLayer]);
    }
    return () => {
      setVectorLayers((layers) => layers.filter((old) => old != europeLayer));
    };
  }, [checked]);

  return (
    <div>
      <label className="checkboxLabel">
        <input
          className="checkbox"
          type="checkbox"
          checked={checked}
          onChange={(e) => setChecked(e.target.checked)}
        />
        {!checked ? "Show" : "Hide"} Europe
      </label>
    </div>
  );
}
export default EuropeLayerCheckbox;
