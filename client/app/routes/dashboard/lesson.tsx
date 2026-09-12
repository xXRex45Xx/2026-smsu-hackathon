import { useState, type CSSProperties } from "react";
import { Link, useParams } from "react-router";
import * as sb from "../../styles/skillbridge";
import { getLessonBySlug } from "../../data/lessons";
import type { Route } from "./+types/lesson";

export function meta({ params }: Route.MetaArgs) {
  const lesson = getLessonBySlug(params.slug ?? "");
  return [{ title: `${lesson?.title ?? "Lesson"} — SkillBridge` }];
}

type Tab = "content" | "quiz";

export default function Lesson() {
  const { slug } = useParams();
  const lesson = getLessonBySlug(slug ?? "");

  const [tab, setTab] = useState<Tab>("content");
  const [contentDone, setContentDone] = useState(false);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [submitted, setSubmitted] = useState(false);

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

  const markContentDone = () => {
    setContentDone(true);
    setTab("quiz");
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

  const tabButtonStyle = (active: boolean, disabled: boolean): CSSProperties => ({
    fontSize: 13,
    fontWeight: 700,
    padding: "10px 18px",
    borderRadius: 10,
    border: "none",
    cursor: disabled ? "not-allowed" : "pointer",
    background: active ? sb.colors.ink : "transparent",
    color: disabled ? sb.colors.inkFainter : active ? "#fff" : sb.colors.inkSoft,
    opacity: disabled ? 0.6 : 1,
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

      <div style={{ display: "flex", gap: 8, borderBottom: `1px solid ${sb.colors.border}`, paddingBottom: 10 }}>
        <button style={tabButtonStyle(tab === "content", false)} onClick={() => setTab("content")}>
          Content{contentDone ? " ✓" : ""}
        </button>
        <button
          style={tabButtonStyle(tab === "quiz", !quizUnlocked)}
          onClick={() => quizUnlocked && setTab("quiz")}
          disabled={!quizUnlocked}
          title={quizUnlocked ? undefined : "Finish the content first to unlock the quiz"}
        >
          Quiz{submitted ? ` (${score}/${totalQuestions})` : ""}
        </button>
      </div>

      {tab === "content" && (
        <div style={sb.card}>
          {lesson.contentType === "text" &&
            lesson.sections?.map((section) => (
              <div key={section.heading} style={{ marginBottom: 22 }}>
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

          <div style={{ marginTop: 8, paddingTop: 18, borderTop: `1px solid ${sb.colors.border}` }}>
            {contentDone ? (
              <span style={{ ...sb.pill, background: sb.colors.greenBg, color: sb.colors.green }}>
                ✓ Marked as read — quiz unlocked
              </span>
            ) : (
              <button style={sb.primaryButton} onClick={markContentDone}>
                Mark as Complete → Take Quiz
              </button>
            )}
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
