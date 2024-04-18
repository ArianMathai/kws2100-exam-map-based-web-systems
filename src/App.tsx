import React, {
  MutableRefObject,
  useContext,
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

function App() {
  const [baseLayer, setBaseLayer] = useState<Layer>(
    new TileLayer({ source: new OSM() }),
  );

  const [busCompany, setBusCompany] = useState<string | undefined>(undefined);

  const [selectedOption, setSelectedOption] = useState("");

  const { vehicleSource } = useTrainData();

  const { busSource } = useBusData(selectedOption);

  const mapRef = useRef() as MutableRefObject<HTMLDivElement>;

  const [vectorLayers, setVectorLayers] = useState<Layer[]>([drawingLayer]);

  const dropdownOptions = [
    { value: "default", label: "Choose Bus Company" },
    { value: "VYX", label: "Vy Express" },
    { value: "VOT", label: "Vestfold og Telemark" },
    { value: "SKY", label: "Vestland (Skyss)" },
    // Add more options as needed
  ];

  const trainLayer = useMemo(() => {
    console.log("Layer recreated!");
    return new VectorLayer({
      source: vehicleSource,
    });
  }, [vehicleSource]);

  const busLayer = useMemo(() => {
    console.log("Layer recreated!");
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

  useEffect(() => {
    map.setTarget(mapRef.current);
  }, []);

  useEffect(() => {
    map.setLayers(allLayers);
  }, [allLayers]);

  return (
    <MapContext.Provider
      value={{ map, setBaseLayer, vectorLayers, setVectorLayers, drawingLayer }}
    >
      <header>
        <nav>
          <DrawCircleButton />
          <Button drawType={"Symbol"} />
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
      <div ref={mapRef}></div>
    </MapContext.Provider>
  );
}

export default App;
