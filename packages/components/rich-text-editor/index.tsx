"use client";

import React, { useEffect, useRef, useState } from "react";
import "react-quill-new/dist/quill.snow.css";
import ReactQuill from "react-quill-new";

const RichTextEditor = ({
  value,
  onChange
}: {
  value: string;
  onChange: (content: string) => void;
}) => {
  const [editorValue, setEditorValue] = useState(value || "");
  const quillRef = useRef(false);

  // Sinhronizacija sa spoljašnjom vrednošću
  useEffect(() => {
    setEditorValue(value || "");
  }, [value]);

  useEffect(() => {
    if (!quillRef.current) {
      quillRef.current = true;

      const timer = setTimeout(() => {
        document.querySelectorAll(".ql-toolbar").forEach((toolbar, index) => {
          if (index > 0) {
            toolbar.remove();
          }
        });
      }, 100);

      return () => clearTimeout(timer);
    }
    return;
  }, []);

  return (
    <div className="rte-container">
      <ReactQuill
        theme="snow"
        value={editorValue}
        onChange={(content) => {
          setEditorValue(content);
          onChange(content);
        }}
        className="rte-editor"
        placeholder="Write something..."
        modules={{
           toolbar: [
            [{ font: [] }],
            [{ header: [1, 2, 3, 4, 5, 6, false] }],

            ["bold", "italic", "underline", "strike", "blockquote", "code-block"],

            [{ color: [] }, { background: [] }],

            [{ script: "sub" }, { script: "super" }],

            [{ list: "ordered" }, { list: "bullet" }],
            [{ indent: "-1" }, { indent: "+1" }],

            [{ direction: "rtl" }, { align: [] }],

            ["link", "image", "video"],

            ["clean"]
          ]
        }}
      />

      <style>
        {`
          .rte-container {
            border: 1px solid #e5e7eb;
            border-radius: 10px;
            overflow: hidden;
            background: black;
            color: white;
            transition: all 0.2s ease;
          }

          .rte-container:focus-within {
            border-color: #6366f1;
            box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.15);
          }

          .rte-editor .ql-toolbar {
            border: none;
            border-bottom: 1px solid #e5e7eb;
            background: black;
            color: white;
          }

          .rte-editor .ql-container {
            border: none;
            font-size: 14px;
          }

          .rte-editor .ql-editor {
            min-height: 180px;
            padding: 12px;
            line-height: 1.6;
          }

          .rte-editor .ql-editor.ql-blank::before {
            color: #9ca3af;
            font-style: normal;
          }

          .rte-editor .ql-editor::-webkit-scrollbar {
            width: 6px;
          }

          .rte-editor .ql-editor::-webkit-scrollbar-thumb {
            background: #d1d5db;
            border-radius: 10px;
          }
        `}
      </style>
    </div>
  );
};

export default RichTextEditor;