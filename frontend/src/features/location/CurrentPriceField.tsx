import React, {useEffect, useState} from "react";
import {Trans} from "@lingui/macro";

import {Location, Station} from "../../common/types";
import {useGetCurrentPriceQuery} from "./priceApiSlice";


const MAPS_URL = "https://www.google.com/maps/search";
const NO_CURRENT_PRICE = -1;
const CURRENT_PRICE_FIELD_ID = "current-price-field";

type Stations = {
  name: string;
  address: string;
  postalCode: string;
  city: string;
  url: string;
}[];

interface Props {
  location: Location;
  isInteractive: boolean;
}

export default function CurrentPriceField({location, isInteractive}: Props): JSX.Element {
  const {data, error, isLoading} = useGetCurrentPriceQuery(location);
  const [currentPrice, setCurrentPrice] = useState<number>(NO_CURRENT_PRICE);
  const [stations, setStations] = useState<Stations>([]);

  useEffect(() => {
    function createMapsURL(station: Station): string {
      // We use the Google Maps search url here as the address and coordinates
      //  of the gas stations are inaccurate and often do not deliver good
      //  results if we try to get it via geocoding API
      const searchQuery = `${station.name} ${station.address} ${station.postalCode} ${station.city}`;

      return encodeURI(`${MAPS_URL}/${searchQuery}`);
    }

    if (data) {
      setCurrentPrice(data.amount);

      const stations_: Stations = [];
      for (const s of data.stations) {
        stations_.push({
          name: s.name,
          address: s.address,
          postalCode: s.postalCode,
          city: s.city,
          url: createMapsURL(s),
        });
      }
      setStations(stations_);
    }

    if (error) {
      console.error(`Failed to get current price: ${JSON.stringify(error, null, 2)}`);
    }
  }, [isLoading]);

  return (
    <div className="tile is-parent" id={CURRENT_PRICE_FIELD_ID}>
      {currentPrice ? (
        <div>
          <div className="tile is-child content mb-5">
            <p className="card-key mb-0">Aktuell niedrigster Preis</p>
            {currentPrice !== NO_CURRENT_PRICE && (
              <p className="card-value">{currentPrice} €</p>
            )}
          </div>
          {stations && stations.length > 0 && (
            <div className="tile is-child content">
              <span className="card-key"><Trans>Tankstellen</Trans></span>
              <div className="card-value mt-0">
                {stations.map((item, index) => {
                  return (
                    <div className="is-flex is-flex-wrap-nowrap" key={index}>
                      <span className="mr-1">&bull;</span>
                      {isInteractive ? (
                        <a
                          className="has-text-dark is-underlined"
                          title={`${item.address}, ${item.postalCode} ${item.city}`}
                          href={item.url}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <span>{item.name}</span>
                        </a>
                      ) : (
                        <p className="has-text-dark">{item.name}</p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div/>
      )}
    </div>
  );
};

export {CURRENT_PRICE_FIELD_ID};
