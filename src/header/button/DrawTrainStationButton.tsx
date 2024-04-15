import React, { useContext, useEffect, useMemo, useState } from "react";
import VectorSource, { VectorSourceEvent } from "ol/source/Vector";
import { Draw } from "ol/interaction";
import {trainStationStyle} from "../../style/styles";
import { MapContext, drawingLayer } from "../../context/MapContext";

export function DrawTrainStationButton() {
    const { map, setVectorLayers } = useContext(MapContext);
    const [source, setSource] = useState<VectorSource | undefined>();
    const draw = useMemo(() => new Draw({ source, type: "Point" }), [source]);

    useEffect(() => {
        const updateStyles = () => {
            if (source) {
                source.getFeatures().forEach((feature) => {
                    const currentResolution = map.getView().getResolution();
                    if(currentResolution) {
                        feature.setStyle((f) => trainStationStyle(f, currentResolution));
                    }
                });
            }
        };

        map.on("moveend", updateStyles);

        return () => {
            map.un("moveend", updateStyles);
        };
    }, [map, source]);

    function handleClick() {
        if (source) {
            map.addInteraction(draw);
            source.once("addfeature", handleAddFeature);
        }
    }

    function handleAddFeature(e: VectorSourceEvent) {
        const currentResolution = map.getView().getResolution();
        if (currentResolution) {
            e.feature?.setStyle((f) => trainStationStyle(f, currentResolution));
        }
        map.removeInteraction(draw);
    }

    useEffect(() => {
        if (drawingLayer) {
            setSource(drawingLayer.getSource());
        }
    }, []);

    useEffect(() => {
        if (drawingLayer) {
            setVectorLayers((old) => [...old, drawingLayer]);
        }
    }, []);

    return <button onClick={handleClick}>Draw train station</button>;
}

export default DrawTrainStationButton;
