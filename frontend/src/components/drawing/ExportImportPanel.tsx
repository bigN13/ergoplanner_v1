"use client";

import { toPng, toSvg } from "html-to-image";
import {
  Download,
  Upload,
  FileImage,
  // FileText,
  Printer,
  Save,
  // FolderOpen,
  // Database,
  FileCode,
} from "lucide-react";
import React, { useState, useCallback, useRef } from "react";
import { useReactFlow } from "reactflow";

import { useDrawingStore } from "@/store/drawingStore";

interface ExportImportPanelProps {
  className?: string;
}

export default function ExportImportPanel({ className = "" }: ExportImportPanelProps): React.ReactElement {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [exportFormat, setExportFormat] = useState<"png" | "svg" | "pdf" | "json" | "dxf">("png");

  const { fitView } = useReactFlow();
  const { nodes, edges, drawingName, setNodes, setEdges, setDrawingName, addToHistory } =
    useDrawingStore();

  // Export Functions
  const exportToPNG = useCallback(
    async (
      options: {
        quality?: number;
        backgroundColor?: string;
        scale?: number;
      } = {}
    ) => {
      setIsExporting(true);
      try {
        const element = document.querySelector(".react-flow") as HTMLElement;
        if (!element) throw new Error("Canvas not found");

        const dataUrl = await toPng(element, {
          quality: options.quality || 1,
          backgroundColor: options.backgroundColor || "#ffffff",
          pixelRatio: options.scale || 2,
          filter: (node) => {
            // Filter out controls and minimap from export
            return !(
              node?.classList?.contains("react-flow__controls") ||
              node?.classList?.contains("react-flow__minimap")
            );
          },
        });

        downloadFile(dataUrl, `${drawingName || "p-id-diagram"}.png`);
      } catch (error) {
        console.error("PNG export failed:", error);
        // TODO: Replace with proper error modal
        // alert("Export failed. Please try again.");
      } finally {
        setIsExporting(false);
      }
    },
    [drawingName]
  );

  const exportToSVG = useCallback(async () => {
    setIsExporting(true);
    try {
      const element = document.querySelector(".react-flow") as HTMLElement;
      if (!element) throw new Error("Canvas not found");

      const svgString = await toSvg(element, {
        backgroundColor: "#ffffff",
        filter: (node) => {
          return !(
            node?.classList?.contains("react-flow__controls") ||
            node?.classList?.contains("react-flow__minimap")
          );
        },
      });

      downloadFile(svgString, `${drawingName || "p-id-diagram"}.svg`);
    } catch (error) {
      console.error("SVG export failed:", error);
      // TODO: Replace with proper error modal
      // alert("Export failed. Please try again.");
    } finally {
      setIsExporting(false);
    }
  }, [drawingName]);

  const exportToPDF = useCallback(async () => {
    setIsExporting(true);
    try {
      const element = document.querySelector(".react-flow") as HTMLElement;
      if (!element) throw new Error("Canvas not found");

      // TODO: Import toPdf from appropriate library
      const dataUrl = await toPng(element, { // Using toPng as fallback
        backgroundColor: "#ffffff",
        pixelRatio: 2,
        filter: (node) => {
          return !(
            node?.classList?.contains("react-flow__controls") ||
            node?.classList?.contains("react-flow__minimap")
          );
        },
      });

      downloadFile(dataUrl, `${drawingName || "p-id-diagram"}.pdf`);
    } catch (error) {
      console.error("PDF export failed:", error);
      // TODO: Replace with proper error modal
      // alert("Export failed. Please try again.");
    } finally {
      setIsExporting(false);
    }
  }, [drawingName]);

  const exportToJSON = useCallback(() => {
    setIsExporting(true);
    try {
      const drawingData = {
        metadata: {
          name: drawingName || "Untitled P&ID",
          created: new Date().toISOString(),
          version: "1.0.0",
          description: "P&ID diagram exported from Ergoplanner",
        },
        drawing: {
          nodes: nodes.map((node) => ({
            ...node,
            // Include engineering metadata
            metadata: {
              equipment: node.data.equipment || {},
              specifications: node.data.specifications || {},
              boq: node.data.boq || {},
            },
          })),
          edges: edges.map((edge) => ({
            ...edge,
            // Include pipe specifications
            metadata: {
              pipeSpec: edge.data?.pipeSpec || {},
              flowConditions: edge.data?.flowConditions || {},
            },
          })),
        },
        settings: {
          gridSize: useDrawingStore.getState().gridSize,
          snapToGrid: useDrawingStore.getState().snapToGrid,
          isGridVisible: useDrawingStore.getState().isGridVisible,
        },
      };

      const dataStr = JSON.stringify(drawingData, null, 2);
      const blob = new Blob([dataStr], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      downloadFile(url, `${drawingName || "p-id-diagram"}.json`);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("JSON export failed:", error);
      // TODO: Replace with proper error modal
      // alert("Export failed. Please try again.");
    } finally {
      setIsExporting(false);
    }
  }, [nodes, edges, drawingName]);

  const exportToDXF = useCallback(() => {
    setIsExporting(true);
    try {
      // Simplified DXF export - in production, use a proper DXF library
      let dxfContent = `0
SECTION
2
HEADER
9
$ACADVER
1
AC1015
0
ENDSEC
0
SECTION
2
TABLES
0
TABLE
2
LAYER
70
2
0
LAYER
2
P&ID_EQUIPMENT
70
0
62
1
0
LAYER
2
P&ID_PIPING
70
0
62
2
0
ENDTAB
0
ENDSEC
0
SECTION
2
ENTITIES
`;

      // Add nodes as blocks/text
      nodes.forEach((node) => {
        dxfContent += `0
TEXT
8
P&ID_EQUIPMENT
10
${node.position.x}
20
${-node.position.y}
30
0.0
40
2.5
1
${node.data.label || node.id}
`;
      });

      // Add edges as lines
      edges.forEach((edge) => {
        const sourceNode = nodes.find((n) => n.id === edge.source);
        const targetNode = nodes.find((n) => n.id === edge.target);
        if (sourceNode && targetNode) {
          dxfContent += `0
LINE
8
P&ID_PIPING
10
${sourceNode.position.x + 40}
20
${-sourceNode.position.y - 20}
30
0.0
11
${targetNode.position.x}
21
${-targetNode.position.y - 20}
31
0.0
`;
        }
      });

      dxfContent += `0
ENDSEC
0
EOF`;

      const blob = new Blob([dxfContent], { type: "application/dxf" });
      const url = URL.createObjectURL(blob);
      downloadFile(url, `${drawingName || "p-id-diagram"}.dxf`);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("DXF export failed:", error);
      // TODO: Replace with proper error modal
      // alert("Export failed. Please try again.");
    } finally {
      setIsExporting(false);
    }
  }, [nodes, edges, drawingName]);

  // Import Functions
  const handleImportJSON = useCallback(
    (file: File) => {
      setIsImporting(true);
      const reader = new FileReader();

      reader.onload = (e) => {
        try {
          const content = e.target?.result as string;
          const data = JSON.parse(content);

          if (data.drawing && data.drawing.nodes && data.drawing.edges) {
            // Validate the data structure
            const validNodes = data.drawing.nodes.filter(
              (node: unknown) => {
                const n = node as Record<string, unknown>;
                return n.id && n.type && n.position;
              }
            );
            const validEdges = data.drawing.edges.filter(
              (edge: unknown) => {
                const e = edge as Record<string, unknown>;
                return e.id && e.source && e.target;
              }
            );

            setNodes(validNodes);
            setEdges(validEdges);

            if (data.metadata?.name) {
              setDrawingName(data.metadata.name);
            }

            addToHistory();

            // Fit view after import
            setTimeout(() => fitView({ padding: 0.1 }), 100);

            // TODO: Replace with proper success modal
            // alert("Drawing imported successfully!");
          } else {
            throw new Error("Invalid file format");
          }
        } catch (error) {
          console.error("Import failed:", error);
          // TODO: Replace with proper error modal
          // alert("Failed to import file. Please check the file format.");
        } finally {
          setIsImporting(false);
        }
      };

      reader.readAsText(file);
    },
    [setNodes, setEdges, setDrawingName, addToHistory, fitView]
  );

  const handleFileImport = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      const fileExtension = file.name.split(".").pop()?.toLowerCase();

      switch (fileExtension) {
        case "json":
          handleImportJSON(file);
          break;
        default:
          // TODO: Replace with proper error modal
          // alert("Unsupported file format. Currently supported: JSON");
          console.warn("Unsupported file format:", fileExtension);
      }

      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    },
    [handleImportJSON]
  );

  const downloadFile = (dataUrl: string, filename: string): void => {
    const link = document.createElement("a");
    link.download = filename;
    link.href = dataUrl;
    link.click();
  };

  const handleExport = (): void => {
    switch (exportFormat) {
      case "png":
        exportToPNG();
        break;
      case "svg":
        exportToSVG();
        break;
      case "pdf":
        exportToPDF();
        break;
      case "json":
        exportToJSON();
        break;
      case "dxf":
        exportToDXF();
        break;
    }
  };

  const handlePrint = useCallback(() => {
    window.print();
  }, []);

  return (
    <div className={`rounded-lg border border-gray-200 bg-white shadow-sm ${className}`}>
      <div className="border-b border-gray-200 p-4">
        <h3 className="mb-4 text-sm font-semibold text-gray-700">Export & Import</h3>

        {/* Export Section */}
        <div className="mb-6">
          <h4 className="mb-2 text-xs font-medium text-gray-600">Export Drawing</h4>
          <div className="space-y-3">
            <div>
              <label className="mb-1 block text-xs text-gray-500">Format</label>
              <select
                value={exportFormat}
                onChange={(e) => setExportFormat(e.target.value as typeof exportFormat)}
                className="w-full rounded border border-gray-300 px-2 py-1.5 text-xs focus:border-blue-500 focus:outline-none"
              >
                <option value="png">PNG (High Quality Image)</option>
                <option value="svg">SVG (Vector Graphics)</option>
                <option value="pdf">PDF (Document)</option>
                <option value="json">JSON (Ergoplanner Format)</option>
                <option value="dxf">DXF (CAD Format)</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={handleExport}
                disabled={isExporting}
                className="flex items-center justify-center gap-1 rounded bg-blue-600 px-3 py-2 text-xs text-white hover:bg-blue-700 disabled:opacity-50"
              >
                <Download className="h-3 w-3" />
                {isExporting ? "Exporting..." : "Export"}
              </button>

              <button
                onClick={handlePrint}
                className="flex items-center justify-center gap-1 rounded bg-gray-600 px-3 py-2 text-xs text-white hover:bg-gray-700"
              >
                <Printer className="h-3 w-3" />
                Print
              </button>
            </div>
          </div>
        </div>

        {/* Import Section */}
        <div>
          <h4 className="mb-2 text-xs font-medium text-gray-600">Import Drawing</h4>
          <div>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={handleFileImport}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isImporting}
              className="flex w-full items-center justify-center gap-1 rounded bg-green-600 px-3 py-2 text-xs text-white hover:bg-green-700 disabled:opacity-50"
            >
              <Upload className="h-3 w-3" />
              {isImporting ? "Importing..." : "Import JSON"}
            </button>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="p-3">
        <h4 className="mb-2 text-xs font-medium text-gray-600">Quick Actions</h4>
        <div className="grid grid-cols-2 gap-1.5">
          <button
            onClick={() => {
              setExportFormat("png");
              exportToPNG({ quality: 0.95, scale: 3 });
            }}
            className="flex items-center justify-center gap-1 rounded bg-gray-100 px-2 py-1.5 text-xs text-gray-700 hover:bg-gray-200"
          >
            <FileImage className="h-3 w-3" />
            HD PNG
          </button>

          <button
            onClick={() => {
              setExportFormat("svg");
              exportToSVG();
            }}
            className="flex items-center justify-center gap-1 rounded bg-gray-100 px-2 py-1.5 text-xs text-gray-700 hover:bg-gray-200"
          >
            <FileCode className="h-3 w-3" />
            Vector
          </button>

          <button
            onClick={() => {
              setExportFormat("json");
              exportToJSON();
            }}
            className="flex items-center justify-center gap-1 rounded bg-gray-100 px-2 py-1.5 text-xs text-gray-700 hover:bg-gray-200"
          >
            <Save className="h-3 w-3" />
            Backup
          </button>

          <button
            onClick={handlePrint}
            className="flex items-center justify-center gap-1 rounded bg-gray-100 px-2 py-1.5 text-xs text-gray-700 hover:bg-gray-200"
          >
            <Printer className="h-3 w-3" />
            Print
          </button>
        </div>
      </div>
    </div>
  );
}
