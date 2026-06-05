import { useEffect } from "react";
import { useLocation } from "react-router-dom";

/**
 * Scrolls to top of the page on route change.
 * Place inside <BrowserRouter> as a sibling to <Routes>.
 */
export default function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [pathname]);

  return null;
}
