import {DEFAULT_HEADERS, spritstatApi} from "../apis/spritstatApi"
import {Locale} from "./types";


export const localeApi = spritstatApi.injectEndpoints({
  endpoints: (builder) => ({
    getLocale: builder.query<Locale | null, void>({
      query: () => {
        return {
          url: "users/locale/",
          method: "GET",
          headers: {
            ...DEFAULT_HEADERS,
            "X-CSRFToken": window.csrfToken
          }
        };
      },
      transformResponse: (response: {locale: string}) => {
        return response.locale as Locale;
      }
    }),
    setLocale: builder.mutation<void, Locale>({
      query: (locale) => {
        return {
          url: "users/locale/",
          method: "POST",
          headers: {
            ...DEFAULT_HEADERS,
            "X-CSRFToken": window.csrfToken
          },
          body: {locale: locale}
        };
      }
    })
  })
});

export const {useLazyGetLocaleQuery} = localeApi;
