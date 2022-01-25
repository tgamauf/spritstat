import React, { Dispatch, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import { apiDeleteRequest } from "../services/api";
import { ActionTypes, setSession } from "../services/store";
import { EMPTY_SESSION } from "../utils/constants";
import { RouteNames } from "../utils/types";

interface Props {
  dispatchGlobalState: Dispatch<ActionTypes>;
  show: boolean;
  close: () => void;
  setErrorMessage: (msg: string) => void;
}

export default function DeleteAccountModal({
  dispatchGlobalState,
  show,
  close,
  setErrorMessage,
}: Props): JSX.Element {
  const modalRef = useRef() as React.MutableRefObject<HTMLDivElement>;
  const deleteButtonRef = useRef() as React.MutableRefObject<HTMLButtonElement>;
  const [doDelete, setDoDelete] = useState(false);
  const [deleteInProgress, setDeleteInProgress] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!doDelete) {
      return;
    }

    setDoDelete(false);
    setDeleteInProgress(true);

    apiDeleteRequest("users/account/delete")
      .then((success) => {
        if (!success) {
          console.error(`Failed to delete account: request failed`);
          setErrorMessage("Dein Konto konnte nicht gelöscht werden.");
        } else {
          navigate(RouteNames.AccountDeleted);
          dispatchGlobalState(setSession(EMPTY_SESSION));
        }
      })
      .catch((e) => {
        console.error(`Failed to delete account: ${e}`);
        setErrorMessage("Dein Konto konnte nicht gelöscht werden.");
      })
      .finally(() => {
        setDeleteInProgress(false);
        close();
      });
  }, [doDelete]);

  if (modalRef.current) {
    if (show) {
      modalRef.current.classList.add("is-active");
    } else {
      modalRef.current.classList.remove("is-active");
    }
  }

  if (deleteButtonRef.current) {
    if (deleteInProgress) {
      deleteButtonRef.current.classList.add("is-loading");
      deleteButtonRef.current.disabled = true;
    } else {
      deleteButtonRef.current.classList.remove("is-loading");
      deleteButtonRef.current.disabled = false;
    }
  }

  return (
    <div className="modal" ref={modalRef} data-test="modal-delete-account">
      <div className="modal-background" onClick={() => close()} />
      <div className="modal-content">
        <div className="box has-text-centered">
          <p className="text has-text-weight-bold is-size-5 mb-3">
            Willst du dein Konto wirklich löschen?
          </p>
          <button
            className="button is-danger"
            ref={deleteButtonRef}
            onClick={() => setDoDelete(true)}
            data-test="btn-delete"
          >
            Löschen
          </button>
        </div>
      </div>
      <button
        className="modal-close is-large"
        aria-label="close"
        onClick={() => close()}
        data-test="btn-close"
      />
    </div>
  );
}

export type { Props as DeleteAccountModalProps };
