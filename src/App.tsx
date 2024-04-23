import React, {
  MutableRefObject,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import TileLayer from "ol/layer/Tile";
import { OSM } from "ol/source";
import BaseLayerDropdown from "./header/select/BaseLayerDropdown";
import { drawingLayer, map, MapContext } from "./context/MapContext";
import { Layer } from "ol/layer";
import FocusOnMeBtn from "./header/button/FocusOnMeBtn";
import DrawTrainStationButton from "./header/button/DrawTrainStationButton";
import DrawPolygon from "./header/button/DrawPolygon";
import VectorLayer from "ol/layer/Vector";
import TrainStationsCheckbox from "./trains/TrainStationsCheckbox";
import { useBusData } from "./Busses/useBusData";
import Dropdown from "./Dropdown";
import { OccupancyStatus, Vehicle } from "./trains/trainTypes";
import { FeatureLike } from "ol/Feature";
import { Feature, MapBrowserEvent } from "ol";
import FeaturesWithinPolygon from "./FeaturesWithinPolygon";
import { getMinutes } from "./getMinutes";
import Routing from "./Routing";

const dropdownOptions = [
  { value: "default", label: "Choose Bus Company" },
  { value: "VYX", label: "Vy Express" },
  { value: "VOT", label: "Vestfold og Telemark" },
  { value: "SKY", label: "Vestland (Skyss)" },
  { value: "AKT", label: "Agder (AKT)" },
  { value: "ATB", label: "Trøndelag (AtB)" },
  { value: "BRA", label: "Viken (Brakar)" },
  { value: "FIN", label: "Troms og Finnmark (Snelandia)" },
  { value: "MOR", label: "Møre og Romsdal (Fram)" },
  { value: "NOR", label: "Nordland fylkeskommune" },
  { value: "NSB", label: "Vy" },
  { value: "OST", label: "Viken (Østfold kollektivtrafikk)" },
  { value: "SOF", label: "Vestland (Kringom)" },
  { value: "TRO", label: "Troms og Finnmark (Troms fylkestrafikk)" },
  { value: "VOT", label: "Vestfold og Telemark" },
  { value: "VYX", label: "Vy Express" },
];

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

  function handlePointerClick(e: MapBrowserEvent<PointerEvent>) {
    const features: FeatureLike[] = [];

    map.forEachFeatureAtPixel(e.pixel, (f) => features.push(f), {
      layerFilter: (l) => l === busLayer,
      hitTolerance: 10,
    });

    console.log(features.length);

    if (features.length === 1) {
      const vehicleFeature = features[0] as FeatureLike;
      const vehicleProperties = vehicleFeature.getProperties();
      const clickedVehicle: {
        lastUpdated: any;
        delay: number;
        line: any;
        location: any;
        vehicleId: any;
        originName: string;
        inCongestion: boolean;
        destinationName: string;
        occupancy: OccupancyStatus;
      } = {
        line: vehicleProperties.line,
        vehicleId: vehicleProperties.vehicleId,
        delay: vehicleProperties.delay,
        lastUpdated: vehicleProperties.lastUpdated,
        location: vehicleProperties.location,
        originName: vehicleProperties.originName,
        inCongestion: vehicleProperties.inCongestion,
        destinationName: vehicleProperties.destinationName,
        occupancy: vehicleProperties.occupancy,
      };

      setClickedFeature(clickedVehicle);
    } else {
      setClickedFeature(undefined);
    }
  }

  useEffect(() => {
    if (trainStationsChecked) {
      setSelectedOption("default");
      busLayer.getSource()?.clear();
    }
  }, [trainStationsChecked]);

  useEffect(() => {
    map.setTarget(mapRef.current);
  }, []);

  useEffect(() => {
    map.setLayers(allLayers);
  }, [allLayers]);

  useEffect(() => {
    if (busLayer) map.on("click", handlePointerClick);

    return () => {
      map.un("click", handlePointerClick);
    };
  }, [busLayer]);

  return (
    <MapContext.Provider
      value={{ map, setBaseLayer, vectorLayers, setVectorLayers, drawingLayer }}
    >
      <header>
        <div className={"applicationHeading"}>WillYouBeDelayed.com</div>
        <nav>
          <BaseLayerDropdown />
          <FocusOnMeBtn />
          <Dropdown
            options={dropdownOptions}
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

          <TrainStationsCheckbox
            checked={trainStationsChecked}
            setChecked={setTrainStationsChecked}
          />
          <Routing />
        </nav>
      </header>
      <main>
        <FeaturesWithinPolygon
          features={featuresWithinPolygon}
          setIsBoxOpen={setIsBoxOpen}
          isBoxOpen={isBoxOpen}
        />
        <div ref={mapRef}></div>
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
      </main>
    </MapContext.Provider>
  );
}

export default App;
