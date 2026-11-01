// Skills against the work they were used in. A filled cell means it's in that project's code or stated stack.
export const matrixColumns = [
  { key: "stockwise", label: "StockWise" },
  { key: "visioninspect", label: "VisionInspect" },
  { key: "bookleaf", label: "BookLeaf" },
  { key: "resume-screener", label: "Resume Screener" },
  { key: "grace", label: "Grace" },
  { key: "biopay", label: "BioPay" },
  { key: "agrimarket", label: "AgriMarket" },
  { key: "logistics", label: "Forecasting" },
  { key: "internships", label: "Internships" },
] as const;

export type ColumnKey = (typeof matrixColumns)[number]["key"];

export type SkillGroup = { label: string; skills: { name: string; used: ColumnKey[] }[] };

export const skillGroups: SkillGroup[] = [
  {
    label: "AI / ML",
    skills: [
      { name: "scikit-learn", used: ["stockwise", "resume-screener", "logistics"] },
      { name: "pandas", used: ["stockwise", "resume-screener", "logistics"] },
      { name: "NumPy", used: ["stockwise", "visioninspect", "resume-screener"] },
      { name: "OpenCV", used: ["visioninspect", "grace", "internships"] },
      { name: "MediaPipe", used: ["grace", "internships"] },
      { name: "YOLO", used: ["visioninspect"] },
      { name: "BERT", used: ["resume-screener", "internships"] },
      { name: "TF-IDF", used: ["resume-screener", "internships"] },
      { name: "LLM APIs", used: ["bookleaf"] },
      { name: "PyTorch", used: ["visioninspect"] },
      { name: "TensorFlow", used: [] },
    ],
  },
  {
    label: "Web / Backend",
    skills: [
      { name: "React", used: ["stockwise", "visioninspect", "bookleaf", "biopay", "agrimarket"] },
      { name: "Next.js", used: ["stockwise", "visioninspect"] },
      { name: "TypeScript", used: ["stockwise", "visioninspect", "bookleaf", "biopay"] },
      { name: "Node.js", used: ["bookleaf", "visioninspect"] },
      { name: "Express", used: ["bookleaf"] },
      { name: "FastAPI", used: ["stockwise", "visioninspect"] },
      { name: "Flask", used: ["logistics"] },
      { name: "REST / OpenAPI", used: ["stockwise", "visioninspect", "bookleaf"] },
      { name: "SSE", used: ["bookleaf"] },
      { name: "SQLite", used: ["stockwise", "visioninspect", "bookleaf"] },
      { name: "Docker", used: ["visioninspect", "logistics"] },
      { name: "Vitest", used: ["stockwise", "visioninspect", "bookleaf"] },
      { name: "pytest", used: ["stockwise", "visioninspect"] },
      { name: "Git", used: ["stockwise", "visioninspect", "bookleaf", "resume-screener", "grace", "biopay", "agrimarket", "logistics"] },
    ],
  },
  {
    label: "Languages",
    skills: [
      { name: "Python", used: ["stockwise", "visioninspect", "resume-screener", "grace", "logistics", "internships"] },
      { name: "TypeScript", used: ["stockwise", "visioninspect", "bookleaf", "biopay"] },
      { name: "JavaScript", used: ["agrimarket"] },
      { name: "SQL", used: ["stockwise", "visioninspect", "bookleaf"] },
      { name: "C++", used: [] },
      { name: "Java", used: [] },
    ],
  },
];
