import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { faHome } from "@fortawesome/free-solid-svg-icons";

import { useGlobalState } from "../../App";
import NoLocation from "../../components/NoLocation";
import CenteredBox from "../../components/CenteredBox";
import BasePage from "../../components/BasePage";
import LocationList from "../../components/LocationList";
import { apiGetRequest } from "../../services/api";
import { Location, RouteNames } from "../../utils/types";

const BREADCRUMB = {
  name: "Startseite",
  icon: faHome,
  destination: RouteNames.Dashboard,
};

export default function Dashboard() {
  const [{ isAuthenticated }] = useGlobalState();
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [refreshUserLocations, setRefreshUserLocations] = useState(false);
  const [locations, setLocations] = useState<Location[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      setRefreshUserLocations(true);
    } else {
      navigate(RouteNames.Login, { replace: true });
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (refreshUserLocations) {
      setRefreshUserLocations(false);

      apiGetRequest("sprit")
        .then((response) => {
          if (response === null || typeof response === "boolean") {
            console.error("Failed to get locations: request failed");
            setErrorMessage("Deine Orte konnten nicht geladen werden.");
            return;
          }

          setLocations(response);
          setLoading(false);
        })
        .catch((error) => {
          console.error(`Failed to get locations: ${error}`);
          setErrorMessage("Deine Orte konnten nicht geladen werden.");
        });
    }
  }, [refreshUserLocations]);

  let mainComponent;
  if (loading) {
    mainComponent = <CenteredBox loading={loading} />;
  } else if (locations.length === 0) {
    mainComponent = <NoLocation />;
  } else {
    mainComponent = (
      <LocationList
        locations={locations}
        setErrorMessage={setErrorMessage}
        triggerLocationsRefresh={() => setRefreshUserLocations(true)}
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
