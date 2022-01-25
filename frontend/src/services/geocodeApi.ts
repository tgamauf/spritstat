import { Coordinates } from "../utils/types";

const API_URL = "https://maps.googleapis.com/maps/api/geocode/json";
const API_KEY = "AIzaSyCP3LVEJhoLDx9av1_65K2mc1bSsZ7utXw";

interface CoordinatesForAddressResponse {
  status: string;
  results: {
    geometry: {
      location: {
        lat: number;
        lng: number;
      };
    };
  }[];
}

interface CheckCoordinatesResponse {
  status: string;
  results: {
    address_components: {
      short_name: string;
    }[];
    place_id: string;
  }[];
}

async function geoAPIGetCoordinatesForAddress(
  address: string,
  postalCode: string,
  city: string
): Promise<Coordinates | null> {
  const url = new URL(API_URL);
  url.searchParams.append("bounds", "AT");
  url.searchParams.append("address", `${postalCode} ${city} ${address}`);
  url.searchParams.append("key", API_KEY);

  const encodedURL = encodeURI(url.toString());

  try {
    const response = await fetch(encodedURL, {
      headers: {
        Accept: "application/json",
        "Content-Type": "application/x-www-form-urlencoded",
      },
    });

    if (!response.ok) {
      console.log(
        `Could not get coordinates for address=${address}, 
        postalCode=${postalCode}, city=${city}: status=${response.status}`
      );
      return null;
    }

    const data: CoordinatesForAddressResponse = await response.json();

    if (data.status !== "OK") {
      console.log(
        `Could not get coordinates for address=${address}, 
        postalCode=${postalCode}, city=${city}: ${data["status"]}`
      );
      return null;
    }

    // It seems like always only a single location is returned, so let's take
    //  the first one
    const coordinates = data.results[0].geometry.location;
    return {
      latitude: coordinates.lat,
      longitude: coordinates.lng,
    };
  } catch (e: any) {
    throw new Error(
      `Could not get coordinates for address=${address}, 
      postalCode=${postalCode}, city=${city}: ${e}`
    );
  }
}

async function geoAPICheckCoordinates(
  coordinates: Coordinates
): Promise<boolean | null> {
  const url = new URL(API_URL);
  url.searchParams.append("language", "en");
  url.searchParams.append("result_type", "country");
  url.searchParams.append("key", API_KEY);

  let encodedURL = encodeURI(url.toString());

  // We have to manually add the latlang parameter to the url as it will
  //  be urlencoded othderwise and the API can't cope with that ...
  encodedURL = `${encodedURL}&latlng=${coordinates.latitude},${coordinates.longitude}`;

  try {
    const response = await fetch(encodedURL, {
      headers: {
        Accept: "application/json",
        "Content-Type": "application/x-www-form-urlencoded",
      },
    });

    if (!response.ok) {
      console.log(
        `Could not execute reverse geo request for 
        coord=${JSON.stringify(coordinates, null, 2)}: 
        status=${response.status}`
      );
      return null;
    }

    const data: CheckCoordinatesResponse = await response.json();

    if (data.status !== "OK") {
      console.log(
        `Could not execute reverse geo request for 
        coord=${JSON.stringify(coordinates, null, 2)}: 
        ${data["status"]}`
      );
      return null;
    }

    // We just take the first address of the first result as the result. This
    //  should be good enough as a check.
    return data.results[0].address_components[0].short_name === "AT";
  } catch (e: any) {
    throw new Error(
      `Could not execute reverse geo request for
      coord=${JSON.stringify(coordinates, null, 2)}: ${e}`
    );
  }
}

export type { Coordinates };

export { geoAPICheckCoordinates, geoAPIGetCoordinatesForAddress };
