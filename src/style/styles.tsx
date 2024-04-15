import {FeatureLike} from "ol/Feature";
import {Circle, Fill, Icon, Stroke, Style} from "ol/style";

export function trainStationStyle(f: FeatureLike, resolution: number) {
    const radius = Math.min(6000 / resolution, 20);
    return [
        new Style({
            image: new Circle({
                radius,
                fill: new Fill({ color: "white" }),
                stroke: new Stroke({ color: "black", width: 3 }),
            }),
        }),
        ...(resolution < 100
            ? [
                new Style({
                    image: new Icon({
                        src: "/kws-exam-2024/boat.svg",
                        scale: radius / 10, // Adjust scale based on radius
                    }),
                }),
            ]
            : []),
    ];
}