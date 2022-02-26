import React, {useLayoutEffect, useState} from "react";
import {Link, useLocation, useNavigate, useParams} from "react-router-dom";
import {faChartLine, faTrash} from "@fortawesome/free-solid-svg-icons";

import BasePage from "../../common/components/BasePage";
import {DateRange, Location, RouteNames} from "../../common/types";
import LocationField from "./LocationField";
import CurrentPriceField from "./CurrentPriceField";
import {
  useGetLocationsQuery,
  useLazyGetPriceDayOfMonthDataQuery,
  useLazyGetPriceDayOfWeekDataQuery,
  useLazyGetPriceHourDataQuery
} from "./locationApiSlice";
import LoadingError from "../../common/components/LoadingError";
import PriceHistoryChart from "./PriceHistoryChart";
import DeleteLocationModal from "./DeleteLocationModal";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import AveragePriceChart from "./AveragePriceChart";
import PriceStationFrequencyChart from "./PriceStationFrequencyChart";
import {BreadcrumbItem} from "../../common/components/Breadcrumb";

const breadcrumb: BreadcrumbItem = {
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
  const {pathname} = useLocation();
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
            <div className="tile box" data-test="price-hour">
              <AveragePriceChart
                name="Niedrigster Preis pro Stunde"
                location={location}
                queryHook={useLazyGetPriceHourDataQuery}
                dateRangeItems={[
                  {name: "1W", value: DateRange.OneWeek},
                  {name: "1M", value: DateRange.OneMonth},
                  {name: "3M", value: DateRange.ThreeMonths},
                  {name: "6M", value: DateRange.SixMonths},
                  {name: "Alles", value: DateRange.All},
                ]}
                initialDateRange={DateRange.OneWeek}
                setErrorMessage={setErrorMessage}
              />
            </div>
            <div className="tile box" data-test="price-day-of-week">
              <AveragePriceChart
                name="Niedrigster Preis pro Wochentag"
                location={location}
                queryHook={useLazyGetPriceDayOfWeekDataQuery}
                setErrorMessage={setErrorMessage}
              />
            </div>
            <div className="tile box" data-test="price-day-of-month">
              <AveragePriceChart
                name="Niedrigster Preis pro Tag im Monat"
                location={location}
                queryHook={useLazyGetPriceDayOfMonthDataQuery}
                setErrorMessage={setErrorMessage}
              />
            </div>
            <div className="tile box" data-test="price-station-frequency">
              <PriceStationFrequencyChart
                location={location}
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

  breadcrumb.destination = pathname;
  return (
    <BasePage
      breadcrumbItems={[breadcrumb]}
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
