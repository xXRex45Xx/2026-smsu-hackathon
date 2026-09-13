import { parentPort, workerData } from "node:worker_threads";
import mammoth from "mammoth";
import yauzl from "yauzl";

try {
  const buffer = Buffer.from(workerData.buffer);
  let text;
  if (workerData.ext === "pdf") {
    const { PDFParse } = await import("pdf-parse");
    const parser = new PDFParse({ data: buffer });
    try { text = (await parser.getText({ first: 40 })).text; }
    finally { await parser.destroy(); }
  } else {
    // Reject oversized or unsafe ZIP members before the DOCX parser expands them.
    await new Promise((resolve, reject) => {
      yauzl.fromBuffer(buffer, { lazyEntries: true }, (error, zip) => {
        if (error) return reject(error);
        let total = 0; let entries = 0;
        zip.on("error", reject);
        zip.on("entry", (entry) => {
          total += entry.uncompressedSize; entries += 1;
          if (total > 30 * 1024 * 1024 || entries > 1500 || /(^|\/)\.\.(\/|$)|^\/|\\/.test(entry.fileName)) {
            zip.close(); reject(new Error("Unsafe archive"));
          } else zip.readEntry();
        });
        zip.on("end", resolve); zip.readEntry();
      });
    });
    text = (await mammoth.extractRawText({ buffer })).value;
  }
  parentPort.postMessage({ text });
} catch {
  parentPort.postMessage({ error: "Unable to extract this document. It may be encrypted, damaged, or too large to process. Try a plain-text export." });
}
