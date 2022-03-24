import moment from "moment-timezone";

import {DEFAULT_HEADERS, spritstatApi} from "../../common/apis/spritstatApi"
import {DateRange, FuelType, Location, LocationType, RegionType} from "../../common/types";
import {reverseMap} from "../../common/utils";

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
  [DateRange.OneWeek, "1w"],
  [DateRange.OneMonth, "1m"],
  [DateRange.ThreeMonths, "3m"],
  [DateRange.SixMonths, "6m"]
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

interface Station {
  id: number;
  name: string;
}

type StationMap = {
  [key: number]: Station;
};

interface Price {
  id: number;
  datetime: string;
  stations: number[];
  min_amount: number;
}

interface PriceRequestData {
  locationId: number;
  dateRange?: DateRange;
}

interface PriceData {
  labels: string[];
  data: number[];
}

interface PriceHistoryData extends PriceData {
  stationsMap: number[][];
}

interface StationFrequencyData {
  stationIds: number[];
  data: number[];
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
            fuel_type: fuelTypeMap.get(Number(fuelType) as FuelType)
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
        return data.map((location) => {
          return {
            id: location.id,
            type: locationTypeReverseMap.get(location.type) as LocationType,
            name: location.name,
            latitude: location.latitude,
            longitude: location.longitude,
            regionCode: location.region_code,
            regionType: regionTypeReverseMap.get(location.region_type as string),
            fuelType: fuelTypeReverseMap.get(location.fuel_type) as FuelType
          };
        });
      },
      providesTags: ["Locations"],
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
        return data.reduce(function (map: StationMap, item) {
          map[item.id] = item;
          return map;
        }, {})
      }
    }),
    getPriceHistoryData: builder.query<PriceHistoryData, PriceRequestData>({
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
        const chartData: PriceHistoryData = {labels: [], data: [], stationsMap: []};
        for (let i = 0; i < data.length; i++) {
          const entry = data[i];
          chartData.labels.push(entry.datetime);
          chartData.data.push(entry.min_amount);
          chartData.stationsMap.push(entry.stations);
        }
        return chartData;
      }
    }),
    getPriceHourData: builder.query<PriceData, PriceRequestData>({
      query: ({locationId, dateRange}) => {
        let url = `sprit/${locationId}/prices/hour/`;
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
      transformResponse: (data: {hour: number, value: number}[]) => {
        const chartData: PriceData = {labels: [], data: []};

        // No data, so just return the empty array.
        if (data.length <= 0) {
          return chartData;
        }

        let index = 0;
        data.sort(({hour: a}, {hour: b}) => {
          return a - b;
        });
        for (let hour = 0 ; hour < 24 ; hour++) {
          chartData.labels.push(String(hour));

          // If no data is available for this weekday add 0 to the data.
          if ((index >= data.length) || data[index].hour > hour) {
            chartData.data.push(0);
          } else {
            chartData.data.push(data[index].value);
            index++;
          }
        }
        return chartData;
      }
    }),
    getPriceDayOfWeekData: builder.query<PriceData, PriceRequestData>({
      query: ({locationId, dateRange}) => {
        let url = `sprit/${locationId}/prices/day_of_week/`;
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
      transformResponse: (data: {day_of_week: number, value: number}[]) => {
        const chartData: PriceData = {labels: [], data: []};

        // No data, so just return the empty array.
        if (data.length <= 0) {
          return chartData;
        }

        let index = 0;
        data.sort(({day_of_week: a}, {day_of_week: b}) => {
          return a - b;
        });
        for (let weekday = 1 ; weekday <= 7 ; weekday++) {
          chartData.labels.push(String(weekday));

          // If no data is available for this weekday add 0 to the data.
          if ((index >= data.length) || data[index].day_of_week > weekday) {
            chartData.data.push(0);
          } else {
            chartData.data.push(data[index].value);
            index++;
          }
        }

        return chartData;
      }
    }),
    getPriceDayOfMonthData: builder.query<PriceData, PriceRequestData>({
      query: ({locationId, dateRange}) => {
        let url = `sprit/${locationId}/prices/day_of_month/`;
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
      transformResponse: (data: {day_of_month: number, value: number}[]) => {
        const chartData: PriceData = {labels: [], data: []};

        // No data, so just return the empty array.
        if (data.length <= 0) {
          return chartData;
        }

        let index = 0;
        data.sort(({day_of_month: a}, {day_of_month: b}) => {
          return a - b;
        });
        for (let dayOfMonth = 1 ; dayOfMonth <= 31 ; dayOfMonth++) {
          chartData.labels.push(String(dayOfMonth));

          // If no data is available for this weekday add 0 to the data.
          if ((index >= data.length) || data[index].day_of_month > dayOfMonth) {
            chartData.data.push(0);
          } else {
            chartData.data.push(data[index].value);
            index++;
          }
        }
        return chartData;
      }
    }),
    getPriceStationFrequency: builder.query<StationFrequencyData, PriceRequestData>({
      query: ({locationId, dateRange}) => {
        let url = `sprit/${locationId}/prices/station_frequency/`;
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
      transformResponse: (data: {station_id: number, frequency: number}[]) => {
        const chartData: StationFrequencyData = {stationIds: [], data: []};

        data.forEach((item) => {
          chartData.stationIds.push(item.station_id);
          chartData.data.push(item.frequency);
        });
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
  useLazyGetPriceHourDataQuery,
  useLazyGetPriceDayOfMonthDataQuery,
  useLazyGetPriceDayOfWeekDataQuery,
  useLazyGetPriceHistoryDataQuery,
  useLazyGetPriceStationFrequencyQuery,
} = extendedApi;

export type PriceDayQuery = typeof useLazyGetPriceDayOfMonthDataQuery | typeof useLazyGetPriceDayOfWeekDataQuery;