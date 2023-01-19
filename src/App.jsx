import React, { useState, useCallback, useContext } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/umd/Page/AnnotationLayer.css";
import "./App.css";
import RightBarNavigation from "./RightBarNavigation";
import axios from "axios";
import Button from "@mui/material/Button";

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;

const options = {
  cMapUrl: "cmaps/",
  cMapPacked: true,
  standardFontDataUrl: "standard_fonts/",
};

const Context = React.createContext();

export function useKeywords() {
  return useContext(Context);
}

export default function App() {
  const [file, setFile] = useState("./output.pdf");
  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [searchText, setSearchText] = useState("");
  const [state, setState] = useState(false);
  const [results, setResults] = useState({});
  const [prev, setPrev] = useState({});
  const [current, setCurrent] = useState(0);

  const onFileChange = (event) => {
    setFile(event.target.files[0]);
  };

  const onDocumentLoadSuccess = ({ numPages: nextNumPages }) => {
    setNumPages(nextNumPages);
  };

  const onDocumentLoadError = (err) => {
    console.log(err);
  };

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
  };

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
    setState(true);
    setSearchText(text);
    setPrev(data => {
      return {
        ...data,
        [current]: text
      }
    });
    setCurrent(curr => curr + 1);
    handleSearchByHighLight(text);
  };

  const goToPrevPage = () => setPageNumber((page) => page - 1);

  const goToNextPage = () => setPageNumber((page) => page + 1);

  const toggleDrawer = (open) => (event) => {
    if (
      event.type === "keydown" &&
      (event.key === "Tab" || event.key === "Shift")
    ) {
      return;
    }
    setResults([]);
    setState(open);
    setPrev("");
    setCurrent(0);
  };

  const getChildWords = useCallback(
    (id) => {
      return results[id];
    },
    [results]
  );

  const handleSearchByHighLight = useCallback((keyword) => {
    axios
      .post(`http://localhost:8000/find`, {
        keyword: keyword.toLowerCase(),
      })
      .then((res) => {
        setResults(res.data.message);
      })
      .catch((err) => {
        console.log(err);
      });
  }, []);

  const handleBackOnClick = useCallback(()=>{
    const prevKeyword = prev[current - 2];    
    console.log(prevKeyword);
    delete prev[current-1];
    setPrev(prev);
    setCurrent(curr => curr - 1);
    handleSearchByHighLight(prevKeyword);
  },[current, handleSearchByHighLight, prev]);

  const handleSearchWordOnClick = useCallback((keyword) => {
    if (keyword.isClickable) {
      setPrev(data => {
        return {
          ...data,
          [current]: keyword.text
        }
      });
      setCurrent(curr => curr + 1);
      handleSearchByHighLight(keyword.text);
    }
  }, [current, handleSearchByHighLight]);

  console.log(results);

  return (
    <Context.Provider
      value={{
        keyword: typeof results !== 'string' ? { ...results }: results,
        rootKeywords: results["root"],
        getChildWords,
        handleSearchWordOnClick,
        handleBackOnClick,
        current
      }}
    >
      <div className="Page">
        <header>
          <span className="custom-header">
            <h1>Paper reader project</h1>
            <RightBarNavigation
              toggleDrawer={toggleDrawer}
              state={state}
              results={results}
            />
          </span>
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
              {pageNumber > 1 && <Button onClick={goToPrevPage}>Prev</Button>}

              {pageNumber < numPages && (
                <Button onClick={goToNextPage}>Next</Button>
              )}
            </div>
            <p className="Page-navigator">
              Page {pageNumber} of {numPages}
            </p>
          </div>
        </div>
      </div>
    </Context.Provider>
  );
}
