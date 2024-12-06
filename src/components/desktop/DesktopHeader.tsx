import React, { FC, ReactElement } from "react";

interface DesktopHeaderProps {
  currentTime?: string;
  closeup?: boolean;
}

const DesktopHeader: FC<DesktopHeaderProps> = ({
  currentTime,
  closeup,
}): ReactElement => {
  const headerClass = closeup ? "computer-header-closeup" : "computer-header";
  const logoSize = closeup ? "h-5 w-5" : "h-3 w-3";
  const headerGap = closeup ? "gap-4" : "gap-2";
  return (
    <header className={headerClass}>
      <div className={`computer-header-left ${headerGap}`}>
        <div className={`apple-logo ${logoSize}`}></div>
        <span>File</span>
        <span>Edit</span>
        <span>View</span>
        <span>Special</span>
        <span>Help</span>
      </div>
      <div className={`computer-header-right ${headerGap}`}>
        <span>{currentTime}</span>
        <div className={`finder-logo ${logoSize}`}></div>
        <span>Finder</span>
      </div>
    </header>
  );
};

export default DesktopHeader;
