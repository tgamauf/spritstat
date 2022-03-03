declare module "*.png";
declare module "*.svg";

declare interface Window {
  csrfToken?: string;
  initGoogleMapsAPI: () => void;
}

type RecursivePartial<T> = {
    [P in keyof T]?: RecursivePartial<T[P]>;
};
