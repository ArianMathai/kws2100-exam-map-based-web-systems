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

interface coordinates {
  coordinates: number[];
}

interface Vehicle {
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

  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
/*
  const vehicleSource = useMemo(() => {
    console.log("Vehicles:", vehicles);
    return new VectorSource({
      features: vehicles?.map(
          (v) => new Feature(new Point(v.location.coordinates)),
      ),
    });
  }, [vehicles]);

  const vehicleLayer = useMemo(() => {
    return new VectorLayer({
      source: vehicleSource,
    });
  }, [vehicleSource]);

 */

  const [webSocket, setWebSocket] = useState<WebSocket | undefined>(undefined);

  const mapRef = useRef() as MutableRefObject<HTMLDivElement>;

  const [vectorLayers, setVectorLayers] = useState<Layer[]>([drawingLayer]);

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
        vehicles(codespaceId:"SKY") {
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
        const data = JSON.parse(event.data);

        const vehiclesFound: Vehicle[] = [];

        if (data.data.vehicles.length != 0) {
          //console.log("Message received:", data.data.vehicles);
          data.data.vehicles.forEach((v: Vehicle) => {
            /*
            console.log("-------------------------------------");
            console.log("Vehicle Id : " + v.vehicleId);
            //console.log("Latitude :" + v.location.coordinates[0]);
            //console.log("Latitude :" + v.location.coordinates[1]);
            console.log("Last updated :" + v.lastUpdated);
            console.log("Delay: " + v.delay);
            console.log("-------------------------------------");

             */



            if (!vehicles.some((vehicle) => vehicle.vehicleId === v.vehicleId)) {
              vehiclesFound.push(v);
            }

          });

        }

        if(vehiclesFound.length > 0) {

          setVehicles((old) => [...old, ...vehiclesFound]);

        }


      };

      ws.onclose = () => {
        console.log("WebSocket disconnected. Attempting to reconnect...");
        // Attempt to reconnect after 1 minute
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
    console.log("Vehicle Array length")
    console.log(vehicles.length);
  }, [vehicles]);

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
