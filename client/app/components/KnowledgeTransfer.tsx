import { useEffect, useRef, useState } from "react";
import { BookOpen, FileText, GitBranch, Sparkles, Upload, Video } from "lucide-react";
import { errorMessage, useKnowledgeApi, type Artifact, type Context, type ModuleContent, type Source } from "../lib/knowledge";
import KnowledgeModule from "./KnowledgeModule";
import { Busy, Notice } from "./KnowledgeShared";
import { captureVideoFrames } from "../lib/video-frames";

const tabs = [{ kind: "video", title: "Video", Icon: Video }, { kind: "document", title: "Document", Icon: FileText }, { kind: "github", title: "GitHub Repository", Icon: GitBranch }] as const;
const empty = (kind: Source["kind"]): Source => ({ kind, name: kind === "video" ? "Video observations" : "Pasted document", text: "", files: [] });

export default function KnowledgeTransfer({ context, onRefresh, onGenerating }: { context: Context; onRefresh: () => void; onGenerating: (value: boolean) => void }) {
  const request = useKnowledgeApi();
  const [kind, setKind] = useState<Source["kind"]>("video");
  const [sources, setSources] = useState<Record<Source["kind"], Source>>({ video: empty("video"), document: empty("document"), github: empty("github") });
  const [repo, setRepo] = useState("");
  const [module, setModule] = useState<Artifact | null>(null);
  const [busy, setBusy] = useState("");
  const [error, setError] = useState("");
  const [retry, setRetry] = useState<"upload" | "import" | "generate" | null>(null);
  const [videoUrl, setVideoUrl] = useState("");
  const lastFile = useRef<File | null>(null);
  const source = sources[kind];
  useEffect(() => () => { if (videoUrl) URL.revokeObjectURL(videoUrl); }, [videoUrl]);
  const setSource = (value: Source) => setSources((p) => ({ ...p, [value.kind]: value }));
  const upload = async (file: File) => {
    lastFile.current = file; setError(""); setRetry("upload");
    const video = kind === "video";
    if (!file.size || file.size > (video ? 100 : 10) * 1024 * 1024 || !(video ? /\.(mp4|mov|webm)$/i : /\.(pdf|docx|txt|md|markdown)$/i).test(file.name)) { setError(video ? "Choose a non-empty MP4, MOV or WebM video up to 100 MB." : "Choose a non-empty PDF, DOCX, TXT or Markdown document up to 10 MB."); return; }
    setBusy(video ? "Reading video" : "Uploading and extracting document text");
    if (video) {
      setVideoUrl(URL.createObjectURL(file));
      setSource({ kind: "video", name: file.name, size: file.size, text: "", files: [] });
      onGenerating(true);
    }
    try {
      let body: FormData;
      if (video) {
        body = await captureVideoFrames(file, (completed, total) => setBusy(`Reading video frames (${completed}/${total})`));
        setBusy("Analyzing video with local vision AI");
      } else { body = new FormData(); body.append("file", file); }
      const result = await request<Source>(video ? "/sources/video" : "/sources/upload", body);
      setSource(result);
    } catch (e) { setError(errorMessage(e)); } finally { setBusy(""); if (video) onGenerating(false); }
  };
  const importRepo = async () => {
    setError(""); setRetry("import"); setBusy("Importing repository documentation");
    try { setSource(await request<Source>("/sources/github", { url: repo.trim() })); }
    catch (e) { setError(errorMessage(e)); } finally { setBusy(""); }
  };
  const generate = async (input = source) => {
    setError(""); setRetry("generate"); setBusy("Analyzing source and generating knowledge module"); onGenerating(true);
    try { setModule(await request<Artifact>("/generate", { kind: input.kind, name: input.name, text: input.text, files: input.files, video: input.video })); onRefresh(); }
    catch (e) { setError(errorMessage(e)); } finally { setBusy(""); onGenerating(false); }
  };
  return <section className="kt-section" aria-labelledby="knowledge-transfer-heading">
    <div className="kt-row"><h2 id="knowledge-transfer-heading">AI Knowledge Transfer</h2><span className="kt-tag kt-blue">Organizational knowledge</span></div>
    <div className="kt-transfer-grid">
      <div className="kt-card kt-stack">
        <div role="tablist" aria-label="Knowledge source" className="kt-tabs">{tabs.map(({ kind: value, title, Icon }, index) => <button key={value} role="tab" id={`source-${value}`} aria-controls={`panel-${value}`} aria-selected={kind === value} tabIndex={kind === value ? 0 : -1} disabled={!!busy} onClick={() => { setKind(value); setError(""); }} onKeyDown={(e) => { const next = e.key === "ArrowRight" ? (index + 1) % 3 : e.key === "ArrowLeft" ? (index + 2) % 3 : e.key === "Home" ? 0 : e.key === "End" ? 2 : null; if (next !== null) { e.preventDefault(); setKind(tabs[next].kind); document.getElementById(`source-${tabs[next].kind}`)?.focus(); } }}><Icon size={18} /><span>{title}</span></button>)}</div>
        <div role="tabpanel" id={`panel-${kind}`} aria-labelledby={`source-${kind}`} className="kt-stack">
          {kind === "github" ? <><label className="kt-field">Repository, folder or document URL<input type="url" maxLength={300} placeholder="https://github.com/owner/repository/tree/main/docs" value={repo} disabled={!!busy} onChange={(e) => setRepo(e.target.value)} /></label><button className="kt-button" disabled={!!busy || !repo.trim()} onClick={importRepo}><GitBranch size={16} />Import Documentation</button><p className="kt-muted kt-small">README, Markdown, security documentation and operational procedures only.</p></> : <>
            <label className="kt-upload"><Upload size={25} /><strong>{kind === "video" ? "Upload a knowledge-transfer video" : "Upload a document"}</strong><span className="kt-muted kt-small">{kind === "video" ? "MP4, MOV, WebM · Up to 100 MB · 30 minutes" : "PDF, DOCX, TXT, Markdown · Up to 10 MB"}</span><input type="file" aria-label={kind === "video" ? "Upload video" : "Upload document"} accept={kind === "video" ? ".mp4,.mov,.webm" : ".pdf,.docx,.txt,.md,.markdown"} disabled={!!busy} onChange={(e) => { const file = e.target.files?.[0]; if (file) void upload(file); e.target.value = ""; }} /></label>
            {kind === "video" && videoUrl && <video className="kt-video" src={videoUrl} controls preload="metadata" />}
          </>}
          {source.status && <div className="kt-source-meta" role="status"><strong>{source.name}</strong>{source.size !== undefined && <span>{(source.size / 1024 / 1024).toFixed(2)} MB</span>}<span>{source.status}</span></div>}
          {!!source.files.length && <details className="kt-detail"><summary>Imported files ({source.files.length})</summary><ul className="kt-list">{source.files.map((file) => <li key={file}>{file}</li>)}</ul></details>}
          <label className="kt-field">{kind === "video" ? "AI video observations" : "Extracted content"}<textarea rows={10} maxLength={24000} value={source.text} disabled={!!busy || (kind === "video" && !source.video)} placeholder={kind === "video" ? "Awaiting video analysis" : "Review extracted text or paste documentation"} onChange={(e) => setSource({ ...source, text: e.target.value })} /></label>
          <div className="kt-row kt-small kt-muted"><span>{kind === "video" ? "Visual analysis · Audio not included" : "Content preview"}</span><span>{source.text.length.toLocaleString()} / 24,000 characters</span></div>
          <button className="kt-button kt-primary" disabled={!!busy || source.text.trim().length < 80} onClick={() => generate()}><Sparkles size={16} />Generate Knowledge Module</button>
        </div>
        {busy.startsWith("Uploading") && lastFile.current && <p className="kt-muted kt-small">{lastFile.current.name} · {(lastFile.current.size / 1024 / 1024).toFixed(2)} MB · Uploading</p>}
        {busy && <Busy label={busy} />}
        {error && <Notice error>{error} <button className="kt-link" disabled={!!busy} onClick={() => retry === "upload" && lastFile.current ? upload(lastFile.current) : retry === "import" ? importRepo() : generate()}>Retry</button></Notice>}
      </div>
      {module ? <KnowledgeModule key={`${module.id}:${module.revision}`} module={module} context={context} onChange={setModule} onRefresh={onRefresh} onRegenerate={() => { setKind(module.source.kind); setSource(module.source); void generate(module.source); }} generating={!!busy} /> : <div className="kt-card kt-empty"><BookOpen size={32} /><h3>Knowledge Module</h3><p className="kt-muted">No source analyzed yet.</p><div className="kt-empty-fields"><span>Skills & competencies</span><span>Procedures & best practices</span><span>Risks & transfer checklist</span><span>Training questions & resources</span></div></div>}
    </div>
    {!!context.modules.filter((m) => m.kind === "MODULE").length && <div className="kt-stack"><h3>Module Library</h3><div className="kt-library">{context.modules.filter((m) => m.kind === "MODULE").map((m) => <button className="kt-card kt-library-item" key={m.id} disabled={!!busy} onClick={() => { setModule(m as Artifact<ModuleContent>); setKind(m.source.kind); setSource(m.source); }}><BookOpen size={20} /><span><strong>{m.content.title}</strong><small>{m.source.name}</small></span><span className={`kt-tag ${m.status === "APPROVED" ? "kt-green" : "kt-amber"}`}>{m.status === "APPROVED" ? "Approved" : "Draft"}</span></button>)}</div></div>}
  </section>;
}
