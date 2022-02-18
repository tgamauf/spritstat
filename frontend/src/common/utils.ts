import React, {useEffect, useState} from "react";
import {TypedUseSelectorHook, useDispatch, useSelector} from "react-redux";

import type {RootState, AppDispatch} from "../app/store";
import {MAX_SCREENSIZE_MOBILE} from "./constants";

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

export {reverseMap, useAppDispatch, useAppSelector, useIsMobile};