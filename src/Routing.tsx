import React, {ChangeEvent, useContext, useEffect, useMemo, useState} from "react";
import {drawingLayer, MapContext} from "./context/MapContext";
import VectorSource, {VectorSourceEvent} from "ol/source/Vector";
import {Draw} from "ol/interaction";
import {LineString} from "ol/geom";

import {Coordinate} from "ol/coordinate";
import {Feature} from "ol";
import {Stroke, Style} from "ol/style";

interface Step {
    maneuver: {
        bearing_after: number;
        bearing_before: number;
        location: [number, number];
        modifier: string;
        type: string;
    };

    duration: number;
    distance: number;
}

interface Leg {
    steps: Step[];
}

function Routing(){

    const { map, setVectorLayers, drawingLayer } = useContext(MapContext);
    const [source, setSource] = useState<VectorSource | undefined>();
    const draw = useMemo(() => new Draw({ source, type: "LineString", maxPoints: 2 }), [source]);

    const [origin, setOrigin] = useState<Coordinate | undefined>(undefined);
    const [destination, setDestination] = useState<Coordinate | undefined>(undefined);
    const [requestUrl, setRequestUrl] = useState<string>("");
    const [route, setRoute] = useState<Coordinate[]>([]);
    const [routeFeature, setRouteFeature] = useState<Feature | undefined>();
    const [distance, setDistance] = useState<number | null>();
    const [duration, setDuration] = useState<number | null>();
    const [selectedOption, setSelectedOption] = useState<string>("default");
    const [errorMessage, setErrorMessage] = useState<string>("")

    const transportOptions = [
        { value: "default", label: "Choose mode of transportation"},
        { value: "routed-car", label: "Car" },
        { value: "routed-bike", label: "Cycle" },
        { value: "routed-foot", label: "Foot" },
    ];

    async function fetchRoute() {
        //setErrorMessage("");
        console.log("Request duration url ", requestUrl);
        try {
            const response = await fetch(requestUrl);
            if (!response.ok) {
                throw new Error('Failed to fetch route data');
            }
            const data = await response.json();
            const legs: Leg[] = data.routes[0].legs;
            let totalDistance = 0;
            let totalDuration = 0;
            let coordinates: Coordinate[] = [];

            legs.forEach((leg: Leg) => {
                leg.steps.forEach((step: Step) => {
                    const coords = step.maneuver.location;
                    coordinates.push(coords)
                    totalDuration += step.duration;
                    totalDistance += step.distance;
                });
            });
            setDistance(Math.round(totalDistance / 1000)); // In km
            setDuration(Math.round(totalDuration / 60)); // In min
            setRoute(coordinates);
        } catch (error) {
            console.error('Error fetching route data:', error);
            setErrorMessage("Error fetching route data. Please choose mode of transportation.");
        }
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
            setOrigin(coordinates[0]);
            setDestination(coordinates[1])

        }
        map.removeInteraction(draw);
    }
    const handleChange = (event: ChangeEvent<HTMLSelectElement>) => {
        setSelectedOption(event.target.value);
    };

    useEffect(() => {
        if (selectedOption === "default"){
            map.removeInteraction(draw);
        }
    }, [selectedOption]);

    useEffect(() => {
        setTimeout(() => {setErrorMessage("")}, 7000)
    }, [errorMessage]);

    function handleClick() {

        console.log("selected option ", selectedOption)
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

    useEffect(() => {
        if (origin && destination && selectedOption !== "default"){
            setRequestUrl(`https://routing.openstreetmap.de/${selectedOption}/route/v1/routed-foot/${origin[0]},${origin[1]};${destination[0]},${destination[1]}?overview=false&alternatives=true&steps=true`);
        }
    }, [origin, destination, selectedOption]);

    const closeBox = () => {
        setDuration(null);
        setDistance(null);
        drawingLayer.getSource()?.clear();
    };


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
                        <button className="exit-btn" onClick={closeBox}>X</button>
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