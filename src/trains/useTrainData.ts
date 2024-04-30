import { useEffect, useMemo, useState } from "react";
import { Feature } from "ol";
import { LineString, Point } from "ol/geom";
import { Train, Vehicle } from "./trainTypes";
import VectorSource, { VectorSourceEvent } from "ol/source/Vector";
import { trainStyle } from "../style/styles";
import VectorLayer from "ol/layer/Vector";
import { Stroke, Style } from "ol/style";
import { fromLonLat } from "ol/proj";

export function useTrainData() {
  const [trainArray, setTrainArray] = useState<Train[] | []>(
    JSON.parse(sessionStorage.getItem("trainArray") || "[]"),
  );
  const [webSocket, setWebSocket] = useState<WebSocket | undefined>(undefined);

  useEffect(() => {
    sessionStorage.setItem("trainArray", JSON.stringify(trainArray));
  }, [trainArray]);

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
        const message = JSON.parse(event.data);
        if (message && message.data && message.data.vehicles) {
          if (message.data.vehicles.length > 0) {
            const receivedVehicles: Train[] = message.data.vehicles;
            receivedVehicles.forEach((receivedVehicle) => {
              setTrainArray((prevTrainArray) => {
                if (
                  !prevTrainArray.some(
                    (train) => train.vehicleId === receivedVehicle.vehicleId,
                  )
                ) {
                  receivedVehicle.history = [];
                  return [...prevTrainArray, receivedVehicle];
                } else {
                  return prevTrainArray.map((train) => {
                    if (train.vehicleId === receivedVehicle.vehicleId) {
                      const updatedHistory = [
                        ...(train.history || []),
                        train.location,
                      ];
                      return {
                        ...train,
                        history: updatedHistory,
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

  const trainSource = useMemo(() => {
    const features = trainArray.map((train) => {
      //console.log("Train: ", train)
      const feature = new Feature(
        new Point(
          fromLonLat([train.location.longitude, train.location.latitude]),
        ),
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

  const trainLayer = useMemo(() => {
    return new VectorLayer({
      source: trainSource,
    });
  }, [trainSource]);

  const trainTrailSource = useMemo(() => {
    //console.log("Train array history, ", trainArray.map((t) => t.history))
    const filteredFeatures = trainArray
      .filter((t) => t.history && t.history.length >= 2)
      .map((tr) => {
        const coordinates = tr.history.map((p) => [p.longitude, p.latitude]);
        const lineStringFeature = new Feature(new LineString(coordinates));
        lineStringFeature.setStyle(
          new Style({
            stroke: new Stroke({
              color: "red",
              width: 3,
            }),
          }),
        );
        return lineStringFeature;
      });

    return new VectorSource({
      features: filteredFeatures,
    });
  }, [trainArray]);

  const trainTrailLayer = useMemo(() => {
    return new VectorLayer({
      source: trainTrailSource,
    });
  }, [trainTrailSource]);

  return { trainArray, setTrainArray, trainTrailLayer, trainLayer };
}
