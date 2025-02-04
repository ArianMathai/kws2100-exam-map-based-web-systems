import { useEffect, useMemo, useState } from "react";
import { Feature } from "ol";
import { Point } from "ol/geom";
import { Vehicle } from "../trains/trainTypes";
import VectorSource from "ol/source/Vector";
import { busStyle } from "../style/styles";
import VectorLayer from "ol/layer/Vector";
import { fromLonLat } from "ol/proj";

export function useBusData(busCompany: string) {
  //Either empty array or fetched from session storage.
  const [busArray, setBusArray] = useState<Vehicle[] | []>(
    JSON.parse(sessionStorage.getItem("busArray") || "[]"),
  );

  const [webSocket, setWebSocket] = useState<WebSocket | undefined>(undefined);

  useEffect(() => {
    sessionStorage.setItem("busArray", JSON.stringify(busArray)); //Filling session storage each time busArray changes.
  }, [busArray]);

  useEffect(() => {
    if (webSocket) {
      setBusArray([]);
      sessionStorage.setItem("busArray", JSON.stringify(busArray));
      webSocket.close();
    }

    if (busCompany && busCompany != "default") {
      //When Bus Company changes and its not default, then a new websocket should be created and Bus Array filled with new buses.
      setBusArray([]);
      sessionStorage.setItem("busArray", JSON.stringify(busArray));
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
                            destinationName
                            inCongestion
                            originName
                            occupancy
                         
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

      connectWebSocket();
    }

    return () => {
      if (webSocket) {
        webSocket.close();
      }
    };
  }, [busCompany]); // Trigger the effect whenever busCompany changes

  const busSource = useMemo(() => {
    const features = busArray.map((bus) => {
      const feature = new Feature(
        new Point(fromLonLat([bus.location.longitude, bus.location.latitude])),
      );
      feature.setStyle(busStyle);
      feature.setProperties({
        id: bus.vehicleId,
        delay: bus.delay,
        lastUpdated: bus.lastUpdated,
        location: bus.location,
        destinationName: bus.destinationName,
        inCongestion: bus.inCongestion,
        originName: bus.originName,
        occupancy: bus.occupancy,
      });

      return feature;
    });

    return new VectorSource({
      features: features,
    });
  }, [busArray]);

  const busLayer = useMemo(() => {
    return new VectorLayer({
      source: busSource,
    });
  }, [busSource]);

  return { busArray, setBusArray, busSource, busLayer };
}
