import { useEffect, useMemo, useState } from "react";
import { Feature } from "ol";
import { Point } from "ol/geom";
import { Vehicle } from "../trains/trainTypes";
import VectorSource from "ol/source/Vector";
import { trainStyle } from "../trains/trainStyles";

export function useBusData(busCompany: string) {
  const [busArray, setBusArray] = useState<Vehicle[]>([]);
  const [webSocket, setWebSocket] = useState<WebSocket | undefined>(undefined);

  useEffect(() => {
    // Close the existing WebSocket connection if it exists
    if (webSocket) {
      setBusArray([]);
      webSocket.close();
    }

    if (busCompany && busCompany != "default") {
      const connectWebSocket = () => {
        const ws = new WebSocket(
          "wss://api.entur.io/realtime/v1/vehicles/subscriptions",
        );

        ws.onopen = () => {
          const subscriptionMessage = JSON.stringify({
            query: `subscription {
                        vehicles(codespaceId:"${busCompany}") {
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
          const message = JSON.parse(event.data);
          if (message && message.data && message.data.vehicles) {
            if (message.data.vehicles.length > 0) {
              const receivedVehicles: Vehicle[] = message.data.vehicles;
              receivedVehicles.forEach((receivedVehicle) => {
                setBusArray((prevBusData) => {
                  if (
                    !prevBusData.some(
                      (bus) => bus.vehicleId === receivedVehicle.vehicleId,
                    )
                  ) {
                    // Add the vehicle to the array
                    return [...prevBusData, receivedVehicle];
                  } else {
                    // Update the location of the existing vehicle
                    return prevBusData.map((bus) => {
                      if (bus.vehicleId === receivedVehicle.vehicleId) {
                        return {
                          ...bus,
                          location: {
                            latitude: receivedVehicle.location.latitude,
                            longitude: receivedVehicle.location.longitude,
                          },
                        };
                      } else {
                        return bus;
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
        };

        ws.onerror = (error) => {
          console.error("WebSocket error:", error);
          ws.close();
        };

        setWebSocket(ws);
      };

      // Initialize the WebSocket connection
      connectWebSocket();
    }

    // Cleanup function to close the WebSocket when the component unmounts or when busCompany changes
    return () => {
      if (webSocket) {
        webSocket.close();
      }
    };
  }, [busCompany]); // Trigger the effect whenever busCompany changes

  const busSource = useMemo(() => {
    const features = busArray.map((bus) => {
      const feature = new Feature(
        new Point([bus.location.longitude, bus.location.latitude]),
      );
      feature.setStyle(trainStyle);
      feature.setProperties({
        id: bus.vehicleId,
        delay: bus.delay,
      });
      return feature;
    });

    return new VectorSource({
      features: features,
    });
  }, [busArray]);

  return { busArray, setBussArray: setBusArray, busSource };
}
