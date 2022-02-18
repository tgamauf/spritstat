import React, {useEffect, useState} from "react";
import {Link} from "react-router-dom";
import {faHome} from "@fortawesome/free-solid-svg-icons";

import NoLocation from "./NoLocation";
import BasePage from "../../common/components/BasePage";
import LocationList from "./LocationList";
import {RouteNames} from "../../common/types";
import {useGetLocationsQuery} from "./locationApiSlice";
import LoadingError from "../../common/components/LoadingError";


const BREADCRUMB = {
  name: "Startseite",
  icon: faHome,
  destination: RouteNames.Dashboard,
};

export default function Dashboard() {
  // The query is skipped if not authenticated
  const {
    data: locations,
    error,
    isError,
    isFetching,
    isSuccess,
    refetch
 } = useGetLocationsQuery();
  const [errorMessage, setErrorMessage] = useState("");

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
    mainComponent = (
      <LoadingError
        loading={isFetching}
        message="Deine Orte konnten nicht geladen werden."
        children={
          <Link className="has-text-primary" to="" onClick={() => refetch()}>
            Neu laden
          </Link>
       }
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

export {BREADCRUMB as DASHBOARD_BREADCRUMB};
