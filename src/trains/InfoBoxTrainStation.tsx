import { Feature } from "ol";
import { TrainstationProperties } from "./trainTypes";
import React, { useContext } from "react";
import { MapContext } from "../context/MapContext";

function InfoBoxTrainStation({
  featuresWithinDistance,
  isBoxOpen,
  setIsBoxOpen,
}: {
  featuresWithinDistance: Feature[] | [];
  isBoxOpen: boolean;
  setIsBoxOpen: (isOpen: boolean) => void;
}) {
  const trainStations = featuresWithinDistance.map(
    (f) => f.getProperties() as TrainstationProperties,
  );

  const { drawingLayer } = useContext(MapContext);

  if (trainStations.length <= 0 || !isBoxOpen) {
    return null;
  }

  const closeBox = () => {
    setIsBoxOpen(false);
    drawingLayer.getSource()?.clear();
  };

  return trainStations?.length ? (
    <div className={"markedFeatures"}>
      <button onClick={closeBox}>X</button>
      <p>{trainStations.length + " train stations within your circle."}</p>
      <ul>
        {trainStations.map((station, index) => (
          <li key={index}>
            <div className={"markedFeatureBox"}>
              <p>
                Distance:{" "}
                {station.distance !== undefined
                  ? (station.distance / 1000).toFixed(2) + " kilometers"
                  : "Unknown"}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  ) : null;
}

export default InfoBoxTrainStation;
