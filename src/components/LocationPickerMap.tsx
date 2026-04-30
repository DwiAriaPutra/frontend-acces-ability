"use client";

import { CircleMarker, MapContainer, TileLayer, useMapEvents } from "react-leaflet";

export type Coordinates = {
  lat: number;
  lng: number;
};

type LocationPickerMapProps = {
  center: [number, number];
  value: Coordinates | null;
  onChange: (coordinates: Coordinates) => void;
};

function MapClickHandler({ onChange }: { onChange: (coordinates: Coordinates) => void }) {
  useMapEvents({
    click(event) {
      onChange({ lat: event.latlng.lat, lng: event.latlng.lng });
    },
  });

  return null;
}

export default function LocationPickerMap({ center, value, onChange }: LocationPickerMapProps) {
  return (
    <div className="overflow-hidden rounded-3xl border border-gray-200 shadow-sm">
      <MapContainer center={center} zoom={13} scrollWheelZoom className="h-[360px] w-full">
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapClickHandler onChange={onChange} />
        {value ? (
          <CircleMarker center={[value.lat, value.lng]} radius={10} pathOptions={{ color: "#16a34a", fillColor: "#16a34a", fillOpacity: 0.35 }} />
        ) : null}
      </MapContainer>
    </div>
  );
}