export interface ElectionStep {
  id: number;
  title: string;
  description: string;
  who: string;
  icon: string;
}

export interface ChecklistItem {
  id: number;
  task: string;
  description: string;
  action: string;
  link?: string;
}

export interface QuizQuestion {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

export interface Candidate {
  id: number;
  name: string;
  symbol: string;
  focus: string;
}

export const electionData = {
  country: "India",
  system: "First-Past-The-Post (Parliamentary)",
  overview: "India follows a Parliamentary system where the country is divided into 543 constituencies. The Election Commission of India (ECI), an autonomous constitutional authority, ensures elections are 'free and fair.'",
  steps: [
    {
      id: 1,
      title: "Delimitation and Voter Registration",
      description: "Constituency boundaries are fixed. The 'Electoral Roll' (voter list) is updated annually to include new voters (aged 18+) and remove deceased ones.",
      who: "Delimitation Commission, ECI, and Booth Level Officers (BLOs).",
      icon: "UserPlus"
    },
    {
      id: 2,
      title: "Announcement and MCC",
      description: "The ECI announces the dates. Immediately, the Model Code of Conduct (MCC) comes into force, preventing the ruling government from using state resources for campaigning.",
      who: "Election Commission of India.",
      icon: "Megaphone"
    },
    {
      id: 3,
      title: "Nomination of Candidates",
      description: "Candidates file nomination papers and affidavits. These are scrutinized and candidates have a window to withdraw.",
      who: "Candidates and the Returning Officer (RO).",
      icon: "FileText"
    },
    {
      id: 4,
      title: "Campaigning Phase",
      description: "Political parties and candidates reach out to voters through rallies and media. Campaigning stops 48 hours before polling begins.",
      who: "Candidates, parties, and the ECI monitoring expenses.",
      icon: "Users"
    },
    {
      id: 5,
      title: "Polling Day",
      description: "Voters go to booths to cast votes using Electronic Voting Machines (EVMs) and VVPATs.",
      who: "Voters, Presiding Officers, and Polling Agents.",
      icon: "CheckSquare"
    },
    {
      id: 6,
      title: "Counting and Declaration",
      description: "EVMs are counted under strict supervision, and the candidate with the most votes is declared the winner.",
      who: "Counting Supervisors and the ECI.",
      icon: "Trophy"
    }
  ],
  timeline: [
    { stage: "Preparation", duration: "Continuous", description: "Voter list updates and machine (EVM) checking." },
    { stage: "Announcement", duration: "Day 0", description: "Election schedule released and MCC begins." },
    { stage: "Nominations", duration: "Day 1-15", description: "Filing, scrutiny, and withdrawal window." },
    { stage: "Campaigning", duration: "2-3 Weeks", description: "Intensive outreach through rallies and manifestos." },
    { stage: "Polling", duration: "4-7 Weeks", description: "Multi-phase voting to ensure security and logistics." },
    { stage: "Counting", duration: "24 Hours", description: "EVMs tallied and results officially declared." }
  ],
  checklist: [
    {
      id: 1,
      task: "Form 6 Submission",
      description: "Register to be included in the electoral roll if you are 18+.",
      action: "Submit via Voter Helpline App or NVSP.",
      link: "https://voters.eci.gov.in/"
    },
    {
      id: 2,
      task: "Verify Registration",
      description: "Check if your name is in the current electoral roll (EPIC alone is not enough).",
      action: "Use 'Search in Electoral Roll' on the ECI portal.",
      link: "https://electoralsearch.eci.gov.in/"
    },
    {
      id: 3,
      task: "Download e-EPIC",
      description: "Get your digital voter ID card for easy access.",
      action: "Download from NVSP portal.",
      link: "https://voters.eci.gov.in/"
    },
    {
      id: 4,
      task: "Locate Polling Booth",
      description: "Find your designated local booth (Part and Serial Number).",
      action: "Check Voter Slip or use the Voter Helpline App."
    },
    {
      id: 5,
      task: "Know Your Candidate",
      description: "Research the background, assets, and legal records of candidates.",
      action: "Use the KYC (Know Your Candidate) app.",
      link: "https://kyc.eci.gov.in/"
    }
  ],
  quiz: [
    {
      id: 1,
      question: "Which autonomous body is responsible for conducting elections in India?",
      options: ["Parliament", "Supreme Court", "Election Commission of India", "Ministry of Home Affairs"],
      correctAnswer: 2,
      explanation: "The Election Commission of India (ECI) is the autonomous constitutional authority responsible for administering election processes."
    },
    {
      id: 2,
      question: "What is the 'Model Code of Conduct,' and when does it begin?",
      options: ["A law starting after voting", "Guidelines starting after announcement", "A set of rules for voters only", "Campaign rules starting 1 year before"],
      correctAnswer: 1,
      explanation: "The MCC is a set of guidelines for political parties and candidates that comes into effect immediately after the ECI announces the election dates."
    },
    {
      id: 3,
      question: "What technology ensures that your vote was recorded correctly for the candidate you chose?",
      options: ["EVM Only", "Paper Ballot", "VVPAT", "Biometric Scan"],
      correctAnswer: 2,
      explanation: "The VVPAT (Voter Verifiable Paper Audit Trail) prints a slip showing your choice for 7 seconds before storing it securely."
    },
    {
      id: 4,
      question: "A candidate loses their security deposit if they fail to secure what fraction of total valid votes?",
      options: ["1/2", "1/4", "1/6", "1/10"],
      correctAnswer: 2,
      explanation: "A candidate must secure at least 1/6th of the valid votes polled to save their security deposit."
    },
    {
      id: 5,
      question: "Which Article of the Constitution grants the ECI the power of superintendence of elections?",
      options: ["Article 370", "Article 324", "Article 21", "Article 44"],
      correctAnswer: 1,
      explanation: "Article 324 of the Indian Constitution provides for the power of superintendence, direction, and control of elections in the Election Commission."
    }
  ],
  mockBallot: {
    candidates: [
      { id: 1, name: "Dr. Anil", symbol: "💻", focus: "Tech & Jobs" },
      { id: 2, name: "Ms. Priya", symbol: "🚲", focus: "Green Transit" },
      { id: 3, name: "Mr. Khan", symbol: "🚰", focus: "Infrastructure" },
      { id: 4, name: "NOTA", symbol: "🚫", focus: "None of the Above" }
    ]
  }
};
