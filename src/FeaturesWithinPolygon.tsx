import React, { useState } from "react";
import { Feature } from "ol";
import { Vehicle } from "./trains/trainTypes"; // Assuming types.ts contains the definition of Vehicle interface

function FeaturesWithinPolygon({
  features,
  isBoxOpen,
  setIsBoxOpen,
}: {
  features: Feature[];
  isBoxOpen: boolean;
  setIsBoxOpen: (isOpen: boolean) => void;
}) {
  const vehicles = features?.map((f) => f.getProperties() as Vehicle);

  if (features.length <= 0 || !isBoxOpen) {
    return null;
  }

  const closeBox = () => {
    setIsBoxOpen(false);
  };

  return (
    <div className={"markedFeatures"}>
      <button className="closeButton" onClick={closeBox}>
        X
      </button>
      <ul>
        {vehicles?.map((vehicle, index) => (
          <li key={index}>
            <div className={"markedFeatureBox"}>
              <p>From: {vehicle.originName}</p>
              <p>To: {vehicle.destinationName}</p>
              <p>Delayed? {vehicle.delay > 0 ? "Yes" : "No"}</p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default FeaturesWithinPolygon;
