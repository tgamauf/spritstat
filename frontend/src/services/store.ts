import {GlobalState as State, Session} from "../utils/types";

const SET_SESSION = "SET_SESSION";

interface SetSession {
  type: typeof SET_SESSION;
  session: Session
}

type ActionTypes =
  | SetSession;

function setSession(session: Session): ActionTypes {
  return {
    type: SET_SESSION,
    session
  };
}

function reducer(state: State, action: ActionTypes): State {
  if (action.type === SET_SESSION) {
    return {
      ...state,
      isAuthenticated: action.session.isAuthenticated,
      email: action.session.email
    }
  }

  return state;
}

export type {
  ActionTypes
}

export {
  setSession,
  reducer
}