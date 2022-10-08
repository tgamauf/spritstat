import React, {useEffect} from "react";

import {useAppDispatch, useAppSelector} from "../../utils";
import {
  getCoordinates,
  getPositionPermission,
  PositionPermissionStatus,
  selectPermissionStatus
} from "./positionSlice";

interface Props {
  children: React.ReactNode;
}

// Grab the permission status and if allowed the coordinates on mount
function PositionProvider({children}: Props): JSX.Element {
  const dispatch = useAppDispatch();
  const permissionStatus = useAppSelector(selectPermissionStatus);

  useEffect(() => {
    dispatch(getPositionPermission());
  }, []);

  useEffect(() => {
    if (permissionStatus === PositionPermissionStatus.GRANTED) {
      dispatch(getCoordinates());
    }
  }, [permissionStatus]);

  return <div>{children}</div>;
}

export {PositionProvider};
