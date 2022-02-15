import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import {RegionType} from "../types";
import {reverseMap} from "../utils";


const regionTypeMap = new Map<RegionType, string>([
  [RegionType.State, "BL"], [RegionType.District, "PB"]
]);
const regionTypeReverseMap = reverseMap<RegionType, string>(regionTypeMap);

const eControlApi = createApi({
  reducerPath: "eControlApi",
  baseQuery: fetchBaseQuery({
    baseUrl: "https://api.e-control.at/sprit/1.0/"
  }),
  endpoints: () => ({}),
});

export {eControlApi, regionTypeMap, regionTypeReverseMap};
