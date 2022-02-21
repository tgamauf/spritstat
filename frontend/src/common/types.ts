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
  Diesel = "Diesel",
  Super = "Super",
  Gas = "Gas",
}

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
  OneMonth,
  SixMonths,
}

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

export type {Coordinates, Location, OurFormElement, NamedLocation, Price, Station, StationMap};

export {DateRange, FuelType, LocationType, RegionType, RouteNames};