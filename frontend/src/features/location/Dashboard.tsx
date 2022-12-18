import React, {useEffect, useState} from "react";
import {Link} from "react-router-dom";
import {faHome} from "@fortawesome/free-solid-svg-icons";
import {defineMessage, useIntl} from "react-intl";

import NoLocation from "./NoLocation";
import BasePage from "../../common/components/BasePage";
import LocationList from "./LocationList";
import {RouteNames} from "../../common/types";
import {useGetLocationsQuery} from "./locationApiSlice";
import LoadingError from "../../common/components/LoadingError";
import {BreadcrumbItem} from "../../common/components/Breadcrumb";
import CurrentLocationMap from "./CurrentLocationMap";


const BREADCRUMB: BreadcrumbItem = {
  name: defineMessage({
    description: "Dashboard breadcrumb",
    defaultMessage: "Startseite"
  }),
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
  const intl = useIntl();

  useEffect(() => {
    if (isError) {
      console.error(
        `Failed to get locations: ${JSON.stringify(error, null, 2)}`
      );
    }
  }, [isError]);

  let myLocationsComponent;
  if (isSuccess && locations) {
    if (locations.length === 0) {
      myLocationsComponent = <NoLocation/>;
    } else {
      myLocationsComponent = <LocationList setErrorMessage={setErrorMessage}/>;
    }
  } else {
    myLocationsComponent = (
      <LoadingError
        loading={isFetching}
        message={intl.formatMessage({
          description: "Dashboard error",
          defaultMessage: "Deine Orte konnten nicht geladen werden."
        })}
        children={
          <Link className="has-text-primary" to="" onClick={() => refetch()}>
            {intl.formatMessage({
              description: "Dashboard reload button",
              defaultMessage: "Neu laden"
            })}
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
          <section className="section">
            <CurrentLocationMap />
          </section>
          <section className="section">
            {myLocationsComponent}
          </section>
        </div>
      </div>
    </BasePage>
  );
}

export {BREADCRUMB as DASHBOARD_BREADCRUMB};
