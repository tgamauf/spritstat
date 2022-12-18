import {eControlApi, regionTypeMap} from "../../common/apis/eControl"
import {FuelType, Location, LocationType} from "../../common/types";

const fuelTypeMap = new Map<FuelType, string>([
  [FuelType.Diesel, "DIE"], [FuelType.Super, "SUP"], [FuelType.Gas, "GAS"],
]);

interface Station {
  id: number;
  name: string;
  address: string;
  postalCode: string;
  city: string;
}

interface Price {
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

interface CurrentPrice {
  amount: number;
  stations: Station[];
}

const extendedApi = eControlApi.injectEndpoints({
  endpoints: (builder) => ({
    getCurrentPrice: builder.query<CurrentPrice, Location>({
      query: (location) => {
        const fuelType = fuelTypeMap.get(location.fuelType);

        if (location.type == LocationType.Region) {
          if (!location.regionCode || !location.regionType) {
            throw new Error(`Could not fetch price, invalid location: ${location}`);
         }

          const regionType = regionTypeMap.get(location.regionType);
          return "search/gas-stations/by-region"
            + `?code=${location.regionCode}&type=${regionType}&fuelType=${fuelType}`
       } else {
          if (!location.latitude || !location.longitude) {
            throw new Error(`Could not fetch price, invalid location: ${location}`);
         }

          return "search/gas-stations/by-address"
            + `?latitude=${location.latitude}&longitude=${location.longitude}`
            + `&fuelType=${fuelType}`;
       }
     },
      transformResponse: (response: Price[]) => {
        // Find the cheapest price first
        let cheapestPrice;
        for (let {prices} of response) {
          if (prices.length == 0) {
            continue;
         }

          const currentPrice = prices[0].amount;
          if (!cheapestPrice || currentPrice < cheapestPrice) {
            cheapestPrice = currentPrice;
         }
       }

        if (!cheapestPrice) {
          return {amount: 0, stations: []};
       }

        // Store all stations that have the cheapest price
        const stations: Station[] = [];
        for (let s of response) {
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

        return {amount: cheapestPrice, stations};
     }
   }),
 })
})

export type {CurrentPrice, Station};
export const {useGetCurrentPriceQuery, useLazyGetCurrentPriceQuery} = extendedApi;