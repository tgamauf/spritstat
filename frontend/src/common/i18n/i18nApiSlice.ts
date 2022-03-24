import {DEFAULT_HEADERS, spritstatApi} from "../apis/spritstatApi"
import {Locale} from "./types";


export const localeApi = spritstatApi.injectEndpoints({
  endpoints: (builder) => ({
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
