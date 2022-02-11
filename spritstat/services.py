from dataclasses import dataclass
from decimal import Decimal
from django.contrib.sessions.management.commands.clearsessions import (
    Command as ClearSessionCommand,
)
from enum import Enum, unique
import json
from statistics import mean, median
from typing import Dict, List, Tuple, Union
import urllib3

from . import models


BASE_URL = "https://api.e-control.at/sprit/1.0"
STATION_BASE_URL = f"{BASE_URL}/search/gas-stations"
STATION_BY_ADDRESS_PARAMS = (
    "latitude={latitude:f}&longitude={longitude:f}&fuelType={fuel_type}"
)
STATION_BY_ADDRESS_URL = f"{STATION_BASE_URL}/by-address?{STATION_BY_ADDRESS_PARAMS}"
STATION_BY_REGION_PARAMS = "code={code}&type={type}&fuelType={fuel_type}"
STATION_BY_REGION_URL = f"{STATION_BASE_URL}/by-region?{STATION_BY_REGION_PARAMS}"


@unique
class APIFuelType(str, Enum):
    DIESEL = "DIE"
    SUPER = "SUP"
    GAS = "GAS"


class APIError(Exception):
    pass


class InvalidFuelTypeError(Exception):
    pass


@dataclass(frozen=True)
class Station:
    id: int
    name: str
    address: str
    postal_code: str
    city: str
    latitude: Decimal
    longitude: Decimal

    def __str__(self) -> str:
        return (
            f"<{self.__class__}>("
            f"{self.id}, "
            f"{self.name}, "
            f"{self.address}, "
            f"{self.postal_code}, "
            f"{self.city}, "
            f"{self.latitude}, "
            f"{self.longitude})"
        )


@dataclass(frozen=True)
class Price:
    station: Station
    fuel_type: APIFuelType
    amount: str

    def __str__(self) -> str:
        return (
            f"<{self.__class__}>("
            f"{self.station}, "
            f"{self.fuel_type.name}, "
            f"{self.amount})"
        )


@dataclass(frozen=True)
class PriceStatistics:
    min_amount: float
    max_amount: float
    average_amount: float
    median_amount: float

    def __str__(self) -> str:
        return (
            f"<{self.__class__}>("
            f"{self.min_amount}, "
            f"{self.max_amount}, "
            f"{self.average_amount}, "
            f"{self.median_amount})"
        )


def request_location_prices(location_id: int) -> None:
    """
    Request the top prices for the specified location.

    :param location_id: primary key of the corresponding location database object
    """

    location = models.Location.objects.get(pk=location_id)

    if location.type == models.LocationType.REGION:
        url = STATION_BY_REGION_URL.format(
            code=location.region_code,
            type=location.region_type,
            fuel_type=APIFuelType(location.fuel_type),
        )
    else:
        url = STATION_BY_ADDRESS_URL.format(
            latitude=location.latitude,
            longitude=location.longitude,
            fuel_type=APIFuelType(location.fuel_type),
        )

    prices = request_prices(url)

    if not prices:
        return

    stations, statistics = calculate_statistics(prices)

    if not stations:
        raise APIError(f"Invalid price object received: {prices}")

    create_price_if_changed(location, stations, statistics)


def request_prices(url: str) -> Tuple[Price]:
    """
    Execute the price request given the provided URL and return the parsed
    prices.

    :param url: URL to use for the request
    :return: tuple of parsed prices
    """

    json_data = execute_api_request(url)

    prices = []
    for item in json_data:
        result = parse_prices(item)

        if result:
            prices.append(result)

    return tuple(prices)


def execute_api_request(url: str) -> Dict:
    """
    Execute API request using the provided URL and return the json data.
    """

    http = urllib3.PoolManager()
    r = http.request("GET", url)

    if r.status != 200:
        json_error = json.loads(r.data.decode("utf-8"))
        raise APIError(
            f"API call failed [{json_error['code']} {json_error['name']}]: "
            f"{json_error['exceptionMessage']}"
        )

    json_data = json.loads(r.data.decode("utf-8"))

    return json_data


def parse_prices(item: Dict) -> Union[Price, None]:
    """
    Parse an item of the price result received via API.

    :param item: an API price item containing the station and price information
    :return: parsed price point object or None if no price was found in response
    """

    # If no prices have been found the entry is invalid. This only should
    #  happen if closed stations have been requested as well, but experience
    #  shows that entries like that are returned at least sometimes even if
    #  they aren't requested.
    if not len(item["prices"]):
        return None

    station = Station(
        id=item["id"],
        name=item["name"],
        address=item["location"]["address"],
        postal_code=item["location"]["postalCode"],
        city=item["location"]["city"],
        latitude=Decimal(round(item["location"]["latitude"], 7)),
        longitude=Decimal(round(item["location"]["longitude"], 7)),
    )

    fuel_type = APIFuelType(item["prices"][0]["fuelType"])
    price = Price(station, fuel_type, str(item["prices"][0]["amount"]))

    if not price:
        return None

    return price


def calculate_statistics(
    prices: Tuple[Price],
) -> Tuple[List[Station], PriceStatistics]:
    """
    Calculate the price statistics from the provided price objects.

    :param prices: price objects
    :return: if valid prices have been found return a tuple of the cheapest
        stations and the price statistics
    """

    amounts = tuple(float(p.amount) for p in prices)

    min_amount = min(amounts)
    stations = []
    for p in prices:
        if float(p.amount) <= min_amount:
            stations.append(p.station)

    statistics = PriceStatistics(
        min_amount=min_amount,
        max_amount=max(amounts),
        average_amount=mean(amounts),
        median_amount=median(amounts),
    )

    return stations, statistics


def create_price_if_changed(
    location: models.Location,
    stations: List[models.Station],
    price_statistics: PriceStatistics,
):
    """
    Create the new price object in the database if any of the statistics has
    changed from the last price object.

    :param location: location the prices correspond to
    :param stations: list of stations with the minimum price
    :param price_statistics: objects containing the price statistics
    """

    station_objects = get_or_create_stations(location, stations)

    last_price = models.Price.objects.filter(location=location).last()
    create = True
    if (
        last_price
        and (set(station_objects) == set(last_price.stations.all()))
        and (price_statistics.min_amount == last_price.min_amount)
        and (price_statistics.max_amount == last_price.max_amount)
        and (price_statistics.average_amount == last_price.average_amount)
        and (price_statistics.median_amount == last_price.median_amount)
    ):
        create = False

    if create:
        price = models.Price.objects.create(
            location=location,
            min_amount=price_statistics.min_amount,
            max_amount=price_statistics.max_amount,
            average_amount=price_statistics.average_amount,
            median_amount=price_statistics.median_amount,
        )
        price.stations.add(*station_objects)


def get_or_create_stations(
    location: models.Location, stations: List[Station]
) -> List[models.Station]:
    """
    Create new gas station objects if it is valid and doesn't exist yet.

    :param location: location the station corresponds to
    :param stations: stations received via API
    :return: list of corresponding database objects
    """

    objects = []
    for s in stations:
        try:
            obj = models.Station.objects.get(pk=s.id)
            obj.users.add(location.user)
        except models.Station.DoesNotExist:
            obj = models.Station.objects.create(
                id=s.id,
                user=location.user,
                name=s.name,
                address=s.address,
                postal_code=s.postal_code,
                city=s.city,
                latitude=s.latitude,
                longitude=s.longitude,
            )
        objects.append(obj)

    return objects


def clear_expired_sessions():
    # Clear database backed sessions using the clearsessions command
    ClearSessionCommand().handle()
