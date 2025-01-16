/*
<ai_context>
this is a new file that imports the local webtorrent library
</ai_context>
*/

import WebTorrent from "./js/webtorrent.min.js";

// replicate the streaming logic in your index.html script
(async function main() {
  const statusElement = document.getElementById("status");
  const videoPlayer = document.getElementById("videoPlayer");

  try {
    const client = new WebTorrent();
    statusElement.textContent = "Initializing service worker...";
    await navigator.serviceWorker.register("sw.min.js");
    const registration = await navigator.serviceWorker.ready;
    client.createServer({ controller: registration });

    statusElement.textContent = "Reading magnet URI...";
    const magnetResponse = await fetch("magnet-link.txt");
    const magnetURI = (await magnetResponse.text()).trim();

    statusElement.textContent = "Connecting to peers...";
    client.add(magnetURI, (torrent) => {
      statusElement.textContent = "Starting stream...";
      const file = torrent.files.find(
        (f) =>
          f.name.endsWith(".mp4") ||
          f.name.endsWith(".webm") ||
          f.name.endsWith(".mkv")
      );
      if (!file) {
        statusElement.textContent = "Error: No video file found";
        return;
      }
      file.streamTo(videoPlayer);

      statusElement.textContent = "Streaming";
    });
  } catch (err) {
    statusElement.textContent = `Error: ${err.message}`;
    console.error(err);
  }
})();
