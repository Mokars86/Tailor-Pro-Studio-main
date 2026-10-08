export type SupportedLanguage = 'en' | 'tw' | 'fr' | 'ar';

export interface LanguageInfo {
  code: SupportedLanguage;
  name: string;
  nativeName: string;
  flag: string;
  direction: 'ltr' | 'rtl';
}

export const SUPPORTED_LANGUAGES: LanguageInfo[] = [
  {
    code: 'en',
    name: 'English',
    nativeName: 'English',
    flag: '🇬🇧',
    direction: 'ltr'
  },
  {
    code: 'tw',
    name: 'Twi (Akan)',
    nativeName: 'Twi / Akan',
    flag: '🇬🇭',
    direction: 'ltr'
  },
  {
    code: 'fr',
    name: 'French',
    nativeName: 'Français',
    flag: '🇫🇷',
    direction: 'ltr'
  },
  {
    code: 'ar',
    name: 'Arabic',
    nativeName: 'العربية',
    flag: '🇸🇦',
    direction: 'rtl'
  }
];

export const translations = {
  en: {
    // Nav & Common
    clients: 'Clients',
    runway: 'Runway',
    ledger: 'Ledger',
    inventory: 'Inventory',
    directory: 'Directory',
    stage: 'Stage',
    financials: 'Financials',
    materials: 'Materials',
    quickAdd: '+ Quick Add Client',
    settings: 'Settings',
    searchPlaceholder: 'Search clients, garment tag, phone...',
    all: 'All',
    vip: 'VIP',
    active: 'Active',
    pendingDeposit: 'Pending Deposit',
    activeFilter: 'Active Filter',
    allDesigners: 'All Designers',

    // Header & Studio
    masterAtelier: 'Master Atelier',
    masterAtelierPlatform: 'Master Atelier Platform',
    liveCloud: 'Supabase Live',
    syncing: 'Syncing...',
    localCache: 'Local Cache',
    free: 'Free',
    masterTier: 'Master',
    enterprise: 'Enterprise',
    cert: 'Cert 📜',
    certLocked: 'Cert 🔒',
    alerts: 'Alerts',
    fabricAi: 'Fabric AI',
    language: 'Language',
    selectLanguage: 'Select Application Language',

    // Metrics
    activeDossiers: 'Active Clients',
    unpaidDeposits: 'Pending Deposits',
    completedGarments: 'Garments on Runway',
    totalRevenue: 'Total Atelier Revenue',
    viewRunway: 'View Runway →',
    viewLedger: 'View Ledger →',
    activeRunwayDesc: 'in active production',
    collectDep: 'Collect →',

    // Runway Stages
    stage_consult: 'CONSULT',
    stage_cutting: 'CUTTING',
    stage_sewing: 'SEWING',
    stage_fitting: 'FITTING',
    stage_ready: 'READY',
    stage_delivered: 'DELIVERED',

    // Client Cards
    measure: 'Measure',
    edit: 'Edit',
    call: 'Call',
    chat: 'Chat',
    deposit: 'Deposit',
    paidInFull: 'Paid in Full ✓',
    due: 'Due',
    stageLabel: 'Stage',
    customerDirectory: 'CUSTOMER DIRECTORY',
    swipeTip: 'Swipe left for WhatsApp & call actions • Tap to view dossier',
    activeCount: 'Active Dossiers',
    showingOf: 'Showing {shown} of {total} client dossiers',
    openFullDirectory: 'Click below to open full screen customer directory',
    viewAllClients: 'View All Clients ({count})',
    newConsult: '+ New Consult',
    noClientsYet: 'No Client Dossiers Yet',
    noClientsDesc: 'Your customer directory is clean and ready. Click below to add your first bespoke client consultation and measurements.',
    createFirstClient: '+ Create First Client Consult',

    // Actions & Buttons
    save: 'Save',
    cancel: 'Cancel',
    close: 'Close',
    delete: 'Delete',
    confirm: 'Confirm',
    back: 'Back',
    done: 'Done',
    loading: 'Loading...',

    // Apprentice & Linked Studio
    linkedMasterAtelier: 'LINKED MASTER ATELIER',
    master: 'Master',
    apprenticeRegistry: 'Apprentice Scholars & Curriculum',
    linkNewApprentice: '+ Pair New Apprentice',
    workshopCode: 'Workshop Code',

    // Language selector
    lang_en: 'English (UK/US)',
    lang_tw: 'Twi (Akan / Ghana)',
    lang_fr: 'Français (French)',
    lang_ar: 'العربية (Arabic)'
  },

  tw: {
    // Nav & Common (Twi / Akan)
    clients: 'Kwesefoɔ',
    runway: 'Adwuma Kwan',
    ledger: 'Sika Nhoma',
    inventory: 'Nnoɔma Sie',
    directory: 'Din Nhoma',
    stage: 'Gyinapɛn',
    financials: 'Sika Asɛm',
    materials: 'Ntoma & Nnoɔma',
    quickAdd: '+ Fa Kwesefoɔ Ka Ho',
    settings: 'Nsesamu',
    searchPlaceholder: 'Hwehwɛ kwesefoɔ, ahyɛnsodeɛ, tɛlifon...',
    all: 'Nyinaa',
    vip: 'Ahemfo (VIP)',
    active: 'Wɔwɔ Hɔ',
    pendingDeposit: 'Sika a Aka',
    activeFilter: 'Nkyekyɛmu',
    allDesigners: 'Apampamfoɔ Nyinaa',

    // Header & Studio
    masterAtelier: 'Atelier Panyin',
    masterAtelierPlatform: 'Atelier Panyin Bea',
    liveCloud: 'Cloud a Yɛasɔ',
    syncing: 'Ɛrekɔ so...',
    localCache: 'Afidie So Sie',
    free: 'Kwa',
    masterTier: 'Panyin',
    enterprise: 'Adwumakuo',
    cert: 'Abasobɔdeɛ 📜',
    certLocked: 'Yɛato Mu 🔒',
    alerts: 'Kɔkɔbɔ',
    fabricAi: 'Ntoma AI',
    language: 'Kasa',
    selectLanguage: 'Pau Kasa a Wopɛ',

    // Metrics
    activeDossiers: 'Kwesefoɔ a Wɔwɔ Hɔ',
    unpaidDeposits: 'Sika a Aka Tua',
    completedGarments: 'Ntoma a Yɛreyɛ',
    totalRevenue: 'Sika a Yɛanya Nyinaa',
    viewRunway: 'Hwɛ Adwuma Kwan →',
    viewLedger: 'Hwɛ Sika Nhoma →',
    activeRunwayDesc: 'wɔ adwuma mu seesei',
    collectDep: 'Gye Sika →',

    // Runway Stages
    stage_consult: 'NKITAHODIE',
    stage_cutting: 'TWA NTOMA',
    stage_sewing: 'PAM NTOMA',
    stage_fitting: 'SƆ HWƐ',
    stage_ready: 'AWIE / BƐFA',
    stage_delivered: 'YƐDE AMA',

    // Client Cards
    measure: 'Susu',
    edit: 'Sesa',
    call: 'Frɛ',
    chat: 'Kasa',
    deposit: 'Sika',
    paidInFull: 'Wawie Tua Nyinaa ✓',
    due: 'Ka a Aka',
    stageLabel: 'Gyinapɛn',
    customerDirectory: 'KWESEFOƆ DIN NHOMA',
    swipeTip: 'Twe kɔ bɛnkum ma WhatsApp & frɛ • Mia so na hwɛ nsɛm nyinaa',
    activeCount: 'Kwesefoɔ a Wɔwɔ Hɔ',
    showingOf: 'Kwesefoɔ {shown} wɔ {total} mu na ɛwɔ ha',
    openFullDirectory: 'Mia aseɛ ha na bue kwesefoɔ din nhoma nyinaa',
    viewAllClients: 'Hwɛ Kwesefoɔ Nyinaa ({count})',
    newConsult: '+ Nkitahodie Foforɔ',
    noClientsYet: 'Kwesefoɔ Biara Nni Ha Seesei',
    noClientsDesc: 'Wo kwesefoɔ nhoma da mpan. Mia aseɛ ha na fa wo kwesefoɔ a ɔdi kan ne ne susudeɛ ka ho.',
    createFirstClient: '+ Fa Kwesefoɔ a Ɔdi Kan Ka Ho',

    // Actions & Buttons
    save: 'Sie',
    cancel: 'Gyae',
    close: 'To Mu',
    delete: 'Pepa',
    confirm: 'Gye Tom',
    back: 'San',
    done: 'Awie',
    loading: 'Ɛretwe...',

    // Apprentice & Linked Studio
    linkedMasterAtelier: 'ATELIER PANYIN A WƆNE NO WƆ NKITAHODIE',
    master: 'Panyin',
    apprenticeRegistry: 'Asuafoɔ & Nkyerɛkyerɛ Nhyehyɛeɛ',
    linkNewApprentice: '+ Fa Osuani Foforɔ Ka Ho',
    workshopCode: 'Adwumayɛbea Koodi',

    // Language selector
    lang_en: 'English (UK/US)',
    lang_tw: 'Twi (Akan / Ghana)',
    lang_fr: 'Français (French)',
    lang_ar: 'العربية (Arabic)'
  },

  fr: {
    // Nav & Common (French)
    clients: 'Clients',
    runway: 'Production',
    ledger: 'Comptabilité',
    inventory: 'Inventaire',
    directory: 'Répertoire',
    stage: 'Étape',
    financials: 'Finances',
    materials: 'Tissus & Fournitures',
    quickAdd: '+ Ajouter un client',
    settings: 'Paramètres',
    searchPlaceholder: 'Rechercher clients, étiquette, tél...',
    all: 'Tous',
    vip: 'VIP',
    active: 'Actifs',
    pendingDeposit: 'Acomptes en attente',
    activeFilter: 'Filtre actif',
    allDesigners: 'Tous les designers',

    // Header & Studio
    masterAtelier: 'Maître Atelier',
    masterAtelierPlatform: 'Plateforme Maître Atelier',
    liveCloud: 'Supabase En direct',
    syncing: 'Synchronisation...',
    localCache: 'Cache local',
    free: 'Gratuit',
    masterTier: 'Maître',
    enterprise: 'Entreprise',
    cert: 'Certificat 📜',
    certLocked: 'Verrouillé 🔒',
    alerts: 'Alertes',
    fabricAi: 'Tissu IA',
    language: 'Langue',
    selectLanguage: 'Sélectionnez la langue',

    // Metrics
    activeDossiers: 'Clients Actifs',
    unpaidDeposits: 'Acomptes en Attente',
    completedGarments: 'Vêtements en Atelier',
    totalRevenue: 'Revenu Total Atelier',
    viewRunway: 'Voir la Production →',
    viewLedger: 'Voir la Comptabilité →',
    activeRunwayDesc: 'en cours de confection',
    collectDep: 'Encaisser →',

    // Runway Stages
    stage_consult: 'CONSULTATION',
    stage_cutting: 'COUPE',
    stage_sewing: 'COUTURE',
    stage_fitting: 'ESSAYAGE',
    stage_ready: 'PRÊT AU RETRAIT',
    stage_delivered: 'LIVRÉ',

    // Client Cards
    measure: 'Mesurer',
    edit: 'Modifier',
    call: 'Appeler',
    chat: 'WhatsApp',
    deposit: 'Acompte',
    paidInFull: 'Payé en totalité ✓',
    due: 'Dû',
    stageLabel: 'Étape',
    customerDirectory: 'RÉPERTOIRE CLIENTS',
    swipeTip: 'Glissez à gauche pour WhatsApp et appels • Appuyez pour voir le dossier',
    activeCount: 'Dossiers Actifs',
    showingOf: 'Affichage de {shown} sur {total} dossiers clients',
    openFullDirectory: 'Cliquez ci-dessous pour ouvrir le répertoire complet',
    viewAllClients: 'Voir tous les clients ({count})',
    newConsult: '+ Nouvelle Consultation',
    noClientsYet: 'Aucun dossier client pour le moment',
    noClientsDesc: 'Votre répertoire client est prêt. Cliquez ci-dessous pour ajouter votre première consultation et prendre des mesures.',
    createFirstClient: '+ Créer la première consultation',

    // Actions & Buttons
    save: 'Enregistrer',
    cancel: 'Annuler',
    close: 'Fermer',
    delete: 'Supprimer',
    confirm: 'Confirmer',
    back: 'Retour',
    done: 'Terminé',
    loading: 'Chargement...',

    // Apprentice & Linked Studio
    linkedMasterAtelier: 'MAÎTRE ATELIER CONNECTÉ',
    master: 'Maître',
    apprenticeRegistry: 'Registre des Apprentis & Formation',
    linkNewApprentice: '+ Associer un nouvel apprenti',
    workshopCode: "Code de l'Atelier",

    // Language selector
    lang_en: 'English (UK/US)',
    lang_tw: 'Twi (Akan / Ghana)',
    lang_fr: 'Français (French)',
    lang_ar: 'العربية (Arabic)'
  },

  ar: {
    // Nav & Common (Arabic)
    clients: 'العملاء',
    runway: 'خط الإنتاج',
    ledger: 'دفتر الحسابات',
    inventory: 'المخزون',
    directory: 'الدليل',
    stage: 'المرحلة',
    financials: 'المالية',
    materials: 'الأقمشة والمواد',
    quickAdd: '+ إضافة عميل سريع',
    settings: 'الإعدادات',
    searchPlaceholder: 'ابحث عن عميل، نوع الزي، رقم الهاتف...',
    all: 'الكل',
    vip: 'عميل مميز (VIP)',
    active: 'نشط',
    pendingDeposit: 'دفعات معلقة',
    activeFilter: 'تصفية نشطة',
    allDesigners: 'جميع المصممين',

    // Header & Studio
    masterAtelier: 'المشغل الرئيسي',
    masterAtelierPlatform: 'منصة المشغل الرئيسي',
    liveCloud: 'متزامن سحابياً',
    syncing: 'جاري المزامنة...',
    localCache: 'ذاكرة محلية',
    free: 'مجاني',
    masterTier: 'محترف',
    enterprise: 'مؤسسات',
    cert: 'الشهادة 📜',
    certLocked: 'مقفلة 🔒',
    alerts: 'التنبيهات',
    fabricAi: 'ذكاء الأقمشة AI',
    language: 'اللغة',
    selectLanguage: 'اختر لغة التطبيق',

    // Metrics
    activeDossiers: 'العملاء النشطون',
    unpaidDeposits: 'الدفعات المعلقة',
    completedGarments: 'ملابس قيد التنفيذ',
    totalRevenue: 'إجمالي إيرادات المشغل',
    viewRunway: 'عرض خط الإنتاج ←',
    viewLedger: 'عرض الحسابات ←',
    activeRunwayDesc: 'قيد الخياطة والإنتاج',
    collectDep: 'تحصيل ←',

    // Runway Stages
    stage_consult: 'استشارة وتصميم',
    stage_cutting: 'قص القماش',
    stage_sewing: 'الخياطة والحياكة',
    stage_fitting: 'البروفة والقياس',
    stage_ready: 'جاهز للاستلام',
    stage_delivered: 'تم التسليم',

    // Client Cards
    measure: 'القياسات',
    edit: 'تعديل',
    call: 'اتصال',
    chat: 'واتساب',
    deposit: 'دفعة',
    paidInFull: 'مدفوع بالكامل ✓',
    due: 'المتبقي',
    stageLabel: 'المرحلة',
    customerDirectory: 'دليل ملفات العملاء',
    swipeTip: 'اسحب لليسار للواتساب والاتصال • اضغط لفتح ملف العميل الكامل',
    activeCount: 'ملفات العملاء النشطة',
    showingOf: 'عرض {shown} من أصل {total} ملف عميل',
    openFullDirectory: 'اضغط أدناه لفتح دليل العملاء بالكامل',
    viewAllClients: 'عرض جميع العملاء ({count})',
    newConsult: '+ استشارة عميل جديد',
    noClientsYet: 'لا توجد ملفات عملاء حالياً',
    noClientsDesc: 'دليل المشغل جاهز ونظيف. اضغط أدناه لإضافة أول عميل وتسجيل قياسات الأزياء بدقة.',
    createFirstClient: '+ إنشاء أول استشارة عميل',

    // Actions & Buttons
    save: 'حفظ',
    cancel: 'إلغاء',
    close: 'إغلاق',
    delete: 'حذف',
    confirm: 'تأكيد',
    back: 'رجوع',
    done: 'تم',
    loading: 'جاري التحميل...',

    // Apprentice & Linked Studio
    linkedMasterAtelier: 'المشغل الرئيسي المتصل',
    master: 'المعلم الرئيسي',
    apprenticeRegistry: 'سجل المتدربين والمنهج التدريبي',
    linkNewApprentice: '+ ربط متدرب جديد',
    workshopCode: 'رمز ورشة العمل',

    // Language selector
    lang_en: 'English (UK/US)',
    lang_tw: 'Twi (Akan / Ghana)',
    lang_fr: 'Français (French)',
    lang_ar: 'العربية (Arabic)'
  }
} as const;

export type TranslationKey = keyof typeof translations.en;
