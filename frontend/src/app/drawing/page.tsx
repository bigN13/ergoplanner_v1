"use client";

import dynamic from "next/dynamic";

// Dynamically import the DrawioLayout with ssr disabled
const DrawioLayout = dynamic(
  () => import("@/components/layout/DrawioLayout"),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-screen items-center justify-center bg-gray-100">
        <div className="text-lg text-gray-600">Loading P&ID Drawing Environment...</div>
      </div>
    ),
  }
);

export default function DrawingPage(): React.JSX.Element {
  return <DrawioLayout />;
}
