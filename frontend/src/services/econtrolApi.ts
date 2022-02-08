import { Location, LocationType, Station } from "../utils/types";

const API_URL = "https://api.e-control.at/sprit/1.0";

enum RegionType {
  Invalid = "",
  State = "BL",
  District = "PB",
}

type RegionResponse = [
  {
    code: number;
    type: RegionType.State;
    name: string;
    subRegions: {
      code: number;
      type: RegionType.District;
      name: string;
      postalCodes: string[];
    }[];
    postalCodes: string[];
  }
];

type PostalCodeStateMap = Map<string, number>;

type PostalCodeDistrictMap = Map<string, number>;

interface District {
  type: RegionType.District;
  name: string;
}

type DistrictMap = Map<number, District>;

interface State {
  type: RegionType.State;
  name: string;
  districts: DistrictMap;
}

type StateMap = Map<number, State>;

interface RegionMap {
  postalCodeToState: PostalCodeStateMap;
  postalCodeToDistrict: PostalCodeDistrictMap;
  states: StateMap;
}

type PriceResponse = [
  {
    id: number;
    name: string;
    location: {
      address: string;
      postalCode: string;
      city: string;
    };
    prices: {
      amount: number;
    }[];
  }
];

type PriceResult = {
  amount: number;
  stations: Station[];
};

async function econtrolAPIGetRegions(): Promise<RegionMap | null> {
  const url = new URL(`${API_URL}/regions`);
  const encodedURL = encodeURI(url.toString());

  try {
    const response = await fetch(encodedURL, {
      headers: {
        Accept: "application/json",
        "Content-Type": "application/x-www-form-urlencoded",
      },
    });

    if (!response.ok) {
      console.error(`Could not get regions: ${response.statusText} [${response.status}]`);
      return null;
    }

    const data: RegionResponse = await response.json();

    const regionMap: RegionMap = {
      postalCodeToState: new Map(),
      postalCodeToDistrict: new Map(),
      states: new Map(),
    };
    for (const state of data) {
      state.postalCodes.map((postalCode) => {
        regionMap.postalCodeToState.set(postalCode, state.code);
      });

      const districts: DistrictMap = new Map();
      for (const district of state.subRegions) {
        // We have to check if postalCode exists on the district as the API is
        //  inconsistent - the first "district" of Wien doesn't have the
        //  attribute for some reason.
        if ("postalCodes" in district) {
          district.postalCodes.map((postalCode) => {
            regionMap.postalCodeToDistrict.set(postalCode, district.code);
          });
        }

        districts.set(district.code, {
          type: district.type,
          name: district.name,
        });
      }

      regionMap.states.set(state.code, {
        type: state.type,
        name: state.name,
        districts,
      });
    }

    return regionMap;
  } catch (e: any) {
    throw new Error(`Could not get regions: ${e}`);
  }
}

async function econtrolAPIGetPrice(
  location: Location
): Promise<PriceResult | null> {
  if (location.type == LocationType.Region) {
    if (!location.region_code || !location.region_type) {
      throw new Error(`Could not fetch price, invalid location: ${location}`);
    }

    return await getPriceByRegion(
      location.region_code,
      location.region_type,
      location.fuel_type
    );
  } else {
    if (!location.latitude || !location.longitude) {
      throw new Error(`Could not fetch price, invalid location: ${location}`);
    }

    return await getPriceByAddress(
      location.latitude,
      location.longitude,
      location.fuel_type
    );
  }
}

async function getPriceByAddress(
  latitude: number,
  longitude: number,
  fuelType: string
): Promise<PriceResult | null> {
  const url = new URL(`${API_URL}/search/gas-stations/by-address`);

  url.searchParams.append("latitude", String(latitude));
  url.searchParams.append("longitude", String(longitude));
  url.searchParams.append("fuelType", fuelType);

  const encodedURL = encodeURI(url.toString());

  try {
    const response = await fetch(encodedURL, {
      headers: {
        Accept: "application/json",
        "Content-Type": "application/x-www-form-urlencoded",
      },
    });

    if (!response.ok) {
      console.error(
        `Could not get price by address lat=${latitude}, long=${longitude}, 
        fuelType=${fuelType}: ${response.statusText} [${response.status}]`
      );
      return null;
    }

    const data: PriceResponse = await response.json();

    return parsePrices(data);
  } catch (e: any) {
    throw new Error(
      `Could not get price for lat=${latitude}, long=${longitude}, 
      fuelType=${fuelType}: ${e}`
    );
  }
}

async function getPriceByRegion(
  code: string,
  type: string,
  fuelType: string
): Promise<PriceResult | null> {
  const url = new URL(`${API_URL}/search/gas-stations/by-region`);

  url.searchParams.append("code", code);
  url.searchParams.append("type", type);
  url.searchParams.append("fuelType", fuelType);

  const encodedURL = encodeURI(url.toString());

  try {
    const response = await fetch(encodedURL, {
      headers: {
        Accept: "application/json",
        "Content-Type": "application/x-www-form-urlencoded",
      },
    });

    if (!response.ok) {
      console.error(
        `Could not get price by region for code=${code}, type=${type}, 
        fuelType=${fuelType}: ${response.statusText} [${response.status}]`
      );
      return null;
    }

    const data: PriceResponse = await response.json();

    return parsePrices(data);
  } catch (e: any) {
    throw new Error(
      `Could not get price by region for code=${code}, type=${type}, 
      fuelType=${fuelType}: ${e}`
    );
  }
}

function parsePrices(data: PriceResponse): PriceResult | null {
  // Find the cheapest price first
  let cheapestPrice;
  for (let { prices } of data) {
    if (prices.length == 0) {
      continue;
    }

    const currentPrice = prices[0].amount;
    if (!cheapestPrice || currentPrice < cheapestPrice) {
      cheapestPrice = currentPrice;
    }
  }

  if (!cheapestPrice) {
    return { amount: 0, stations: [] };
  }

  // Store all stations that have the cheapest price
  const stations: Station[] = [];
  for (let s of data) {
    if (s.prices.length == 0) {
      continue;
    }

    if (s.prices[0].amount <= cheapestPrice) {
      stations.push({
        id: s.id,
        name: s.name,
        address: s.location.address,
        postalCode: s.location.postalCode,
        city: s.location.city,
      });
    }
  }

  return { amount: cheapestPrice, stations };
}

export type {
  District,
  DistrictMap,
  PostalCodeStateMap,
  PostalCodeDistrictMap,
  RegionMap,
  State,
  StateMap,
};

export { econtrolAPIGetPrice, econtrolAPIGetRegions, RegionType };
