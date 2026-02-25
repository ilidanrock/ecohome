import * as React from 'react';

const MOBILE_BREAKPOINT = 768;

/**
 * Assume mobile on first paint so the sidebar renders as Sheet from the start on small screens.
 * Otherwise isMobile is false until hydration and the desktop sidebar (fixed) can block content.
 */
export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean>(true);

  React.useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);
    const onChange = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    };
    mql.addEventListener('change', onChange);
    setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    return () => mql.removeEventListener('change', onChange);
  }, []);

  return isMobile;
}
