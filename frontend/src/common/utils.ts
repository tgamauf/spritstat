import React, {useEffect, useState} from "react";
import {TypedUseSelectorHook, useDispatch, useSelector} from "react-redux";
import moment from "moment-timezone";

import type {RootState, AppDispatch} from "../app/store";
import {MAX_SCREENSIZE_MOBILE, TIMEZONE} from "./constants";

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

function formatDatetime(datetime?: string): string {
  return moment.tz(datetime, TIMEZONE).format("DD.MM.YY HH:mm")
}

export {formatDatetime, reverseMap, useAppDispatch, useAppSelector, useIsMobile};