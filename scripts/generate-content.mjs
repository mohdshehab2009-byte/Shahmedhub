import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import "dotenv/config";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.join(__dirname, "..", "src", "data");
const MANUAL_PATH = path.join(DATA_DIR, "content.json");
const OUTPUT_PATH = path.join(DATA_DIR, "generated-content.json");

function readJSON(filePath) {
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf-8"));
  } catch {
    return { items: [] };
  }
}

async function fetchYouTubeVideos(apiKey, channelId) {
  // Step 1: resolve channel ID and get uploads playlist
  const channelRes = await fetch(
    `https://www.googleapis.com/youtube/v3/channels?part=contentDetails&id=${channelId}&key=${apiKey}`
  );
  const channelData = await channelRes.json();

  let playlistId;
  if (channelData.items?.[0]?.contentDetails?.relatedPlaylists?.uploads) {
    playlistId = channelData.items[0].contentDetails.relatedPlaylists.uploads;
  } else {
    // maybe it's a handle like @channelname
    const byHandle = await fetch(
      `https://www.googleapis.com/youtube/v3/channels?part=contentDetails&forHandle=${channelId}&key=${apiKey}`
    );
    const handleData = await byHandle.json();
    playlistId =
      handleData.items?.[0]?.contentDetails?.relatedPlaylists?.uploads;
    if (!playlistId) throw new Error("Could not find uploads playlist");
  }

  // Step 2: fetch all videos from the uploads playlist
  const videos = [];
  let pageToken = "";

  do {
    const url = `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&playlistId=${playlistId}&maxResults=50&key=${apiKey}${pageToken ? `&pageToken=${pageToken}` : ""}`;
    const res = await fetch(url);
    const data = await res.json();
    if (data.items) videos.push(...data.items);
    pageToken = data.nextPageToken || "";
  } while (pageToken);

  return videos.map((item) => {
    const videoId = item.snippet.resourceId.videoId;
    const rawDesc = item.snippet.description || "";
    return {
      id: `yt_${videoId}`,
      title: item.snippet.title,
      type: "video",
      platform: "youtube",
      url: `https://youtube.com/watch?v=${videoId}`,
      embedUrl: `https://youtube.com/embed/${videoId}`,
      thumbnail: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
      date: (item.snippet.publishedAt || "").split("T")[0],
      tags: [],
      description: rawDesc.split("\n")[0].slice(0, 200) || "",
    };
  });
}

async function fetchSoundCloudTracks(clientId, username) {
  // Step 1: resolve username to user ID
  const resolveRes = await fetch(
    `https://api.soundcloud.com/resolve?url=https://soundcloud.com/${username}&client_id=${clientId}`
  );
  if (!resolveRes.ok) throw new Error(`Failed to resolve user: ${resolveRes.status}`);
  const user = await resolveRes.json();

  // Step 2: fetch all tracks for the user
  const tracks = [];
  let offset = 0;
  const limit = 50;

  while (true) {
    const url = `https://api.soundcloud.com/users/${user.id}/tracks?client_id=${clientId}&limit=${limit}&offset=${offset}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Failed to fetch tracks: ${res.status}`);
    const data = await res.json();
    if (!data || data.length === 0) break;
    tracks.push(...data);
    if (data.length < limit) break;
    offset += limit;
  }

  return tracks.map((track) => {
    const tags = (track.tag_list || "")
      .split(/\s+/)
      .filter(Boolean)
      .map((t) => t.replace(/^"|"$/g, ""));
    return {
      id: `sc_${track.id}`,
      title: track.title,
      type: "sound",
      platform: "soundcloud",
      url: track.permalink_url,
      embedUrl: `https://w.soundcloud.com/player/?url=${track.permalink_url}`,
      thumbnail: track.artwork_url || null,
      date: (track.created_at || "").split("T")[0],
      tags,
      description: (track.description || "").slice(0, 300) || "",
    };
  });
}

async function main() {
  const apiKey = process.env.YOUTUBE_API_KEY;
  const channelId = process.env.YOUTUBE_CHANNEL_ID;
  const scClientId = process.env.SOUNDCLOUD_CLIENT_ID;
  const scUsername = process.env.SOUNDCLOUD_USERNAME;

  // Read manual items (Instagram, text posts)
  const { items: manualItems } = readJSON(MANUAL_PATH);
  const finalItems = [...manualItems];
  const seenUrls = new Set(finalItems.map((i) => i.url));

  // Fetch YouTube videos if configured
  let youtubeCount = 0;

  if (apiKey && channelId) {
    try {
      const youtubeVideos = await fetchYouTubeVideos(apiKey, channelId);
      for (const video of youtubeVideos) {
        if (!seenUrls.has(video.url)) {
          finalItems.push(video);
          seenUrls.add(video.url);
          youtubeCount++;
        }
      }
      console.log(`✓ YouTube: ${youtubeCount} videos fetched`);
    } catch (err) {
      console.error(`✗ YouTube fetch failed: ${err.message}`);
    }
  } else {
    console.log(
      "ℹ No YOUTUBE_API_KEY / YOUTUBE_CHANNEL_ID set — skipping YouTube fetch"
    );
  }

  // Fetch SoundCloud tracks if configured
  let soundcloudCount = 0;

  if (scClientId && scUsername) {
    try {
      const soundcloudTracks = await fetchSoundCloudTracks(scClientId, scUsername);
      for (const track of soundcloudTracks) {
        if (!seenUrls.has(track.url)) {
          finalItems.push(track);
          seenUrls.add(track.url);
          soundcloudCount++;
        }
      }
      console.log(`✓ SoundCloud: ${soundcloudCount} tracks fetched`);
    } catch (err) {
      console.error(`✗ SoundCloud fetch failed: ${err.message}`);
    }
  } else {
    console.log(
      "ℹ No SOUNDCLOUD_CLIENT_ID / SOUNDCLOUD_USERNAME set — skipping SoundCloud fetch"
    );
  }

  // Sort by date descending
  finalItems.sort((a, b) => b.date.localeCompare(a.date));

  fs.writeFileSync(OUTPUT_PATH, JSON.stringify({ items: finalItems }, null, 2));
  console.log(
    `✓ Generated ${finalItems.length} items total (${manualItems.length} manual, ${youtubeCount} from YouTube, ${soundcloudCount} from SoundCloud)`
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
