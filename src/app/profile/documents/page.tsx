"use client";

import React, { FC, ReactElement } from "react";
import DesktopHeader from "../../../components/desktop/DesktopHeader";
import BackButton from "../../../components/BackButton";
import "../../styles/pages/profile/documents.css";

const Document: FC = (): ReactElement => {
  // To update the resume, replace public/resume.pdf.
  const document = "/resume.pdf";


  return (
    <div className="overflow-blocker">
      <BackButton />
      <div className="documents-page">
        <div className="desk-closeup"></div>
        <div className="monitor-closeup">
          <div className="computer-desktop">
            <DesktopHeader closeup={true} />
            <div className="desktop-closeup-content">
              <div className="documents-container">
                <div className="document-window">
                  <iframe className="document" src={document}></iframe>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Document;
