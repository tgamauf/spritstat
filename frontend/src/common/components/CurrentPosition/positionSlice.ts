import {createSlice, createAsyncThunk} from "@reduxjs/toolkit";

import {RootState} from "../../../app/store";
import {INVALID_COORDINATES, LOCATION_REQUEST_TIMEOUT_MS} from "../../constants";
import {Coordinates} from "../../types";

enum PositionPermissionStatus {
  PROMPT,
  GRANTED,
  DENIED,
  UNAVAILABLE
}

enum PositionError {
  POSITION_UNAVAILABLE,
  TIMEOUT,
  UNKNOWN
}

interface PositionState {
  permissionStatus: PositionPermissionStatus;
  coordinates: Coordinates;
  positionError?: PositionError;
}

const initialState: PositionState = {
  permissionStatus: PositionPermissionStatus.PROMPT,
  coordinates: INVALID_COORDINATES
};

const getPositionPermission = createAsyncThunk(
  "position/getPositionPermission", async () => {
    if (navigator.geolocation === undefined) {
      return PositionPermissionStatus.UNAVAILABLE;
    }

    const permission = await navigator.permissions.query({name: "geolocation"});

    let permissionStatus;
    if (permission.state === "granted") {
      permissionStatus = PositionPermissionStatus.GRANTED;
    } else if (permission.state === "denied") {
      permissionStatus = PositionPermissionStatus.DENIED;
    } else {
      permissionStatus = PositionPermissionStatus.PROMPT;
    }

    return permissionStatus;
  });

const getCoordinates = createAsyncThunk(
  "position/getCoordinates", async (_, {rejectWithValue}) => {
    try {
      return await new Promise<Coordinates>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(
          (position) => resolve(position.coords),
          (error) => {
            console.error(`Failed to get position: ${error.message}`);
            reject(error.code)
          },
          {enableHighAccuracy: true, timeout: LOCATION_REQUEST_TIMEOUT_MS}
        );
      });
    } catch (error) {
      return rejectWithValue(error);
    }
  });

const positionSlice = createSlice({
  name: "position",
  initialState,
  reducers: {
    clearPositionError(state) {
      state.positionError = undefined;
    }
  },
  extraReducers: (builder) => {
    builder.addCase(getPositionPermission.fulfilled, (state, action) => {
      state.permissionStatus = action.payload;
    });
    builder.addCase(getCoordinates.fulfilled, (state, action) => {
      state.permissionStatus = PositionPermissionStatus.GRANTED;
      state.coordinates = action.payload;
      state.positionError = undefined;
    });
    builder.addCase(getCoordinates.rejected, (state, action) => {
      if (action.payload === GeolocationPositionError.PERMISSION_DENIED) {
        // If the request has been denied, we don't want to ask again and also
        //  won't show an error message. We do set the permission status to denied
        //  instead.
        state.permissionStatus = PositionPermissionStatus.DENIED;
      } else if(action.payload === GeolocationPositionError.POSITION_UNAVAILABLE) {
        // If the position is currently unavailable the user obviously granted
        //  us permission to access the location.
        state.permissionStatus = PositionPermissionStatus.GRANTED;
        state.positionError = PositionError.POSITION_UNAVAILABLE;
      } else if(action.payload === GeolocationPositionError.TIMEOUT) {
        // If acquiring the position timed out the user obviously granted us
        //  permission to access the location.
        state.permissionStatus = PositionPermissionStatus.GRANTED;
        state.positionError = PositionError.TIMEOUT;
      } else {
        console.error(`Unknown error code: ${action.payload}`);
        state.positionError = PositionError.UNKNOWN;
      }
      state.coordinates = INVALID_COORDINATES;
    });
  }
});

const {clearPositionError} = positionSlice.actions;  // This is only for internal use and not exported.
const selectPermissionStatus = (state: RootState) => state.position.permissionStatus;
const selectCoordinates = (state: RootState) => state.position.coordinates;
const selectPositionError = (state: RootState) => state.position.positionError;

export {
  getCoordinates,
  getPositionPermission,
  PositionError,
  PositionPermissionStatus,
  positionSlice,
  selectCoordinates,
  selectPositionError,
  selectPermissionStatus,
};
