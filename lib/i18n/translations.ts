export type Language = "en" | "te";

export interface TranslationDictionary {
  farmerNav: {dashboard: string; collections: string; notifications: string; payments: string; profile: string};
  pwa: {installPromptTitle: string; installPromptDesc: string; installBtn: string; dismissBtn: string; iosInstruction: string; alreadyInstalled: string; installedNotice: string};
}

export const translations: Record<Language, TranslationDictionary> = {
  en: {
    farmerNav: {
      dashboard: "Dashboard",
      collections: "Collections",
      notifications: "Notifications",
      payments: "Earnings",
      profile: "Profile",
    },
    pwa: {
      installPromptTitle: "Install DairyFlow App",
      installPromptDesc: "Install on your home screen for fast 1-tap milk tracking and offline access.",
      installBtn: "Install App",
      dismissBtn: "Later",
      iosInstruction: "To install on iPhone/iPad: Tap Share (⎙) below and select 'Add to Home Screen' (➕).",
      alreadyInstalled: "App Installed",
      installedNotice: "DairyFlow is installed on your device.",
    },
  },
  te: {
    farmerNav: {
      dashboard: "డాష్‌బోర్డ్",
      collections: "సేకరణలు",
      notifications: "నోటిఫికేషన్లు",
      payments: "ఆదాయం",
      profile: "ప్రొఫైల్",
    },
    pwa: {
      installPromptTitle: "డెయిరీఫ్లో యాప్‌ను ఇన్‌స్టాల్ చేసుకోండి",
      installPromptDesc: "పాల సేకరణ మరియు చెల్లింపు వివరాల కోసం మీ ఫోన్ హోమ్ స్క్రీన్‌పై యాప్‌ను జోడించండి.",
      installBtn: "ఇన్‌స్టాల్ చేయండి",
      dismissBtn: "తర్వాత",
      iosInstruction: "ఐఫోన్‌లో ఇన్‌స్టాల్ చేయడానికి: షేర్ బటన్ (⎙) నొక్కి 'Add to Home Screen' (➕) ఎంచుకోండి.",
      alreadyInstalled: "యాప్ ఇన్‌స్టాల్ అయింది",
      installedNotice: "డెయిరీఫ్లో మీ పరికరంలో ఇన్‌స్టాల్ చేయబడింది.",
    },
  },
};
