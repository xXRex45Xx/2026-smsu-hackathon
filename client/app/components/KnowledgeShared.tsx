import { useEffect, useRef } from "react";
import { AlertCircle, CheckCircle2, LoaderCircle, X } from "lucide-react";
import type { ReactNode } from "react";

export function Notice({ children, error = false }: { children: ReactNode; error?: boolean }) {
  return <div className={`kt-notice ${error ? "kt-notice-error" : ""}`} role={error ? "alert" : "status"}><AlertCircle size={17} aria-hidden="true" /><span>{children}</span></div>;
}
export function Busy({ label }: { label: string }) {
  return <div className="kt-busy" role="status"><LoaderCircle className="kt-spin" size={17} aria-hidden="true" /><span>{label}</span><progress aria-label={label} /></div>;
}
export function ReviewNotice() {
  return <Notice>AI Generated. A manager or subject-matter expert must review this content before approval or changes to employee records.</Notice>;
}
export function TextList({ items, ordered = false }: { items: string[]; ordered?: boolean }) {
  const Tag = ordered ? "ol" : "ul";
  return <Tag className="kt-list">{items.map((item, i) => <li key={i}>{item}</li>)}</Tag>;
}
export function Modal({ title, children, onClose }: { title: string; children: ReactNode; onClose: () => void }) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => { const dialog = ref.current; dialog?.showModal(); return () => dialog?.close(); }, []);
  return <dialog ref={ref} className="kt-modal" aria-label={title} onCancel={(event) => { event.preventDefault(); onClose(); }}>
    <div className="kt-row"><h3>{title}</h3><button className="kt-icon" title="Close" aria-label="Close" onClick={onClose}><X size={18} /></button></div>
    {children}
  </dialog>;
}
export function Success({ children }: { children: ReactNode }) {
  return <div className="kt-success" role="status"><CheckCircle2 size={16} aria-hidden="true" />{children}</div>;
}
