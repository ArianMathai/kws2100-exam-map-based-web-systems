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
import DrawCircleButton from "./header/button/DrawCircleButton";
import VectorLayer from "ol/layer/Vector";
import TrainStationsCheckbox from "./trains/TrainStationsCheckbox";
import { useTrainData } from "./trains/useTrainData";
import { useBusData } from "./Busses/useBusData";
import Dropdown from "./Dropdown";
import { OccupancyStatus, Vehicle } from "./trains/trainTypes";
import { FeatureLike } from "ol/Feature";
import { MapBrowserEvent } from "ol";

function App() {
  const [baseLayer, setBaseLayer] = useState<Layer>(
    new TileLayer({ source: new OSM() }),
  );

  const [busCompany, setBusCompany] = useState<string | undefined>(undefined);

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
    // Add more options as needed
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
          <DrawCircleButton />
          <Button drawType={"Symbol1"} />
          <Button drawType={"Symbol2"} />
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
      </main>
    </MapContext.Provider>
  );
}

export default App;
