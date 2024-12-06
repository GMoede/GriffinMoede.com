"use client";

import React, { FC, ReactElement, use, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import DesktopHeader from "../../../../components/desktop/DesktopHeader";

const Document: FC = (): ReactElement => {
  const params = useParams();
  const [document, setDocument] = useState<string>("");
  useEffect(() => {
    const fakeDocumentFetch = `This is where you would put your resume
    that will be fetched from the server. But for now, this is just a
    placeholder text.`;
    setDocument(fakeDocumentFetch);
  });

  return (
    <div className="overflow-blocker">
      <div className="documents-page">
        <div className="desk-closeup"></div>
        <div className="monitor-closeup">
          <div className="computer-desktop">
            <DesktopHeader closeup={true} />
            <div className="desktop-closeup-content">
              <div className="documents-container">
                <div className="document-window">{document}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Document;
