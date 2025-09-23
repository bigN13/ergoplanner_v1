/**
 * Application configuration
 */

export const config = {
  api: {
    baseUrl: process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api",
    wsUrl: process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:5000",
    signalRHub: process.env.NEXT_PUBLIC_SIGNALR_HUB_URL || "http://localhost:5000/hubs",
    timeout: 30000,
    retryAttempts: 3,
  },
  app: {
    name: process.env.NEXT_PUBLIC_APP_NAME || "Ergoplanner",
    version: process.env.NEXT_PUBLIC_APP_VERSION || "1.0.0",
    maxUploadSizeMB: parseInt(process.env.NEXT_PUBLIC_MAX_UPLOAD_SIZE_MB || "50", 10),
    debugMode: process.env.NEXT_PUBLIC_DEBUG_MODE === "true",
  },
  features: {
    ai: process.env.NEXT_PUBLIC_ENABLE_AI_FEATURES === "true",
    collaboration: process.env.NEXT_PUBLIC_ENABLE_COLLABORATION === "true",
    offlineMode: process.env.NEXT_PUBLIC_ENABLE_OFFLINE_MODE === "true",
  },
  storage: {
    tokenKey: "ergoplanner_token",
    userKey: "ergoplanner_user",
    refreshTokenKey: "ergoplanner_refresh_token",
    themeKey: "ergoplanner_theme",
    projectKey: "ergoplanner_active_project",
  },
  drawing: {
    gridSize: 20,
    snapToGrid: true,
    defaultZoom: 1,
    minZoom: 0.1,
    maxZoom: 3,
    autosaveInterval: 30000, // 30 seconds
    maxUndoSteps: 50,
  },
  reactFlow: {
    nodeTypes: ["pump", "valve", "tank", "pipe", "instrument", "text", "group"],
    edgeTypes: ["pipe", "signal", "electrical"],
    connectionLineStyle: { stroke: "#3b82f6", strokeWidth: 2 },
    defaultViewport: { x: 0, y: 0, zoom: 1 },
  },
} as const;

export default config;
