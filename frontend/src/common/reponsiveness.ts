import React, { useEffect, useState } from "react";

import { MAX_SCREENSIZE_MOBILE } from "./constants";

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

export { useIsMobile };
