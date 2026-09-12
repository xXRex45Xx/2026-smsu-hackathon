// Lesson content + quiz for the /lesson/:slug page.
//
// Hardcoded for now. Later:
//  - `content` (text lessons) comes from the database instead of this file.
//  - `videoUrl` (video lessons) comes from Cloudflare R2 — see client/app/lib/uploads.ts
//    and server/src/routes/uploads.js for the presigned-URL flow already wired up.
//  - `quiz` is generated on the spot by an AI model from the lesson content, instead
//    of being authored ahead of time.

export type LessonContentType = "text" | "video";

export interface QuizQuestion {
  question: string;
  options: string[];
  correctIndex: number;
}

export interface TextSection {
  heading: string;
  paragraphs: string[];
}

export interface Lesson {
  slug: string;
  title: string;
  courseId?: string;
  contentType: LessonContentType;
  /** Present when contentType === "text". */
  sections?: TextSection[];
  /** Present when contentType === "video"; will be an R2 download URL later. */
  videoUrl?: string;
  quiz: QuizQuestion[];
}

export const LESSONS: Lesson[] = [
  {
    slug: "advanced-automation-systems",
    title: "Advanced Automation Systems",
    courseId: "c1",
    contentType: "text",
    sections: [
      {
        heading: "Overview",
        paragraphs: [
          "This lesson introduces the core building blocks of the automated packaging and production lines used across our manufacturing facilities: programmable logic controllers (PLCs), sensors and feedback loops, safety interlocks, and recipe-driven changeovers.",
          "By the end of this lesson, you should be able to explain how these pieces work together to keep a line running safely and efficiently, and recognize the vocabulary used by automation and maintenance teams on the floor.",
        ],
      },
      {
        heading: "Programmable Logic Controllers (PLCs)",
        paragraphs: [
          "A PLC is the industrial computer that decides how a machine behaves. Instead of running general-purpose software, it executes ladder logic programs: rules that react to sensor inputs (a part detected, a guard closed, a pressure threshold reached) and drive outputs (motors, valves, indicator lights) accordingly.",
          "Because ladder logic is scanned continuously in a tight loop, PLCs respond to changing conditions on the line in milliseconds, which is what makes reliable high-speed automation possible.",
        ],
      },
      {
        heading: "Sensors and Feedback Loops",
        paragraphs: [
          "Automated lines rely on sensors to know what is actually happening, not just what should be happening. Photoelectric sensors detect a part on a conveyor without touching it, using a light beam that is broken or reflected. Proximity sensors detect metal parts at close range, and pressure or flow sensors monitor pneumatic and hydraulic systems.",
          "A closed-loop control system takes that sensor feedback and continuously adjusts an output, like motor speed or valve position, to keep a process at its target setpoint. This is what allows a line to self-correct for small variations instead of drifting out of spec.",
        ],
      },
      {
        heading: "Safety Interlocks and Lockout/Tagout",
        paragraphs: [
          "Interlocks are safety circuits that prevent a machine from operating unless a condition is met, such as a guard door being closed. Emergency stop (e-stop) circuits are wired independently of the PLC logic so that they can cut power even if the controller itself has a fault.",
          "Lockout/Tagout (LOTO) is the procedure maintenance technicians follow before servicing equipment: energy sources are isolated and physically locked, and a tag identifies who performed the lockout. Its purpose is to prevent the machine from unexpectedly starting up while someone is working on it.",
        ],
      },
      {
        heading: "Recipe-Driven Changeovers",
        paragraphs: [
          "Packaging lines regularly switch between products, package sizes, or flavors. A manual changeover means physically resetting guides, timing, and settings for the new product, which can take hours.",
          "Recipe-driven automation stores each product's settings as a saved 'recipe' that the PLC can load automatically. Combined with quick-change tooling, this is the main lever used to reduce changeover time between product runs.",
        ],
      },
      {
        heading: "Key Takeaways",
        paragraphs: [
          "PLCs use ladder logic to react to sensor input in real time. Sensors and closed-loop control keep a process at its target automatically. Interlocks and LOTO exist to protect people, not throughput. Recipe-driven automation is the primary way lines cut changeover time.",
        ],
      },
    ],
    quiz: [
      {
        question: "What does a PLC primarily use to decide how to control connected machinery?",
        options: [
          "A fixed mechanical cam",
          "Ladder logic programs reacting to sensor input",
          "Only manual push-button wiring",
          "A separate cloud AI model",
        ],
        correctIndex: 1,
      },
      {
        question: "Which sensor type is commonly used to detect a part on a conveyor without touching it?",
        options: ["Strain gauge", "Thermocouple", "Photoelectric sensor", "pH probe"],
        correctIndex: 2,
      },
      {
        question: "What is the main purpose of a Lockout/Tagout (LOTO) procedure?",
        options: [
          "Speed up product changeovers",
          "Prevent unexpected machine startup during maintenance",
          "Track finished-goods inventory",
          "Calibrate ladder logic timers",
        ],
        correctIndex: 1,
      },
      {
        question: "Recipe-driven automation on a packaging line mainly helps reduce what?",
        options: [
          "Changeover time between product runs",
          "The number of safety sensors required",
          "PLC programming language options",
          "Employee training hours only",
        ],
        correctIndex: 0,
      },
      {
        question: "In a closed-loop control system, sensor feedback is used to do what?",
        options: [
          "Disable the emergency stop circuit",
          "Replace the PLC entirely",
          "Continuously adjust output toward a target setpoint",
          "Eliminate the need for guarding",
        ],
        correctIndex: 2,
      },
    ],
  },
];

export function getLessonBySlug(slug: string): Lesson | undefined {
  return LESSONS.find((l) => l.slug === slug);
}

// Matched by title rather than id: courses now come from the live /api/v1/courses
// endpoint, whose ids don't line up with this hardcoded lesson data. Title is the
// stable link between "a course in the catalog" and "a lesson we have content for".
export function getLessonByCourseTitle(title: string): Lesson | undefined {
  const normalized = title.trim().toLowerCase();
  return LESSONS.find((l) => l.title.trim().toLowerCase() === normalized);
}
