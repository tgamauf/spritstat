import introJs from "intro.js";
import {defineMessage, MessageDescriptor} from "react-intl";

interface FormElements extends HTMLFormControlsCollection {
  email: HTMLInputElement;
  password: HTMLInputElement;
}

interface OurFormElement extends HTMLFormElement {
  readonly elements: FormElements;
}

enum RouteNames {
  Index = "/",
  Home = "/home",
  Imprint = "/imprint",
  PrivacyPolicy = "/privacy",
  Signup = "/signup",
  VerifyEmailSent = "/verify-email-sent",
  ConfirmEmail = "/confirm-email",
  Login = "/login",
  PasswordRecoveryEmail = "/password-recover-email",
  ResetPassword = "/reset-password",
  Settings = "/settings",
  ChangePassword = "/change-password",
  Contact = "/contact",
  Dashboard = "/dashboard",
  AddLocation = "/add-location",
  LocationDetails = "/location-details",
  AccountDeleted = "/account-deleted",
  Unsubscribe = "/unsubscribe"
}

enum LocationType {
  Named,
  Region,
}

enum RegionType {
  Invalid,
  State,
  District,
}

enum FuelType {
  Diesel,
  Super,
  Gas,
}

const fuelTypeNames = new Map<FuelType, MessageDescriptor>([
  [
    FuelType.Diesel,
    defineMessage({description: "Fuel type diesel", defaultMessage: "Diesel"})
  ],
  [
    FuelType.Super,
    defineMessage({description: "Fuel type gasoline", defaultMessage: "Super"})
  ],
  [
    FuelType.Gas,
    defineMessage({description: " Fuel type autogas", defaultMessage: "Gas"})
  ],
]);

interface Coordinates {
  latitude: number;
  longitude: number;
}

interface NamedLocation {
  name: string;
  coords: Coordinates;
}

interface Location {
  id: number;
  type: LocationType;
  name: string;
  latitude?: number;
  longitude?: number;
  regionCode?: string;
  regionType?: RegionType;
  fuelType: FuelType;
}

enum DateRange {
  All,
  OneWeek,
  OneMonth,
  ThreeMonths,
  SixMonths,
}

const dateRangeNames = new Map<DateRange, MessageDescriptor>([
  [
    DateRange.All,
    defineMessage({description: "DateRange all", defaultMessage: "Alle"})
  ],
  [
    DateRange.OneWeek,
    defineMessage({description: "DateRange 1w", defaultMessage: "1W"})
  ],
  [
    DateRange.OneMonth,
    defineMessage({description: "DateRange 1m", defaultMessage: "1M"})
  ],
  [
    DateRange.ThreeMonths,
    defineMessage({description: "DateRange 3m", defaultMessage: "3M"})
  ],
  [
    DateRange.SixMonths,
    defineMessage({description: "DateRange 6m", defaultMessage: "6M"})
  ],
]);

interface Station {
  id: number;
  name: string;
  address: string;
  postalCode: string;
  city: string;
}

type StationMap = {
  [key: number]: Station;
};

interface Price {
  id: number;
  datetime: string;
  stations: number[];
  amount: number;
}

// Override the introJs namespace to provide the internal properties we need
type IntroJs = typeof introJs & {
  _currentStep: number,
  _options: introJs.Options,
  _introItems: introJs.Step[]
}

export type {
  Coordinates,
  IntroJs,
  Location,
  OurFormElement,
  NamedLocation,
  Price,
  Station,
  StationMap
};

export {
  DateRange,
  dateRangeNames,
  FuelType,
  fuelTypeNames,
  LocationType,
  RegionType,
  RouteNames
};
