import {createApi, fetchBaseQuery} from "@reduxjs/toolkit/query/react";
import Cookie from "universal-cookie";


interface SessionData {
  isAuthenticated: boolean;
  hasBetaAccess: boolean;
  email: string;
}

const DEFAULT_HEADERS = {
  Accept: "application/json",
  "Content-Type": "application/json",
}

function updateCsrfToken() {
  // Get the CSRF token from the cookie and store it on the window to make it
  //  available to all requests.

  const cookie = new Cookie();
  window.csrfToken = cookie.get("csrftoken")
}

const spritstatApi = createApi({
  reducerPath: "spritstatApi",
  baseQuery: fetchBaseQuery({baseUrl: "/api/v1"}),
  tagTypes: ["Locations", "Session"],
  endpoints: (builder) => ({
    getSession: builder.query<SessionData, void>({
      query: () => {
        // Reload the CSRF token on every call to getSession. This ensures that
        //  the token is set or removed automatically on login/logout.
        updateCsrfToken();

        let headers;
        if (window.csrfToken) {
          headers = {
            ...DEFAULT_HEADERS,
            "X-CSRFToken": window.csrfToken
          }
        } else {
          headers = DEFAULT_HEADERS;
        }
        return {
          url: "users/account/session/",
          method: "POST",
          headers
        };
      },
      providesTags: ["Session"]
    }),
  }),
});

const {useGetSessionQuery} = spritstatApi;

export type {SessionData};
export {DEFAULT_HEADERS, spritstatApi, updateCsrfToken, useGetSessionQuery};
