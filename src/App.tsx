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
import { Circle, Fill, Icon, Stroke, Style } from "ol/style";
import CircleStyle from "ol/style/Circle";
import { FeatureLike } from "ol/Feature";
import TrainStationsCheckbox from "./trains/TrainStationsCheckbox";

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

type VehicleFeatures = { getProperties(): Vehicle } & Feature<Point>;

interface Data {
  data: {
    vehicles: Vehicle[];
  };
}

function trainStyle(f: FeatureLike, resolution: number) {
  const trainFeature = f as VehicleFeatures;
  const radius = Math.min(2000 / resolution, 5);

  // Check the delay of the train
  const train = trainFeature.getProperties();

  console.log("DELAY: " + train.delay);

  return [
    // Style for the icon
    new Style({
      image: new Icon({
        src: "/kws-exam-2024/train.png",
        scale: radius / 10, // Adjust scale based on radius
      }),
    }),
    // Style for the stroke around the icon
    new Style({
      image: new Circle({
        radius: radius + 5, // Adjust the radius to fit the icon
        stroke: new Stroke({
          color: train.delay > 0 ? "Red" : "Green",
          width: 2,
        }),
      }),
    }),
  ];
}

function App() {
  const [baseLayer, setBaseLayer] = useState<Layer>(
    new TileLayer({ source: new OSM() }),
  );

  const [trainArray, setTrainArray] = useState<Vehicle[]>([]);

  //const [busses, setBusses] = useState<Vehicle[]>([]);

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

  const vehicleSource = useMemo(() => {
    const features = trainArray.map((train) => {
      const feature = new Feature(
        new Point([train.location.longitude, train.location.latitude]),
      );
      feature.setStyle(trainStyle);
      feature.setProperties({
        id: train.vehicleId,
        delay: train.delay,
      });
      return feature;
    });

    return new VectorSource({
      features: features,
    });
  }, [trainArray]);

  const vehicleLayer = useMemo(() => {
    console.log("Layer recreated!");
    return new VectorLayer({
      source: vehicleSource,
    });
  }, [vehicleSource]);

  const [webSocket, setWebSocket] = useState<WebSocket | undefined>(undefined);

  const mapRef = useRef() as MutableRefObject<HTMLDivElement>;

  const [vectorLayers, setVectorLayers] = useState<Layer[]>([drawingLayer]);

  const allLayers = useMemo(
    () => [baseLayer, ...vectorLayers, vehicleLayer],
    [baseLayer, vectorLayers, vehicleLayer],
  );

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
              console.log("Received Vehicle:", receivedVehicle);
              setTrainArray((prevTrainArray) => {
                if (
                  !prevTrainArray.some(
                    (train) => train.vehicleId === receivedVehicle.vehicleId,
                  )
                ) {
                  // Add the vehicle to the array
                  return [...prevTrainArray, receivedVehicle];
                } else {
                  console.log(
                    `Vehicle with ID ${receivedVehicle.vehicleId} already exists in trainArray`,
                  );
                  // Update the location of the existing vehicle
                  return prevTrainArray.map((train) => {
                    if (train.vehicleId === receivedVehicle.vehicleId) {
                      return {
                        ...train,
                        location: {
                          latitude: receivedVehicle.location.latitude,
                          longitude: receivedVehicle.location.longitude,
                        },
                      };
                    } else {
                      return train;
                    }
                  });
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
          <TrainStationsCheckbox />
        </nav>
      </header>
      <div ref={mapRef}></div>
    </MapContext.Provider>
  );
}

export default App;
