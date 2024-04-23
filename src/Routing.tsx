import React, {ChangeEvent, useContext, useEffect, useMemo, useState} from "react";
import {MapContext} from "./context/MapContext";
import VectorSource, {VectorSourceEvent} from "ol/source/Vector";
import {Draw} from "ol/interaction";
import {LineString} from "ol/geom";

import {Coordinate} from "ol/coordinate";
import {Feature} from "ol";
import {Stroke, Style} from "ol/style";
import {getMinutes} from "./getMinutes";

function Routing(){

    const { map, setVectorLayers, drawingLayer } = useContext(MapContext);
    const [source, setSource] = useState<VectorSource | undefined>();
    const draw = useMemo(() => new Draw({ source, type: "LineString", maxPoints: 2 }), [source]);
    const drawRoute = useMemo(() => new Draw({source, type: "LineString"}), [source]);

    const [origin, setOrigin] = useState<Coordinate | undefined>(undefined);
    const [destination, setDestination] = useState<Coordinate | undefined>(undefined);
    const [requestUrl, setRequestUrl] = useState<string>("");
    const [route, setRoute] = useState<Coordinate[]>([]);
    const [routeFeature, setRouteFeature] = useState<Feature | undefined>();
    const [distance, setDistance] = useState<number>();
    const [duration, setDuration] = useState<number>();
    const [selectedOption, setSelectedOption] = useState<string>("default");
    const [errorMessage, setErrorMessage] = useState<string>("")

    const osrmBaseUrl = 'https://router.project-osrm.org/route/v1';
    const transportOptions = [
        { value: "default", label: "Choose mode of transportation"},
        { value: "driving", label: "Car" },
        { value: "walking", label: "Walking" },
        { value: "cycling", label: "Bicycling" },
    ];


/*
    async function fetchRoute(){
        setErrorMessage("");
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

                console.log('Distance:', distance, 'meters');
                console.log("between")
                console.log('Duration:', duration, 'seconds');
                console.log('Route Geometry:', geometry.coordinates);
                setDistance(Math.round(distance / 1000)); // In km
                setDuration(Math.round(duration / 60)); // In min
                setRoute(geometry.coordinates);
            })
            .catch(error => {
                console.error('Error fetching route data:', error);
                setErrorMessage("Error fetching route . \n\r Choose mode of transportation");
            });
    }

 */
    async function fetchRoute(){
        setErrorMessage("");
        console.log("Request url ", requestUrl);
        try {
            const response = await fetch(requestUrl);
            if (!response.ok) {
                throw new Error('Failed to fetch route data');
            }
            const data = await response.json();
            // Parse the route data
            const route = data.routes[0];
            const distance = route.distance; // Distance in meters
            const duration = route.duration; // Duration in seconds
            const geometry = route.geometry; // Route geometry (e.g., polyline)

            console.log('Distance:', distance, 'meters');
            console.log('Duration:', duration, 'seconds');
            console.log('Route Geometry:', geometry.coordinates);
            setDistance(Math.round(distance / 1000)); // In km
            setDuration(Math.round(duration / 60)); // In min
            setRoute(geometry.coordinates);
        } catch (error) {
            console.error('Error fetching route data:', error);
            setErrorMessage("Error fetching route data. Please choose mode of transportation.");
        }
    }

    useEffect(() => {
        if (route.length > 0){
            console.log("Route in route, ", route);

        }
    }, [route]);

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
    const handleChange = (event: ChangeEvent<HTMLSelectElement>) => {
        setSelectedOption(event.target.value);
    };

    function handleClick() {
        source?.clear();
        if (selectedOption === "default") {
            setErrorMessage("Choose mode of transportation to calculate route");
            return;
        }

        if (source) {
            map.addInteraction(draw);
            source.once("addfeature", handleDrawLine);
        }
    }

    useEffect(() => {
        if (route.length > 0) {
            const lineString = new LineString(route);
            const routeFeature = new Feature({ geometry: lineString });
            routeFeature.setStyle(new Style({
                stroke: new Stroke({
                    color: 'blue',
                    width: 4
                })
            }));
            setRouteFeature(routeFeature);
        }
    }, [route]);

    useEffect(() => {
        if (routeFeature && source) {
            source.clear();
            source.addFeature(routeFeature);
        }
    }, [routeFeature, source]);

    useEffect(() => {
        if (requestUrl){
            fetchRoute();
        }
    }, [requestUrl]);
    /*
    useEffect(() => {
        console.log("distance after ", distance)
        console.log("duration after ", duration)
        console.log("selected option ", selectedOption)
    }, [distance, duration, selectedOption]);

     */

    useEffect(() => {
        console.log("Selected Option:", selectedOption);
        if (origin && destination && selectedOption !== "default"){
            setRequestUrl(`${osrmBaseUrl}/${selectedOption}/${origin[0]},${origin[1]};${destination[0]},${destination[1]}?geometries=geojson`)
        }
    }, [origin, destination, selectedOption]);

    useEffect(() => {
        if (errorMessage.length > 1)
            console.log(errorMessage)
    }, [errorMessage]);




    return (
        <>
            <button onClick={handleClick}>Calculate route{" "}
                <select
                    className={"baseLayer_select"}
                    value={selectedOption}
                    onChange={handleChange}
                >
                    {transportOptions.map((option, index) => (
                        <option key={index} value={option.value}>
                            {option.label}
                        </option>
                    ))}
                </select></button>

            {distance && duration ? (
                <div className={"clickedFeature"}>
                    <div className={"clickedFeatureBox"}>
                        <p>Distance: {distance} km</p>
                        {duration >= 60 ? (
                            <p>Duration: {Math.floor(duration / 60)} hours {duration % 60} min</p>
                        ) : (
                            <p>Duration: {duration} min</p>
                        )}
                    </div>
                </div>
            ) : null}
            {errorMessage && (
                <div className={"showInfo"}>
                    <p>{errorMessage}</p>
                </div>
            )}
        </>
    );

}

export default Routing;