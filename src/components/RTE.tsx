"use client";

import dynamic from "next/dynamic";

const MDEditor = dynamic(() => import("@uiw/react-md-editor"), { ssr: false });

export const MarkdownPreview = dynamic(
  () => import("@uiw/react-md-editor").then((mod) => mod.default.Markdown),
  { ssr: false },
);

export default function RTE({
  value,
  onChange,
}: {
  value?: string;
  onChange?: (value?: string) => void;
}) {
  return <MDEditor value={value} onChange={onChange} />;
}
