import React, {useEffect, useLayoutEffect, useRef, useState} from "react";
import {Link, useLocation, useNavigate, useParams} from "react-router-dom";
import {faChartLine, faTrash} from "@fortawesome/free-solid-svg-icons";
import introJs from "intro.js";
import {defineMessage, useIntl} from "react-intl";

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
import PriceHistoryChart, {BTN_CHART_HISTORY_DATE_RANGE_ID} from "./PriceHistoryChart";
import DeleteLocationModal from "./DeleteLocationModal";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import AveragePriceChart from "./AveragePriceChart";
import PriceStationFrequencyChart from "./PriceStationFrequencyChart";
import {BreadcrumbItem} from "../../common/components/Breadcrumb";
import {getFormattedIntroOption, updateIntroStepElement, useAppSelector} from "../../common/utils";
import {selectIntroSettingsLocationDetails} from "../../common/settings/settingsSlice";
import {useSetSettingMutation} from "../../common/apis/spritstatApi";
import AveragePriceDayOfWeekChart from "./AveragePriceDayOfWeekChart";


const FIELD_LOCATION_DETAILS_ID = "field-location-details";
const CHART_HISTORY_ID = "chart-history";
const CHART_HOUR_ID = "chart-hour";
const CHART_WEEKDAY_ID = "chart-weekday";
const CHART_DAY_OF_MONTH_ID = "chart-day-of-month";
const CHART_STATION_ID = "chart-station";
const BTN_DELETE_LOCATION_ID = "btn-delete-location";

const breadcrumb: BreadcrumbItem = {
  name: defineMessage({
    description: "LocationDetails breadcrumb",
    defaultMessage: "Ort"
  }),
  icon: faChartLine,
  destination: RouteNames.LocationDetails,
};

export default function LocationDetails(): JSX.Element {
  // Component is only loaded if params are matched, so locationId is never undefined
  const {locationId} = useParams() as unknown as {locationId: string};
  // @ts-ignore this is a fluke caused somehow by intro.js-react typing
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
  const introActive = useAppSelector(selectIntroSettingsLocationDetails);
  const [setSettings] = useSetSettingMutation();
  const [introDone, setIntroDone] = useState(false);
  const intl = useIntl();

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
  }, [locations]);

  useEffect(() => {
    if (introDone) {
      setIntroDone(false);

      setSettings({intro: {location_details_active: false}}).unwrap()
        .catch((e) => {
          console.error(`Failed to disable LocationDetails intro: ${JSON.stringify(e, null, 2)}`);
        })
    }
  }, [introDone]);

  useEffect(() => {
    if (location && introActive) {
      introJs().setOptions({
        ...getFormattedIntroOption(intl),
        steps: [
          {
            intro: intl.formatMessage({
              description: "LocationDetails intro 1",
              defaultMessage: "Auf dieser Seite werden detaillierte Preisdaten des " +
                "gewählten Ortes angezeigt."
            })
          },
          {
            element: `#${FIELD_LOCATION_DETAILS_ID}`,
            intro: intl.formatMessage({
              description: "LocationDetails intro 2",
              defaultMessage: "Auch hier wird die Beschreibung des Ortes und der " +
                "aktuelle Preis angezeigt. Zusätzlich ist es möglich direkt auf den " +
                "Tankstellennamen zu klicken um diese auf Google Maps angezeigt zu " +
                "bekommen."
            })
          },
          {
            element: `#${CHART_HISTORY_ID}`,
            intro: intl.formatMessage({
              description: "LocationDetails intro 3",
              defaultMessage: "Dieser Graph zeigt den zeitlichen Verlauf des " +
                "niedrigsten Treibstoffpreises über den gewählten Zeitraum an."
            })
          },
          {
            element: `#${CHART_HISTORY_ID}`,
            intro: intl.formatMessage({
              description: "LocationDetails intro 4",
              defaultMessage: "Es ist möglich den Graphen zu vergrößern. Auf einem " +
                "Mobiltelefon oder Tablet kann mit Pinch-and-Zoom die Zoomstufe " +
                "verändert und danach mit zwei Fingern entlang der x-Achse gescrollt " +
                "werden. Mit einer Maus ist das mit STRG + Mausrad, bzw. durch Klick " +
                "+ Ziehen möglich."
            })
          },
          {
            element: `#${BTN_CHART_HISTORY_DATE_RANGE_ID}`,
            intro: intl.formatMessage({
              description: "LocationDetails intro 5",
              defaultMessage: "Für alle Graphen ist es möglich den angezeigten " +
                "Zeitraum zu wählen."
            })
          },
          {
            element: `#${CHART_HOUR_ID}`,
            intro: intl.formatMessage({
              description: "LocationDetails intro 6",
              defaultMessage: "Dieser Graph zeigt den durchschnittlich niedrigsten " +
                "Preis pro Tageszeit im gewählten Zeitraum an."
            })
          },
          {
            element: `#${CHART_WEEKDAY_ID}`,
            intro: intl.formatMessage({
              description: "LocationDetails intro 7",
              defaultMessage: "Dieser Graph zeigt den durchschnittlichen niedrigsten " +
                "Preis pro Wochentag im gewählten Zeitraum an."
            })
          },
          {
            element: `#${CHART_DAY_OF_MONTH_ID}`,
            intro: intl.formatMessage({
              description: "LocationDetails intro 8",
              defaultMessage: "Dieser Graph zeigt den durchschnittlichen niedrigsten " +
                "Preis pro Tag im Monat im gewählten Zeitraum an."
            })
          },
          {
            element: `#${CHART_STATION_ID}`,
            intro: intl.formatMessage({
              description: "LocationDetails intro 9",
              defaultMessage: "Dieser Graph zeigt an wie häufig eine Tankstelle im " +
                "gewählten Zeitraum den niedrigsten Preis angeboten hat."
            })
          },
          {
            element: `#${BTN_DELETE_LOCATION_ID}`,
            intro: intl.formatMessage({
              description: "LocationDetails intro 10",
              defaultMessage: "Schlussendlich ist es möglich den Ort zu löschen, " +
                "falls er nicht mehr relevant für dich ist."
            })
          }
        ]
      }).onexit(
        () => setIntroDone(true)
      ).onbeforechange(
        updateIntroStepElement
      ).start();
    }
  }, [location, introActive]);

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
            title={intl.formatMessage({
              description: "LocationDetails delete button title",
              defaultMessage: "Entferne diesen Ort."
            })}
            data-test="btn-delete-location-small"
            onClick={() => setDeleteModalActive(true)}
            id={BTN_DELETE_LOCATION_ID}
          >
            <FontAwesomeIcon className="icon" icon={faTrash}/>
            <span>{intl.formatMessage({
              description: "LocationDetails delete button text",
              defaultMessage: "Entfernen"
            })}</span>
          </button>
        </div>
        <div className="tile is-ancestor">
          <div className="tile is-vertical">
            <div
              className="tile box card-header-title has-background-primary-light"
              data-test="location-info"
              id={FIELD_LOCATION_DETAILS_ID}
            >
              <div className="tile">
                <LocationField location={location}/>
              </div>
              <div className="tile is-ancestor">
                <CurrentPriceField location={location} isInteractive={true}/>
              </div>
            </div>
            <div className="tile box" data-test="price-history" id={CHART_HISTORY_ID}>
              <PriceHistoryChart
                location={location}
                isInteractive={true}
                setErrorMessage={setErrorMessage}
              />
            </div>
            <div className="tile box" data-test="price-hour" id={CHART_HOUR_ID}>
              <AveragePriceChart
                name={defineMessage({
                  description: "LocationDetails lowest price per hour graph title",
                  defaultMessage: "Niedrigster Preis pro Stunde"
                })}
                location={location}
                queryHook={useLazyGetPriceHourDataQuery}
                dateRangeItems={[
                  DateRange.OneWeek,
                  DateRange.OneMonth,
                  DateRange.ThreeMonths,
                  DateRange.SixMonths,
                  DateRange.All,
                ]}
                initialDateRange={DateRange.OneWeek}
                setErrorMessage={setErrorMessage}
              />
            </div>
            <div className="tile box" data-test="price-day-of-week" id={CHART_WEEKDAY_ID}>
              <AveragePriceDayOfWeekChart
                location={location}
                setErrorMessage={setErrorMessage}
              />
            </div>
            <div
              className="tile box"
              data-test="price-day-of-month"
              id={CHART_DAY_OF_MONTH_ID}
            >
              <AveragePriceChart
                name={defineMessage({
                  description: "LocationDetails lowest price per day of month graph title",
                  defaultMessage: "Niedrigster Preis pro Tag im Monat"
                })}
                location={location}
                queryHook={useLazyGetPriceDayOfMonthDataQuery}
                setErrorMessage={setErrorMessage}
              />
            </div>
            <div
              className="tile box"
              data-test="price-station-frequency"
              id={CHART_STATION_ID}
            >
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
        message={intl.formatMessage({
          description: "LocationDetails error",
          defaultMessage: "Der Ort konnte nicht geladen werden."
        })}
      >
        <Link
          className="has-text-primary"
          to=""
          onClick={() => refetch()}
          data-test="btn-reload-location"
        >
          {intl.formatMessage({
            description: "LocationDetails reload button",
            defaultMessage: "Neu laden"
          })}
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
