declare module "*.png";
declare module "*.svg";

declare interface Window {
  csrfToken?: string;
  initGoogleMapsAPI: () => void;
}
