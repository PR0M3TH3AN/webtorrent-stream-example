// Set up global for browser environment
if (typeof window !== "undefined") {
  window.global = window;
}

// Import WebTorrent
import WebTorrent from "webtorrent";

// Export WebTorrent as default
export default WebTorrent;
