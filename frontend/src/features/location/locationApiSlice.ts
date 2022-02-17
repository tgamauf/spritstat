import moment from "moment-timezone";

import {DEFAULT_HEADERS, spritstatApi} from "../../common/apis/spritstatApi"
import {DateRange, FuelType, Location, LocationType, RegionType, Station, StationMap} from "../../common/types";
import {reverseMap} from "../../common/utils";


const TIMEZONE = Intl.DateTimeFormat().resolvedOptions().timeZone;

const locationTypeMap = new Map<LocationType, number>([
  [LocationType.Named, 1], [LocationType.Region, 2]
]);
const locationTypeReverseMap = reverseMap<LocationType, number>(locationTypeMap);

const regionTypeMap = new Map<RegionType, string>([
  [RegionType.State, "BL"], [RegionType.District, "PB"]
]);
const regionTypeReverseMap = reverseMap<RegionType, string>(regionTypeMap);

const fuelTypeMap = new Map<FuelType, string>([
  [FuelType.Diesel, "DIE"], [FuelType.Super, "SUP"], [FuelType.Gas, "GAS"],
]);
const fuelTypeReverseMap = reverseMap<FuelType, string>(fuelTypeMap);

const dateRangeMap = new Map<DateRange, string>([
  [DateRange.OneMonth, "1m"], [DateRange.SixMonths, "6m"]
])

interface LocationData {
  type: LocationType;
  name: string;
  latitude?: number;
  longitude?: number;
  regionCode?: number;
  regionType?: RegionType;
  fuelType: FuelType;
}

type LocationResults = {
  id: number;
  type: number;
  name: string;
  latitude?: number;
  longitude?: number;
  region_code?: string;
  region_type?: string;
  fuel_type: string;
}[];

interface Price {
  id: number;
  datetime: string;
  stations: number[];
  min_amount: number;
}

interface PriceChartRequestData {
  locationId: number;
  dateRange?: DateRange;
}

interface PriceChartData {
  labels: string[];
  data: number[];
  stationsMap: number[][];
}

const extendedApi = spritstatApi.injectEndpoints({
  endpoints: (builder) => ({
    addLocation: builder.mutation<boolean, LocationData>({
      query: ({
        type, name, latitude, longitude, regionCode, regionType, fuelType
     }) => {
        return {
          url: "sprit/",
          method: "POST",
          headers: {
            ...DEFAULT_HEADERS,
            "X-CSRFToken": window.csrfToken
         },
          body: {
            type: locationTypeMap.get(type as LocationType),
            name,
            latitude,
            longitude,
            region_code: regionCode,
            region_type: regionTypeMap.get(regionType as RegionType),
            fuel_type: fuelTypeMap.get(fuelType as FuelType)
         }
       };
     },
      invalidatesTags: ["Locations"]
   }),
    deleteLocation: builder.mutation<boolean, number>({
      query: (id) => {
        return {
          url: `sprit/${id}/`,
          method: "DELETE",
          headers: {
            ...DEFAULT_HEADERS,
            "X-CSRFToken": window.csrfToken
         }
       };
     },
      transformResponse: () => true,
      invalidatesTags: (result, error, arg) => {
        return ["Locations"]
     }
   }),
    getLocations: builder.query<Location[], void>({
      query: () => {
        return {
          url: "sprit/",
          headers: {
            ...DEFAULT_HEADERS,
            "X-CSRFToken": window.csrfToken
         }
       };
     },
      transformResponse: (data: LocationResults) => {
        return data.map((loc) => {
          return {
            id: loc.id,
            type: locationTypeReverseMap.get(loc.type) as LocationType,
            name: loc.name,
            latitude: loc.latitude,
            longitude: loc.longitude,
            regionCode: loc.region_code,
            regionType: regionTypeReverseMap.get(loc.region_type as string),
            fuelType: fuelTypeReverseMap.get(loc.fuel_type) as FuelType
         };
       });
     },
      providesTags: ["Locations"]
   }),
    getStations: builder.query<StationMap, void>({
      query: () => {
        return {
          url: "sprit/station/",
          headers: {
            ...DEFAULT_HEADERS,
            "X-CSRFToken": window.csrfToken
         }
       };
     },
      transformResponse: (data: Station[]) => {
        return data.reduce(function(map: StationMap, item) {
            map[item.id] = item;
            return map;
         }, {})
     }
   }),
    getPriceChartData: builder.query<PriceChartData, PriceChartRequestData>({
      query: ({locationId, dateRange}) => {
        let url = `sprit/${locationId}/prices/`;
        if (dateRange !== DateRange.All) {
          url += `?date_range=${dateRangeMap.get(dateRange as DateRange)}`;
       }
        return {
          url,
          headers: {
            ...DEFAULT_HEADERS,
            "X-CSRFToken": window.csrfToken
         }
       };
     },
      transformResponse: (data: Price[]) => {
        const chartData: PriceChartData = {labels: [], data: [], stationsMap: []};
        for (const i in data) {
          const entry = data[i];
          chartData.labels.push(
            moment.tz(entry.datetime, TIMEZONE).format("DD.MM.YY HH:mm")
          );
          chartData.data.push(entry.min_amount);
          chartData.stationsMap.push(entry.stations);
       }
        return chartData;
     }
   }),
 })
})

export const {
  useAddLocationMutation,
  useDeleteLocationMutation,
  useGetLocationsQuery,
  useGetStationsQuery,
  useLazyGetPriceChartDataQuery,
} = extendedApi;

export type {PriceChartRequestData};
