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

function App() {
  const [baseLayer, setBaseLayer] = useState<Layer>(
    new TileLayer({ source: new OSM() }),
  );

  const [webSocket, setWebSocket] = useState<WebSocket | undefined>(undefined)

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
        const ws = new WebSocket('wss://api.entur.io/realtime/v1/vehicles/subscriptions');

        ws.onopen = () => {
          const subscriptionMessage = JSON.stringify({
            query: `subscription {
        vehicles(codespaceId:"SKY") {
          lastUpdated
          location {
            latitude
            longitude
          }
        }
      }`
          });
          ws.send(subscriptionMessage);
        };

        ws.onmessage = (event) => {
          const data = JSON.parse(event.data)

          if(data.data.vehicles.length != 0){
            console.log('Message received:', data.data.vehicles);
          }

        };

        ws.onclose = () => {
          console.log('WebSocket disconnected. Attempting to reconnect...');
          // Attempt to reconnect after 1 minute
          setTimeout(() => {
            connectWebSocket();
          }, 60000);
        };

        ws.onerror = (error) => {
          console.error('WebSocket error:', error);
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
        </nav>
      </header>
      <div ref={mapRef}></div>
    </MapContext.Provider>
  );
}

export default App;
