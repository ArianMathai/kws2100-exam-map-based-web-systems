import React, {useContext, useEffect, useState} from "react";
import {MapContext} from "../../context/MapContext";
function FocusOnMeBtn () {

    const {map} = useContext(MapContext);

    const [lat, setLat] = useState<number>();
    const [long, setLong] = useState<number>();

    function handleLoadCoords(){
        navigator.geolocation.getCurrentPosition((pos) => {
            const { latitude, longitude } = pos.coords;
            console.log(pos.coords);
            setLong(longitude);
            setLat(latitude);
        });
    }

    function handleFocusOnMe(e: React.MouseEvent) {
        e.preventDefault();
        if (lat && long) {
            map.getView().animate({
                center: [long, lat],
                zoom: 19,
            });
        }
    }

    useEffect(() => {
        handleLoadCoords();
    }, []);


    return (
        <button onClick={handleFocusOnMe}>Focus on me</button>
    )

}

export default FocusOnMeBtn;