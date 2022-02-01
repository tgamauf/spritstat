import { Session } from "./types";

const EMPTY_SESSION: Session = {
  isAuthenticated: false,
  hasBetaAccess: false,
  email: "",
};
const MAX_SCREENSIZE_MOBILE = 768;

export { EMPTY_SESSION, MAX_SCREENSIZE_MOBILE };
