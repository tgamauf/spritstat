import React, {useLayoutEffect, useState} from "react";
import {Link, useNavigate, useParams} from "react-router-dom";
import {faChartLine, faTrash} from "@fortawesome/free-solid-svg-icons";

import BasePage from "../../common/components/BasePage";
import {Location, RouteNames} from "../../common/types";
import LocationField from "./LocationField";
import CurrentPriceField from "../currentPrice/CurrentPriceField";
import {
  useGetLocationsQuery,
  useLazyGetPriceDayOfMonthDataQuery,
  useLazyGetPriceDayOfWeekDataQuery
} from "./locationApiSlice";
import LoadingError from "../../common/components/LoadingError";
import PriceHistoryChart from "./PriceHistoryChart";
import DeleteLocationModal from "./DeleteLocationModal";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import PriceDayOfXChart from "./PriceDayOfXChart";


const BREADCRUMB = {
  name: "Ort",
  icon: faChartLine,
  destination: RouteNames.LocationDetails,
};

export default function LocationDetails(): JSX.Element {
  // Component is only loaded if params are matched, so locationId is never undefined
  const {locationId} = useParams() as unknown as {locationId: string};
  const {
    data: locations,
    error,
    isError: isLoadingError,
    isFetching,
    isSuccess,
    refetch
  } = useGetLocationsQuery();
  const [location, setLocation] = useState<Location>();
  const [deleteModalActive, setDeleteModalActive] = useState(false);
  const [isLocationError, setIsLocationError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();

  useLayoutEffect(() => {
    if (!isSuccess || !locations) {
      return;
    }

    setIsLocationError(false);
    const location_ = locations.find(e => e.id === Number(locationId));

    if (!location_) {
      console.error(`Location id ${locationId} doesn't exist in available locations: ${
        JSON.stringify(locations, null, 2)}`);
      setIsLocationError(true);
    } else {
      setLocation(location_);
    }
  }, [locations])

  let mainComponent;
  if (location) {
    mainComponent = (
      <div>
        {locationId && deleteModalActive && (
          <DeleteLocationModal
            locationId={Number(locationId)}
            close={() => setDeleteModalActive(false)}
            notifyDeleted={() => navigate(RouteNames.Dashboard, {replace: true})}
            setErrorMessage={setErrorMessage}
          />
        )}
        <div className="has-content-right">
          <button
            className="button is-primary is-outlined is-small is-right"
            title="Entferne diesen Ort."
            data-test="btn-delete-location-small"
            onClick={() => setDeleteModalActive(true)}
          >
            <FontAwesomeIcon className="icon" icon={faTrash}/>
            <span>Entfernen</span>
          </button>
        </div>
        <div className="tile is-ancestor">
          <div className="tile is-vertical">
            <div
              className="tile box card-header-title has-background-primary-light"
              data-test="location-info"
            >
              <div className="tile">
                <LocationField location={location}/>
              </div>
              <div className="tile is-ancestor">
                <CurrentPriceField location={location} isInteractive={true}/>
              </div>
            </div>
            <div className="tile box" data-test="price-history">
              <PriceHistoryChart
                location={location}
                isInteractive={true}
                setErrorMessage={setErrorMessage}
              />
            </div>
            <div className="tile box" data-test="price-day-of-week">
              <PriceDayOfXChart
                name="day of week"
                location={location}
                queryHook={useLazyGetPriceDayOfWeekDataQuery}
                setErrorMessage={setErrorMessage}
              />
            </div>
            <div className="tile box" data-test="price-day-of-month">
              <PriceDayOfXChart
                name="day of month"
                location={location}
                queryHook={useLazyGetPriceDayOfMonthDataQuery}
                setErrorMessage={setErrorMessage}
              />
            </div>
          </div>
        </div>
      </div>
    )
  } else {
    if (isLoadingError) {
      console.error(`Failed to load locations: ${JSON.stringify(error, null, 2)}`);
    }

    mainComponent = (
      <LoadingError
        loading={isFetching && !isLocationError}
        message="Der Ort konnte nicht geladen werden."
      >
        <Link
          className="has-text-primary"
          to=""
          onClick={() => refetch()}
          data-test="btn-reload-location"
        >
          Neu laden
        </Link>
      </LoadingError>
    );
  }

  return (
    <BasePage
      breadcrumbItems={[BREADCRUMB]}
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
};
