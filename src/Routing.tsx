import React, {useContext, useEffect, useMemo, useState} from "react";
import {MapContext} from "./context/MapContext";
import VectorSource, {VectorSourceEvent} from "ol/source/Vector";
import {Draw} from "ol/interaction";
import {LineString} from "ol/geom";
import * as ol from 'ol';
import {Coordinate} from "ol/coordinate";

function Routing(){

    const { map, setVectorLayers, drawingLayer } = useContext(MapContext);
    const [source, setSource] = useState<VectorSource | undefined>();
    const draw = useMemo(() => new Draw({ source, type: "LineString", maxPoints: 2 }), [source]);

    const [origin, setOrigin] = useState<Coordinate | undefined>(undefined);
    const [destination, setDestination] = useState<Coordinate | undefined>(undefined);
    const [requestUrl, setRequestUrl] = useState<string>("");
    const [route, setRoute] = useState<Coordinate[]>([]);

    const osrmBaseUrl = 'https://router.project-osrm.org/route/v1'; // OSRM API base URL



    async function fetchRoute(){
        console.log("Request url ", requestUrl)
        fetch(requestUrl)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Failed to fetch route data');
                }
                return response.json();
            })
            .then(data => {
                // Parse the route data
                const route = data.routes[0];
                const distance = route.distance; // Distance in meters
                const duration = route.duration; // Duration in seconds
                const geometry = route.geometry; // Route geometry (e.g., polyline)

                // Do something with the route data
                console.log('Distance:', distance, 'meters');
                console.log('Duration:', duration, 'seconds');
                console.log('Route Geometry:', geometry);
            })
            .catch(error => {
                console.error('Error fetching route data:', error);
            });
    }

    useEffect(() => {
        if (drawingLayer) {
            setSource(drawingLayer.getSource()!);
        }
    }, []);

    function handleDrawLine(e: VectorSourceEvent){
        const lineFeature = e.feature;
        const lineGeometry = lineFeature?.getGeometry() as LineString;

        let coordinates;

        if (lineGeometry) {
            coordinates = lineGeometry.getCoordinates();
            console.log('Drawn Line Coordinates:', coordinates);
            setOrigin(coordinates[0]);
            setDestination(coordinates[1])

        }

        map.removeInteraction(draw);


    }

    function handleClick() {
        if (source) {
            map.addInteraction(draw);
            source.once("addfeature", handleDrawLine);
        }
    }

    useEffect(() => {
        if (requestUrl){
            fetchRoute();
        }
    }, [requestUrl]);

    useEffect(() => {
        if (origin && destination){
            setRequestUrl(`${osrmBaseUrl}/driving/${origin[0]},${origin[1]};${destination[0]},${destination[1]}?geometries=geojson`)
        }
    }, [origin, destination]);




    return (
        <>
            <button onClick={handleClick}>Calculate route</button>
        </>
    )
}

export default Routing;