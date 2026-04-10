import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "instant", // darhol sakrab chiqadi
    });
  }, [pathname]); // Har gal URL o'zgarganda ishlaydi

  return null;
};

export default ScrollToTop;