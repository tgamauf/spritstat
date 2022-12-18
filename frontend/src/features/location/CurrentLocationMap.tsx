import React, {useCallback, useEffect, useState} from "react";
import {useIntl} from "react-intl";

import MapField, {MapMarker, MAP_FIELD_DEFAULT_ZOOM} from "../../common/components/MapField";
import {INVALID_COORDINATES} from "../../common/constants";
import {useAppDispatch, useAppSelector} from "../../common/utils";
import {
  getCoordinates,
  PositionPermissionStatus,
  selectCoordinates,
  selectPermissionStatus,
  selectPositionError
} from "../../common/components/CurrentPosition";
import CenteredBox from "../../common/components/CenteredBox";
import {useLazyGetCurrentPriceQuery} from "./priceApiSlice";
import {FuelType, LocationType} from "../../common/types";
import {FuelTypeButtonGroup} from "../../common/components/FuelTypeButtonGroup";

// Use the coordinates of the center of Austria as default.
const AUSTRIA_CENTER = {latitude: 47.5162, longitude: 14.5501};
const AUSTRIA_ZOOM = 7;

export default function CurrentLocationMap(): JSX.Element {
  const positionPermission = useAppSelector(selectPermissionStatus);
  const currentPosition = useAppSelector(selectCoordinates);
  const positionError = useAppSelector(selectPositionError);
  const dispatch = useAppDispatch();
  const intl = useIntl();
  const [loading, setLoading] = useState(true);
  const [
    getPriceData,
    {
      data: priceData,
      error,
      isError,
      isSuccess
    }
  ] = useLazyGetCurrentPriceQuery();
  const [fuelType, setFuelType] = useState<FuelType>(FuelType.Super);
  const [stations, setStations] = useState<MapMarker[]>([]);

  const currentLocationTitle = intl.formatMessage({
    description: "CurrentLocationMap current location",
    defaultMessage: "Dein aktueller Ort."
  });

  useEffect(() => {
    if ((positionError !== undefined) ||
      (positionPermission === PositionPermissionStatus.DENIED)) {
      // If the current position or the permission error exists, disable the
      //  loading state as it is obviously done now.
      console.log(`CurrentLocationMap [1]`);//TODO


      setLoading(false);
    }
  }, [positionError, positionPermission]);

  useEffect(() => {
    if (currentPosition !== INVALID_COORDINATES) {
      getPriceData({
        id: -1,
        type: LocationType.Named,
        name: "Current Location",
        latitude: currentPosition.latitude,
        longitude: currentPosition.longitude,
        fuelType: FuelType.Super //TODO we need to adapt that
      });
      setLoading(false);
    }
  }, [currentPosition]);

  // useEffect(() => {
  //   if (isSuccess && priceData) {
  //     // TODO need to adap this
  //     for (const s of priceData.stations) {
  //       stations_.push({
  //         id: s.id,
  //         name: s.name,
  //         address: s.address,
  //         postalCode: s.postalCode,
  //         city: s.city,
  //         url: createMapsURL(s),
  //       });
  //     }
  //   }
  // }, [isSuccess]);

  useEffect(() => {
    if (isError) {
      console.error(`Get stations failed: ${JSON.stringify(error, null, 2)}`);
    }
  }, [isError]);

  useEffect(() => {
    if (isError) {
      console.error(`Get stations failed: ${JSON.stringify(error, null, 2)}`);
    }
  }, [isError]);

  function loadPosition() {
    dispatch(getCoordinates());
    setLoading(true);
  }

  //TODO
  const buttonRef = useCallback((ref: HTMLParagraphElement) => {
    if (ref) {
      if ((positionPermission === PositionPermissionStatus.GRANTED) ||
        (positionPermission === PositionPermissionStatus.PROMPT)) {
        ref.classList.remove("is-static");
      } else {
        ref.classList.add("is-static");
      }
    }
  }, [positionPermission]);


  //TODO I think I will change the whole process - show a map from the start and
  // then pan to the location as soon as it is available. If an error occurs we
  // show the error message as usual.
  //TODO While the default map is shown we should show an half-transparent overlay
  // with either a button to request the current location or a loading indicator.
  //TODO If the user disables the location permission we remove the whole section
  // completely and show an info message that the user has to enable the location
  // permission to use this feature.

  let center, marker: Array<MapMarker>, zoom, onClick;
  if (currentPosition === INVALID_COORDINATES) {
    center = AUSTRIA_CENTER;
    marker = [];
    zoom = AUSTRIA_ZOOM;
    onClick = loadPosition;
  } else {
    center = currentPosition;
    marker = [{coordinates: currentPosition, title: currentLocationTitle}]; //TODO this should include the stations
    zoom = MAP_FIELD_DEFAULT_ZOOM;
    onClick = undefined;
  }

  console.log(`CurrentLocationMap [0] center: ${JSON.stringify(center, null, 2)}, marker: ${JSON.stringify(marker, null, 2)}`);//TODO

  return (
    <div>
      <div className="container">
        <h1 className="title">
          {intl.formatMessage({
            description: "CurrentLocation title",
            defaultMessage: "Aktueller Ort"
          })}
        </h1>
        <CenteredBox>
          <FuelTypeButtonGroup value={fuelType} setSelected={setFuelType} />
          <MapField
            center={center}
            marker={marker}
            zoom={zoom}
            loading={loading}
            onClick={onClick}
          />
        </CenteredBox>
      </div>
    </div>
  );
};

export {CurrentLocationMap};
