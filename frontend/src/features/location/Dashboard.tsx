import React, {useEffect, useState} from "react";
import {Link} from "react-router-dom";
import {faHome} from "@fortawesome/free-solid-svg-icons";
import {defineMessage, t, Trans} from "@lingui/macro";

import NoLocation from "./NoLocation";
import BasePage from "../../common/components/BasePage";
import LocationList from "./LocationList";
import {RouteNames} from "../../common/types";
import {useGetLocationsQuery} from "./locationApiSlice";
import LoadingError from "../../common/components/LoadingError";
import {BreadcrumbItem} from "../../common/components/Breadcrumb";


const BREADCRUMB: BreadcrumbItem = {
  name: defineMessage({id: "breadcrumb.dashboard", message: "Startseite"}),
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
        message={t`Deine Orte konnten nicht geladen werden.`}
        children={
          <Link className="has-text-primary" to="" onClick={() => refetch()}>
            <Trans>Neu laden</Trans>
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
      <div className="columns is-centered wide-content">
        <div className="column is-two-thirds-fullhd">
          {mainComponent}
        </div>
      </div>
    </BasePage>
  );
}

export {BREADCRUMB as DASHBOARD_BREADCRUMB};
