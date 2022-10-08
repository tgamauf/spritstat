import React, {useEffect, useState} from "react";
import {TypedUseSelectorHook, useDispatch, useSelector} from "react-redux";

import type {RootState, AppDispatch} from "../app/store";
import {MAX_SCREENSIZE_MOBILE} from "./constants";
import {IntroJs} from "./types";
import {IntlShape} from "react-intl";

const useAppDispatch = () => useDispatch<AppDispatch>();
const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

function useIsMobile() {
  const [width, setWidth] = useState(window.innerWidth);
  const handleWindowSizeChange = () => {
    setWidth(window.innerWidth);
 };

  useEffect(() => {
    window.addEventListener("resize", handleWindowSizeChange);
    return () => {
      window.removeEventListener("resize", handleWindowSizeChange);
   };
 }, []);

  return width <= MAX_SCREENSIZE_MOBILE;
}

function reverseMap<Key, Value>(map: Map<Key, Value>): Map<Value, Key> {
  return new Map<Value, Key>(
    Array.from(map).map(([k, v]) => [v, k])
  );
}

function getFormattedIntroOption(intl: IntlShape, options?: object): object {
  return {
    ...options,
    doneLabel: intl.formatMessage({
      description: "Intro done label",
      defaultMessage: "Fertig"
    }),
    nextLabel: intl.formatMessage({
      description: "Intro next label",
      defaultMessage: "Weiter"
    }),
    prevLabel: intl.formatMessage({
      description: "Intro previous label",
      defaultMessage: "Zurück"
    }),
    hidePrev: true,
    tooltipClass: "intro-tooltip"
  }
}

function updateIntroStepElement(this: IntroJs, element: HTMLElement) {
  // We have to touch the internals of introJs as it doesn't support dynamical
  // elements by default. We also can't just use intro.js-react as it has a
  // strange error where the introjs-helperLayer isn't removed on exit.

  // Skip if no steps have been defined - this is a formality in our implementation
  if (!this._options.steps) {
    return;
  }
  // Skip for elements that do already exist
  if (!element || element.id) {
    return;
  }

  const stepIndex = this._currentStep;
  const configStep = this._options.steps[stepIndex];
  const updateElement = document.querySelector(configStep.element as string);

  // Skip if this is a step without an element
  if (!updateElement) {
    return;
  }

  const introStep = this._introItems[stepIndex];

  introStep.element = updateElement;
  introStep.position = configStep.position || "auto";
}

export {
  getFormattedIntroOption,
  reverseMap,
  updateIntroStepElement,
  useAppDispatch,
  useAppSelector,
  useIsMobile
};