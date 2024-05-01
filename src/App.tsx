import React, {
  MutableRefObject,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import TileLayer from "ol/layer/Tile";
import { OSM } from "ol/source";
import BaseLayerDropdown from "./header/BaseLayerDropdown";
import { drawingLayer, map, MapContext } from "./context/MapContext";
import { Layer } from "ol/layer";
import FocusOnMeBtn from "./header/FocusOnMeBtn";
import DrawPolygon from "./header/DrawPolygon";
import TrainStationsCheckbox from "./trains/TrainStationsCheckbox";
import { useBusData } from "./Busses/useBusData";
import Dropdown from "./Dropdown";
import { OccupancyStatus, Vehicle } from "./trains/trainTypes";
import { FeatureLike } from "ol/Feature";
import { Feature, MapBrowserEvent } from "ol";
import ShowFeaturesWithinPolygon from "./ShowFeaturesWithinPolygon";
import { getMinutes } from "./utils/getMinutes";
import Routing from "./routing/Routing";
import CountriesLayerCheckbox from "./countries/CountriesLayerCheckbox";
import CountriesAside from "./countries/CountriesAside";
import overviewMapControl from "./overviewMap";
import handleBusClick from "./Busses/handleBusClick";

function App() {
  const [baseLayer, setBaseLayer] = useState<Layer>(
    new TileLayer({ source: new OSM() }),
  );

  const [featuresWithinPolygon, setFeaturesWithinPolygon] = useState<
    Feature[] | []
  >([]);

  const [showMessage, setShowMessage] = useState(false);

  const [showInfoMessage, setShowInfoMessage] = useState(false);

  const [trainStationsChecked, setTrainStationsChecked] = useState(false);

  const [selectedOption, setSelectedOption] = useState("");

  const { busLayer, busSource } = useBusData(selectedOption);

  const mapRef = useRef() as MutableRefObject<HTMLDivElement>;

  const [vectorLayers, setVectorLayers] = useState<Layer[]>([drawingLayer]);

  const [isBoxOpen, setIsBoxOpen] = useState<boolean>(true);

  const [clickedFeature, setClickedFeature] = useState<Vehicle | undefined>(
    undefined,
  );
  const [checked, setChecked] = useState(false);

  const allLayers = useMemo(
    () => [baseLayer, ...vectorLayers, busLayer],
    [baseLayer, vectorLayers, busLayer],
  );

  const handleDropdownChange = (newValue: string) => {
    setSelectedOption(newValue);
    setTrainStationsChecked(false);
    setShowMessage(true); // Show the message box when a new value is selected
    setTimeout(() => {
      setShowMessage(false); // Hide the message box after 3 seconds
    }, 4000);
  };

  useEffect(() => {
    if (trainStationsChecked) {
      setSelectedOption("default");
      busLayer.getSource()?.clear();
    }
  }, [trainStationsChecked]);

  useEffect(() => {
    map.setTarget(mapRef.current);
    map.addControl(overviewMapControl);
  }, []);

  useEffect(() => {
    map.setLayers(allLayers);
  }, [allLayers]);

  useEffect(() => {
    if (busLayer) {
      const clickHandler = (e: MapBrowserEvent<PointerEvent>) =>
        handleBusClick({ e, setClickedFeature, busLayer });
      map.on("click", clickHandler);

      return () => {
        map.un("click", clickHandler);
      };
    }
  }, [busLayer]);

  return (
    <MapContext.Provider
      value={{
        map,
        setBaseLayer,
        vectorLayers,
        setVectorLayers,
        drawingLayer,
        checked,
        setChecked,
      }}
    >
      <header>
        <div className={"applicationHeading"}>WillYouBeDelayed.com</div>
        <nav>
          <BaseLayerDropdown />
          <FocusOnMeBtn />
          <Dropdown
            selectedValue={selectedOption}
            onChange={handleDropdownChange}
          />
          <DrawPolygon
            vectorSource={busSource}
            setFeaturesWithinPolygon={setFeaturesWithinPolygon}
            setIsBoxOpen={setIsBoxOpen}
            setShowInfoMessage={setShowInfoMessage}
          />
          {/*<DrawTrainStationButton />*/}
          <CountriesLayerCheckbox />
          <TrainStationsCheckbox
            checked={trainStationsChecked}
            setChecked={setTrainStationsChecked}
          />
          <Routing />
        </nav>
      </header>
      <main>
        <ShowFeaturesWithinPolygon
          features={featuresWithinPolygon}
          setIsBoxOpen={setIsBoxOpen}
          isBoxOpen={isBoxOpen}
        />
        <div className="map" id="map" ref={mapRef}></div>
        {clickedFeature ? (
          <div className={"clickedFeature"}>
            <div className={"clickedFeatureBox"}>
              <p>From: {clickedFeature.originName}</p>
              <p>To: {clickedFeature.destinationName}</p>
              <p>
                Delay?{" "}
                {clickedFeature.delay > 0
                  ? `Yes, ${getMinutes(clickedFeature.delay)} minutes`
                  : clickedFeature.delay === 0
                    ? "No. Right on time"
                    : `No. Ahead of schedule with ${getMinutes(clickedFeature.delay)} minutes`}
              </p>
              <p>In Congestion? {clickedFeature.inCongestion ? "Yes" : "No"}</p>
            </div>
          </div>
        ) : null}
        {showMessage && (
          <div className={"showInfo"}>
            <p>You can click on buses to see if they are delayed.</p>
          </div>
        )}
        {showInfoMessage && (
          <div className={"showInfo"}>
            <p>If you choose bus company you can draw polygon around buses.</p>
          </div>
        )}
        <CountriesAside />
      </main>
    </MapContext.Provider>
  );
}

export default App;
