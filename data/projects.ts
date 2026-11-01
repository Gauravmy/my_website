export type ProjectTag = "AI/ML" | "Full-Stack";

/** A real screenshot. Files live in /public/projects/<slug>/. */
export type Shot = { src: string; alt: string; caption: string; w: number; h: number };

export type Project = {
  slug: string;
  title: string;
  subtitle: string;
  /** One sentence on the problem. */
  problem: string;
  tags: ProjectTag[];
  stack: string[];
  /** What goes on the home page. */
  bullets: string[];
  github: string;
  /** Leave undefined when there is no working public deployment. */
  live?: string;
  liveLabel?: string;
  /** Headline numbers. Only measured facts. */
  results: { value: string; label: string }[];
  note?: string;
  shots?: Shot[];
  /** Project with no UI to screenshot: a real excerpt from the repository. */
  code?: { file: string; lang: string; source: string };
  /** A figure drawn from real output instead of a screenshot. */
  figure?: "screener";
  /** Case-study page. */
  built: string[];
  decisions?: { title: string; body: string }[];
  table?: { caption: string; head: string[]; rows: string[][] };
  limits?: string[];
};

const shot = (slug: string, n: number, alt: string, caption: string): Shot => ({
  src: `/projects/${slug}/${n}.webp`,
  alt,
  caption,
  w: 1800,
  h: 1125,
});

export const projects: Project[] = [
  {
    slug: "stockwise",
    title: "StockWise AI",
    subtitle: "Demand forecasting and reorder recommendations",
    problem: "Reorder decisions need a forecast you can trust, and a more complex model isn't automatically a better one.",
    tags: ["AI/ML", "Full-Stack"],
    stack: ["FastAPI", "Next.js", "TypeScript", "scikit-learn", "SQLAlchemy", "Alembic", "SQLite"],
    bullets: [
      "Compares a moving-average baseline with seasonal-naive and random-forest models on the same chronological holdout, and picks per product.",
      "CSV validation pipeline, safety-stock and reorder-point logic, and a five-page dashboard.",
    ],
    github: "https://github.com/Gauravmy/stockwise-ai-",
    results: [
      { value: "6.57 → 4.13", label: "MAE on SKU-1001" },
      { value: "3 of 7", label: "products where the baseline won" },
      { value: "94 + 11", label: "backend + frontend tests" },
    ],
    note: "All results are on the repo's synthetic sample dataset.",
    shots: [
      shot("stockwise", 2, "StockWise forecasting page for SKU-1001 showing holdout MAE 4.13 against 6.57", "Forecasting: random forest vs baseline on the holdout"),
      shot("stockwise", 1, "StockWise overview dashboard with KPIs, a demand chart and stockout risk", "Overview: KPIs, history and forecast, stockout risk"),
      shot("stockwise", 4, "StockWise inventory table with reorder points and risk levels", "Inventory: reorder points and risk"),
      shot("stockwise", 3, "StockWise insights page with monthly demand by category", "Insights: demand by category and trends"),
      shot("stockwise", 5, "StockWise data management page", "Data management: validated, versioned datasets"),
    ],
    built: [
      "CSV upload with a dry-run validation report: required columns and header aliases, ISO dates only, future dates rejected, finite non-negative quantities, exact duplicates, same-day aggregation, missing calendar dates. Rejected rows are listed by line number with a reason.",
      "Versioned datasets: every committed upload is immutable and becomes active, and earlier versions can be reactivated.",
      "A 28-day moving-average baseline, weekly seasonal-naive and a random forest on lag features, all evaluated on the same chronological holdout. Lowest MAE wins, per product.",
      "Inventory logic per product: lead time, safety stock, MOQ, pack size, reorder point, order quantity, days until stockout, risk level, and a plain-language explanation of each recommendation.",
      "Versioned REST API with Alembic migrations, a typed API client and a five-page Next.js dashboard.",
    ],
    decisions: [
      {
        title: "Keep the baseline in the race",
        body: "The moving average wins on 3 of the 7 evaluated products, so the system ships it for those. Choosing random forest everywhere would have looked smarter and been worse.",
      },
      {
        title: "Refuse to guess",
        body: "Fewer than 14 days of history and the forecast is refused. Between 14 and 55 days you get a low-confidence fallback with no metrics, rather than numbers that look more certain than they are.",
      },
      {
        title: "Flag small wins as small",
        body: "On SKU-1003 random forest wins by under 1%. The app selects it but says the gain is small.",
      },
    ],
    table: {
      caption: "Holdout 2025-06-03 to 2025-06-30, MAE / RMSE in units per day, synthetic sample data",
      head: ["Product", "Moving average", "Seasonal naive", "Random forest", "Selected"],
      rows: [
        ["SKU-1001", "6.57 / 8.62", "6.00 / 6.92", "4.13 / 5.08", "Random forest"],
        ["SKU-1002", "4.62 / 5.88", "5.43 / 6.57", "5.01 / 6.64", "Moving average"],
        ["SKU-1003", "3.43 / 4.39", "3.68 / 4.52", "3.41 / 4.43", "Random forest (gain under 1%)"],
        ["SKU-1004", "0.49 / 0.67", "0.82 / 1.09", "0.55 / 0.69", "Moving average"],
        ["SKU-1005", "2.43 / 2.85", "3.43 / 4.10", "2.54 / 3.19", "Moving average"],
        ["SKU-1006", "10.43 / 12.32", "6.64 / 8.84", "3.90 / 5.22", "Random forest"],
        ["SKU-1007", "2.63 / 3.94", "2.18 / 3.63", "2.55 / 3.92", "Seasonal naive"],
      ],
    },
    limits: [
      "Point forecasts only. No prediction intervals, so safety stock is heuristic rather than service-level based.",
      "A single holdout window decides model selection. Rolling-origin backtesting would be more robust.",
      "Missing dates are assumed to be zero sales. Stockouts, promotions, prices and holidays aren't modelled.",
      "No authentication; it runs on SQLite.",
    ],
  },
  {
    slug: "visioninspect",
    title: "VisionInspect Pro",
    subtitle: "Explainable visual quality inspection",
    problem: "A pass/fail from a vision model is useless on a factory line unless you can see the evidence and the rule behind it.",
    tags: ["AI/ML", "Full-Stack"],
    stack: ["YOLOE (Ultralytics)", "OpenCV", "FastAPI", "Next.js", "TypeScript", "SQLite", "Docker"],
    bullets: [
      "Runs OpenCV image-quality checks and a YOLO detector, then returns PASS, REJECT or REVIEW with the evidence and the rule that produced it.",
      "Upload a photo or point a camera at the item for a live check on every frame. Results are stored, searchable and exportable.",
    ],
    github: "https://github.com/Gauravmy/visionpro",
    results: [
      { value: "20 / 24", label: "labelled photos decided correctly" },
      { value: "15", label: "reference photos, no training run" },
      { value: "3", label: "product profiles ready to use" },
    ],
    note: "Screenshots are real detector output on the repo's reference photos. In the README I call it a starting point, not a validated inspection system.",
    shots: [
      shot("visioninspect", 1, "VisionInspect rejecting a highlighter under the Bottle profile, with the detection box and rule shown", "REJECT: a marker under the Bottle profile, rule cited"),
      shot("visioninspect", 2, "VisionInspect dashboard with inspection counts and model status", "Dashboard: yield, decisions, model health"),
      shot("visioninspect", 3, "VisionInspect passing a phone charger with a detection box", "PASS: charger found at 0.85"),
      shot("visioninspect", 4, "VisionInspect marking a burnt charger out of range with several detection boxes", "Out of range: burnt charger internals"),
      shot("visioninspect", 5, "VisionInspect inspection history table", "History: searchable, exportable records"),
    ],
    built: [
      "A Next.js 15 app in front of a FastAPI inference service. The browser only ever talks to the Next.js server.",
      "OpenCV quality checks before detection: focus by variance of the Laplacian, exposure, clipped highlights and resolution.",
      "An Ultralytics YOLOE-11l detector prompted with text and with boxes on 15 reference photos, with no training run.",
      "A decision engine in TypeScript with precedence REJECT > REVIEW > PASS. The service returns raw measurements, thresholds live in the product profile, and every decision cites the rule behind it.",
      "Each record stores a snapshot of the profile it was inspected with, so later edits don't rewrite history. CSV and JSON export, printable reports, analytics.",
    ],
    decisions: [
      {
        title: "No simulated detector",
        body: "Without weights the detector reports itself as unavailable and draws no boxes. The app never fakes a result to look finished.",
      },
      {
        title: "Say what the scores aren't",
        body: "Detector scores are shown as raw model confidences, labelled as not calibrated probabilities. The analytics page warns that a high pass rate doesn't prove the model is accurate.",
      },
      {
        title: "Leave out what didn't work",
        body: "An anomaly autoencoder reported an AUROC of 0.4791 on pooled MVTec AD test images, which means no useful discrimination. It stays out of the decisions.",
      },
    ],
    limits: [
      "Thresholds are starting values, not calibrated on a real line.",
      "20 of 24 is a small, partly self-collected test set. It's a sanity check, not a validation.",
      "No authentication or multi-user access control; Raspberry Pi deployment isn't validated.",
    ],
  },
  {
    slug: "bookleaf",
    title: "BookLeaf",
    subtitle: "AI-assisted author support portal",
    problem: "Support tickets need triage. An LLM can sort them, but only if its output is validated and something sensible happens when it fails.",
    tags: ["AI/ML", "Full-Stack"],
    stack: ["React", "Express", "TypeScript", "SQLite", "Claude API", "zod", "SSE", "OpenAPI"],
    bullets: [
      "LLM triage and grounded reply drafts with schema-validated output, timeouts and a rule-based fallback. Nothing reaches an author until an admin confirms it.",
      "Two portals, a ticket queue with overdue rules, live updates over SSE, role-based auth with scrypt and httpOnly sessions.",
    ],
    github: "https://github.com/Gauravmy/bookLeaf",
    live: "https://bookleaf-vz6m.onrender.com/login",
    liveLabel: "Live app (login)",
    results: [
      { value: "96% / 70%", label: "rule baseline: category / priority, 27 tickets" },
      { value: "55", label: "automated tests" },
      { value: "2", label: "portals: author and admin" },
    ],
    note: "Hosted on Render's free tier, so the first load can take about 30 seconds. Screenshots use the repo's seeded demo data; email me for a demo login.",
    shots: [
      shot("bookleaf", 1, "BookLeaf admin ticket queue with metrics, filters and prioritised tickets", "Admin: ticket queue, sorted by urgency"),
      shot("bookleaf", 2, "BookLeaf author dashboard with books, copies sold and royalties", "Author: dashboard with royalties and tickets"),
      shot("bookleaf", 3, "BookLeaf author books page with sales and royalty details", "Author: books, sales and payouts"),
    ],
    built: [
      "An author portal: sign in, see books and royalties, raise tickets with attachments, follow replies live.",
      "An admin portal: shared queue with filters, search, urgency sorting and overdue rules, internal notes, assignment and an activity log.",
      "Triage in the background, so a slow or failing provider never delays or blocks ticket creation. Category and priority run as separate prompts.",
      "Reply drafts grounded in a knowledge base and the author's verified book data, with a check-before-sending list.",
      "Security basics done properly: scrypt-hashed passwords, httpOnly sessions, CSRF origin checks, rate limiting. An OpenAPI 3.1 spec documents the API.",
    ],
    decisions: [
      {
        title: "Validate the model's output like user input",
        body: "LLM responses go through the same zod schemas as everything else. If they fail, a labelled rule-based fallback takes over.",
      },
      {
        title: "Humans send the replies",
        body: "A draft is generated when the ticket opens, but sending takes an explicit confirmation from an admin.",
      },
      {
        title: "Report what was measured",
        body: "The rule baseline scored 96% on category and 70% on priority over 27 labelled tickets. I wrote both the rules and most of the labels, so the category number is optimistic. The LLM pass hasn't been measured yet, and I don't claim a number for it.",
      },
    ],
    limits: [
      "LLM accuracy unmeasured. Next: run the eval with a key and grow the labelled set from real tickets.",
      "SQLite, single instance. Next: PostgreSQL, then Redis or LISTEN/NOTIFY for the SSE bus.",
      "Background triage runs in-process. A server stop mid-call leaves a ticket pending until re-run.",
    ],
  },
  {
    slug: "resume-screener",
    title: "Resume Screener",
    subtitle: "Ranking candidates against a job description",
    problem: "Keyword filters miss good candidates. Ranking should compare scorers instead of trusting one.",
    tags: ["AI/ML"],
    stack: ["Python", "scikit-learn", "BERT", "Streamlit", "pandas"],
    bullets: [
      "Ranks resumes against a job description with TF-IDF, BERT, hybrid and ensemble scorers, plus skill-match percentages.",
      "PDF/DOCX/TXT upload and CSV/Excel export. The Fit Check on this site runs the TF-IDF idea in your browser.",
    ],
    github: "https://github.com/Gauravmy/NLPfinal",
    results: [
      { value: "50 / 60", label: "top-10 slots in the right category (TF-IDF)" },
      { value: "2,484", label: "resumes across 24 categories" },
      { value: "4", label: "scorers to compare" },
    ],
    note: "NLP internship project at Ganpat University (WSRIP). The figure comes from running the repo's TF-IDF scorer while building this site.",
    figure: "screener",
    built: [
      "Four scorers behind one interface: TF-IDF for speed, BERT (all-MiniLM-L6-v2) for meaning, a hybrid, and an ensemble.",
      "A final score of 70% similarity and 30% skill match, with skill extraction across a technical-skills list.",
      "PDF, DOCX and TXT parsing, CSV and Excel export, and evaluation helpers for Precision@K, Recall@K and MAP.",
    ],
    decisions: [
      {
        title: "Test it on something checkable",
        body: "The resumes are filed under 24 job categories. So a simple test: write a job description for a category, and count how many of the top 10 resumes really belong to it.",
      },
    ],
    limits: [
      "The figure uses six job descriptions I wrote for this test. It shows the TF-IDF scorer alone.",
      "Category labels are a proxy for fit. A real recruiter's judgement isn't in this dataset.",
    ],
  },
  {
    slug: "grace",
    title: "Grace",
    subtitle: "Gesture and voice healthcare assistant",
    problem: "Medical documentation is slow and touch-based. Could doctors do it hands-free, by voice and gesture?",
    tags: ["AI/ML"],
    stack: ["Python", "OpenCV", "MediaPipe", "Streamlit"],
    bullets: [
      "Hackathon project for hands-free medical documentation using speech-to-text and gesture control.",
      "Patient-record analysis scripts over hospital data.",
    ],
    github: "https://github.com/Gauravmy/Grace",
    live: "https://v0-grace-clrf5dhnktt.vercel.app/",
    liveLabel: "Project site",
    results: [{ value: "4", label: "person team; I'm listed as Full Stack Developer" }],
    shots: [
      shot("grace", 1, "Grace project landing page", "Project site"),
      shot("grace", 2, "Grace solution section listing gesture, voice and real-time features", "The solution: gesture, voice, real-time"),
      shot("grace", 3, "Grace market research chart", "Market research section"),
    ],
    built: [
      "A project site presenting the idea, the problem and the market research, with an in-browser gesture canvas.",
      "Patient-record analysis scripts over a hospital dataset, in Python.",
    ],
    limits: ["A hackathon prototype, not a clinical system."],
  },
  {
    slug: "biopay",
    title: "BioPay Connect",
    subtitle: "Palm-vein payment prototype (simulated)",
    problem: "What would checkout feel like if your palm was the card? A prototype of that flow, with simulated biometrics.",
    tags: ["Full-Stack"],
    stack: ["React", "TypeScript", "Vite", "Tailwind", "shadcn/ui", "three.js"],
    bullets: [
      "Responsive wallet app with split vendor and user panels, a scan animation, a dashboard and transaction history.",
      "Biometrics, transactions and figures are simulated. No real payments or biometric data involved.",
    ],
    github: "https://github.com/Gauravmy/bio-pay-connect",
    live: "https://bio-pay-connect.vercel.app",
    liveLabel: "Live demo",
    results: [{ value: "Simulated", label: "all biometrics and transactions" }],
    shots: [
      shot("biopay", 1, "BioPay simulated live transaction monitor", "Simulated transaction monitor"),
      shot("biopay", 2, "BioPay landing page", "Landing page"),
    ],
    built: ["Split vendor and user panels, scan animation, dashboard and transaction history, deployed on Vercel."],
    limits: ["A front-end prototype. Everything shown, including the numbers, is simulated."],
  },
  {
    slug: "agrimarket",
    title: "AgriMarket",
    subtitle: "Farmer marketplace (hackathon)",
    problem: "Farmers lose margin to middlemen. A direct marketplace connects them with buyers.",
    tags: ["Full-Stack"],
    stack: ["React", "React Router", "Framer Motion"],
    bullets: ["Marketplace prototype connecting farmers and buyers, with separate portals for each.", "Built during a hackathon, with demo data."],
    github: "https://github.com/Gauravmy/AgriMarket",
    results: [{ value: "2", label: "portals: farmer and buyer" }],
    note: "Screenshots are from running the repo locally. The hosted demo is currently offline.",
    shots: [
      shot("agrimarket", 1, "AgriMarket buyer marketplace listing fresh produce from farmers", "Buyer marketplace"),
      shot("agrimarket", 2, "AgriMarket farmer product management form", "Farmer: add a product"),
      shot("agrimarket", 3, "AgriMarket home page", "Home"),
    ],
    built: ["Farmer and buyer portals in React with product listings, a product form, orders, news and a contact page. Demo data."],
    limits: ["A hackathon prototype with demo data and no backend."],
  },
  {
    slug: "logistics",
    title: "AI Demand Forecasting",
    subtitle: "Forecasting service for logistics (early project)",
    problem: "An early attempt at the idea StockWise later did properly: predict product demand from historical data.",
    tags: ["AI/ML"],
    stack: ["Flask", "scikit-learn", "Docker"],
    bullets: ["Random Forest regressor served through a Flask endpoint.", "Dockerised, with preprocessing, training and forecasting scripts."],
    github: "https://github.com/Gauravmy/AI-Demand-Forecasting-Logistics",
    results: [],
    code: {
      file: "1. Backend Code",
      lang: "python",
      source: `model = pickle.load(open('../models/demand_forecast_model.pkl', 'rb'))
scaler = pickle.load(open('../models/scaler.pkl', 'rb'))

app = Flask(__name__)

@app.route('/forecast', methods=['POST'])
def forecast():
    data = request.form
    features = pd.DataFrame([data]).astype(float)
    scaled_features = scaler.transform(features)
    prediction = model.predict(scaled_features)[0]
    return render_template('forecast.html', prediction=prediction)`,
    },
    built: ["Preprocessing, training and forecasting scripts plus a small Flask service, packaged with Docker."],
    limits: ["The repo holds scripts rather than a running app, so the code is what there is to show."],
  },
];

export const getProject = (slug: string) => projects.find((p) => p.slug === slug);
