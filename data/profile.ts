// Core identity. Edit freely; every component reads from here.
export const profile = {
  name: "Gaurav Dhakad",
  firstName: "Gaurav",
  lastName: "Dhakad",
  initials: "GD",
  title: "AI/ML Engineer & Full-Stack Developer",
  status: "Open to AI/ML and full-stack internships and roles",
  positioning:
    "AI/ML engineer who also ships full-stack products. I build ML systems that are checked against baselines and covered by tests, then deploy them as working apps.",
  heroLine: "I build ML systems, check them against a baseline, write the tests, and ship them as apps people can use.",
  about: [
    "I'm a final-year B.Tech CSE (AI & ML) student at Sanskriti University, Mathura. I like the unglamorous part of machine learning: finding out whether the model actually beat the simple thing, and saying so when it didn't.",
    "Since 2025 I've interned in computer vision, NLP and machine learning with Ethernet Robotics, Ganpat University, CCRAS (Govt. of India), Infosys Springboard and IIT Guwahati's Consulting & Analytics Club. I also co-founded AI Digitals & Unstoppable Coders, where I've mentored 300+ students across 15+ workshops, and I'm President of the Technical Club at my university.",
  ],
  education: {
    degree: "B.Tech CSE (AI & ML major)",
    school: "Sanskriti University, Mathura",
    period: "Aug 2023 – Jun 2027",
    cgpa: "8.50",
    year: "Final year",
  },
  email: "g4777636@gmail.com",
  phone: "+91-7668759906",
  phoneHref: "tel:+917668759906",
  location: "Mathura, India",
  siteUrl: "https://gaurav-dhakad-portfolio.vercel.app",
  resumes: {
    aiml: {
      label: "AI/ML resume",
      long: "Download AI/ML resume",
      href: "/Gaurav_Dhakad_Resume_AI-ML.pdf",
      hint: "For ML, computer-vision, NLP or data-science roles.",
    },
    fullstack: {
      label: "Full-stack resume",
      long: "Download Full-Stack resume",
      href: "/Gaurav_Dhakad_Resume_Full-Stack.pdf",
      hint: "For web, backend or product-engineering roles.",
    },
  },
} as const;

export type ResumeType = keyof typeof profile.resumes;

/** The results strip under the hero. Every number links to its evidence on this page. */
export const proof = [
  { value: "6.57 → 4.13", label: "forecast MAE vs baseline, sample data", href: "#work-stockwise" },
  { value: "20 / 24", label: "labelled photos decided correctly, VisionInspect", href: "#work-visioninspect" },
  { value: "89%", label: "accuracy, crime-risk fusion model", href: "#experience" },
  { value: "92%", label: "accuracy, real-time motion detection", href: "#experience" },
  { value: "1,103", label: "LeetCode problems solved", href: "#profiles" },
  { value: "7+", label: "national hackathon finals", href: "#experience" },
];
