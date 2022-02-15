import React, {useEffect, useState} from "react";
import {useNavigate} from "react-router-dom";
import {faHome} from "@fortawesome/free-solid-svg-icons";

import NoLocation from "./NoLocation";
import BasePage from "../../common/components/BasePage";
import LocationList from "./LocationList";
import {RouteNames} from "../../common/types";
import {useAppSelector} from "../../common/utils";
import {selectIsAuthenticated} from "../../common/sessionSlice";
import {useGetLocationsQuery} from "./locationApiSlice";
import LoadingError from "../../common/components/LoadingError";


const BREADCRUMB = {
  name: "Startseite",
  icon: faHome,
  destination: RouteNames.Dashboard,
};

export default function Dashboard() {
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const {data: locations, error, isError, isFetching, isSuccess} = useGetLocationsQuery();
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate(RouteNames.Login, { replace: true });
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (isError) {
      console.error(
        `Failed to get locations: ${JSON.stringify(error, null, 2)}`
      );
    }
  }, [isError]);

  let mainComponent;
  if (isSuccess && locations) {
    if (locations.length === 0) {
      mainComponent = <NoLocation />;
    } else {
      mainComponent = <LocationList setErrorMessage={setErrorMessage} />;
    }
  } else {
    // TODO: need to check if this is actually reloading the locations,
    //  otherwise we need to use refetch of useGetLocationsQuery
    mainComponent = (
      <LoadingError
        loading={isFetching}
        message="Deine Orte konnten nicht geladen werden."
        linkTo={RouteNames.Dashboard}
        linkName="Neu Laden"
      />
    );
  }

  return (
    <BasePage
      active={errorMessage !== ""}
      message={errorMessage}
      discardMessage={() => setErrorMessage("")}
    >
      {mainComponent}
    </BasePage>
  );
}

export { BREADCRUMB as DASHBOARD_BREADCRUMB };
