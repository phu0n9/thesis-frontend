import React, { useState, useCallback } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/umd/Page/AnnotationLayer.css";
import "./App.css";

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;

const options = {
  cMapUrl: "cmaps/",
  cMapPacked: true,
  standardFontDataUrl: "standard_fonts/",
};

export default function App() {
  const [file, setFile] = useState("./output.pdf");
  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [searchText, setSearchText] = useState("");

  const onFileChange = (event) => {
    setFile(event.target.files[0]);
  }

  const onDocumentLoadSuccess = ({ numPages: nextNumPages }) => {
    setNumPages(nextNumPages);
  }

  const onDocumentLoadError = (err) => {
    console.log(err);
  }

  const highlightPattern = (text, pattern) => {
    const splitText = text.split(pattern);

    if (splitText.length <= 1) {
      return text;
    }

    const matches = text.match(pattern);

    return splitText.reduce(
      (arr, element, index) =>
        matches[index]
          ? [...arr, element, <mark key={index}>{matches[index]}</mark>]
          : [...arr, element],
      []
    );
  }

  const textRenderer = useCallback(
    (textItem) => {
      return highlightPattern(textItem.str, searchText);
    },
    [searchText]
  );

  const onMouseUp = () => {
    let text = "";
    if (window.getSelection) {
      text = window.getSelection().toString();
    } else if (document.selection && document.selection.type !== "Control") {
      text = document.selection.createRange().text;
    }
    setSearchText(text);
    console.log(text);
  };

  const goToPrevPage = () => setPageNumber((page) => page - 1);

  const goToNextPage = () => setPageNumber((page) => page + 1);

  return (
    <div className="Page">
      <header>
        <h1>Be Buc page</h1>
      </header>
      <div className="Page__container">
        <div className="Page__container__load">
          <label htmlFor="file">Load from file:</label>{" "}
          <input onChange={onFileChange} type="file" />
        </div>
        <div className="Page__container__document">
          <div style={{ width: 1000 }}>
            <Document
              file={file}
              onLoadSuccess={onDocumentLoadSuccess}
              options={options}
              onLoadError={onDocumentLoadError}
            >
              <Page
                pageNumber={pageNumber}
                width={1000}
                customTextRenderer={textRenderer}
                onMouseUp={onMouseUp}
                renderTextLayer={true}
              />
            </Document>
          </div>
          <div className="Page-navigator">
            {pageNumber > 1 && (
              <button onClick={goToPrevPage}>Prev</button>
            )}

            {pageNumber < numPages && (
              <button onClick={goToNextPage}>Next</button>
            )}
          </div>
          <p className="Page-navigator">
            Page {pageNumber} of {numPages}
          </p>
        </div>
      </div>
    </div>
  );
}
