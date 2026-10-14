import { makeZip } from "client-zip";

// Largest folder (bytes) we will build as an in-memory ZIP in browsers that
// cannot write straight to disk. Chromium browsers never hit this: they use
// the directory picker instead.
export const ZIP_MEMORY_LIMIT = 1024 ** 3;

const encodePath = (p) => p.split("/").map(encodeURIComponent).join("/");
const fileUrl = (path) => `/media/${encodePath(path)}`;

/** Flat list of every file under `folder`: [{ path, bytes, mtime }] */
export async function loadManifest(folder, signal) {
  const url = `/media/${folder ? encodePath(folder) + "/" : ""}index.all.json`;
  const res = await fetch(url, { cache: "no-cache", signal });
  if (!res.ok) throw new Error(`Could not load file list (HTTP ${res.status})`);
  return res.json();
}

/** Name used for the top-level folder / zip: the folder you are in. */
export const rootName = (folder) => (folder ? folder.split("/").pop() : "media");

/** Path of a file relative to the folder being downloaded. */
const relative = (folder, path) => (folder ? path.slice(folder.length + 1) : path);

/** Passes bytes through while reporting how many went by. */
function counting(stream, onBytes) {
  return stream.pipeThrough(
    new TransformStream({
      transform(chunk, controller) {
        onBytes(chunk.byteLength);
        controller.enqueue(chunk);
      },
    })
  );
}

async function openFile(path, signal) {
  const res = await fetch(fileUrl(path), { signal });
  if (!res.ok || !res.body) throw new Error(`${path}: HTTP ${res.status}`);
  return res;
}

/**
 * Write the folder into a directory the user picked (File System Access API).
 * Streams to disk, so the size of the folder does not matter. Files that are
 * already there with the right size are skipped, which makes re-running the
 * download after an interruption cheap.
 *
 * @param parentHandle FileSystemDirectoryHandle from showDirectoryPicker()
 */
export async function saveToDirectory(parentHandle, folder, files, { onProgress, signal, concurrency = 4 } = {}) {
  const top = await parentHandle.getDirectoryHandle(rootName(folder), { create: true });
  const total = files.reduce((n, f) => n + f.bytes, 0);
  let doneBytes = 0;
  let doneFiles = 0;
  const report = () => onProgress?.({ doneBytes, totalBytes: total, doneFiles, totalFiles: files.length });

  async function dirFor(parts) {
    let dir = top;
    for (const part of parts) dir = await dir.getDirectoryHandle(part, { create: true });
    return dir;
  }

  async function saveOne(f) {
    const parts = relative(folder, f.path).split("/");
    const name = parts.pop();
    const dir = await dirFor(parts);

    const existing = await dir.getFileHandle(name).then((h) => h.getFile(), () => null);
    if (existing && existing.size === f.bytes) {
      doneBytes += f.bytes;
      doneFiles++;
      return report();
    }

    const res = await openFile(f.path, signal);
    const handle = await dir.getFileHandle(name, { create: true });
    const writable = await handle.createWritable();
    let counted = 0;
    try {
      await counting(res.body, (n) => {
        counted += n;
        doneBytes += n;
        report();
      }).pipeTo(writable, { signal });
    } catch (err) {
      doneBytes -= counted; // this file will be redone on the next run
      throw err;
    }
    doneFiles++;
    report();
  }

  // small worker pool: the next files start while big ones are still streaming
  const queue = files.slice();
  const workers = Array.from({ length: Math.min(concurrency, queue.length) }, async () => {
    while (queue.length) {
      signal?.throwIfAborted();
      await saveOne(queue.shift());
    }
  });
  const results = await Promise.allSettled(workers);
  const failed = results.find((r) => r.status === "rejected");
  if (failed) throw failed.reason;
}

/** The folder as a ZIP stream (files stored, not compressed). */
function zipStream(folder, files, { onProgress, signal } = {}) {
  const totalBytes = files.reduce((n, f) => n + f.bytes, 0);
  let doneBytes = 0;
  let doneFiles = 0;
  const root = rootName(folder);

  async function* entries() {
    for (const f of files) {
      signal?.throwIfAborted();
      const res = await openFile(f.path, signal);
      yield {
        name: `${root}/${relative(folder, f.path)}`,
        lastModified: new Date(f.mtime),
        size: f.bytes,
        input: counting(res.body, (n) => {
          doneBytes += n;
          onProgress?.({ doneBytes, totalBytes, doneFiles, totalFiles: files.length });
        }),
      };
      doneFiles++;
    }
  }

  return makeZip(entries());
}

/**
 * Stream the ZIP straight into a file the user picked (showSaveFilePicker).
 * Nothing is held in memory, so the folder can be any size.
 *
 * @param fileHandle FileSystemFileHandle from showSaveFilePicker()
 */
export async function saveZipToFile(fileHandle, folder, files, { onProgress, signal } = {}) {
  const writable = await fileHandle.createWritable();
  await zipStream(folder, files, { onProgress, signal }).pipeTo(writable, { signal });
}

/**
 * Fallback for browsers without the file pickers: build one ZIP in memory
 * and return it as a Blob.
 */
export function buildZip(folder, files, opts) {
  return new Response(zipStream(folder, files, opts)).blob();
}

export function saveBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = Object.assign(document.createElement("a"), { href: url, download: filename });
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 60_000);
}

export function formatBytes(n) {
  if (n < 1024) return `${n} B`;
  const units = ["KB", "MB", "GB", "TB"];
  let i = -1;
  do {
    n /= 1024;
    i++;
  } while (n >= 1024 && i < units.length - 1);
  return `${n.toFixed(n >= 100 ? 0 : 1)} ${units[i]}`;
}
