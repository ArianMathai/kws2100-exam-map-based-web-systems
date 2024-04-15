import React, {MutableRefObject, useContext, useEffect, useMemo, useRef, useState} from "react";
import TileLayer from "ol/layer/Tile";
import { OSM } from "ol/source";
import OptionPicker from "./header/select/BaseLayerDropdown";
import Button from "./header/button/Button";
import {map, MapContext} from "./context/MapContext";
import {Layer} from "ol/layer";
import FocusOnMeBtn from "./header/button/FocusOnMeBtn";
import DrawTrainStationButton from "./header/button/DrawTrainStationButton";
import {log} from "ol/console";
import VectorLayer from "ol/layer/Vector";
import {Draw} from "ol/interaction";
import VectorSource from "ol/source/Vector";

function App() {

    const [baseLayer, setBaseLayer] = useState<Layer>(
        new TileLayer({ source: new OSM() }),
    );

    const mapRef = useRef() as MutableRefObject<HTMLDivElement>;

    const [vectorLayers, setVectorLayers] = useState<Layer[]>([]);

    const allLayers = useMemo(
        () => [baseLayer, ...vectorLayers],
        [baseLayer],
    );

    useEffect(() => {
        map.setTarget(mapRef.current);
    }, []);

    useEffect(() => {
        map.setLayers(allLayers)
    }, [allLayers]);


    return(
    <MapContext.Provider
        value={{map,setBaseLayer,vectorLayers,setVectorLayers}}>
    <header>
        <nav>
            <Button drawType="Circle"/>
            <Button drawType={"Symbol"}/>
            <Button drawType={"Symbol2"}/>
            <DrawTrainStationButton/>
            <FocusOnMeBtn/>
            <OptionPicker/>

        </nav>
    </header>
        <div ref={mapRef}></div>
    </MapContext.Provider>
    )
}

export default App;