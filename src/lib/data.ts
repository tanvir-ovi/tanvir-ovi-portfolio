export const profile = {
  name: "Tanvir Hossain Ovi",
  shortName: "Tanvir Ovi",
  role: "EEG & Brain-Computer Interface Researcher",
  location: "Chattogram, Bangladesh",
  email: "tanvirhossainovi.eee@std.cu.ac.bd",
  tagline:
    "I build deep learning systems that decode cognition, emotion, and identity from EEG. I also study how immersive environments change the way we think.",
  links: {
    linkedin: "https://www.linkedin.com/in/tanvir-hossain-ovi/",
    github: "https://github.com/tanvir-ovi",
    scholar: "https://scholar.google.com/citations?user=n8SuOHUAAAAJ&hl=en",
  },
  cvPath: "/docs/Tanvir_Hossain_Ovi_CV.pdf",
};

export const stats = [
  { label: "Publications", value: "8" },
  { label: "Published Journal Papers", value: "3" },
  { label: "IELTS Academic", value: "7.5" },
  { label: "BSc CGPA", value: "3.78/4.0" },
];

export const focusAreas = [
  {
    title: "Cognitive Load & Immersive Environments",
    description:
      "I compare 360° VR and 2D laptop viewing to see how immersion changes mental workload. Theta-alpha ratio and engagement index do most of the talking.",
  },
  {
    title: "EEG Biometrics & Security",
    description:
      "Different EEG frequency bands carry different kinds of information. Some are good at reading what a person is doing, others are better at recognizing who they are. I'm trying to find exactly where that split happens.",
  },
  {
    title: "Emotion Recognition & Personalization",
    description:
      "EEG-based emotion recognition tends to fall apart when you test it days or weeks later. I build phenotype-aware models that adapt to each person's neural patterns instead of correcting everyone the same way.",
  },
  {
    title: "Imagined Speech & Accessibility",
    description:
      "Decoding imagined English and Bangla speech from EEG, aimed at assistive communication tools for people with limited motor control.",
  },
];

export type PubStatus = "Published" | "Accepted" | "Under Review" | "Submitted";

export interface Publication {
  id: string;
  title: string;
  authors: string;
  venue: string;
  year: string;
  status: PubStatus;
  firstAuthor: boolean;
  abstract?: string;
  featured?: boolean;
}

export const publications: Publication[] = [
  {
    id: "frequency-band-dissociation",
    title:
      "Frequency Band Dissociation Between Cognitive State Recognition and Person Identification in EEG",
    authors:
      "T. H. Ovi, M. M. Islam, M. A. Uddin, K. Ghazinour, A. M. M. Chowdhury, N. Siddique",
    venue: "Machine Learning with Applications",
    year: "2026",
    status: "Published",
    firstAuthor: true,
    featured: true,
    abstract:
      "A three-stage, three-week EEG study asking whether the same brain rhythms can classify mental states and identify individuals at the same time. Delta-band oscillations reached 86.9% accuracy on task classification but only 15.6 to 23.6% on person identification. Broadband signals reversed that pattern, hitting 69.9% authentication accuracy across sessions a week apart. Two-way ANOVA confirmed the split was structured rather than noise. Shared cognitive processes ride on slow cortical rhythms. Stable individual signatures live in the broader frequency bands instead.",
  },
  {
    id: "phenotype-aware-personalization",
    title: "Phenotype-Aware Personalization for Cross-Session EEG-Based Emotion Recognition",
    authors: "T. H. Ovi, T. Forsythe, A. M. M. Chowdhury, N. Siddique, Y. Li",
    venue: "Pattern Recognition",
    year: "2026",
    status: "Under Review",
    firstAuthor: true,
    featured: true,
    abstract:
      "EEG emotion recognition degrades sharply across sessions days or weeks apart. This work asks whether that decline is random or structured. Using the SEED-IV dataset, variance decomposition showed the subject by emotion interaction explained 80.1% of performance variance, and each person showed a consistent emotion-specific fingerprint across sessions. Baseline patterns predicted how much someone would benefit from personalization, with an R² of 0.951. Phenotype-aware fine-tuning reached 91.92% accuracy against 39.96% for uniform correction.",
  },
  {
    id: "envisioned-english-speech",
    title: "Classification of Envisioned English Speech from EEG using Deep Learning Approaches",
    authors: "A. Hossain, T. H. Ovi, M. A. I. Mahmood, M. F. Kader",
    venue: "Machine Learning with Applications, vol. 22, p. 100752",
    year: "2025",
    status: "Published",
    firstAuthor: false,
    featured: true,
    abstract:
      "EEG signals from 20 participants imagining 26 English letters and 10 digits were used to train 1D CNN, BiLSTM, and hybrid CNN-BiLSTM models across five frequency bands. BiLSTM performed best, reaching 85.65% accuracy on digits within the delta band and 83.65% on letters within the alpha band. It is a step toward assistive communication for people with motor neuron disorders.",
  },
  {
    id: "mobile-phone-brain-activity",
    title: "Impact of Mobile Phone Use on the Brain Activity: Audio Call vs Video Call",
    authors: "M. A. Z. Akas, T. H. Ovi, M. F. Kader",
    venue: "Acta Psychologica, vol. 262, p. 106160",
    year: "2026",
    status: "Published",
    firstAuthor: false,
    abstract:
      "EEG from 28 participants during WhatsApp audio and video calls shows video calls impose significantly higher cognitive load and mental fatigue than audio calls, growing with call duration. Theta-alpha ratio and Mahalanobis-distance fatigue analysis combined with ML classification (ROC-AUC > 0.90) gave convergent evidence that communication modality matters for real-world workload assessment.",
  },
  {
    id: "iot-intrusion-detection",
    title: "AI-Driven Clustering and Multistage Intrusion Detection for APT Mitigation in IoT Networks",
    authors: "T. H. Ovi, A. M. M. Chowdhury, K. Ghazinour, M. Simsek",
    venue: "9th International Balkan Conference on Communications and Networking (BalkanCom)",
    year: "2026",
    status: "Accepted",
    firstAuthor: true,
  },
  {
    id: "cognitive-load-vr-laptop",
    title:
      "EEG-Based Cognitive Load Analysis in Immersive Virtual Reality and Laptop-Based Video Learning Environments",
    authors: "T. H. Ovi, T. F. Arin, M. A. I. Mahmood, M. F. Kader",
    venue: "Applied Cognitive Psychology",
    year: "2026",
    status: "Submitted",
    firstAuthor: true,
    featured: true,
    abstract:
      "My undergraduate thesis. Thirty participants watched the same video either on a 2D laptop or in 360° VR through a Meta Quest 3, all wearing a 14-channel Emotiv EPOC X. Theta-alpha ratio was higher on the laptop (0.93) than in VR (0.73), while engagement index and beta-alpha ratio were both higher in VR. That pattern suggests immersive environments lower cognitive load while keeping people more engaged. A KNN classifier combining all three indices reached 83.5% accuracy.",
  },
  {
    id: "bangla-imagined-speech",
    title: "Bangla Imagined Speech Using EEG to Understand Emotional Words",
    authors: "T. F. Arin, T. H. Ovi, M. F. Kader",
    venue: "Computer Speech & Language",
    year: "2026",
    status: "Submitted",
    firstAuthor: false,
    abstract:
      "A new EEG dataset of 10 Bangla words across 5 emotional conditions (love, surprise, anger, sadness, fear) from 17 participants, the first of its kind for imagined Bangla speech. A 1D-CNN trained on Welch power-spectral-density features across theta, alpha, beta, and gamma bands reached 95.40% and 92.25% accuracy across two trials, showing clear neural signatures of emotionally driven imagined speech.",
  },
  {
    id: "bangla-word-level-speech",
    title:
      "Heterogeneous Deep Learning Approaches for EEG-Based Imagined Bangla Word-Level Speech Recognition",
    authors: "A. Hossain, M. A. Z. Akas, T. H. Ovi, M. F. Kader",
    venue: "Computer Speech & Language",
    year: "2026",
    status: "Submitted",
    firstAuthor: false,
  },
];

export interface ResearchExperience {
  id: string;
  title: string;
  period: string;
  bullets: string[];
}

export const researchExperience: ResearchExperience[] = [
  {
    id: "phenotype-personalization",
    title: "Phenotype-Aware Personalization for Cross-Session EEG Emotion Recognition",
    period: "2025 to 2026",
    bullets: [
      "Investigated cross-session performance degradation in EEG-based emotion recognition by analyzing the SEED-IV dataset across three weekly recording sessions per participant.",
      "Implemented variance decomposition and two-way ANOVA to partition performance variance, examining whether cross-session variability reflects structured individual differences rather than random noise.",
      "Conducted brain-behavior correlation analysis and hierarchical clustering to identify distinct user phenotypes affecting cross-session model generalization.",
      "Developed and evaluated personalized fine-tuning strategies, demonstrating the efficacy of phenotype-aware domain adaptation over uniform correction methods for cross-session reliability.",
    ],
  },
  {
    id: "frequency-band-biometrics",
    title: "EEG-Based Frequency Band Analysis for Cognitive State and Biometric Applications",
    period: "2025",
    bullets: [
      "Independently analyzed a publicly available EEG dataset of 20 participants across three weekly recording sessions to investigate frequency band dissociation between task classification and person authentication.",
      "Implemented a complete preprocessing pipeline with ICA artifact removal and computed cognitive engagement metrics including Theta-to-Alpha Ratio and Engagement Index.",
      "Developed and evaluated EEGNet with Squeeze-and-Excitation blocks, Channel Mixing variants, and EEGPT architectures for cognitive state classification across seven frequency bands.",
      "Conducted cross-session subject authentication experiments, discovering that delta oscillations achieved 86.9% task classification accuracy but only 15.6 to 23.6% authentication accuracy, while broadband signals reached 69.9% authentication performance.",
    ],
  },
  {
    id: "cognitive-load-vr",
    title: "Cognitive Load Analysis in Virtual Reality and Traditional Display Environments",
    period: "2024 to 2025",
    bullets: [
      "Designed an experimental protocol comparing cognitive load during 360° VR immersive viewing versus 2D laptop display with 30 participants using a 14-channel Emotiv EPOC X.",
      "Developed a preprocessing pipeline incorporating bandpass filtering, ICA artifact rejection, and signal normalization, then extracted Theta-Alpha Ratio, Engagement Index, and Beta-Alpha Ratio.",
      "Performed statistical validation using MANOVA and ANOVA with FDR correction and built classification models with SVM, Random Forest, and kNN using five-fold cross validation.",
      "Demonstrated that VR environments reduced cognitive load by 21% while increasing engagement by 59%, achieving 83.5% classification accuracy with TAR identified as the optimal marker.",
    ],
  },
];

export const education = {
  institution: "University of Chittagong, Bangladesh",
  degree: "BSc in Electrical and Electronic Engineering",
  period: "Jan 2020 to Nov 2025",
  cgpa: "3.78 / 4.00",
  merit: "2nd out of 63 students",
  thesis: "EEG-based cognitive load analysis in 360° virtual reality and 2D laptop video modes",
};

export const standardisedTests = [
  {
    name: "IELTS Academic",
    date: "14 April 2026",
    overall: "7.5",
    breakdown: [
      { label: "Listening", score: "8.0" },
      { label: "Reading", score: "8.0" },
      { label: "Writing", score: "6.0" },
      { label: "Speaking", score: "7.0" },
    ],
  },
];

export const honors = [
  {
    title: "First Runner-up, Student Merit Award",
    venue: "EEE Fest, University of Chittagong",
    date: "Feb 2025",
  },
  {
    title: "Champion, Robo Soccer Competition",
    venue: "EEE Fest, University of Chittagong",
    date: "Jan 2023",
  },
  {
    title: "Second Runner-up, Robo Soccer Competition",
    venue: "Engineering Day, University of Chittagong",
    date: "Jun 2022",
  },
  {
    title: "Industrial Training Certificate (14-day program)",
    venue: "General Electric Manufacturing Company Limited",
    date: "Jul 2025",
  },
];

export const skills = [
  {
    category: "Programming & Frameworks",
    items: ["Python", "TensorFlow", "Keras", "PyTorch", "Scikit-learn"],
  },
  {
    category: "Signal Processing",
    items: ["MNE-Python", "EEGLAB", "EEG preprocessing", "Feature extraction"],
  },
  {
    category: "Statistical Analysis",
    items: ["t-test", "Wilcoxon", "ANOVA", "MANOVA", "Data modeling"],
  },
  {
    category: "Computer Vision",
    items: ["MediaPipe", "OpenCV", "ROI extraction", "NFIQ2"],
  },
  {
    category: "Data Visualization",
    items: ["Matplotlib", "Seaborn", "Tableau"],
  },
  {
    category: "Tools & Platforms",
    items: ["LaTeX", "Google Colab", "Git", "Linux"],
  },
  {
    category: "Simulation",
    items: ["Advanced Design System (ADS)", "RSoft", "PSpice"],
  },
];

export const referees = [
  {
    name: "Dr. Nazmul Siddique",
    title: "Senior Lecturer, School of Computing, Engineering and Intelligent Systems",
    institution: "Ulster University, Londonderry",
    relation: "Research Advisor",
    email: "nh.siddique@ulster.ac.uk",
  },
  {
    name: "Dr. A M Mahmud Chowdhury",
    title: "Assistant Professor, Department of Cybersecurity",
    institution: "State University of New York, Canton",
    relation: "Research Advisor",
    email: "Chowdhuryam@canton.edu",
  },
];

export const navLinks = [
  { href: "/", label: "Home" },
  { href: "/research", label: "Research" },
  { href: "/experience", label: "Experience" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];
