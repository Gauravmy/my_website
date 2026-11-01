// Fit Check: rank my work against a job description with TF-IDF and cosine similarity,
// the same approach as the TF-IDF scorer in my resume screener. Runs entirely in the browser.
import { projects } from "@/data/projects";
import type { ResumeType } from "@/data/profile";

/** Multi-word and punctuated terms become single tokens before splitting, so "node.js" and "nodejs" match. */
const PHRASES: [RegExp, string][] = [
  [/\bmachine[-\s]learning\b|\bml\b/g, "machinelearning"],
  [/\bdeep[-\s]learning\b/g, "deeplearning"],
  [/\bcomputer[-\s]vision\b|\bcv\b/g, "computervision"],
  [/\bnatural[-\s]language[-\s]processing\b|\bnlp\b/g, "nlp"],
  [/\bartificial[-\s]intelligence\b|\bai\b/g, "ai"],
  [/\bobject[-\s]detection\b/g, "objectdetection"],
  [/\bimage[-\s]processing\b/g, "imageprocessing"],
  [/\bfull[-\s]?stack\b/g, "fullstack"],
  [/\bfront[-\s]?end\b/g, "frontend"],
  [/\bback[-\s]?end\b/g, "backend"],
  [/\bnode\.?js\b|\bnode\b/g, "nodejs"],
  [/\bnext\.?js\b/g, "nextjs"],
  [/\breact\.?js\b/g, "react"],
  [/\bexpress\.?js\b/g, "express"],
  [/\bvue\.?js\b/g, "vue"],
  [/\bscikit[-\s]learn\b|\bsklearn\b/g, "sklearn"],
  [/\btf[-\s]?idf\b/g, "tfidf"],
  [/\bc\+\+/g, "cpp"],
  [/\bc#/g, "csharp"],
  [/\brest(ful)?\s?(apis?|services?)\b|\brestful\b/g, "restapi"],
  [/\bci\s?\/\s?cd\b/g, "cicd"],
  [/\bpower\s?bi\b/g, "powerbi"],
  [/\bllms?\b|\blarge language models?\b|\bgenai\b|\bgenerative ai\b/g, "llm"],
  [/\byolo(v?\d+)?\b|\byoloe\b/g, "yolo"],
  [/\btime[-\s]series\b/g, "timeseries"],
  [/\bprompt engineering\b/g, "promptengineering"],
  [/\bpostgres(ql)?\b/g, "postgresql"],
  [/\bgithub\b/g, "git"],
  [/\bunit tests?\b|\bautomated tests?\b|\btesting\b|\btests?\b/g, "testing"],
];

const STOP = new Set(
  `a about above across after again all also am an and any are as at be because been before being below between both but by can could did do does doing down during each few for from further had has have having he her here hers him his how i if in into is it its itself just me more most my no nor not now of off on once only or other our out over own same she should so some such than that the their them then there these they this those through to too under until up very was we were what when where which while who whom why will with would you your
  ability able applicant applicants apply candidate candidates company degree desired duties education ensure excellent experience experienced familiarity familiar good great hands help hiring ideal include including job join knowledge looking must need needed nice plus preferred proficiency proficient required requirement requirements responsibilities role roles skill skills strong support team teams understanding using use work working world year years intern internship opportunity position bachelor bachelors related field etc well like new build building develop developing development developer engineer engineers engineering`
    .split(/\s+/),
);

export function tokenize(text: string): string[] {
  let t = ` ${text.toLowerCase()} `;
  for (const [re, tok] of PHRASES) t = t.replace(re, ` ${tok} `);
  return t
    .split(/[^a-z0-9]+/)
    .map((w) => (w.length > 4 && w.endsWith("s") && !w.endsWith("ss") ? w.slice(0, -1) : w))
    .filter((w) => w.length > 1 && !STOP.has(w));
}

// ---- Documents: everything I can truthfully say about each project ----
type Doc = { slug: string; title: string; tokens: string[] };

const EXTRA: Record<string, string> = {
  stockwise: "time series demand forecasting random forest baseline holdout mae rmse data validation inventory dashboard python api",
  visioninspect: "computer vision object detection yolo opencv image processing quality inspection camera python api deployment",
  bookleaf: "llm claude prompt engineering classification nlp node backend frontend rest api auth security real-time",
  "resume-screener": "nlp bert tf-idf embeddings ranking text classification information retrieval python semantic search",
  grace: "computer vision gesture speech recognition voice healthcare mediapipe opencv python",
  biopay: "frontend react typescript ui fintech payments three.js",
  agrimarket: "frontend react javascript marketplace ecommerce",
  logistics: "machine learning forecasting regression random forest flask docker python",
};

const docs: Doc[] = projects.map((p) => ({
  slug: p.slug,
  title: p.title,
  tokens: tokenize([p.title, p.subtitle, p.problem, p.bullets.join(" "), p.built.join(" "), p.stack.join(" "), EXTRA[p.slug] ?? ""].join(" ")),
}));

const df = new Map<string, number>();
for (const d of docs) for (const w of new Set(d.tokens)) df.set(w, (df.get(w) ?? 0) + 1);
const idf = (w: string) => Math.log((1 + docs.length) / (1 + (df.get(w) ?? 0))) + 1;

function vector(tokens: string[]) {
  const tf = new Map<string, number>();
  for (const w of tokens) tf.set(w, (tf.get(w) ?? 0) + 1);
  const v = new Map<string, number>();
  let norm = 0;
  for (const [w, c] of tf) {
    const x = (1 + Math.log(c)) * idf(w);
    v.set(w, x);
    norm += x * x;
  }
  norm = Math.sqrt(norm) || 1;
  for (const [w, x] of v) v.set(w, x / norm);
  return v;
}
const docVectors = docs.map((d) => vector(d.tokens));

// ---- Skills: what a JD can ask for, and whether I can show it ----
type Skill = { label: string; token: string; group: "ml" | "web" | "both"; where?: string };

const HAVE: Skill[] = [
  { label: "Machine learning", token: "machinelearning", group: "ml", where: "StockWise AI" },
  { label: "Computer vision", token: "computervision", group: "ml", where: "VisionInspect Pro" },
  { label: "NLP", token: "nlp", group: "ml", where: "Resume Screener" },
  { label: "LLM APIs", token: "llm", group: "ml", where: "BookLeaf" },
  { label: "Python", token: "python", group: "both", where: "StockWise AI" },
  { label: "scikit-learn", token: "sklearn", group: "ml", where: "StockWise AI" },
  { label: "PyTorch", token: "pytorch", group: "ml", where: "VisionInspect Pro" },
  { label: "TensorFlow", token: "tensorflow", group: "ml", where: "my skills list" },
  { label: "pandas", token: "panda", group: "ml", where: "StockWise AI" },
  { label: "NumPy", token: "numpy", group: "ml", where: "StockWise AI" },
  { label: "OpenCV", token: "opencv", group: "ml", where: "VisionInspect Pro" },
  { label: "MediaPipe", token: "mediapipe", group: "ml", where: "CCRAS internship" },
  { label: "YOLO", token: "yolo", group: "ml", where: "VisionInspect Pro" },
  { label: "Object detection", token: "objectdetection", group: "ml", where: "VisionInspect Pro" },
  { label: "BERT", token: "bert", group: "ml", where: "Resume Screener" },
  { label: "TF-IDF", token: "tfidf", group: "ml", where: "Resume Screener" },
  { label: "Forecasting", token: "forecasting", group: "ml", where: "StockWise AI" },
  { label: "Time series", token: "timeseries", group: "ml", where: "StockWise AI" },
  { label: "Deep learning", token: "deeplearning", group: "ml", where: "Infosys Springboard" },
  { label: "React", token: "react", group: "web", where: "BookLeaf" },
  { label: "Next.js", token: "nextjs", group: "web", where: "StockWise AI" },
  { label: "TypeScript", token: "typescript", group: "web", where: "BookLeaf" },
  { label: "JavaScript", token: "javascript", group: "web", where: "AgriMarket" },
  { label: "Node.js", token: "nodejs", group: "web", where: "BookLeaf" },
  { label: "Express", token: "express", group: "web", where: "BookLeaf" },
  { label: "FastAPI", token: "fastapi", group: "web", where: "StockWise AI" },
  { label: "Flask", token: "flask", group: "web", where: "AI Demand Forecasting" },
  { label: "REST APIs", token: "restapi", group: "web", where: "BookLeaf" },
  { label: "SQL", token: "sql", group: "both", where: "StockWise AI" },
  { label: "SQLite", token: "sqlite", group: "both", where: "BookLeaf" },
  { label: "Docker", token: "docker", group: "both", where: "VisionInspect Pro" },
  { label: "Git", token: "git", group: "both", where: "every project" },
  { label: "Testing", token: "testing", group: "both", where: "StockWise AI" },
  { label: "Tailwind", token: "tailwind", group: "web", where: "BioPay Connect" },
  { label: "C++", token: "cpp", group: "both", where: "my skills list" },
  { label: "Java", token: "java", group: "both", where: "my skills list" },
];

const NOT_YET: { label: string; token: string }[] = [
  ["AWS", "aws"],
  ["GCP", "gcp"],
  ["Azure", "azure"],
  ["Kubernetes", "kubernete"],
  ["Spark", "spark"],
  ["Kafka", "kafka"],
  ["Hadoop", "hadoop"],
  ["Airflow", "airflow"],
  ["MLflow", "mlflow"],
  ["Terraform", "terraform"],
  ["Redis", "redi"],
  ["MongoDB", "mongodb"],
  ["PostgreSQL", "postgresql"],
  ["MySQL", "mysql"],
  ["GraphQL", "graphql"],
  ["Django", "django"],
  ["Spring", "spring"],
  ["Angular", "angular"],
  ["Vue", "vue"],
  ["Go", "golang"],
  ["Rust", "rust"],
  ["Ruby", "ruby"],
  ["PHP", "php"],
  ["C#", "csharp"],
  ["Swift", "swift"],
  ["Kotlin", "kotlin"],
  ["LangChain", "langchain"],
  ["RAG", "rag"],
  ["ROS", "ros"],
  ["SLAM", "slam"],
  ["CI/CD", "cicd"],
  ["Tableau", "tableau"],
  ["Power BI", "powerbi"],
].map(([label, token]) => ({ label, token }));

export type FitResult = {
  ranked: { slug: string; title: string; score: number; terms: string[] }[];
  have: { label: string; where?: string }[];
  missing: string[];
  coverage: number | null;
  resume: ResumeType;
  resumeReason: string;
  words: number;
};

export function runFit(jd: string): FitResult {
  const tokens = tokenize(jd);
  const q = vector(tokens);
  const ranked = docs
    .map((d, i) => {
      let score = 0;
      const shared: [string, number][] = [];
      for (const [w, x] of q) {
        const y = docVectors[i].get(w);
        if (y) {
          score += x * y;
          shared.push([w, x * y]);
        }
      }
      // Rounded so server and browser agree exactly; ties keep the project order.
      return { slug: d.slug, title: d.title, score: Math.round(score * 1e4) / 1e4, order: i, terms: shared.sort((a, b) => b[1] - a[1]).slice(0, 5).map(([w]) => w) };
    })
    .sort((a, b) => b.score - a.score || a.order - b.order);

  const set = new Set(tokens);
  const seen = new Set<string>();
  const have = HAVE.filter((s) => set.has(s.token));
  const missing = NOT_YET.filter((s) => set.has(s.token) && !seen.has(s.label) && seen.add(s.label)).map((s) => s.label);
  const total = have.length + missing.length;

  const ml = have.filter((s) => s.group === "ml").length;
  const web = have.filter((s) => s.group === "web").length;
  const resume: ResumeType = web > ml ? "fullstack" : "aiml";
  const resumeReason =
    ml === web
      ? "This asks for both, so start with the AI/ML version."
      : `${Math.max(ml, web)} of the skills asked for are on the ${resume === "aiml" ? "ML" : "web"} side.`;

  return {
    ranked,
    have: have.map((s) => ({ label: s.label, where: s.where })),
    missing,
    coverage: total ? Math.round((have.length / total) * 100) : null,
    resume,
    resumeReason,
    words: jd.trim() ? jd.trim().split(/\s+/).length : 0,
  };
}

export const SAMPLES = [
  {
    id: "ml",
    label: "ML engineer",
    text: "Machine Learning Engineer Intern. Build and evaluate ML models in Python using scikit-learn, pandas and NumPy. Compare models against baselines, track metrics such as MAE and RMSE, and write unit tests. Deploy models behind a REST API with FastAPI and Docker. Time series forecasting experience is a plus. Familiarity with PyTorch and AWS preferred.",
  },
  {
    id: "cv",
    label: "Computer vision",
    text: "Computer Vision Engineer. Develop object detection and image processing pipelines with OpenCV, YOLO and PyTorch. Evaluate detection quality on real images, integrate models into a production inference service, and build tools for reviewing results. Python required. C++ and ROS experience is a plus for robotics applications.",
  },
  {
    id: "llm",
    label: "NLP / LLM",
    text: "NLP Engineer. Work with large language models, embeddings and BERT for text classification and semantic search. Build prompt engineering workflows with validated structured output and fallbacks, and evaluate quality on labelled data. Python, LLM APIs and a working knowledge of RAG and LangChain.",
  },
  {
    id: "web",
    label: "Full-stack",
    text: "Full-Stack Developer. Build web applications with React, Next.js and TypeScript on the frontend and Node.js, Express or FastAPI on the backend. Design REST APIs, work with SQL databases such as PostgreSQL, handle authentication, and write automated tests with good Git habits. Docker experience and CI/CD a plus.",
  },
];

// ---- A tiny store so the Work section can follow the ranking ----
type Order = { slugs: string[]; label: string } | null;
let order: Order = null;
const listeners = new Set<() => void>();

export const fitStore = {
  get: () => order,
  server: () => null as Order,
  set(next: Order) {
    order = next;
    listeners.forEach((l) => l());
  },
  subscribe(l: () => void) {
    listeners.add(l);
    return () => listeners.delete(l);
  },
};
