import React, { useEffect, useState } from "react";

import { Location, Station } from "../../common/types";
import { econtrolAPIGetPrice } from "../../services/econtrolApi";

const MAPS_URL = "https://www.google.com/maps/search";
const NO_CURRENT_PRICE = -1;

type Stations = {
  name: string;
  address: string;
  postalCode: string;
  city: string;
  url: string;
}[];

interface Props {
  location: Location;
}

export default function CurrentPriceField({ location }: Props): JSX.Element {
  const [currentPrice, setCurrentPrice] = useState<number>();
  const [stations, setStations] = useState<Stations>();

  useEffect(() => {
    function createMapsURL(station: Station): string {
      // We use the Google Maps search url here as the address and coordinates
      //  of the gas stations are inaccurate and often do not deliver good
      //  results if we try to get it via geocoding API
      const searchQuery = `${station.name} ${station.address} ${station.postalCode} ${station.city}`;

      return encodeURI(`${MAPS_URL}/${searchQuery}`);
    }

    async function getPrice(location: Location): Promise<void> {
      const currentPrice = await econtrolAPIGetPrice(location);
      if (!currentPrice) {
        console.error(`Could not fetch price: request not ok`);
        return;
      }
      if (!currentPrice.amount) {
        console.warn(`Could not fetch price: no price found`);
        setCurrentPrice(NO_CURRENT_PRICE);
        return;
      }

      const stations_: Stations = [];
      for (const s of currentPrice.stations) {
        stations_.push({
          name: s.name,
          address: s.address,
          postalCode: s.postalCode,
          city: s.city,
          url: createMapsURL(s),
        });
      }

      setCurrentPrice(currentPrice.amount);
      setStations(stations_);
    }

    getPrice(location).catch((e: any) => {
      console.error(`Could not fetch cheapest price urls: ${e}`);
    });
  }, []);

  return (
    <div className="tile is-parent">
      {currentPrice && (
        <div>
          <div className="tile is-child content mb-5">
            <p className="card-key mb-0">Bester Preis</p>
            {currentPrice !== NO_CURRENT_PRICE ? (
              <p className="card-value ml-3">{currentPrice} €</p>
            ) : (
              <p className="card-value has-text-danger ml-3">-- €</p>
            )}
          </div>
          {stations && stations.length > 0 && (
            <div className="tile is-child content">
              <span className="card-key">Tankstellen</span>
              <ul className="card-value mt-0">
                {stations.map((item, index) => {
                  return (
                    <li key={index}>
                      <a
                        className="has-text-dark is-underlined"
                        title={`${item.address}, ${item.postalCode} ${item.city}`}
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <span>{item.name}</span>
                      </a>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export type { Props as CurrentPriceFieldProps };
