import {NamedLocation, Station} from "./types";

const MAX_SCREENSIZE_MOBILE = 768;

const INVALID_COORDINATES = {
  latitude: -1,
  longitude: -1
};

const INVALID_LOCATION: NamedLocation = {
  name: "",
  coords: INVALID_COORDINATES
}

const INVALID_STATION: Station = {
  id: -1,
  name: "",
  address: "",
  postalCode: "",
  city: ""
}

export {
  INVALID_COORDINATES,
  INVALID_LOCATION,
  INVALID_STATION,
  MAX_SCREENSIZE_MOBILE
};
