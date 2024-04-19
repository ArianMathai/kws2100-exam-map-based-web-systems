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
import Button from "./header/button/Button";
import { drawingLayer, map, MapContext } from "./context/MapContext";
import { Layer } from "ol/layer";
import FocusOnMeBtn from "./header/button/FocusOnMeBtn";
import DrawTrainStationButton from "./header/button/DrawTrainStationButton";
import DrawPolygon from "./header/button/DrawPolygon";
import VectorLayer from "ol/layer/Vector";
import TrainStationsCheckbox from "./trains/TrainStationsCheckbox";
import { useTrainData } from "./trains/useTrainData";
import { useBusData } from "./Busses/useBusData";
import Dropdown from "./Dropdown";
import { OccupancyStatus, Vehicle } from "./trains/trainTypes";
import { FeatureLike } from "ol/Feature";
import { Feature, MapBrowserEvent } from "ol";

function App() {
  const [baseLayer, setBaseLayer] = useState<Layer>(
    new TileLayer({ source: new OSM() }),
  );

  const [busCompany, setBusCompany] = useState<string | undefined>(undefined);

  const [showMessage, setShowMessage] = useState(false);

  const [selectedOption, setSelectedOption] = useState("");

  const { trainSource } = useTrainData();

  const { busSource } = useBusData(selectedOption);

  const mapRef = useRef() as MutableRefObject<HTMLDivElement>;

  const [vectorLayers, setVectorLayers] = useState<Layer[]>([drawingLayer]);

  const [clickedFeature, setClickedFeature] = useState<Vehicle | undefined>(
    undefined,
  );

  const dropdownOptions = [
    { value: "default", label: "Choose Bus Company" },
    { value: "VYX", label: "Vy Express" },
    { value: "VOT", label: "Vestfold og Telemark" },
    { value: "SKY", label: "Vestland (Skyss)" },
    { value: "AKT", label: "Agder (AKT)" },
    { value: "ATB", label: "Trøndelag (AtB)" },
    { value: "AVI", label: "Avinor" },
    { value: "BNR", label: "Vy/Flytoget/Go-Ahead/SJ Nord (via Bane NOR)" },
    { value: "BRA", label: "Viken (Brakar)" },
    { value: "FIN", label: "Troms og Finnmark (Snelandia)" },
    { value: "FLT", label: "Flytoget" },
    { value: "GJB", label: "Vy (formerly NSB) Gjøvikbanen" },
    { value: "GOA", label: "Go-Ahead" },
    { value: "INN", label: "Innlandet (Innlandstrafikk)" },
    { value: "KOL", label: "Rogaland (Kolumbus)" },
    { value: "MOR", label: "Møre og Romsdal (Fram)" },
    { value: "NBU", label: "Connect Bus Flybuss" },
    { value: "NOR", label: "Nordland fylkeskommune" },
    { value: "NSB", label: "Vy" },
    { value: "OST", label: "Viken (Østfold kollektivtrafikk)" },
    { value: "RUT", label: "Oslo region (Ruter)" },
    { value: "SJN", label: "SJ Nord" },
    { value: "SOF", label: "Vestland (Kringom)" },
    { value: "TEL", label: "Vestfold og Telemark (Farte)" },
    { value: "TRO", label: "Troms og Finnmark (Troms fylkestrafikk)" },
    { value: "VKT", label: "Vestfold og Telemark (VKT)" },
    { value: "VOT", label: "Vestfold og Telemark" },
    { value: "VYB", label: "Vy Buss (SE)" },
    { value: "VYG", label: "Vy Group" },
    { value: "VYX", label: "Vy Express" },
  ];

  const trainLayer = useMemo(() => {
    return new VectorLayer({
      source: trainSource,
    });
  }, [trainSource]);

  const busLayer = useMemo(() => {
    return new VectorLayer({
      source: busSource,
    });
  }, [busSource]);

  const allLayers = useMemo(
    () => [baseLayer, ...vectorLayers, busLayer, trainLayer],
    [baseLayer, vectorLayers, busLayer, trainLayer],
  );

  const handleDropdownChange = (newValue: string) => {
    setSelectedOption(newValue);
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
      // @ts-ignore
      setClickedFeature(clickedVehicle);
    } else {
      setClickedFeature(undefined);
    }
  }

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
        <nav>
          <DrawPolygon vectorSource={busSource} />
          <DrawTrainStationButton />
          <FocusOnMeBtn />
          <BaseLayerDropdown />
          <Dropdown
            options={dropdownOptions}
            selectedValue={selectedOption}
            onChange={handleDropdownChange}
          />
          <TrainStationsCheckbox />
        </nav>
      </header>
      <main>
        <div ref={mapRef}></div>
        {clickedFeature ? (
          <div className={"clickedFeature"}>
            <p>From: {clickedFeature.originName}</p>
            <p>To: {clickedFeature.destinationName}</p>
            <p>
              Delay?{" "}
              {clickedFeature.delay > 0
                ? `Yeah, sorry, ${clickedFeature.delay} seconds`
                : "No. I'm speeding!"}
            </p>
            <p>In Congestion? {clickedFeature.inCongestion ? "Yes" : "No"}</p>
          </div>
        ) : null}
        {showMessage && (
          <div className={"showInfo"}>
            <p>You can click on buses to see if they are delayed.</p>
          </div>
        )}
      </main>
    </MapContext.Provider>
  );
}

export default App;
