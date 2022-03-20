import React, {useEffect, useLayoutEffect, useRef, useState} from "react";
import {defineMessage, useIntl} from "react-intl";

import {useDeleteLocationMutation} from "./locationApiSlice";

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
  const [deleteLocation, {isLoading: isDeleting}] = useDeleteLocationMutation();
  const modalRef = useRef() as React.MutableRefObject<HTMLDivElement>;
  const deleteButtonRef = useRef() as React.MutableRefObject<HTMLButtonElement>;
  const [doDelete, setDoDelete] = useState(false);
  const intl = useIntl();

  useEffect(() => {
    if (!doDelete) {
      return;
    }

    setDoDelete(false);

    const error = defineMessage({
      description: "DeleteLocationModal error",
      defaultMessage: "Dein Ort konnte nicht gelöscht werden."
    });
    deleteLocation(locationId).unwrap()
      .then((success) => {
        if (!success) {
          console.error(`Failed to delete location ${locationId}: request failed`);
          setErrorMessage(intl.formatMessage(error));
        }
      })
      .catch((e) => {
        console.error(
          `Failed to delete location ${locationId}: ${JSON.stringify(e, null, 2)}`
        );
        setErrorMessage(intl.formatMessage(error))
      })
      .finally(() => {
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
      if (isDeleting) {
        deleteButtonRef.current.classList.add("is-loading");
        deleteButtonRef.current.disabled = true;
      } else {
        deleteButtonRef.current.classList.remove("is-loading");
        deleteButtonRef.current.disabled = false;
      }
    }
  }, [isDeleting]);

  return (
    <div className="modal" ref={modalRef} data-test="modal-delete-location">
      <div className="modal-background" onClick={() => close()}/>
      <div className="modal-content">
        <div className="box has-text-centered">
          <p className="text has-text-weight-bold is-size-5 mb-3">
            {intl.formatMessage({
              description: "DeleteLocationModal check text",
              defaultMessage: "Willst du den Ort wirklich löschen?"
            })}
          </p>
          <button
            className="button is-danger"
            onClick={() => setDoDelete(true)}
            ref={deleteButtonRef}
            data-test="btn-delete"
          >
            {intl.formatMessage({
              description: "DeleteLocationModal delete button",
              defaultMessage: "Löschen"
            })}
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
};

export {NO_LOCATION_ID};
