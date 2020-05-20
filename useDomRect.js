import { useEffect, useState } from "react";
import { throttle } from "throttle-debounce";

export const useDomRect = () => {
  const [domRect, setDomRect] = useState(() => document.body.getBoundingClientRect());
  useEffect(() => {
    const throttled = throttle(300, () => {
      setDomRect(document.body.getBoundingClientRect());
    });
    function listener() {
      throttled();
    }
    document.addEventListener("scroll", listener);
    return () => {
      document.removeEventListener("scroll", listener);
    };
  }, []);
  return domRect;
};
