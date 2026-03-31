/**
 * CONTENT.JS - All Text Content for PrivacyPlay
 * 
 * Edit any text here and the website will automatically update!
 * No need to touch HTML or JavaScript files.
 */

const CONTENT = {
  
  // ============================================================================
  // HERO SECTION
  // ============================================================================
  hero: {
    eyebrow: "Privacy Seminar",
    title: "How can I share a secret privately?",
    // Uncomment these if you want to show them:
    // lede: "Local Differential Privacy.",
    // scroll: "Scroll for the story."
  },

  // ============================================================================
  // CHAPTER 1: INTRO
  // ============================================================================
  chapter1: {
    step1: {
      eyebrow: "Differential Privacy",
      title: "What is it?",
      lead: "Differential Privacy is a privacy guarantee: when we analyze data from a group of people, we protect each individual in that group. Local differential privacy goes one step further.",
      body: "It lets people share sensitive information for research — health data, personal preferences, opinions — while keeping their individual data private from everyone, including researchers."
    },

    step1b: {
      eyebrow: "Differential Privacy",
      title: "Who uses it?",
      lead: "Governments, tech companies, and researchers use it. But anyone with an interest in privacy can use it."
    },

    step1c: {
      eyebrow: "Differential Privacy",
      title: "Why use it?",
      lead: "Privacy isn't just about hiding data — it's a <em>mathematical guarantee</em>. Click each company card on the right to see exactly why they chose differential privacy.",
      
      // Company cards data
      companies: [
        {
          id: "tiktok",
          name: "TikTok",
          category: "Social media platform",
          icon: "🎵",
          description: "TikTok's PrivacyGo program uses DP to measure ad campaign reach and conversion rates without ever exposing which videos any individual user watched.",
          expanded: true
        },
        {
          id: "apple",
          name: "Apple",
          category: "Device & software maker",
          icon: "🍎",
          description: "Apple uses differential privacy to learn popular emoji, keyboard suggestions, and Safari browsing patterns for energy efficiency — all while keeping individual data private on your device.",
          expanded: false
        },
        {
          id: "meta",
          name: "Meta",
          category: "Social networking",
          icon: "👤",
          description: "Meta applies differential privacy to aggregate insights about user behavior and platform trends while protecting individual privacy in social network analytics.",
          expanded: false
        },
        {
          id: "us-bureau",
          name: "US Bureau of Labor Statistics",
          category: "Government agency",
          icon: "📊",
          description: "The US Bureau of Labor Statistics uses differential privacy to publish employment statistics and economic data while protecting the confidentiality of individual respondents and businesses.",
          expanded: false
        }
      ]
    }
  },

  // ============================================================================
  // CHAPTER 2: PET GERBIL EXAMPLE
  // ============================================================================
  chapter2: {
    stepExample: {
      eyebrow: "Example",
      title: "My teacher asks the class to name our pet gerbil.",
      lead: "We're voting on a name for our class pet. Should we call him Rizz Rodent, 6-7 Squeaker, or Carl?"
    },

    stepExampleVoting: {
      eyebrow: "Example",
      title: "Everyone likes 6-7 Squeaker and Rizz Rodent, but I want Carl.",
      lead: "I know my choice is less popular, but I still want to share my opinion honestly."
    },

    stepExampleResults: {
      eyebrow: "Example",
      title: "The vote.",
      lead: "Carl lost 😢"
    },

    stepExampleCaptain: {
      eyebrow: "Privacy Problem",
      title: "Uh oh... the class captain knows!",
      lead: "Our class captain collected everyone's votes. That means he knows exactly who voted for what.",
      body1: "What if he tells his friends? What if your vote gets out? Everyone will know you voted for Carl!",
      note: "Click on the students on the right to see who voted for what. This is what the captain can see!",
      
      // Student voting panel data
      students: [
        { id: 1, emoji: "👧🏿", name: "Student 1", vote: "Rizz Rodent", voteId: "rizz" },
        { id: 2, emoji: "👦🏻", name: "Student 2", vote: "Rizz Rodent", voteId: "rizz" },
        { id: 3, emoji: "👨🏾‍🦲", name: "You", vote: "Carl", voteId: "carl", isYou: true, secret: "🤫" },
        { id: 4, emoji: "👱🏼‍♀️", name: "Student 4", vote: "6-7 Squeaker", voteId: "squeaker" },
        { id: 5, emoji: "🧕🏽", name: "Student 5", vote: "6-7 Squeaker", voteId: "squeaker" },
        { id: 6, emoji: "🧑🏽", name: "Student 6", vote: "6-7 Squeaker", voteId: "squeaker" }
      ],
      
      warningTitle: "Privacy Problem:",
      warningText: "The captain can see everyone's vote! Your vote for Carl isn't private."
    },

    stepExamplePrivacy: {
      eyebrow: "Example",
      title: "Insecure about the vote; confident in my privacy.",
      lead: "Although we voted, I feel secure in my less popular feelings about the name Carl because we used local differential privacy."
    }
  },

  // ============================================================================
  // CHAPTER 3: RANDOMIZED RESPONSE
  // ============================================================================
  chapter3: {
    step2: {
      eyebrow: "Randomized Response",
      title: "Flip a coin first.",
      lead: "Before I say my vote out loud, I flip a coin in private. If it's heads, I tell the truth. If it's tails, I flip again and let the second coin decide my public answer."
    }
  },

  // ============================================================================
  // CHAPTER 4-10: ADD MORE CHAPTERS HERE
  // ============================================================================
  chapter4: {
    // Add your Chapter 4 content here
  },

  chapter5: {
    // Add your Chapter 5 content here
  },

  // ============================================================================
  // CHAPTER 11: K-ANONYMITY
  // ============================================================================
  chapter11: {
    step1: {
      eyebrow: "K-Anonymity",
      title: "Meet Sarah",
      lead: "Sarah is 34 years old. She lives in ZIP code 85281. She was just diagnosed with heart disease.",
      body: "She goes to the hospital for treatment. The hospital records her information in their database.",
      body2: "Age: 34. ZIP: 85281. Condition: Heart Disease."
    },

    step2: {
      eyebrow: "K-Anonymity",
      title: "The hospital database is open",
      lead: "The receptionist can see Sarah's exact information. The IT staff can access it. Insurance companies request it for billing.",
      body: "Anyone with access can search: 'Show me the 34-year-old from ZIP 85281'",
      body2: "Only ONE person matches. It's Sarah. Her medical condition is exposed. This is <strong>k=1</strong>."
    },

    step3: {
      eyebrow: "K-Anonymity",
      title: "What is k-anonymity?",
      lead: "K-anonymity is a privacy technique that groups people together so you can't identify individuals.",
      body: "The 'k' is a number: if k=5, then at least 5 people share the same characteristics.",
      body2: "Instead of being unique (k=1), you hide in a group of k people. No one can tell which record is yours!"
    },

    step4: {
      eyebrow: "K-Anonymity",
      title: "How does it work?",
      lead: "The hospital transforms Sarah's exact data into ranges.",
      body: "Age 34 → <strong>Age Range: 30-40</strong>",
      body2: "ZIP 85281 → <strong>ZIP Area: 852**</strong>",
      body3: "Condition stays the same: Heart Disease"
    },

    step5: {
      eyebrow: "K-Anonymity",
      title: "Now Sarah has company!",
      lead: "With these ranges, Sarah is grouped with 4 other people who also have:",
      body: "• Age 30-40<br>• ZIP Area 852**<br>• Heart Disease",
      body2: "Now when someone searches the database, they find 5 people (k=5). They can't tell which one is Sarah!"
    },

    step6: {
      eyebrow: "K-Anonymity",
      title: "Try it yourself",
      lead: "Enter your age, ZIP code, and a health concern.",
      instruction: "See how you'd be exposed with exact data (k=1), then watch k-anonymity protect you by grouping you with others (k≥5)."
    },

    step7: {
      eyebrow: "K-Anonymity",
      title: "Why does this matter?",
      lead: "K-anonymity protects privacy while keeping data useful for research.",
      body: "Doctors can still study 'heart disease in people aged 30-40 in area 852**' for research.",
      body2: "But they can't identify Sarah specifically. She's hidden in a group of 5.",
      body3: "Privacy is protected. Research continues. Win-win! 🎉"
    },

    step8: {
      eyebrow: "K-Anonymity",
      title: "The tradeoff: choosing k",
      lead: "Higher k = more privacy, but less specific data.",
      point1Title: "k = 5 (Typical)",
      point1Text: "Good balance. Sarah is one of 5 people. Age ranges are 10 years (30-40).",
      point2Title: "k = 100 (Very Private)",
      point2Text: "Excellent privacy. Sarah is one of 100 people. But age ranges must be very broad (20-60).",
      point3Title: "k = 2 (Risky)",
      point3Text: "Weak protection. Sarah is one of only 2 people. Still somewhat identifiable."
    },

    step9: {
      eyebrow: "K-Anonymity",
      title: "Real-world impact",
      lead: "K-anonymity is used everywhere to protect sensitive data.",
      example1Title: "🏥 Healthcare",
      example1Text: "Hospitals use k-anonymity (k=5 to k=10) to share medical data for research while protecting patient privacy.",
      example2Title: "📊 Census Data",
      example2Text: "Government census bureaus use k-anonymity to publish demographic statistics without exposing individuals.",
      example3Title: "💳 Financial Records",
      example3Text: "Banks use k-anonymity to analyze spending patterns while protecting customer identities."
    }
  },

  // ... continue for all chapters

  // ============================================================================
  // NAVIGATION (Chapter Labels)
  // ============================================================================
  navigation: {
    chapters: [
      "Intro",
      "Example", 
      "Randomized response",
      "Tune the coin",
      "Watch the flow",
      "Meet ε",
      "Tune ε",
      "RAPPOR",
      "Beyond the coin",
      "Go deeper",
      "K-Anonymity"  // NEW!
    ]
  },

  // ============================================================================
  // REFERENCES SECTION
  // ============================================================================
  references: {
    title: "References",
    items: [
      {
        id: "apple-dp",
        authors: "Apple Inc.",
        title: "Learning with Privacy at Scale",
        year: "2017",
        url: "https://machinelearning.apple.com/research/learning-with-privacy-at-scale"
      },
      {
        id: "google-rappor",
        authors: "Úlfar Erlingsson, Vasyl Pihur, Aleksandra Korolova",
        title: "RAPPOR: Randomized Aggregatable Privacy-Preserving Ordinal Response",
        year: "2014",
        url: "https://research.google/pubs/pub42852/"
      },
      {
        id: "dwork-roth",
        authors: "Cynthia Dwork, Aaron Roth",
        title: "The Algorithmic Foundations of Differential Privacy",
        year: "2014",
        url: "https://www.cis.upenn.edu/~aaroth/Papers/privacybook.pdf"
      },
      {
        id: "privacytools",
        authors: "Harvard Privacy Tools Project",
        title: "Differential Privacy Educational Resources",
        year: "2021",
        url: "https://privacytools.seas.harvard.edu/"
      },
      {
        id: "privacygo",
        authors: "TikTok",
        title: "PrivacyGo: Privacy-Preserving Advertising",
        year: "2022",
        url: "https://newsroom.tiktok.com/en-us/privacy-preserving-ad-measurement"
      },
      {
        id: "sweeney-kanon",
        authors: "Latanya Sweeney",
        title: "k-Anonymity: A Model for Protecting Privacy",
        year: "2002",
        url: "https://dataprivacylab.org/dataprivacy/projects/kanonymity/kanonymity.pdf"
      },
      {
        id: "machanavajjhala",
        authors: "Ashwin Machanavajjhala, Daniel Kifer, Johannes Gehrke, Muthuramakrishnan Venkitasubramaniam",
        title: "L-Diversity: Privacy Beyond K-Anonymity",
        year: "2007",
        url: "https://personal.utdallas.edu/~muratk/courses/privacy08f_files/ldiversity.pdf"
      },
      {
        id: "li-tcloseness",
        authors: "Ninghui Li, Tiancheng Li, Suresh Venkatasubramanian",
        title: "t-Closeness: Privacy Beyond k-Anonymity and l-Diversity",
        year: "2007",
        url: "https://www.cs.purdue.edu/homes/ninghui/papers/t_closeness_icde07.pdf"
      },
      {
        id: "hipaa-kanon",
        authors: "U.S. Department of Health & Human Services",
        title: "Guidance Regarding Methods for De-identification of Protected Health Information",
        year: "2012",
        url: "https://www.hhs.gov/hipaa/for-professionals/privacy/special-topics/de-identification/index.html"
      },
      {
        id: "el-emam-guide",
        authors: "Khaled El Emam, Luk Arbuckle",
        title: "Anonymizing Health Data: Case Studies and Methods to Get You Started",
        year: "2013",
        url: "https://www.oreilly.com/library/view/anonymizing-health-data/9781449363062/"
      }
    ]
  },

  // ============================================================================
  // UI LABELS (Buttons, Controls, Messages)
  // ============================================================================
  ui: {
    buttons: {
      revealVote: "Click to expand",
      hideVote: "Click to collapse"
    },
    
    controls: {
      coinBiasLabel: "Coin Bias (Probability of Truth)",
      participantsLabel: "Participants",
      epsilonLabel: "Privacy Budget (ε)"
    },
    
    status: {
      loading: "Loading visualization...",
      ready: "Ready to explore",
      calculating: "Calculating privacy..."
    },
    
    accessibility: {
      skipToContent: "Skip to main content",
      chapterNavigation: "Chapter navigation",
      visualization: "Interactive visualization"
    }
  }
};

// Make content available globally
if (typeof window !== 'undefined') {
  window.CONTENT = CONTENT;
}

// For Node.js environments (if needed)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = CONTENT;
}
