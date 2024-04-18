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
import OptionPicker from "./header/select/BaseLayerDropdown";
import Button from "./header/button/Button";
import { drawingLayer, map, MapContext } from "./context/MapContext";
import { Layer } from "ol/layer";
import FocusOnMeBtn from "./header/button/FocusOnMeBtn";
import DrawTrainStationButton from "./header/button/DrawTrainStationButton";
import DrawCircleButton from "./header/button/DrawCircleButton";
import VectorSource from "ol/source/Vector";
import VectorLayer from "ol/layer/Vector";
import { Feature } from "ol";
import { Point } from "ol/geom";
import { Circle, Fill, Stroke, Style } from "ol/style";
import CircleStyle from "ol/style/Circle";
import { log } from "ol/console";
import { fromLonLat } from "ol/proj";

interface coordinates {
  latitude: number;
  longitude: number;
}

interface lineRef {
  lineRef: string;
}

interface Vehicle {
  line: lineRef;
  vehicleId: string;
  delay: number;
  lastUpdated: string;
  location: coordinates;
}

interface Data {
  data: {
    vehicles: Vehicle[];
  };
}

function App() {
  const [baseLayer, setBaseLayer] = useState<Layer>(
    new TileLayer({ source: new OSM() }),
  );

  const [trainArray, setTrainArray] = useState<Vehicle[]>([]);

  const [vehicles, setVehicles] = useState<Vehicle[]>([]);

  // Create a style for the point feature
  const pointStyle = new Style({
    image: new CircleStyle({
      radius: 5, // Radius of the point in pixels
      fill: new Fill({
        color: "blue", // Fill color
      }),
      stroke: new Stroke({
        color: "white", // Stroke color
        width: 1, // Stroke width
      }),
    }),
  });
  /*
  const vehicleSource = useMemo(() => {
    console.log("TRIGGERED!");
    return new VectorSource({
      features: [new Feature(new Point([9, 59]))]
    });
  }, []);

 */

  const trainsTest = [
    {
      long: 10,
      lat: 60,
    },
  ];

  const vehicleSource = useMemo(() => {
    console.log("TRIGGERED!");
    const features = trainArray.map((train) => {
      console.log("Lat: " + train.location.latitude);
      console.log("Long: " + train.location.longitude);
      return new Feature(
        new Point([train.location.latitude, train.location.longitude]),
      );
    });

    return new VectorSource({
      features: features,
    });
  }, [trainArray]);

  const vehicleLayer = useMemo(() => {
    return new VectorLayer({
      source: vehicleSource,
    });
  }, [vehicleSource]);

  const [webSocket, setWebSocket] = useState<WebSocket | undefined>(undefined);

  const mapRef = useRef() as MutableRefObject<HTMLDivElement>;

  const [vectorLayers, setVectorLayers] = useState<Layer[]>([
    drawingLayer,
    vehicleLayer,
  ]);

  const allLayers = useMemo(() => [baseLayer, ...vectorLayers], [baseLayer]);

  useEffect(() => {
    map.setTarget(mapRef.current);
  }, []);

  useEffect(() => {
    map.setLayers(allLayers);
  }, [allLayers]);

  useEffect(() => {
    // Function to initialize the WebSocket connection
    const connectWebSocket = () => {
      const ws = new WebSocket(
        "wss://api.entur.io/realtime/v1/vehicles/subscriptions",
      );

      ws.onopen = () => {
        const subscriptionMessage = JSON.stringify({
          query: `subscription {
        vehicles(mode: RAIL) {
          line {lineRef}
          lastUpdated
          location {
            latitude
            longitude
          }
          delay
          vehicleId
        }
      }`,
        });
        ws.send(subscriptionMessage);
      };

      ws.onmessage = (event) => {
        let trains: Vehicle[] = [];
        const message = JSON.parse(event.data);
        if (message && message.data && message.data.vehicles) {
          if (message.data.vehicles.length > 0) {
            const receivedVehicles: Vehicle[] = message.data.vehicles;
            receivedVehicles.forEach((receivedVehicle) => {
              setTrainArray((prevTrainArray) => {
                if (
                  !prevTrainArray.some(
                    (train) => train.vehicleId === receivedVehicle.vehicleId,
                  )
                ) {
                  return [...prevTrainArray, receivedVehicle]; // Add the vehicle to the array
                } else {
                  console.log(
                    `Vehicle with ID ${receivedVehicle.vehicleId} already exists in trainArray`,
                  );
                  return prevTrainArray; // Return the previous array unchanged
                }
              });
            });
          }
        }
      };

      ws.onclose = () => {
        console.log("WebSocket disconnected. Attempting to reconnect...");
        setTimeout(() => {
          connectWebSocket();
        }, 6000);
      };

      ws.onerror = (error) => {
        console.error("WebSocket error:", error);
        ws.close();
      };

      setWebSocket(ws);
    };

    // Initialize the WebSocket connection
    connectWebSocket();

    // Cleanup function to close the WebSocket when the component unmounts
    return () => {
      if (webSocket) {
        webSocket.close();
      }
    };
  }, []); // Empty dependency array ensures this effect runs only once

  useEffect(() => {
    if (trainArray.length > 0) {
      trainArray.forEach((train) => {
        console.log("Train: ", train);
      });
    }
  }, [trainArray]);

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
          <OptionPicker />
        </nav>
      </header>
      <div ref={mapRef}></div>
    </MapContext.Provider>
  );
}

export default App;
