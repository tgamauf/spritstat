interface FormElements extends HTMLFormControlsCollection {
  email: HTMLInputElement;
  password: HTMLInputElement;
}

interface OurFormElement extends HTMLFormElement {
  readonly elements: FormElements;
}

interface Session {
  isAuthenticated: boolean;
  email: string;
}

interface GlobalState {
  isAuthenticated: boolean;
  email: string;
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
  AccountDeleted = "/account-deleted",
}

enum LocationType {
  Named = 1,
  Region = 2,
}

enum FuelType {
  Diesel = "DIE",
  Super = "SUP",
  Gas = "GAS",
}

const FuelTypeLabels = new Map<FuelType, string>([
  [FuelType.Diesel, "Diesel"],
  [FuelType.Super, "Super"],
  [FuelType.Gas, "Gas"],
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
  region_code?: string;
  region_type?: string;
  fuel_type: FuelType;
}

interface Station {
  id: number;
  name: string;
  address: string;
  postalCode: string;
  city: string;
}

interface Price {
  id: number;
  datetime: string;
  cheapest_station: number;
  min_amount: number;
}

export type {
  Coordinates,
  Location,
  GlobalState,
  OurFormElement,
  NamedLocation,
  Price,
  Session,
  Station,
};

export { FuelType, FuelTypeLabels, LocationType, RouteNames };
