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
import {Circle, Fill, Stroke, Style} from "ol/style";
import CircleStyle from "ol/style/Circle";
import {log} from "ol/console";

interface coordinates {
  latitude:number;
  longitude: number;
}

interface lineRef{
  lineRef:string
}

interface Vehicle {
  line:lineRef;
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

// Create a style for the point feature
  const pointStyle = new Style({
    image: new CircleStyle({
      radius: 5, // Radius of the point in pixels
      fill: new Fill({
        color: 'blue', // Fill color
      }),
      stroke: new Stroke({
        color: 'white', // Stroke color
        width: 1, // Stroke width
      }),
    }),
  });

  const vehicleSource = useMemo(() => {
    console.log()
    return new VectorSource({
      features: vehicles.map((v) => {
        const feature = new Feature(new Point([9, 60]));
        const style = new Style({
          image: new Circle({
            radius: 6,
            fill: new Fill({
              color: 'blue', // You can set any color you prefer
            }),
          }),
        });
        feature.setStyle(style);
        return feature;
      }),
    });
  }, [vehicles]);



  const vehicleLayer = useMemo(() => {
    return new VectorLayer({
      source: vehicleSource,
    });
  }, [vehicleSource]);



  const [webSocket, setWebSocket] = useState<WebSocket | undefined>(undefined);

  const mapRef = useRef() as MutableRefObject<HTMLDivElement>;

  const [vectorLayers, setVectorLayers] = useState<Layer[]>([drawingLayer,vehicleLayer]);

  const allLayers = useMemo(() => [baseLayer, ...vectorLayers], [baseLayer]);

  const [trainArray, setTrainArray] = useState<Vehicle[]>([]);

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
        let trains:Vehicle[] = [];
        const message = JSON.parse(event.data);
        if (message && message.data && message.data.vehicles) {
          if (message.data.vehicles.length > 0) {
            const receivedVehicles: Vehicle[] = message.data.vehicles;
            receivedVehicles.forEach((receivedVehicle) => {
              if (!trainArray.some((train) => train.vehicleId === receivedVehicle.vehicleId)) {
                trains.push(receivedVehicle);
              } else {
                console.log(`Vehicle with ID ${receivedVehicle.vehicleId} already exists in trainArray`);
              }
            });

          }
        }

        // @ts-ignore
        setTrainArray((old) => [...old,...trains]);

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
    if(trainArray.length > 0){
      console.log("Train Array: " + trainArray.length);
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
