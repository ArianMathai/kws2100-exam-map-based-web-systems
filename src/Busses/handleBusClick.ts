import { MapBrowserEvent } from "ol";
import { FeatureLike } from "ol/Feature";
import { map } from "../context/MapContext";
import { OccupancyStatus, Vehicle } from "../trains/trainTypes";
import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";

interface HandleBusClickParams {
  e: MapBrowserEvent<PointerEvent>;
  setClickedFeature: (feature: Vehicle | undefined) => void;
  busLayer: VectorLayer<VectorSource>;
}

function handleBusClick({
  e,
  setClickedFeature,
  busLayer,
}: HandleBusClickParams) {
  console.log("Wihthin here");
  const features: FeatureLike[] = [];

  map.forEachFeatureAtPixel(e.pixel, (f) => features.push(f), {
    layerFilter: (l) => l === busLayer,
    hitTolerance: 10,
  });

  if (features.length === 1) {
    const vehicleFeature = features[0] as FeatureLike;
    const vehicleProperties = vehicleFeature.getProperties();
    const clickedVehicle: Vehicle = {
      line: vehicleProperties.line,
      vehicleId: vehicleProperties.vehicleId,
      delay: vehicleProperties.delay,
      lastUpdated: vehicleProperties.lastUpdated,
      location: vehicleProperties.location,
      originName: vehicleProperties.originName,
      inCongestion: vehicleProperties.inCongestion,
      destinationName: vehicleProperties.destinationName,
      occupancy: vehicleProperties.occupancy,
    };

    setClickedFeature(clickedVehicle);
  } else {
    setClickedFeature(undefined);
  }
}

export default handleBusClick;
