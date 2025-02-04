"use client";
import React from "react";

export default function CopyToClipboardButton({value}: {value?: string}) {
  const handleClick = () => {
    if (value) {
      navigator.clipboard.writeText(value).then(() => {
        alert("Copied to clipboard!");
      });
    }
  };

  return <button onClick={handleClick}>Copy to Clipboard</button>;
}
