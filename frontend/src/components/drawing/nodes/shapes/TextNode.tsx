"use client";

import React, { memo, useState, useRef, useEffect } from "react";
import { Handle, Position, type NodeProps } from "reactflow";


export interface TextNodeData {
  label?: string;
  text?: string;
  fontSize?: number;
  fontFamily?: string;
  fontWeight?: string;
  fontStyle?: string;
  textDecoration?: string;
  color?: string;
  backgroundColor?: string;
  padding?: number;
  textAlign?: "left" | "center" | "right";
}

const TextNode = memo(({ data, selected }: NodeProps<TextNodeData>) => {
  // selectedNode removed from store
  const isSelected = selected;

  const [isEditing, setIsEditing] = useState(false);
  const [text, setText] = useState(data.text ?? "Double-click to edit");
  const textRef = useRef<HTMLDivElement>(null);

  const fontSize = data.fontSize ?? 14;
  const fontFamily = data.fontFamily ?? "Inter, sans-serif";
  const fontWeight = data.fontWeight ?? "normal";
  const fontStyle = data.fontStyle ?? "normal";
  const textDecoration = data.textDecoration ?? "none";
  const color = data.color ?? "#333333";
  const backgroundColor = data.backgroundColor ?? "transparent";
  const padding = data.padding ?? 8;
  const textAlign = data.textAlign ?? "left";

  useEffect(() => {
    if (isEditing && textRef.current) {
      textRef.current.focus();
      // Select all text
      const range = document.createRange();
      range.selectNodeContents(textRef.current);
      const sel = window.getSelection();
      sel?.removeAllRanges();
      sel?.addRange(range);
    }
  }, [isEditing]);

  const handleDoubleClick = () => {
    setIsEditing(true);
  };

  const handleBlur = () => {
    setIsEditing(false);
    if (textRef.current) {
      setText(textRef.current.textContent ?? "");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleBlur();
    }
  };

  return (
    <div
      className={`relative min-w-[100px] ${isSelected ? "ring-2 ring-blue-500 ring-offset-2" : ""}`}
      onDoubleClick={handleDoubleClick}
      style={{
        backgroundColor,
        padding: `${padding}px`,
        borderRadius: "4px",
      }}
    >
      <div
        ref={textRef}
        contentEditable={isEditing}
        suppressContentEditableWarning
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        className="outline-none"
        style={{
          fontSize: `${fontSize}px`,
          fontFamily,
          fontWeight,
          fontStyle,
          textDecoration,
          color,
          textAlign,
          minHeight: "1.5em",
          wordBreak: "break-word",
        }}
      >
        {text}
      </div>

      {/* Connection handles (hidden by default, shown on hover) */}
      <div className="opacity-0 hover:opacity-100 transition-opacity">
        <Handle
          type="source"
          position={Position.Top}
          id="top"
          className="!bg-blue-500 !w-2 !h-2"
          style={{ top: -4, left: "50%" }}
        />
        <Handle
          type="source"
          position={Position.Right}
          id="right"
          className="!bg-blue-500 !w-2 !h-2"
          style={{ right: -4, top: "50%" }}
        />
        <Handle
          type="source"
          position={Position.Bottom}
          id="bottom"
          className="!bg-blue-500 !w-2 !h-2"
          style={{ bottom: -4, left: "50%" }}
        />
        <Handle
          type="source"
          position={Position.Left}
          id="left"
          className="!bg-blue-500 !w-2 !h-2"
          style={{ left: -4, top: "50%" }}
        />
      </div>
    </div>
  );
});

TextNode.displayName = "TextNode";

export default TextNode;