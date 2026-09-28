export type Language = "en" | "te";

export interface TranslationDictionary {
  // Navigation & General
  nav: {
    features: string;
    howItWorks: string;
    about: string;
    farmerLogin: string;
    adminLogin: string;
    register: string;
    home: string;
    language: string;
  };
  // Landing Page
  home: {
    heroBadge: string;
    heroTitlePart1: string;
    heroTitlePart2: string;
    heroTitlePart3: string;
    heroSubtitle: string;
    farmerLoginBtn: string;
    adminConsoleBtn: string;
    registerFarmerBtn: string;
    todayMilk: string;
    activeFarmers: string;
    capabilitiesBadge: string;
    capabilitiesTitle: string;
    capabilitiesSubtitle: string;
    featureCollectionTitle: string;
    featureCollectionDesc: string;
    featureQualityTitle: string;
    featureQualityDesc: string;
    featurePayoutsTitle: string;
    featurePayoutsDesc: string;
    featureAnalyticsTitle: string;
    featureAnalyticsDesc: string;
    featureFarmersTitle: string;
    featureFarmersDesc: string;
    featureReportsTitle: string;
    featureReportsDesc: string;
    workflowBadge: string;
    workflowTitle: string;
    workflowSubtitle: string;
    step1Title: string;
    step1Desc: string;
    step2Title: string;
    step2Desc: string;
    step3Title: string;
    step3Desc: string;
    missionBadge: string;
    missionTitle: string;
    missionDesc: string;
    missionPoint1: string;
    missionPoint2: string;
    missionPoint3: string;
    footerTagline: string;
    quickLinks: string;
    portals: string;
    support: string;
    copyright: string;
    slogan: string;
  };
  // Farmer Login Page
  farmerLogin: {
    portalBadge: string;
    leftBannerTitle: string;
    leftBannerDesc: string;
    title: string;
    subtitle: string;
    emailLabel: string;
    emailPlaceholder: string;
    passwordLabel: string;
    passwordPlaceholder: string;
    rememberMe: string;
    forgotPassword: string;
    signInBtn: string;
    signingIn: string;
    demoFillBtn: string;
    noAccount: string;
    registerLink: string;
    backToHome: string;
  };
  // Admin Login Page
  adminLogin: {
    portalBadge: string;
    backHome: string;
    title: string;
    subtitle: string;
    emailLabel: string;
    emailPlaceholder: string;
    passwordLabel: string;
    passwordPlaceholder: string;
    signInBtn: string;
    signingIn: string;
    demoFillBtn: string;
    cooperativeNotice: string;
  };
  // Register Page
  register: {
    title: string;
    subtitle: string;
    backHome: string;
    fullNameLabel: string;
    emailLabel: string;
    phoneLabel: string;
    villageLabel: string;
    addressLabel: string;
    cattleCountLabel: string;
    breedLabel: string;
    cowBreed: string;
    buffaloBreed: string;
    mixedBreed: string;
    bankAccLabel: string;
    ifscLabel: string;
    passwordLabel: string;
    submitBtn: string;
    submitting: string;
    alreadyRegistered: string;
    signInLink: string;
    successTitle: string;
    successDesc: string;
    assignedIdLabel: string;
    goToLoginBtn: string;
  };
  // Farmer Mobile & Bottom Nav
  farmerNav: {
    dashboard: string;
    collections: string;
    quality: string;
    payments: string;
    profile: string;
    notifications: string;
  };
}

export const translations: Record<Language, TranslationDictionary> = {
  en: {
    nav: {
      features: "Features",
      howItWorks: "How It Works",
      about: "About",
      farmerLogin: "Farmer Login",
      adminLogin: "Admin Login",
      register: "Register",
      home: "Home",
      language: "Language",
    },
    home: {
      heroBadge: "Next-Gen Dairy Intelligence",
      heroTitlePart1: "Smart",
      heroTitlePart2: "Milk Management",
      heroTitlePart3: "for Modern Dairy Farms",
      heroSubtitle:
        "Track milk production, monitor quality, manage payments, and understand dairy performance from one simple platform.",
      farmerLoginBtn: "Farmer Login",
      adminConsoleBtn: "Admin Console",
      registerFarmerBtn: "Register as Farmer",
      todayMilk: "Today's Milk",
      activeFarmers: "Active Farmers",
      capabilitiesBadge: "Core Capabilities",
      capabilitiesTitle: "Everything Your Dairy Operation Needs",
      capabilitiesSubtitle:
        "Empowering farmers with transparent payouts and dairy cooperatives with automated collection logistics.",
      featureCollectionTitle: "Milk Collection Tracking",
      featureCollectionDesc:
        "Record morning and evening intake per farmer with automatic volume calculation and instant slip generation.",
      featureQualityTitle: "Quality Analysis",
      featureQualityDesc:
        "Accurate Fat% and SNF% testing ensures fair grading slabs and transparent pricing for every producer.",
      featurePayoutsTitle: "Farmer Payments",
      featurePayoutsDesc:
        "Automated payment calculation with direct bank transfers, fortnight disbursements, and clear transaction history.",
      featureAnalyticsTitle: "Daily Analytics",
      featureAnalyticsDesc:
        "Comprehensive visual trends comparing morning vs evening yields, quality slabs, and production forecasts.",
      featureFarmersTitle: "Farmer Management",
      featureFarmersDesc:
        "Manage all farmer profiles, bank details, village tags, cattle inventory, and individual collection histories.",
      featureReportsTitle: "Certified Reports",
      featureReportsDesc:
        "Generate instant daily milk logs, farmer audit summaries, quality audits, and payment CSV reports with one-click print.",
      workflowBadge: "Streamlined Workflow",
      workflowTitle: "Simple 3-Step Dairy Lifecycle",
      workflowSubtitle: "How DairyFlow turns morning milk drop-offs into transparent earnings in seconds.",
      step1Title: "Intake & Quality Test",
      step1Desc:
        "Farmer brings milk to the chilling center. Quantity is weighed, and Fat/SNF levels are calibrated digitally.",
      step2Title: "Automatic Pricing",
      step2Desc:
        "System applies active board rates, computing the exact per-liter payout based on quality metrics with zero disputes.",
      step3Title: "Transparent Settlement",
      step3Desc:
        "Both farmer and cooperative records update in real time. Payment summaries are accessible via mobile or print slip.",
      missionBadge: "Our Mission",
      missionTitle: "Empowering Rural Dairy Prosperity Through Transparency",
      missionDesc:
        "DairyFlow was designed from the ground up to solve the real everyday challenges faced by Indian dairy farmers and village cooperatives. By eliminating manual register logs and testing ambiguity, we ensure every drop of milk is valued fairly.",
      missionPoint1: "Fair, transparent payouts calculated directly from verified Fat & SNF slabs.",
      missionPoint2: "Real-time tracking so farmers know their daily earnings anywhere, anytime.",
      missionPoint3: "Comprehensive audit trails ensuring complete institutional governance and zero disputes.",
      footerTagline:
        "Smart Milk Management for Modern Dairy Farms. Empowering farmers and cooperatives with real-time collection metrics and transparent payouts.",
      quickLinks: "Quick Links",
      portals: "Portals",
      support: "Support: support@dairyflow.com",
      copyright: "© 2026 DairyFlow Systems. All rights reserved.",
      slogan: "Track. Manage. Grow.",
    },
    farmerLogin: {
      portalBadge: "Farmer Member Portal",
      leftBannerTitle: "Every drop counted. Every rupee accounted for.",
      leftBannerDesc:
        "Check morning and evening milk quantities, real-time Fat/SNF rates, and pending cooperative payments anytime.",
      title: "Farmer Sign In",
      subtitle: "Enter your credentials to access your daily milk logs and payments.",
      emailLabel: "Farmer Email or Member ID",
      emailPlaceholder: "farmer@dairyflow.com or FARM001",
      passwordLabel: "Password",
      passwordPlaceholder: "••••••••",
      rememberMe: "Remember me for 30 days",
      forgotPassword: "Forgot password?",
      signInBtn: "Sign In as Farmer",
      signingIn: "Signing In...",
      demoFillBtn: "Auto-Fill Demo Farmer (Ramesh Kumar)",
      noAccount: "Don't have an account?",
      registerLink: "Register as Farmer",
      backToHome: "DairyFlow Home",
    },
    adminLogin: {
      portalBadge: "Official Admin Portal",
      backHome: "DairyFlow Home",
      title: "Admin Sign In",
      subtitle: "Secure administrative console for dairy supervisors, lab technicians, and accountants.",
      emailLabel: "Admin Email",
      emailPlaceholder: "admin@dairyflow.com",
      passwordLabel: "Password",
      passwordPlaceholder: "••••••••",
      signInBtn: "Enter Admin Console",
      signingIn: "Verifying Admin Access...",
      demoFillBtn: "Auto-Fill Demo Admin Credentials",
      cooperativeNotice: "Authorized cooperative dairy staff only. Access is monitored and logged.",
    },
    register: {
      title: "Farmer Registration",
      subtitle: "Join your local dairy cooperative milk collection network.",
      backHome: "DairyFlow Home",
      fullNameLabel: "Full Name",
      emailLabel: "Email Address",
      phoneLabel: "Phone Number",
      villageLabel: "Village / Gram Panchayat",
      addressLabel: "Residential Address",
      cattleCountLabel: "Cattle Count (Milking Cows/Buffaloes)",
      breedLabel: "Primary Breed",
      cowBreed: "Cow (ఆవు)",
      buffaloBreed: "Buffalo (గేదె)",
      mixedBreed: "Mixed Herd (మిశ్రమ పశువులు)",
      bankAccLabel: "Bank Account Number",
      ifscLabel: "Bank IFSC Code",
      passwordLabel: "Create Password",
      submitBtn: "Submit Registration",
      submitting: "Submitting Application...",
      alreadyRegistered: "Already registered?",
      signInLink: "Sign In to Portal",
      successTitle: "Account Submitted for Approval",
      successDesc: "Your dairy membership application has been received and is pending verification.",
      assignedIdLabel: "Assigned Member ID",
      goToLoginBtn: "Proceed to Farmer Login",
    },
    farmerNav: {
      dashboard: "Dashboard",
      collections: "Collections",
      quality: "Quality",
      payments: "Payments",
      profile: "Profile",
      notifications: "Notifications",
    },
  },
  te: {
    nav: {
      features: "ఫీచర్లు",
      howItWorks: "ఎలా పనిచేస్తుంది",
      about: "మా గురించి",
      farmerLogin: "రైతు లాగిన్",
      adminLogin: "అడ్మిన్ లాగిన్",
      register: "నమోదు",
      home: "హోమ్",
      language: "భాష",
    },
    home: {
      heroBadge: "ఆధునిక పాడి సాంకేతికత",
      heroTitlePart1: "ఆధునిక పాడి పరిశ్రమల కోసం",
      heroTitlePart2: "స్మార్ట్ పాల నిర్వహణ",
      heroTitlePart3: "మరియు లెక్కలు",
      heroSubtitle:
        "ఒకే వేదిక నుండి పాల ఉత్పత్తిని ట్రాక్ చేయండి, నాణ్యతను పర్యవేక్షించండి, చెల్లింపులను నిర్వహించండి మరియు డైరీ పనితీరును సులభంగా తెలుసుకోండి.",
      farmerLoginBtn: "రైతు లాగిన్",
      adminConsoleBtn: "అడ్మిన్ కన్సోల్",
      registerFarmerBtn: "రైతుగా నమోదు చేసుకోండి",
      todayMilk: "నేటి పాలు",
      activeFarmers: "క్రియాశీల రైతులు",
      capabilitiesBadge: "ప్రధాన ఫీచర్లు",
      capabilitiesTitle: "మీ పాడి కేంద్రానికి కావలసిన సమగ్ర పరిష్కారం",
      capabilitiesSubtitle:
        "రైతులకు పారదర్శక చెల్లింపులు మరియు డైరీ సహకార సంఘాలకు ఆటోమేటెడ్ సేకరణ నిర్వహణ వ్యవస్థ.",
      featureCollectionTitle: "పాల సేకరణ ట్రాకింగ్",
      featureCollectionDesc:
        "ప్రతి రైతు నుండి ఉదయం మరియు సాయంత్రం పాల సేకరణను ఆటోమేటిక్ వాల్యూమ్ లెక్కింపు మరియు తక్షణ రశీదుతో నమోదు చేయండి.",
      featureQualityTitle: "నాణ్యత విశ్లేషణ",
      featureQualityDesc:
        "ఖచ్చితమైన ఫ్యాట్% మరియు ఎస్.ఎన్.ఎఫ్% పరీక్షలతో ప్రతి పాడి రైతుకు న్యాయమైన ధర మరియు పారదర్శకత లభిస్తుంది.",
      featurePayoutsTitle: "రైతు చెల్లింపులు",
      featurePayoutsDesc:
        "ఆటోమేటిక్ ధర లెక్కింపు, నేరుగా బ్యాంక్ ఖాతా జమ, పక్షం రోజుల చెల్లింపులు మరియు స్పష్టమైన లావాదేవీల రికార్డులు.",
      featureAnalyticsTitle: "రోజువారీ విశ్లేషణలు",
      featureAnalyticsDesc:
        "ఉదయం vs సాయంత్రం పాల దిగుబడి, నాణ్యతా విభాగాలు మరియు ఉత్పత్తి అంచనాలను స్పష్టమైన చార్ట్‌ల ద్వారా చూడండి.",
      featureFarmersTitle: "రైతుల నిర్వహణ",
      featureFarmersDesc:
        "రైతుల వివరాలు, బ్యాంక్ ఖాతాలు, గ్రామ సమూహాలు, పశువుల సంఖ్య మరియు వ్యక్తిగత సేకరణ చరిత్రను ఒకే చోట నిర్వహించండి.",
      featureReportsTitle: "ధృవీకరించబడిన నివేదికలు",
      featureReportsDesc:
        "రోజువారీ పాల లాగ్‌లు, రైతు ఆడిట్ నివేదికలు, నాణ్యత సమాచారం మరియు చెల్లింపుల CSV డౌన్‌లోడ్ & ప్రింట్ సౌకర్యం.",
      workflowBadge: "సరళమైన విధానం",
      workflowTitle: "3 సులభమైన దశలలో పాల సేకరణ ప్రక్రియ",
      workflowSubtitle: "డైరీఫ్లోతో మీ పాల సేకరణ నుండి చెల్లింపుల వరకు అత్యంత సులభం మరియు పారదర్శకం.",
      step1Title: "సేకరణ & నాణ్యత పరీక్ష",
      step1Desc:
        "రైతు పాలను చిల్లింగ్ సెంటర్‌కు తీసుకువస్తారు. పరిమాణం తూకం వేయబడి, డిజిటల్ పద్ధతిలో ఫ్యాట్/ఎస్.ఎన్.ఎఫ్ కొలవబడుతుంది.",
      step2Title: "తక్షణ ధర లెక్కింపు",
      step2Desc:
        "నాణ్యత శాతాల ఆధారంగా వ్యవస్థ స్వయంచాలకంగా ప్రభుత్వ/బోర్డు రేట్లను వర్తింపజేసి కచ్చితమైన ధరను లెక్కిస్తుంది.",
      step3Title: "పారదర్శక చెల్లింపులు",
      step3Desc:
        "రైతు మరియు డైరీ రికార్డులు తక్షణమే అప్‌డేట్ అవుతాయి. చెల్లింపు రశీదును మొబైల్ లేదా ప్రింట్ ద్వారా పొందవచ్చు.",
      missionBadge: "మా లక్ష్యం",
      missionTitle: "పారదర్శకతతో గ్రామీణ పాడి రైతుల శ్రేయస్సు మరియు అభివృద్ధి",
      missionDesc:
        "భారతీయ పాడి రైతులు మరియు గ్రామ సహకార సంఘాలు రోజూ ఎదుర్కొనే సవాళ్లను పరిష్కరించడానికి డైరీఫ్లో రూపొందించబడింది. మాన్యువల్ పుస్తకాల రికార్డులను తొలగించి, ప్రతి చుక్క పాలకు న్యాయమైన విలువ అందేలా చూస్తాము.",
      missionPoint1: "ధృవీకరించబడిన ఫ్యాట్ & ఎస్.ఎన్.ఎఫ్ ఆధారంగా నేరుగా పారదర్శక చెల్లింపులు.",
      missionPoint2: "ఎక్కడి నుండైనా ఎప్పుడైనా రోజువారీ ఆదాయాన్ని తెలుసుకునే రియల్-టైమ్ సదుపాయం.",
      missionPoint3: "ఎలాంటి వివాదాలు లేకుండా పారదర్శక పాలనా ప్రమాణాలు మరియు ఖచ్చితమైన ఆడిట్ రికార్డులు.",
      footerTagline:
        "ఆధునిక పాడి పరిశ్రమల కోసం స్మార్ట్ పాల నిర్వహణ. రియల్-టైమ్ పాల సేకరణ మరియు పారదర్శక చెల్లింపులతో రైతులను శక్తివంతం చేయడం.",
      quickLinks: "ముఖ్యమైన లింకులు",
      portals: "పోర్టల్స్",
      support: "సహాయం: support@dairyflow.com",
      copyright: "© 2026 డైరీఫ్లో సిస్టమ్స్. సర్వహక్కులు ప్రత్యేకించబడ్డాయి.",
      slogan: "ట్రాక్ చేయండి. నిర్వహించండి. అభివృద్ధి చెందండి.",
    },
    farmerLogin: {
      portalBadge: "రైతు సభ్యుల పోర్టల్",
      leftBannerTitle: "ప్రతి బొట్టు లెక్కించబడుతుంది. ప్రతి రూపాయి జమ అవుతుంది.",
      leftBannerDesc:
        "ఉదయం మరియు సాయంత్రం పాల పరిమాణం, రియల్-టైమ్ ఫ్యాట్/ఎస్.ఎన్.ఎఫ్ రేట్లు మరియు పెండింగ్ చెల్లింపులను ఎప్పుడైనా తనిఖీ చేయండి.",
      title: "రైతు సైన్ ఇన్",
      subtitle: "మీ రోజువారీ పాల రికార్డులు మరియు చెల్లింపుల కోసం లాగిన్ అవ్వండి.",
      emailLabel: "రైతు ఈమెయిల్ లేదా సభ్యత్వ ఐడి",
      emailPlaceholder: "farmer@dairyflow.com లేదా FARM001",
      passwordLabel: "పాస్‌వర్డ్",
      passwordPlaceholder: "••••••••",
      rememberMe: "30 రోజుల పాటు నన్ను గుర్తుంచుకో",
      forgotPassword: "పాస్‌వర్డ్ మర్చిపోయారా?",
      signInBtn: "రైతుగా సైన్ ఇన్ అవ్వండి",
      signingIn: "లాగిన్ అవుతోంది...",
      demoFillBtn: "డెమో రైతు వివరాలు నింపండి (రమేష్ కుమార్)",
      noAccount: "ఖాతా లేదా?",
      registerLink: "రైతుగా నమోదు చేసుకోండి",
      backToHome: "హోమ్ పేజీ",
    },
    adminLogin: {
      portalBadge: "అధికారిక అడ్మిన్ పోర్టల్",
      backHome: "హోమ్ పేజీ",
      title: "అడ్మిన్ సైన్ ఇన్",
      subtitle: "డైరీ సూపర్‌వైజర్లు, ల్యాబ్ టెక్నీషియన్లు మరియు అకౌంటెంట్ల కోసం సురక్షిత పోర్టల్.",
      emailLabel: "అడ్మిన్ ఈమెయిల్",
      emailPlaceholder: "admin@dairyflow.com",
      passwordLabel: "పాస్‌వర్డ్",
      passwordPlaceholder: "••••••••",
      signInBtn: "అడ్మిన్ కన్సోల్‌లోకి ప్రవేశించండి",
      signingIn: "ధృవీకరిస్తోంది...",
      demoFillBtn: "డెమో అడ్మిన్ వివరాలు నింపండి",
      cooperativeNotice: "అధీకృత డైరీ సిబ్బందికి మాత్రమే. అన్ని లాగిన్ కార్యకలాపాలు పర్యవేక్షించబడతాయి.",
    },
    register: {
      title: "రైతు సభ్యత్వ నమోదు",
      subtitle: "మీ స్థానిక పాడి సహకార సంఘం పాల సేకరణ నెట్‌వర్క్‌లో చేరండి.",
      backHome: "హోమ్ పేజీ",
      fullNameLabel: "పూర్తి పేరు",
      emailLabel: "ఈమెయిల్ చిరునామా",
      phoneLabel: "మొబైల్ నంబర్",
      villageLabel: "గ్రామం / పంచాయతీ",
      addressLabel: "నివాస చిరునామా",
      cattleCountLabel: "పాడి పశువుల సంఖ్య (ఆవులు/గేదెలు)",
      breedLabel: "ప్రధాన పశువుల జాతి",
      cowBreed: "ఆవు (Cow)",
      buffaloBreed: "గేదె (Buffalo)",
      mixedBreed: "మిశ్రమ పశువులు (Mixed)",
      bankAccLabel: "బ్యాంక్ ఖాతా సంఖ్య",
      ifscLabel: "బ్యాంక్ IFSC కోడ్",
      passwordLabel: "కొత్త పాస్‌వర్డ్ సృష్టించండి",
      submitBtn: "నమోదును సమర్పించండి",
      submitting: "దరఖాస్తు సమర్పిస్తోంది...",
      alreadyRegistered: "ఇప్పటికే ఖాతా ఉందా?",
      signInLink: "పోర్టల్‌లోకి సైన్ ఇన్ అవ్వండి",
      successTitle: "ఖాతా ఆమోదం కోసం సమర్పించబడింది",
      successDesc: "మీ పాడి సభ్యత్వ దరఖాస్తు స్వీకరించబడింది. ధృవీకరణ పెండింగ్‌లో ఉంది.",
      assignedIdLabel: "కేటాయించిన రైతు ఐడి",
      goToLoginBtn: "రైతు లాగిన్‌కు వెళ్లండి",
    },
    farmerNav: {
      dashboard: "డాష్‌బోర్డ్",
      collections: "సేకరణలు",
      quality: "నాణ్యత",
      payments: "చెల్లింపులు",
      profile: "ప్రొఫైల్",
      notifications: "నోటిఫికేషన్లు",
    },
  },
};
