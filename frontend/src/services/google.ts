import {Loader} from "@googlemaps/js-api-loader";

import {INVALID_COORDINATES, INVALID_LOCATION} from "../utils/constants";
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


interface Prediction {
  placeId: string;
  description: string;
  coords?: Coordinates;
}

interface ParsedLocation extends NamedLocation {
  placeId: string;
}

const INVALID_PREDICTION: Prediction = {
 placeId: "",
 description: "",
 coords: INVALID_COORDINATES
}

const INVALID_PARSED_LOCATION: ParsedLocation = {
  ...INVALID_LOCATION,
  placeId: ""
};

class GoogleMapsAPI {
  private autocompleteService: google.maps.places.AutocompleteService;
  private geocoderService: google.maps.Geocoder;
  private readonly sessionToken: google.maps.places.AutocompleteSessionToken;

  constructor() {
    this.autocompleteService = new google.maps.places.AutocompleteService();
    this.geocoderService = new google.maps.Geocoder();

    // As an instance is created every time we use this, we set the session here
    this.sessionToken = new google.maps.places.AutocompleteSessionToken();
  }

  public async getPredictionsFromText(input: string): Promise<Prediction[]> {
    // Search for the input string and store the returned results
    try {
      const result = await this.autocompleteService.getPlacePredictions({
        input,
        componentRestrictions: {country: "AT"},
        sessionToken: this.sessionToken
      });

      return result.predictions.map((prediction) => {
        return {
          placeId: prediction.place_id,
          description: prediction.description
        };
      });
    } catch (e: any) {
      console.error(`Autocomplete call failed: ${e}`);
      return [];
    }
  }

  public async getPredictionsFromCoordinates(
    coords: Coordinates
  ): Promise<Prediction[]> {
    // Get the location details for the provided coordinates
    const locations = await this.getLocation({
      location: new google.maps.LatLng(coords.latitude, coords.longitude),
      region: "AT"
    });

    let predictions: Prediction[] = [];
    for (const loc of locations) {
      predictions.push({
        placeId: loc.placeId,
        description: loc.name,
        coords: loc.coords
      });
    }

    // Deduplicate the predictions
    predictions = predictions.filter(
      (item, index, self) =>
        index === self.findIndex((t) => (
          t.description === item.description)
        )
    )

    return predictions;
  }

  public async selectPrediction(prediction: Prediction): Promise<NamedLocation> {
    // Return the location details of the selected location

    // If we have the coordinates already just return the location directly
    if (prediction.coords) {
      return {name: prediction.description, coords: prediction.coords};
    }

    const locations = await this.getLocation({
      placeId: prediction.placeId,
      region: "AT"
    });

    if (locations.length == 0) {
      return INVALID_LOCATION;
    }

    if (locations.length > 1) {
      console.warn(
        `Received more than one result for selected prediction: 
        ${JSON.stringify(locations, null, 2)}`
      );
    }

    // Pick the first valid location
    let index = 0;
    while (locations[index] === INVALID_PARSED_LOCATION) {
      index++;
    }
    if (locations[index] === INVALID_PARSED_LOCATION) {
      return INVALID_LOCATION;
    }

    return locations[index];
  }

  private async getLocation(
    request: google.maps.GeocoderRequest
  ): Promise<ParsedLocation[]> {
    // Get the location details for the provided data

    const result = await this.geocoderService.geocode(request);

    if (!result || !result.results) {
      console.error(
        `No results returned for request ${JSON.stringify(request, null, 2)}`
      );
      return [];
    }

    const locations: ParsedLocation[] = [];
    for (const entry of result.results) {
      const loc = this.parseLocationResult(entry);
      if (loc === INVALID_PARSED_LOCATION) {
        continue;
      }

      locations.push(loc);
    }

    return locations;
  }

  private parseLocationResult(location: google.maps.GeocoderResult): ParsedLocation {
    if (!location.place_id || !location.geometry) {
      console.error(`Invalid location received: ${JSON.stringify(location, null, 2)}`);
      return INVALID_PARSED_LOCATION;
    }

    const placeId = location.place_id
    const coords = {
      latitude: location.geometry.location.lat(),
      longitude: location.geometry.location.lng()
    }

    let streetNumber;
    let street;
    let other;
    let locality;
    let postalCode;
    let district;
    for (const entry of location.address_components) {
      if (entry.types.includes("street_number")) {
        streetNumber = entry.long_name;
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
    }

    const name = GoogleMapsAPI.createLocationName(
      {street, streetNumber: streetNumber, other}
    );

    // Create the "city" which is either a locality or a district in certain
    //  edge cases like a natural feature.
    if (!locality && other && district) {
      locality = district;
    }

    const description = GoogleMapsAPI.createLocationDescription(
      {name, locality, postalCode}
    );

    return {name: description, placeId, coords};
  }

  private static createLocationName(
    {street, streetNumber, other}: { street?: string, streetNumber?: string, other?: string }
  ): string | undefined {
    // Create the name, which either consists of a street, a street + street
    //  number, or one of the other features (like an establishment, or natural
    //  feature
    let name;
    if (street) {
      name = street;

      if (streetNumber) {
        name += ` ${streetNumber}`;
      }
    } else if (other) {
      name = other;
    }

    return name;
  }

  private static createLocationDescription(
    {name, locality, postalCode}: { name?: string, locality?: string, postalCode?: string }
  ): string {
    let description;
    if (name && locality && postalCode) {
      description = `${name}, ${postalCode} ${locality}`;
    } else if (locality && postalCode) {
      description = `${postalCode} ${locality}`;
    } else if (locality) {
      description = locality;
    } else if (postalCode) {
      description = postalCode;
    } else {
      description = "Österreich";
    }

    return description;
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

export type {Prediction, Coordinates};
export {GoogleMapsAPI, INVALID_LOCATION, INVALID_PREDICTION, loadGoogleMapsAPI};
