import React, { useState } from "react";
import { useKeywords } from "./App";
import "./App.css";

type ItemProps = {
  text: string;
  id: number;
  parentID: number;
  isClickable: boolean;
};

export default function Rows() {
  const { rootKeywords, keyword } = useKeywords();
  console.log(rootKeywords);
  return (
    <div>
      {rootKeywords != null && rootKeywords.length > 0 && (
        <KeywordList keywords={rootKeywords} />
      )}
      {typeof keyword === "string" && <NotFound />}
    </div>
  );
}

const NotFound = () => {
  return (
    <div
      style={{
        justifyContent: "center",
        display: "inline",
        alignItems: "center",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          padding: 20
        }}
      >
        <img
          src="message.png"
          alt="error"
          style={{ width: "200px", height: "200px" }}
        />
      </div>
      <h3
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          color: '#605c5c'
        }}
      >
        No ontology tree exists for such terms
      </h3>
    </div>
  );
};

const KeywordList = ({ keywords }: any) => {
  return keywords?.map((keyword: any) => (
    <div
      key={keyword.id}
      style={{
        position: "relative",
        display: "flex",
        flexDirection: "column",
        left: 25,
        borderLeft: "1px solid",
        paddingLeft: 15,
        marginTop: 10,
      }}
    >
      <Keyword {...keyword} />
    </div>
  ));
};

const Keyword = (keyword: ItemProps) => {
  const { getChildWords, handleSearchWordOnClick } = useKeywords();
  const childKeywords = getChildWords(keyword.id);
  const [isShown, setIsShown] = useState(false);

  return (
    <>
      {keyword.isClickable ? (
        <p
          onClick={() => handleSearchWordOnClick(keyword)}
          onMouseEnter={() => setIsShown(true)}
          onMouseLeave={() => setIsShown(false)}
          className={isShown ? "highlight-text" : ""}
        >
          {keyword.text}
        </p>
      ) : (
        <p>{keyword.text}</p>
      )}
      {childKeywords?.length > 0 && <KeywordList keywords={childKeywords} />}
    </>
  );
};
