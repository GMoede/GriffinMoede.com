"use client";

import React, { FC, ReactElement, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import DesktopHeader from "../../../components/desktop/DesktopHeader";
import BackButton from "../../../components/BackButton";
import "../../styles/pages/profile/documents.css";
import { Document as PDFReader, pdfjs } from "react-pdf";

const Document: FC = (): ReactElement => {
  const [document, setDocument] = useState<string>(null);
  useEffect(() => {
    const fetchResume = async () => {
      try {
        const response = await fetch("/api/resume");
        const data = await response.json();
        const resumeURL = data.resumeURL;
        setDocument(resumeURL);
      } catch (err) {
        console.log(err);
      }
    };
    fetchResume();
  });

  // pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;
  // pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

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
                  {/* {document && <PDFReader file={document} />} */}
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
