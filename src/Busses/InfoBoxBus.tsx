import React from "react";
import { Vehicle } from "../trains/trainTypes";
import { getMinutes } from "../utils/getMinutes";

interface InfoBoxBusProps {
  clickedFeature: Vehicle | undefined;
}

function InfoBoxBus({ clickedFeature }: InfoBoxBusProps) {
  if (!clickedFeature) return null;

  return (
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
  );
}

export default InfoBoxBus;
