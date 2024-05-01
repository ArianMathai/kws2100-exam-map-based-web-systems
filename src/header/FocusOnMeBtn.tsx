import React, { useContext, useEffect, useState } from "react";
import { MapContext } from "../context/MapContext";
import { fromLonLat } from "ol/proj";
function FocusOnMeBtn() {
  const { map } = useContext(MapContext);

  const [lat, setLat] = useState<number>();
  const [long, setLong] = useState<number>();

  function handleLoadCoords() {
    navigator.geolocation.getCurrentPosition((pos) => {
      const { latitude, longitude } = pos.coords;
      setLong(longitude);
      setLat(latitude);
    });
  }

  function handleFocusOnMe(e: React.MouseEvent) {
    e.preventDefault();
    if (lat && long) {
      map.getView().animate({
        center: fromLonLat([long, lat]),
        zoom: 19,
      });
    }
  }

  useEffect(() => {
    handleLoadCoords();
  }, []);

  return (
    <button
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        height: "auto",
      }}
      onClick={handleFocusOnMe}
    >
      <span className="material-symbols-outlined">my_location</span>Focus on me
    </button>
  );
}

export default FocusOnMeBtn;
