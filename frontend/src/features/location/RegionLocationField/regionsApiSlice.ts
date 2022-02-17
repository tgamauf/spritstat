import {eControlApi, regionTypeReverseMap} from "../../../common/apis/eControl"
import {RegionType} from "../../../common/types";


interface Region {
  code: number;
  type: string;
  name: string;
  subRegions: {
    code: number;
    type: string;
    name: string;
    postalCodes: string[];
 }[];
  postalCodes: string[];
}

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

const extendedApi = eControlApi.injectEndpoints({
  endpoints: (builder) => ({
    getRegions: builder.query<RegionMap, void>({
      query: () => "regions",
      transformResponse: (response: Region[]) => {
        const regionMap: RegionMap = {
          postalCodeToState: new Map(),
          postalCodeToDistrict: new Map(),
          states: new Map(),
       };
        for (const state of response) {
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

            districts.set(district.code, <District>{
              type: regionTypeReverseMap.get(district.type),
              name: district.name,
           });
         }

          regionMap.states.set(state.code, <State>{
            type: regionTypeReverseMap.get(state.type),
            name: state.name,
            districts,
         });
       }

        return regionMap;
     }
   }),
 })
})

export type {RegionMap};
export const {useGetRegionsQuery} = extendedApi;