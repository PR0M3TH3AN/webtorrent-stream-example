/*
<ai_context>
this is a new file that imports the local webtorrent library
</ai_context>
*/

import WebTorrent from "./js/webtorrent.min.js";

// replicate the streaming logic in your index.html script
(async function main() {
  console.log("[App] Starting application...");

  const statusElement = document.getElementById("status");
  const videoPlayer = document.getElementById("videoPlayer");

  try {
    console.log("[App] Initializing service worker registration...");
    statusElement.textContent = "Initializing service worker...";
    await navigator.serviceWorker.register("sw.min.js");
    const registration = await navigator.serviceWorker.ready;
    console.log("[App] Service worker ready. Creating WebTorrent server...");

    const client = new WebTorrent();
    client.createServer({ controller: registration });

    statusElement.textContent = "Reading magnet URI...";
    console.log("[App] Fetching magnet URI from magnet-link.txt...");
    const magnetResponse = await fetch("magnet-link.txt");
    const magnetURI = (await magnetResponse.text()).trim();
    console.log("[App] Successfully fetched magnet URI:", magnetURI);

    statusElement.textContent = "Connecting to peers...";
    console.log("[App] Adding torrent to WebTorrent client...");
    const torrent = client.add(magnetURI);

    // Additional torrent events:
    torrent.on("infoHash", () => {
      console.log("[Torrent] infoHash event. infoHash:", torrent.infoHash);
    });

    torrent.on("metadata", () => {
      console.log("[Torrent] metadata event. Name:", torrent.name);
      console.log("[Torrent] Number of files:", torrent.files.length);
    });

    torrent.on("ready", () => {
      console.log(
        "[Torrent] ready event. Attempting to select a playable file."
      );
    });

    torrent.on("done", () => {
      console.log("[Torrent] done event. All data downloaded.");
    });

    // Listen for when a new peer is connected (wire)
    torrent.on("wire", (wire, infoHash) => {
      console.log(
        `[Torrent] New wire connected for ${infoHash}. Peer address: ${wire.remoteAddress}`
      );
    });

    // Listen for download progress
    torrent.on("download", (bytes) => {
      console.log(
        `[Torrent] Download chunk: ${bytes} bytes. ` +
          `Total downloaded: ${torrent.downloaded}/${torrent.length}. ` +
          `Connected peers: ${torrent.numPeers}. ` +
          `Progress: ${(torrent.progress * 100).toFixed(2)}%`
      );
    });

    // Trackers – see if announces are happening
    torrent.on("trackerAnnounce", () => {
      console.log("[Torrent] trackerAnnounce event. Current tracker stats:", {
        announce: torrent.announce,
        tracker: torrent.tracker
          ? torrent.tracker.wrtcSupport
            ? "WebRTC supported"
            : "No WebRTC"
          : "No tracker object",
      });
    });

    // If after a while we never get metadata, assume no WebRTC seeder
    setTimeout(() => {
      if (!torrent.metadata) {
        console.warn(
          "[Torrent] Still no metadata. This usually means no WebRTC peers " +
            "are seeding the torrent. Ensure it's seeded by a client that supports WebRTC."
        );
      }
    }, 15000);

    // When the torrent finishes parsing metadata, add a callback to stream the file
    torrent.on("metadata", () => {
      statusElement.textContent = "Starting stream...";
      const file = torrent.files.find(
        (f) =>
          f.name.endsWith(".mp4") ||
          f.name.endsWith(".webm") ||
          f.name.endsWith(".mkv")
      );

      if (!file) {
        const msg = "Error: No video file found in torrent!";
        statusElement.textContent = msg;
        console.error("[Torrent]", msg);
        return;
      }

      console.log(`[Torrent] Selected file for streaming: ${file.name}`);
      console.log("[Torrent] Streaming file to HTML video element...");
      file.streamTo(videoPlayer);

      statusElement.textContent = "Streaming";
      console.log("[Torrent] Streaming started; waiting for video to buffer.");
    });
  } catch (err) {
    const msg = `Error: ${err.message}`;
    statusElement.textContent = msg;
    console.error("[App]", err);
  }
})();
