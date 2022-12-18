import React, {useEffect, useRef, useState} from "react";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faMapLocationDot} from "@fortawesome/free-solid-svg-icons";

import {Coordinates, GoogleMapsAPI, loadGoogleMapsAPI} from "../apis/google";
import Spinner from "./Spinner";
import {useIntl} from "react-intl";

const DEFAULT_ZOOM = 15;

interface MapMarker {
  coordinates: Coordinates;
  title: string;
}

interface Props {
  center: Coordinates;
  marker: Array<MapMarker>
  zoom: number;
  loading: boolean;
  onClick?: () => void;
}

export default function MapField({center, marker, zoom = DEFAULT_ZOOM, loading, onClick}: Props): JSX.Element {
  const [googleMapsAPI, setGoogleMapsAPI] = useState<GoogleMapsAPI | null>(null);
  const mapRef = useRef() as React.MutableRefObject<HTMLDivElement>;
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [markerObjects, setMarkerObjects] = useState<google.maps.Marker[]>([]);
  const intl = useIntl();

  console.log(`MapField [3] center: ${JSON.stringify(center, null, 2)}, marker: ${JSON.stringify(marker, null, 2)}, zoom: ${zoom}, loading: ${loading}, onClick: ${onClick}, map: ${map}`);//TODO

  useEffect(() => {
    if (!googleMapsAPI) {
      loadGoogleMapsAPI().then((api) => setGoogleMapsAPI(api));
    }
  }, [])

  useEffect(() => {
    if (map === null) {
      if (mapRef.current && googleMapsAPI) {
        console.log(`MapField [0] center coordinates: ${JSON.stringify(center, null, 2)}, zoom: ${zoom}`);//TODO
        const map_ = new googleMapsAPI.Map(
          mapRef.current,
          {center: {lat: center.latitude, lng: center.longitude}, zoom: zoom}
        );
        map_.addListener("click", (event: any) => {
          if (onClick) {
            onClick();
          }
        });

        setMap(map_);
        setMarker();
      }
    }
  }, [googleMapsAPI, mapRef]);

  useEffect(() => {
    if (map) {
      console.log(`MapField [2] center coordinates: ${JSON.stringify(center, null, 2)}, zoom: ${zoom}`);//TODO
      map.panTo({lat: center.latitude, lng: center.longitude});
      map.setZoom(zoom);
      setMarker();
    }
  }, [center, marker, zoom, onClick]);

  function setMarker() {
    if ((googleMapsAPI !== null) && (map !== null)) {
      // Delete all existing markers
      for (const marker_ of markerObjects) {
        marker_.setMap(null);
      }

      for (const {coordinates, title} of marker) {
        console.log(`MapField [1] marker coordinates: ${JSON.stringify(coordinates, null, 2)}, title: ${title}`);//TODO
        const markerObjects_ = []
        const marker_ = new googleMapsAPI.Marker({
          map,
          position: {lat: coordinates.latitude, lng: coordinates.longitude},
          title
        });
        markerObjects_.push(marker_);
        setMarkerObjects(markerObjects_);
      }
    }
  }

  return (
    <div className="map-holder">
      {loading && (
        <div className="map-overlay">
          <div className="map-overlay-content">
            <Spinner />
          </div>
        </div>
      )}
      {(onClick !== undefined) && (
        <div className="map-overlay">
          <div className="map-overlay-content has-text-primary">
            <FontAwesomeIcon
              title={intl.formatMessage({
                description: "MapField enable geolocation",
                defaultMessage: "Lade deinen aktuellen Ort."
              })}
              icon={faMapLocationDot}
              size="8x"
              onClick={onClick}
            />
          </div>
        </div>
      )}
      <div ref={mapRef} className="map" />
    </div>
  );
};

export {MapField, DEFAULT_ZOOM as MAP_FIELD_DEFAULT_ZOOM};
export type {MapMarker};
