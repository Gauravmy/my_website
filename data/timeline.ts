// Experience, newest first, grouped by the year it started.
export type TimelineItem = {
  year: string;
  role: string;
  org: string;
  period: string;
  details: string[];
  metric?: string;
  link?: { label: string; href: string };
};

export const timeline: TimelineItem[] = [
  {
    year: "2026",
    role: "Computer Vision Intern",
    org: "Ethernet Robotics",
    period: "Jul – Sep 2026",
    details: ["Testing and validating computer-vision modules for robotics applications."],
  },
  {
    year: "2026",
    role: "Machine Learning Intern",
    org: "Ganpat University, SSRIP",
    period: "May – Sep 2026",
    details: ["AI-Based Real-Time Crime and Safety Risk Prediction System: a hybrid fusion model on a Kaggle dataset."],
    metric: "89% accuracy",
  },
  {
    year: "2025",
    role: "NLP Intern",
    org: "Ganpat University, WSRIP",
    period: "Dec 2025 – Apr 2026",
    details: [
      "Resume-screening app that ranks candidates against a job description with TF-IDF, BERT, hybrid and ensemble scorers.",
      "Skill-match percentages, PDF/DOCX/TXT upload, CSV/Excel export.",
    ],
    link: { label: "Code", href: "https://github.com/Gauravmy/NLPfinal" },
  },
  {
    year: "2025",
    role: "IT Intern (Embedded AI)",
    org: "CCRAS, Govt. of India",
    period: "Jun – Jul 2025",
    details: ["Real-time motion and exercise detection with OpenCV and MediaPipe."],
    metric: "92% accuracy",
  },
  {
    year: "2025",
    role: "AI & Data Science Intern",
    org: "IIT Guwahati, Consulting & Analytics Club",
    period: "Jun – Jul 2025",
    details: ["6-week programme under IIT Guwahati faculty."],
  },
  {
    year: "2025",
    role: "AI/ML Virtual Intern",
    org: "Infosys Springboard",
    period: "2025",
    details: ["Deep learning, computer vision and NLP pipelines, with end-to-end deployment projects."],
  },
  {
    year: "2023",
    role: "Co-Founder & Lead Instructor",
    org: "AI Digitals & Unstoppable Coders",
    period: "2023 – present",
    details: ["Mentored 300+ students across 15+ workshops.", "President, Technical Club, Sanskriti University."],
    metric: "300+ students",
  },
  {
    year: "2023",
    role: "Hackathon finalist",
    org: "Flipkart GRiD, SIH 2025, Walmart Sparkathon",
    period: "2023 – present",
    details: ["Finalist in 7+ national events."],
    metric: "7+ finals",
  },
];
