import { useEffect, useMemo, useState } from "react";
import { Feature } from "ol";
import { Point } from "ol/geom";
import { Vehicle } from "./trainTypes";
import VectorSource from "ol/source/Vector";
import {trainStyle} from "../style/styles";

export function useTrainData() {
  const [trainArray, setTrainArray] = useState<Vehicle[]>([]);
  const [webSocket, setWebSocket] = useState<WebSocket | undefined>(undefined);

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

  return { trainArray, setTrainArray, trainSource: vehicleSource };
}
