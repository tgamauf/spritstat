import {NamedLocation} from "./types";

const TIMEZONE = Intl.DateTimeFormat().resolvedOptions().timeZone;

const MAX_SCREENSIZE_MOBILE = 768;

const INVALID_COORDINATES = {
  latitude: -1,
  longitude: -1
};

const INVALID_LOCATION: NamedLocation = {
  name: "",
  coords: INVALID_COORDINATES
}

const LOCATION_REQUEST_TIMEOUT_MS = 5000;

export {
  INVALID_COORDINATES,
  INVALID_LOCATION,
  LOCATION_REQUEST_TIMEOUT_MS,
  MAX_SCREENSIZE_MOBILE,
  TIMEZONE
};
