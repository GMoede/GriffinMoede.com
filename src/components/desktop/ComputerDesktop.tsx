import React, { FC, ReactElement } from "react";

const ComputerDesktop: FC = (): ReactElement => {
  return (
    <div className="computer-desktop">
      <header className="computer-header">
        <div className="apple-logo"></div>
        <span>File</span>
        <span>Edit</span>
        <span>View</span>
        <span>Special</span>
        <span>Help</span>
      </header>
    </div>
  );
};

export default ComputerDesktop;
