import React, { useEffect, useLayoutEffect, useRef, useState } from "react";

import { apiDeleteRequest } from "../../services/api";

const NO_LOCATION_ID = -1;

interface Props {
  locationId: number;
  close: () => void;
  notifyDeleted: () => void;
  setErrorMessage: (msg: string) => void;
}

export default function DeleteLocationModal({
  locationId,
  close,
  notifyDeleted,
  setErrorMessage,
}: Props): JSX.Element {
  const modalRef = useRef() as React.MutableRefObject<HTMLDivElement>;
  const deleteButtonRef = useRef() as React.MutableRefObject<HTMLButtonElement>;
  const [doDelete, setDoDelete] = useState(false);
  const [deleteInProgress, setDeleteInProgress] = useState(false);

  useEffect(() => {
    if (locationId === NO_LOCATION_ID) {
      return;
    }
    if (!doDelete) {
      return;
    }

    setDoDelete(false);
    setDeleteInProgress(true);

    apiDeleteRequest(`sprit/${locationId}`)
      .then((success) => {
        if (!success) {
          console.error(`Failed to delete location: request failed`);
          setErrorMessage("Dein Ort konnte nicht gelöscht werden.");
        }
      })
      .catch((e) => {
        console.error(`Failed to delete location: ${e}`);
        setErrorMessage("Dein Ort konnte nicht gelöscht werden.");
      })
      .finally(() => {
        setDeleteInProgress(false);
        notifyDeleted();
      });
  }, [doDelete]);

  useLayoutEffect(() => {
    if (modalRef.current) {
      if (locationId !== NO_LOCATION_ID) {
        modalRef.current.classList.add("is-active");
      } else {
        modalRef.current.classList.remove("is-active");
      }
    }
  }, [locationId]);

  useLayoutEffect(() => {
    if (deleteButtonRef.current) {
      if (deleteInProgress) {
        deleteButtonRef.current.classList.add("is-loading");
        deleteButtonRef.current.disabled = true;
      } else {
        deleteButtonRef.current.classList.remove("is-loading");
        deleteButtonRef.current.disabled = false;
      }
    }
  }, [deleteInProgress]);

  return (
    <div className="modal" ref={modalRef} data-test="modal-delete-location">
      <div className="modal-background" onClick={() => close()} />
      <div className="modal-content">
        <div className="box has-text-centered">
          <p className="text has-text-weight-bold is-size-5 mb-3">
            Willst du den Ort wirklich löschen?
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
      />
    </div>
  );
}

export type { Props as DeleteLocationModalProps };

export { NO_LOCATION_ID };
