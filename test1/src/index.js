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
    const reg = await navigator.serviceWorker.register("./sw.min.js", { scope: "./" });
    await navigator.serviceWorker.ready;

    if (!navigator.serviceWorker.controller) {
      console.log("[App] SW not controlling this page yet. Reloading...");
      location.reload();
      return;
    }
    console.log("[App] Service worker controlling page:", navigator.serviceWorker.controller.scriptURL);

    statusElement.textContent = "Initializing WebTorrent...";
    const client = new WebTorrent();
    client.createServer({ controller: reg });

    function onSWMessage(evt) {
      const data = evt.data;
      if (!data || data.type !== "webtorrent") return;
      if (typeof client._onServiceWorkerRequest === "function") {
        client._onServiceWorkerRequest(data, evt.ports[0]);
      } else {
        console.warn("[App] No client._onServiceWorkerRequest found - fallback needed.");
      }
    }
    window.addEventListener("message", onSWMessage);

    statusElement.textContent = "Reading magnet URI...";
    const magnetResponse = await fetch("magnet-link.txt");
    const magnetURI = (await magnetResponse.text()).trim();
    console.log("[App] Magnet URI:", magnetURI);

    statusElement.textContent = "Connecting to peers...";
    const torrent = client.add(magnetURI);

    // Grab references to elements that display stats
    const peersElement = document.getElementById("peers");
    const downloadSpeedElement = document.getElementById("downloadSpeed");
    const progressElement = document.getElementById("progress");
    const progressBar = document.getElementById("progressBar");
    const bufferedElement = document.getElementById("buffered");

    // Simple helper to convert speeds to human-readable format
    function prettyBytes(num) {
      const units = ["B/s", "kB/s", "MB/s", "GB/s"];
      let unitIndex = 0;
      while (num >= 1024 && unitIndex < units.length - 1) {
        num /= 1024;
        unitIndex++;
      }
      return num.toFixed(2) + " " + units[unitIndex];
    }

    function updateStats() {
      peersElement.textContent = torrent.numPeers;
      downloadSpeedElement.textContent = prettyBytes(torrent.downloadSpeed);
      progressElement.textContent = (torrent.progress * 100).toFixed(2) + "%";
      progressBar.style.width = (torrent.progress * 100).toFixed(2) + "%";
      bufferedElement.textContent = "N/A";
    }

    torrent.on("infoHash", () => console.log("[Torrent] infoHash:", torrent.infoHash));
    torrent.on("metadata", () => {
      console.log("[Torrent] metadata event. Name:", torrent.name);
      console.log("[Torrent] files:", torrent.files.map((f) => f.name));
    });
    torrent.on("ready", () => console.log("[Torrent] ready event."));
    torrent.on("done", () => console.log("[Torrent] done event. All data downloaded."));

    torrent.on("download", (bytes) => {
      console.log(
        `[Torrent] Downloaded chunk: ${bytes} bytes, total: ${torrent.downloaded}/${torrent.length}, progress: ${(torrent.progress * 100).toFixed(2)}%`
      );
      updateStats();
    });

    // If your MP4 is faststart, it should begin playing quickly once we get partial data.
    // The HTML side (autoplay muted) should handle actually starting the video without calling play().
    torrent.on("metadata", () => {
      statusElement.textContent = "Starting stream...";
      const file = torrent.files.find((f) =>
        f.name.endsWith(".mp4") || f.name.endsWith(".webm") || f.name.endsWith(".mkv")
      );
      if (!file) {
        statusElement.textContent = "No video file found in torrent!";
        return;
      }
      console.log("[Torrent] streaming file:", file.name);
      file.streamTo(videoPlayer);

      // Optional extra forced play (if you prefer). Some browsers block autoplay or
      // require user gesture unless it's muted. Your choice to keep or remove.
      // videoPlayer.play().catch(err => {
      //   console.warn("[App] Autoplay blocked or error:", err);
      // });

      statusElement.textContent = "Streaming";
      updateStats();
    });
  } catch (err) {
    statusElement.textContent = `Error: ${err.message}`;
    console.error("[App]", err);
  }
})();