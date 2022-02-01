import {Loader} from "@googlemaps/js-api-loader";

import {Coordinates, NamedLocation} from "../utils/types";

// The Google Maps API has to be loaded dynamically.
// We have to do this here as it is loaded asynchronously and otherwise we won't
//  be able to just create the class below.
let loading: Promise<typeof google>;
try {
  loading = new Loader({
    apiKey: "AIzaSyCP3LVEJhoLDx9av1_65K2mc1bSsZ7utXw",
    language: "de",
    libraries: ["places"],
    region: "AT",
    version: "weekly"
  }).load();
} catch (e) {
  console.error("Failed to load Google Maps API");
}


interface AutocompletePrediction {
  id: number;
  description: string;
}

type AutocompleteResult = AutocompletePrediction[];

interface ParsedLocation {
  name?: string
  locality?: string;
  postalCode?: string;
  country?: string;
  coords?: Coordinates;
}

const INVALID_LOCATION: NamedLocation = {
  name: "",
  coords: {
    latitude: -1,
    longitude: -1
  }
}

class GoogleMapsAPI {
  private autocompleteService: google.maps.places.AutocompleteService;
  private geocoderService: google.maps.Geocoder;
  private readonly sessionToken: google.maps.places.AutocompleteSessionToken;
  private predictions: google.maps.places.AutocompletePrediction[];

  constructor() {
    this.autocompleteService = new google.maps.places.AutocompleteService();
    this.geocoderService = new google.maps.Geocoder();

    // As an instance is created every time we use this, we set the session here
    this.sessionToken = new google.maps.places.AutocompleteSessionToken();
    this.predictions = []
  }

  public async getPredictions(input: string): Promise<AutocompleteResult> {
    // Search for the input string and store the returned results

    try {
      const result = await this.autocompleteService.getPlacePredictions({
        input,
        componentRestrictions: {country: "AT"},
        sessionToken: this.sessionToken
      });

      // Replace the previous predictions
      this.predictions = [];
      return result.predictions.map((prediction, index) => {
        this.predictions.push(prediction);
        return {id: index, description: prediction.description};
      })
    } catch (e: any) {
      console.error(`Autocomplete call failed: ${e}`);
      return [];
    }
  }

  public async getLocationFromCoordinates(
    coords: Coordinates
  ): Promise<NamedLocation> {
    // Get the location details for the provided coordinates

    return this.getLocation({
      location: new google.maps.LatLng(coords.latitude, coords.longitude),
      componentRestrictions: {country: "AT"}
    });
  }

  public async selectPrediction(id: number): Promise<NamedLocation> {
    // Return the location details of the selected location

    return this.getLocation({placeId: this.predictions[id].place_id});
  }

  private async getLocation(
    request: google.maps.GeocoderRequest
  ): Promise<NamedLocation> {
    // Get the location details for the provided data

    const result = await this.geocoderService.geocode(request);

    if (!result || !result.results) {
      console.error(
        `No results returned for request ${JSON.stringify(request, null, 2)}`
      );
      return INVALID_LOCATION;
    }

    const location = this.parseLocationResult(result.results[0]);

    if (!location.country || (location.country !== "AT")) {
      console.error(
        `Provided location is not in Austria: ${JSON.stringify(result, null, 2)}`
      )
      return INVALID_LOCATION;
    }
    if (!location.coords) {
      console.error(
        `Provided location is not valid: ${JSON.stringify(result, null, 2)}`
      )
      return INVALID_LOCATION;
    }

    let name;
    if (location.name && location.locality && location.postalCode) {
      name = `${location.name}, ${location.postalCode} ${location.locality}`;
    } else if (location.locality && location.postalCode) {
      name = `${location.postalCode} ${location.locality}`;
    } else if (location.locality) {
      name = location.locality;
    } else if (location.postalCode) {
      name = location.postalCode;
    } else {
      console.warn(
        `Provided location is country-only: ${JSON.stringify(result, null, 2)}`
      )
      name = "Österreich";
    }
    return {
      name,
      coords: location.coords
    };
  }

  private parseLocationResult(location: google.maps.GeocoderResult): ParsedLocation {
    let coords;
    let street_number;
    let street;
    let other;
    let locality;
    let postalCode;
    let district;
    let country;
    if (location.geometry.location) {
      coords = {
        latitude: location.geometry.location.lat(),
        longitude: location.geometry.location.lng()
      }
    }
    for (const entry of location.address_components) {
      if (entry.types.includes("street_number")) {
        street_number = entry.long_name;
      }
      if (entry.types.includes("route")) {
        street = entry.long_name;
      }
      if (["establishment", "natural_feature"].some(
        (type) => entry.types.includes(type)
      )) {
        other = entry.long_name
      }
      if (entry.types.includes("locality")) {
        locality = entry.long_name;
      }
      if (entry.types.includes("postal_code")) {
        postalCode = entry.long_name;
      }
      if (entry.types.includes("administrative_area_level_2")) {
        district = entry.long_name;
      }
      if (entry.types.includes("country")) {
        country = entry.short_name;
      }
    }

    // This address isn't in Austria, so it isn't supported
    if (country !== "AT") {
      console.error(
        `Provided address not in Austria: ${JSON.stringify(location, null, 2)}`
      )
      return INVALID_LOCATION;
    }

    // Create the name, which either consists of a street, a street + street
    //  number, or one of the other features (like an establishment, or natural
    //  feature
    let name;
    if (street) {
      name = street;

      if (street_number) {
        name += ` ${street_number}`;
      }
    } else if (other) {
      name = other;
    }

    // Create the "city" which is either a locality or a district in certain
    //  edge cases like a natural feature.
    if (!locality && other && district) {
      locality = district;
    }

    return { name, locality, postalCode, country, coords };
  }
}

async function loadGoogleMapsAPI(): Promise<GoogleMapsAPI | null> {
  // Wait for the loader to load the API, then return the API class.
  try {
    await loading;

    return new GoogleMapsAPI();
  } catch (e) {
    console.error(`Google Maps API could not be loaded: ${e}`);
  }

  return null;
}

export type {
  AutocompletePrediction,
  AutocompleteResult,
  Coordinates
};

export {GoogleMapsAPI, INVALID_LOCATION, loadGoogleMapsAPI};
