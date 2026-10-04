import { useRef, useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { Box } from "@mui/material";

/**
 * Wraps page content and applies a fade-slide-in animation on every
 * route change. Uses the location.key to detect navigation events.
 */
export default function PageTransition({ children }) {
  const location = useLocation();
  const [animKey, setAnimKey] = useState(location.key);

  useEffect(() => {
    // Trigger re-animation on route change
    setAnimKey(location.key);
  }, [location.key]);

  return (
    <Box
      key={animKey}
      className="page-enter"
      sx={{ minHeight: 0, flex: 1 }}
    >
      {children}
    </Box>
  );
}
