import React, {
  MutableRefObject,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import { Feature } from "ol/render/webgl/MixedGeometryBatch";
import { MapBrowserEvent, Overlay } from "ol";
import { Fill, Style } from "ol/style";
import { MapContext } from "../context/MapContext";

type CountryProperties = {
  name: string;
  pop_est: number;
  economy: string;
  income_grp: string;
  name_id: string;
};
interface CountryFeature extends Feature {
  getProperties(): CountryProperties;
}
type EuropeVectorLayer = VectorLayer<VectorSource<CountryFeature>>;

function useCountryFeatures() {
  const { map, vectorLayers } = useContext(MapContext);

  const europeLayer = vectorLayers.find(
    (layer) => layer.getClassName() === "europeLayer",
  ) as EuropeVectorLayer;

  const [features, setFeatures] = useState<CountryFeature[]>();

  const [viewExtent, setViewExtent] = useState(
    map.getView().getViewStateAndExtent().extent,
  );
  const visibleFeatures = useMemo(
    () =>
      features?.filter((f) => f.getGeometry()?.intersectsExtent(viewExtent)),
    [viewExtent, features],
  );
  function handleSetViewExtent() {
    setViewExtent(map.getView().getViewStateAndExtent().extent);
  }
  function handleSetFeatures() {
    setFeatures(europeLayer?.getSource()?.getFeatures());
  }

  useEffect(() => {
    map.getView().on("change", handleSetViewExtent);
    return () => {
      map.getView().un("change", handleSetViewExtent);
    };
  }, [map]);

  useEffect(() => {
    europeLayer?.getSource()?.on("change", handleSetFeatures);
    handleSetFeatures();
  }, [europeLayer]);

  return { europeLayer, features, visibleFeatures };
}

const transparentColor = "rgba(0,247,255,0.3)";
const hoverStyle = new Style({
  fill: new Fill({
    color: transparentColor,
  }),
});

function EuropeAside() {
  const { europeLayer, features, visibleFeatures } = useCountryFeatures();

  const { map } = useContext(MapContext);

  const [hoveredCountry, setHoveredCountry] = useState<CountryFeature>();
  const [isAsideVisible, setIsAsideVisible] = useState(true);
  const [clickedCountry, setClickedCountry] = useState<Feature | undefined>(
    undefined,
  );

  const overlay = useMemo(() => new Overlay({}), []);
  const olRef = useRef() as MutableRefObject<HTMLDivElement>;

  function handleHovereCountry(e: MapBrowserEvent<PointerEvent>) {
    const hoveredFeatures = europeLayer
      ?.getSource()
      ?.getFeaturesAtCoordinate(e.coordinate);
    setHoveredCountry(
      hoveredFeatures?.length === 1
        ? (hoveredFeatures[0] as CountryFeature)
        : undefined,
    );
  }

  function handleClickedCountry(e: MapBrowserEvent<PointerEvent>) {
    const clickedFeatures = europeLayer
      ?.getSource()
      ?.getFeaturesAtCoordinate(e.coordinate);
    setClickedCountry(
      clickedFeatures?.length === 1
        ? (clickedFeatures[0] as CountryFeature)
        : undefined,
    );
    if (clickedFeatures?.length === 1) {
      const pixel = map.getPixelFromCoordinate(e.coordinate);
      overlay.setPosition(pixel);
    } else {
      overlay.setPosition(undefined);
    }
  }

  function handleZoomEnd() {
    const storedZoom = sessionStorage.getItem("zoom");
    const latitude = sessionStorage.getItem("lat");
    const longitude = sessionStorage.getItem("long");

    if (storedZoom && latitude && longitude) {
      const zoomLevel = parseFloat(storedZoom);
      const lat = parseFloat(latitude);
      const long = parseFloat(longitude);
      if (!isNaN(zoomLevel)) {
        map.getView().setCenter([lat, long]);
        map.getView().setZoom(zoomLevel);
      }
    } else {
      console.warn("Stored zoom or center not found in sessionStorage.");
    }

    setIsAsideVisible(true);
  }

  const zoomToFeature = useCallback(
    (feature: CountryFeature) => {
      const view = map.getView();
      console.log("View: ", view.getCenter());
      if (!view) {
        console.error("Map view is not available.");
        return;
      }

      const geometry = feature.getGeometry();
      if (!geometry) {
        console.error("Feature has no geometry:", feature);
        return;
      }

      const extent = geometry.getExtent();
      if (
        !extent ||
        extent.every((num) => num === Infinity || num === -Infinity)
      ) {
        console.warn("Invalid extent for feature:", feature);
        return;
      }

      // Check if the extent is too small and set a minimum size if necessary
      const minSize = 0.1; // Adjust this value as needed
      if (extent[2] - extent[0] < minSize || extent[3] - extent[1] < minSize) {
        console.warn("Extent is too small:", extent);
        // Optionally, adjust the extent or set a default zoom level here
        return;
      }

      console.log("Feature extent:", extent);
      setIsAsideVisible(false);
      const center: Array<number> | undefined = view.getCenter();

      const prevZoom = view.getZoom();
      if (prevZoom !== undefined && center !== undefined) {
        sessionStorage.setItem("zoom", prevZoom.toString());
        sessionStorage.setItem("lat", center[0].toString());
        sessionStorage.setItem("long", center[1].toString());
      }

      view.cancelAnimations();
      view.fit(extent, {
        duration: 1000,
        padding: [0, 0, 0, 0],
        maxZoom: view.getMaxZoom(),
        // Optionally, you can add a minZoom constraint here
      });
    },
    [map],
  );

  useEffect(() => {
    overlay.setElement(olRef.current);
    map.addOverlay(overlay);

    return () => {
      map.removeOverlay(overlay);
    };
  }, []);

  useEffect(() => {
    if (visibleFeatures) {
      map.on("pointermove", handleHovereCountry);
    }
    return () => {
      map.un("pointermove", handleHovereCountry);
    };
  }, [map, visibleFeatures]);
  useEffect(() => {
    const handleMoveEnd = () => {
      handleZoomEnd();
    };

    // Using type assertion to bypass the type checking
    map.getView().on("moveend" as any, handleMoveEnd);
    return () => {
      map.getView().un("moveend" as any, handleMoveEnd);
    };
  }, [map]);

  useEffect(() => {
    if (visibleFeatures) {
      map.on("click", handleClickedCountry);
    }
    return () => {
      map.un("click", handleClickedCountry);
      setClickedCountry(undefined);
    };
  }, [map, visibleFeatures]);

  useEffect(() => {
    hoveredCountry?.setStyle(hoverStyle);
    return () => hoveredCountry?.setStyle(undefined);
  }, [hoveredCountry]);

  return (
    <>
      {!isAsideVisible ? (
        <button className="zoom-btn" onClick={handleZoomEnd}>
          Go back!
        </button>
      ) : (
        <aside
          className={isAsideVisible && features?.length ? "visible" : "hidden"}
        >
          <div>
            <h3>Countries</h3>
            <ul>
              {visibleFeatures?.map((c) => (
                <li
                  key={c.getProperties().name_id}
                  className={
                    c.getProperties().name ===
                    hoveredCountry?.getProperties().name
                      ? "bold"
                      : ""
                  }
                  onClick={() => zoomToFeature(c)}
                >
                  {c.getProperties().name}
                </li>
              ))}
            </ul>
          </div>
        </aside>
      )}
      {clickedCountry ? (
        <div ref={olRef} className={"clickedCountryOl"}>
          <p>{clickedCountry?.getProperties().name}</p>
          <p>Estimated population: {clickedCountry?.getProperties().pop_est}</p>
          <p>Economic status: {clickedCountry?.getProperties().economy}</p>
          <p>Income: {clickedCountry?.getProperties().income_grp}</p>
        </div>
      ) : null}
    </>
  );
}
export default EuropeAside;
