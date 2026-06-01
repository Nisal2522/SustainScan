import type { ReactNode } from "react";

/** Wraps the app in a phone-sized viewport on desktop; full screen on real devices. */
export function MobileShell({ children }: { children: ReactNode }) {
  return (
    <div className="mobile-shell">
      <div className="mobile-device" role="presentation">
        <div className="mobile-viewport">{children}</div>
      </div>
    </div>
  );
}
