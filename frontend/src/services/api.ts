import Cookie from "universal-cookie";

import {EMPTY_SESSION} from "../utils/constants";
import {FuelType, LocationType, Session} from "../utils/types";
import {RegionType} from "./econtrolApi";

// Get the URL of the website, this is also where the API is available.
const API_URL = `${window.location.href.split("/")[0]}/api/v1`;

interface URLSearchParams {
  [key: string]: boolean | number | string;
}

type GetResponse = [] | boolean | null;

interface PasswordValidationResponse {
  valid: boolean;
  score: number;
  suggestions: string[];
}

interface LocationData {
  type: LocationType;
  address?: string;
  postalCode?: string;
  city?: string;
  latitude?: number;
  longitude?: number;
  regionCode?: number;
  regionType?: RegionType;
  regionName?: string;
  fuelType: FuelType;
}

async function apiPostRequest(
  path: string,
  requestData?: object
): Promise<any> {
  const cookie = new Cookie();

  try {
    const csrfToken = cookie.get("csrftoken");

    let body = "";
    if (requestData) {
      body = JSON.stringify(requestData);
    }

    const response = await fetch(encodeURI(`${API_URL}/${path}/`), {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        "X-CSRFToken": csrfToken,
      },
      body: body,
    });

    if (!response.ok) {
      return null;
    }

    if (response.status !== 204) {
      return await response.json();
    }

    // No content has been provided, so let"s just return true
    return true;
  } catch (e: any) {
    throw new Error(`API post request to "${path}" failed: ${e}`);
  }
}

async function apiGetSessionRequest(): Promise<Session> {
  const cookie = new Cookie();
  try {
    const csrfToken = cookie.get("csrftoken");

    // Return an empty session
    if (!csrfToken) {
      return EMPTY_SESSION;
    }

    return await apiPostRequest("users/account/session");
  } catch (e: any) {
    throw new Error(`Could not fetch session data: ${e}`);
  }
}

async function apiValidatePasswordRequest(
  password: string,
  email?: string
): Promise<PasswordValidationResponse> {
  const cookie = new Cookie();
  const data = {
    password,
    email,
  };

  try {
    const csrfToken = cookie.get("csrftoken");
    let headers;
    if (!csrfToken) {
      headers = {
        Accept: "application/json",
        "Content-Type": "application/json",
      };
    } else {
      // Add the token if we have it as Django rest framework will require it
      //  for authenticated users.
      headers = {
        Accept: "application/json",
        "Content-Type": "application/json",
        "X-CSRFToken": csrfToken,
      };
    }

    // No CSRF token here as this call doesn"t change anything
    const response = await fetch(
      encodeURI(`${API_URL}/users/auth/password/validate/`),
      {
        method: "POST",
        headers,
        body: JSON.stringify(data),
      }
    );

    if (!response.ok) {
      throw new Error(`${response.statusText} [${response.status}]`);
    }

    return await response.json();
  } catch (e: any) {
    throw new Error(`Could not validate password, request failed: ${e}`);
  }
}

async function apiCreateLocation(location: LocationData): Promise<boolean> {
  try {
    const cookie = new Cookie();
    const csrfToken = cookie.get("csrftoken");
    const response = await fetch(
      encodeURI(`${API_URL}/sprit/`),
      {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          "X-CSRFToken": csrfToken,
        },
        body: JSON.stringify({
          type: location.type,
          address: location.address ? location.address : "",
          postal_code: location.postalCode ? location.postalCode : "",
          city: location.city ? location.city : "",
          latitude: location.latitude,
          longitude: location.longitude,
          region_code: location.regionCode,
          region_type: location.regionType ? location.regionType : RegionType.Invalid,
          region_name: location.regionName ? location.regionName : "",
          fuel_type: location.fuelType
        }),
      }
    );

    return response.ok;
  } catch (e: any) {
    throw new Error(`Could not create location, request failed: ${e}`);
  }
}

async function apiGetRequest(
  path: string,
  searchParams?: URLSearchParams
): Promise<GetResponse> {
  let url = `${API_URL}/${path}/`;

  if (searchParams) {
    for (const [key, value] of Object.entries(searchParams)) {
      url += `?${key}=${value}`;
    }
  }

  try {
    const response = await fetch(encodeURI(url), {
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      }
    });

    if (!response.ok) {
      return null;
    }

    if (response.status !== 204) {
      return await response.json();
    }

    return true;
  } catch (e: any) {
    throw new Error(`API get request to "${path}" failed: ${e}`);
  }
}

async function apiDeleteRequest(path: string): Promise<any> {
  let url = `${API_URL}/${path}/`;
  const cookie = new Cookie();

  try {
    const csrfToken = cookie.get("csrftoken");

    const response = await fetch(encodeURI(url), {
      method: "DELETE",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        "X-CSRFToken": csrfToken,
      }
    });

    if (!response.ok) {
      return null;
    }

    if (response.status !== 204) {
      return await response.json();
    }

    // No content has been provided, so let"s just return true
    return true;
  } catch (e: any) {
    throw new Error(`API post request to "${path}" failed: ${e}`);
  }
}

export type {
  GetResponse as APIGetResponse,
  LocationData as APILocationData,
  PasswordValidationResponse as APIPasswordValidationResponse,
  URLSearchParams as APIURLSearchParams
};

export {
  apiCreateLocation,
  apiDeleteRequest,
  apiGetRequest,
  apiGetSessionRequest,
  apiPostRequest,
  apiValidatePasswordRequest,
};
