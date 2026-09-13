import { useEffect, useRef, useState, type CSSProperties } from "react";
import { Link, useParams } from "react-router";
import * as sb from "../../styles/skillbridge";
import { getLessonBySlug } from "../../data/lessons";
import type { Route } from "./+types/learning-catalogue";

export function meta({ params }: Route.MetaArgs) {
  const lesson = getLessonBySlug(params.slug ?? "");
  return [{ title: `${lesson?.title ?? "Lesson"} — SkillBridge` }];
}

type Tab = "content" | "quiz";

// Offset for the sticky dashboard topbar, so scrolled-to sections and the
// scrollspy threshold both land below it instead of underneath it.
const TOPBAR_OFFSET = 130;

export default function Lesson() {
  const { slug } = useParams();
  const lesson = getLessonBySlug(slug ?? "");

  const [tab, setTab] = useState<Tab>("content");
  const [contentDone, setContentDone] = useState(false);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [submitted, setSubmitted] = useState(false);

  const sectionRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const [activeHeading, setActiveHeading] = useState<string | undefined>(lesson?.sections?.[0]?.heading);

  // Book-index scrollspy: track which section heading is currently at/above
  // the topbar offset, and highlight that one in the side panel.
  useEffect(() => {
    if (tab !== "content" || lesson?.contentType !== "text" || !lesson.sections) return;

    const headings = lesson.sections.map((s) => s.heading);
    function onScroll() {
      let current = headings[0];
      for (const heading of headings) {
        const el = sectionRefs.current[heading];
        if (el && el.getBoundingClientRect().top - TOPBAR_OFFSET <= 0) {
          current = heading;
        }
      }
      setActiveHeading(current);
    }

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [tab, lesson]);

  if (!lesson) {
    return (
      <div style={sb.page}>
        <div style={sb.card}>
          <div style={sb.cardTitle}>Lesson not found</div>
          <div style={{ ...sb.cardSubtitle, marginTop: 6 }}>
            There's no lesson at "{slug}". <Link to="/learning" style={{ color: sb.colors.red, fontWeight: 700 }}>Back to Learning & Training</Link>
          </div>
        </div>
      </div>
    );
  }

  const quizUnlocked = contentDone;
  const totalQuestions = lesson.quiz.length;
  const answeredCount = Object.keys(answers).length;
  const score = submitted ? lesson.quiz.filter((q, i) => answers[i] === q.correctIndex).length : 0;
  const complete = contentDone && submitted;

  const takeQuiz = () => {
    setContentDone(true);
    setTab("quiz");
  };

  const scrollToSection = (heading: string) => {
    sectionRefs.current[heading]?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const selectAnswer = (qIndex: number, optIndex: number) => {
    if (submitted) return;
    setAnswers((prev) => ({ ...prev, [qIndex]: optIndex }));
  };

  const submitQuiz = () => setSubmitted(true);
  const retakeQuiz = () => {
    setAnswers({});
    setSubmitted(false);
  };

  const crumbStyle = (active: boolean, disabled: boolean): CSSProperties => ({
    fontSize: 14,
    fontWeight: active ? 800 : 600,
    background: "none",
    border: "none",
    padding: 0,
    cursor: disabled ? "not-allowed" : "pointer",
    color: disabled ? sb.colors.inkFainter : active ? sb.colors.ink : sb.colors.inkFaint,
    textDecoration: active ? "underline" : "none",
    textUnderlineOffset: 4,
  });

  return (
    <div style={sb.page}>
      <div>
        <Link to="/learning" style={{ fontSize: 12, fontWeight: 700, color: sb.colors.inkFaint }}>← Back to Learning & Training</Link>
        <div className="sb-fluid-row-between sb-fluid-row-wrap" style={{ marginTop: 10 }}>
          <div>
            <h1 style={sb.pageHeading}>{lesson.title}</h1>
            <div style={sb.pageSubheading}>
              {lesson.contentType === "video" ? "Video lesson" : "Text lesson"} · {totalQuestions}-question quiz
            </div>
          </div>
          {complete && (
            <span style={{ ...sb.pill, background: sb.colors.greenBg, color: sb.colors.green }}>
              ✓ Learning Event Complete
            </span>
          )}
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 8 }} aria-label="Lesson sections">
        <button style={crumbStyle(tab === "content", false)} onClick={() => setTab("content")}>
          Content{contentDone ? " ✓" : ""}
        </button>
        <span style={{ color: sb.colors.inkFainter, fontSize: 13 }}>›</span>
        <button
          style={crumbStyle(tab === "quiz", !quizUnlocked)}
          onClick={() => quizUnlocked && setTab("quiz")}
          disabled={!quizUnlocked}
          title={quizUnlocked ? undefined : "Finish the content first to unlock the quiz"}
        >
          Quiz{submitted ? ` (${score}/${totalQuestions})` : !quizUnlocked ? " 🔒" : ""}
        </button>
      </div>

      {tab === "content" && (
        <div className="sb-lesson-layout">
          {lesson.contentType === "text" && lesson.sections && (
            <nav className="sb-lesson-toc" aria-label="Table of contents">
              {lesson.sections.map((section) => (
                <button
                  key={section.heading}
                  className={
                    activeHeading === section.heading ? "sb-lesson-toc-link sb-lesson-toc-link-active" : "sb-lesson-toc-link"
                  }
                  onClick={() => scrollToSection(section.heading)}
                >
                  {section.heading}
                </button>
              ))}
            </nav>
          )}

          <div style={sb.card}>
            {lesson.contentType === "text" &&
              lesson.sections?.map((section) => (
                <div
                  key={section.heading}
                  ref={(el) => {
                    sectionRefs.current[section.heading] = el;
                  }}
                  style={{ marginBottom: 22, scrollMarginTop: TOPBAR_OFFSET }}
                >
                  <div style={{ ...sb.cardTitle, fontSize: 16, marginBottom: 8 }}>{section.heading}</div>
                  {section.paragraphs.map((p, i) => (
                    <p key={i} style={{ fontSize: 14, color: sb.colors.inkSoft, lineHeight: 1.6, margin: "0 0 10px" }}>
                      {p}
                    </p>
                  ))}
                </div>
              ))}

            {lesson.contentType === "video" && lesson.videoUrl && (
              <video controls style={{ width: "100%", borderRadius: 10 }} src={lesson.videoUrl} />
            )}

            <div style={{ marginTop: 8, paddingTop: 18, borderTop: `1px solid ${sb.colors.border}`, display: "flex", justifyContent: "flex-end" }}>
              <button style={sb.primaryButton} onClick={takeQuiz}>
                Take Quiz
              </button>
            </div>
          </div>
        </div>
      )}

      {tab === "quiz" && quizUnlocked && (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {lesson.quiz.map((q, qIndex) => {
            const selected = answers[qIndex];
            return (
              <div key={q.question} style={sb.card}>
                <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 12 }}>
                  {qIndex + 1}. {q.question}
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {q.options.map((opt, optIndex) => {
                    const isSelected = selected === optIndex;
                    const isCorrect = optIndex === q.correctIndex;
                    let bg = sb.colors.surface;
                    let border = sb.colors.borderStrong;
                    let color = sb.colors.inkSoft;
                    if (submitted) {
                      if (isCorrect) {
                        bg = sb.colors.greenBg;
                        border = sb.colors.green;
                        color = sb.colors.green;
                      } else if (isSelected && !isCorrect) {
                        bg = sb.colors.redLight;
                        border = sb.colors.red;
                        color = sb.colors.red;
                      }
                    } else if (isSelected) {
                      bg = sb.colors.surfaceSoft;
                      border = sb.colors.ink;
                      color = sb.colors.ink;
                    }
                    return (
                      <button
                        key={opt}
                        onClick={() => selectAnswer(qIndex, optIndex)}
                        disabled={submitted}
                        style={{
                          textAlign: "left",
                          fontSize: 13,
                          fontWeight: isSelected ? 700 : 500,
                          padding: "10px 14px",
                          borderRadius: 10,
                          border: `1px solid ${border}`,
                          background: bg,
                          color,
                          cursor: submitted ? "default" : "pointer",
                        }}
                      >
                        {opt}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}

          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            {!submitted ? (
              <button
                style={{ ...sb.primaryButton, opacity: answeredCount === totalQuestions ? 1 : 0.5 }}
                disabled={answeredCount !== totalQuestions}
                onClick={submitQuiz}
              >
                Submit Quiz
              </button>
            ) : (
              <>
                <span style={{ fontSize: 14, fontWeight: 700 }}>
                  Score: {score}/{totalQuestions}
                </span>
                <button style={sb.secondaryButton} onClick={retakeQuiz}>
                  Retake Quiz
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
