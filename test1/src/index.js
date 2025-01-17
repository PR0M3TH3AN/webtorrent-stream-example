/*
<ai_context>
this is a new file that imports the local webtorrent library
</ai_context>
*/

import WebTorrent from "./js/webtorrent.min.js";

(async function main() {
  console.log("[App] Starting application...");

  const statusElement = document.getElementById("status");
  const videoPlayer = document.getElementById("videoPlayer");

  try {
    console.log("[App] Registering service worker...");
    const reg = await navigator.serviceWorker.register("./sw.min.js", {
      scope: "./",
    });
    await navigator.serviceWorker.ready;

    if (!navigator.serviceWorker.controller) {
      console.log("[App] SW not controlling this page yet. Reloading...");
      location.reload();
      return;
    }
    console.log(
      "[App] Service worker controlling page:",
      navigator.serviceWorker.controller.scriptURL
    );

    statusElement.textContent = "Initializing WebTorrent...";
    const client = new WebTorrent();

    // (A) Create the server to handle range requests
    // This sets up the *internal* message handler to respond with "STREAM" data
    client.createServer({ controller: reg });

    // (B) *Also* manually add a fallback message listener if createServer isn't hooking up
    function onSWMessage(evt) {
      const data = evt.data;
      if (!data || data.type !== "webtorrent") return;
      // Hand it off to the internal method that crafts "body: 'STREAM'" responses
      if (typeof client._onServiceWorkerRequest === "function") {
        client._onServiceWorkerRequest(data, evt.ports[0]);
      } else {
        // Fallback: if your version doesn't have _onServiceWorkerRequest,
        // we must implement the "STREAM" logic ourselves (see fallback below).
        console.warn(
          "[App] No client._onServiceWorkerRequest found - fallback needed."
        );
      }
    }
    window.addEventListener("message", onSWMessage);

    // (C) Now proceed with adding the torrent
    statusElement.textContent = "Reading magnet URI...";
    const magnetResponse = await fetch("magnet-link.txt");
    const magnetURI = (await magnetResponse.text()).trim();
    console.log("[App] Magnet URI:", magnetURI);

    statusElement.textContent = "Connecting to peers...";
    const torrent = client.add(magnetURI);

    torrent.on("infoHash", () =>
      console.log("[Torrent] infoHash:", torrent.infoHash)
    );
    torrent.on("metadata", () => {
      console.log("[Torrent] metadata event. Name:", torrent.name);
      console.log(
        "[Torrent] files:",
        torrent.files.map((f) => f.name)
      );
    });
    torrent.on("ready", () => console.log("[Torrent] ready event."));
    torrent.on("done", () =>
      console.log("[Torrent] done event. All data downloaded.")
    );

    // Show chunk progress logs
    torrent.on("download", (bytes) => {
      console.log(
        `[Torrent] Downloaded chunk: ${bytes} bytes, total: ${
          torrent.downloaded
        }/${torrent.length}, progress: ${(torrent.progress * 100).toFixed(2)}%`
      );
    });

    // When torrent metadata loads, pick a file to stream
    torrent.on("metadata", () => {
      statusElement.textContent = "Starting stream...";
      const file = torrent.files.find((f) => {
        return (
          f.name.endsWith(".mp4") ||
          f.name.endsWith(".webm") ||
          f.name.endsWith(".mkv")
        );
      });

      if (!file) {
        statusElement.textContent = "No video file found in torrent!";
        return;
      }
      console.log("[Torrent] streaming file:", file.name);
      file.streamTo(videoPlayer);
      statusElement.textContent = "Streaming";
    });
  } catch (err) {
    statusElement.textContent = `Error: ${err.message}`;
    console.error("[App]", err);
  }
})();
