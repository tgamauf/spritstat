import React, {useEffect, useRef, useState} from "react";
import {useNavigate} from "react-router-dom";

import {RouteNames} from "../types";
import {useDeleteAccountMutation} from "../apis/spritstatApi";

interface Props {
  show: boolean;
  close: () => void;
  setErrorMessage: (msg: string) => void;
}

export default function DeleteAccountModal(
  {show, close, setErrorMessage}: Props
): JSX.Element {
  const [deleteAccount, {isLoading}] = useDeleteAccountMutation();
  const modalRef = useRef() as React.MutableRefObject<HTMLDivElement>;
  const deleteButtonRef = useRef() as React.MutableRefObject<HTMLButtonElement>;
  const [doDelete, setDoDelete] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!doDelete) {
      return;
   }

    setDoDelete(false);

    deleteAccount().unwrap()
      .then((success) => {
        if (success) {
          navigate(RouteNames.AccountDeleted, {replace: true});
       } else {
          console.error(`Failed to delete account: request failed`);
          setErrorMessage("Dein Konto konnte nicht gelöscht werden.");
       }
     })
      .catch((e) => {
        console.error(`Failed to delete account: ${JSON.stringify(e, null, 2)}`);
        setErrorMessage("Dein Konto konnte nicht gelöscht werden.");
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
    if (isLoading) {
      deleteButtonRef.current.classList.add("is-loading");
   } else {
      deleteButtonRef.current.classList.remove("is-loading");
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
            onClick={() => setDoDelete(true)}
            disabled={isLoading}
            ref={deleteButtonRef}
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
};
