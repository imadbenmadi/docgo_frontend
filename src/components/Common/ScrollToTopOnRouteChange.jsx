import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const CONTAINER_SELECTORS = [
  "#dashboard-main-scroll",
  "[data-route-scroll-container='true']",
];

export default function ScrollToTopOnRouteChange() {
  const { pathname, search } = useLocation();

  useEffect(() => {
    // Scroll main container to top with smooth behavior
    CONTAINER_SELECTORS.forEach((selector) => {
      const el = document.querySelector(selector);
      if (el && typeof el.scrollTo === "function") {
        el.scrollTo({ top: 0, left: 0, behavior: "smooth" });
      }
    });

    // Also scroll window to top for edge cases
    window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }, [pathname, search]);

  return null;
}
