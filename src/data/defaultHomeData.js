/**
 * staticDefaultHomeData
 *
 * Used as a fallback when the API is unreachable or returns an error.
 * All text exists in three languages so sections can pick the right one
 * exactly the same way they do with live CMS data.
 *
 * Shape mirrors the `homePageContent` object returned by the server.
 */

export const defaultHomePageContent = {
  //  Visibility toggles (all on by default)
  showFeaturedCourses: true,
  showFeaturedPrograms: true,
  showFAQSection: true,
  showAboutSection: true,
  showServicesSection: true,
  showStepsSection: true,
  showProgramSearcher: true,
  showAboutCountries: true,

  //  Hero
  heroBadge_en: "Explore Opportunities",
  heroBadge_fr: "Explorez les opportunités",
  heroBadge_ar: "استكشف الفرص",

  heroTitle_en: "Dive Into Possibilities",
  heroTitle_fr: "Plongez dans les possibilités",
  heroTitle_ar: "انغمس في الإمكانيات",

  heroSubtitle_en:
    "Join us to discover programs and courses that open doors to your future.",
  heroSubtitle_fr:
    "Rejoignez-nous pour découvrir des programmes et des cours qui ouvrent les portes de votre avenir.",
  heroSubtitle_ar: "انضم إلينا لاكتشاف برامج ودورات تفتح أبواب مستقبلك.",

  heroCta_en: "Discover Programs",
  heroCta_fr: "Découvrir les programmes",
  heroCta_ar: "اكتشف البرامج",

  //  About Us
  aboutTitle_en: "About Us",
  aboutTitle_fr: "À propos de nous",
  aboutTitle_ar: "من نحن",

  aboutDescription_en:
    "healthpathglobal is a platform dedicated to helping students study abroad. We connect you with partner universities, guide your visa process, and support your academic journey every step of the way.",
  aboutDescription_fr:
    "healthpathglobal est une plateforme dédiée à aider les étudiants à étudier à l'étranger. Nous vous connectons avec des universités partenaires, guidons votre processus de visa et soutenons votre parcours académique à chaque étape.",
  aboutDescription_ar:
    "healthpathglobal منصة مخصصة لمساعدة الطلاب على الدراسة في الخارج. نربطك بالجامعات الشريكة، ونرشدك خلال إجراءات التأشيرة، وندعم رحلتك الأكاديمية في كل خطوة.",

  studyQuote_en: '"Studying abroad can change the way you see the world"',
  studyQuote_fr:
    '"Étudier à l\'étranger peut changer la façon dont vous voyez le monde"',
  studyQuote_ar: '"الدراسة في الخارج يمكن أن تغير نظرتك للعالم"',

  featuredCountries: [
    { code: "fr", name_en: "France", name_fr: "France", name_ar: "فرنسا" },
    { code: "ca", name_en: "Canada", name_fr: "Canada", name_ar: "كندا" },
    {
      code: "gb",
      name_en: "England",
      name_fr: "Angleterre",
      name_ar: "إنجلترا",
    },
    {
      code: "de",
      name_en: "Germany",
      name_fr: "Allemagne",
      name_ar: "ألمانيا",
    },
    { code: "be", name_en: "Belgium", name_fr: "Belgique", name_ar: "بلجيكا" },
    {
      code: "us",
      name_en: "United States",
      name_fr: "États-Unis",
      name_ar: "الولايات المتحدة",
    },
  ],

  //  Steps
  stepsTitle_en: "What To Do To Study Abroad?",
  stepsTitle_fr: "Que faire pour étudier à l'étranger ?",
  stepsTitle_ar: "ماذا تفعل للدراسة في الخارج؟",

  step1Title_en: "Create an Account",
  step1Title_fr: "Créer un compte",
  step1Title_ar: "إنشاء حساب",
  step1Desc_en: "Sign up and submit your personal and academic information.",
  step1Desc_fr:
    "Inscrivez-vous et soumettez vos informations personnelles et académiques.",
  step1Desc_ar: "سجّل وأرسل معلوماتك الشخصية والأكاديمية.",

  step2Title_en: "Connect With Us",
  step2Title_fr: "Connectez-vous avec nous",
  step2Title_ar: "تواصل معنا",
  step2Desc_en: "Our team guides you through the visa process and paperwork.",
  step2Desc_fr:
    "Notre équipe vous guide tout au long du processus de visa et des formalités administratives.",
  step2Desc_ar: "يرشدك فريقنا خلال إجراءات التأشيرة والأوراق المطلوبة.",

  step3Title_en: "Submit Your Application",
  step3Title_fr: "Soumettre votre candidature",
  step3Title_ar: "قدّم طلبك",
  step3Desc_en: "Complete and submit your visa and university application.",
  step3Desc_fr: "Complétez et soumettez votre demande de visa et d'université.",
  step3Desc_ar: "أكمل وقدّم طلب التأشيرة والجامعة.",

  step4Title_en: "We Will Contact You",
  step4Title_fr: "Nous vous contacterons",
  step4Title_ar: "سنتصل بك",
  step4Desc_en: "Receive confirmation and prepare for your journey abroad.",
  step4Desc_fr:
    "Recevez la confirmation et préparez-vous pour votre voyage à l'étranger.",
  step4Desc_ar: "استلم التأكيد وابدأ التحضير لرحلتك في الخارج.",

  //  Services
  servicesTitle_en: "Our Services",
  servicesTitle_fr: "Nos Services",
  servicesTitle_ar: "خدماتنا",

  service1Title_en: "Guidance for Studying Abroad",
  service1Title_fr: "Orientation pour étudier à l'étranger",
  service1Title_ar: "توجيه للدراسة في الخارج",
  service1Desc_en:
    "Studying abroad changes your perspective and opens new opportunities.",
  service1Desc_fr:
    "Étudier à l'étranger change votre perspective et ouvre de nouvelles opportunités.",
  service1Desc_ar: "الدراسة في الخارج تغير منظورك وتفتح آفاقاً جديدة.",
  service1Cta_en: "Sign Up & Discover",
  service1Cta_fr: "Inscrivez-vous et découvrez",
  service1Cta_ar: "سجّل واكتشف",

  service2Title_en: "Online Courses",
  service2Title_fr: "Cours en ligne",
  service2Title_ar: "دورات عبر الإنترنت",
  service2Desc_en: "Learn anything, anywhere - at your own pace.",
  service2Desc_fr: "Apprenez n'importe quoi, n'importe où - à votre rythme.",
  service2Desc_ar: "تعلّم أي شيء، في أي مكان - بالوتيرة التي تناسبك.",
  service2Cta_en: "Discover All Courses",
  service2Cta_fr: "Découvrir tous les cours",
  service2Cta_ar: "اكتشف جميع الدورات",

  // Program Search Engine
  programSearcherTitle_en: "Find Your Perfect Program",
  programSearcherTitle_fr: "Trouvez votre programme idéal",
  programSearcherTitle_ar: "اعثر على برنامجك المثالي",

  programSearcherDescription_en:
    "Search for programs by country, specialty, and type. Discover exactly what you're looking for.",
  programSearcherDescription_fr:
    "Recherchez des programmes par pays, spécialité et type. Trouvez exactement ce que vous cherchez.",
  programSearcherDescription_ar:
    "ابحث عن البرامج حسب الدولة والتخصص والنوع. اكتشف بالضبط ما تبحث عنه.",

  programSearcherPlaceholder_en: "Select Country",
  programSearcherPlaceholder_fr: "Sélectionner un pays",
  programSearcherPlaceholder_ar: "اختر الدولة",

  programSearcherButtonText_en: "Search Programs",
  programSearcherButtonText_fr: "Rechercher",
  programSearcherButtonText_ar: "بحث",

  //  Filter study domains
  filterStudyDomains: [
    { id: "1", en: "Medicine", fr: "Médecine", ar: "الطب" },
    { id: "2", en: "Engineering", fr: "Ingénierie", ar: "الهندسة" },
    {
      id: "3",
      en: "Computer Science",
      fr: "Informatique",
      ar: "علوم الحاسوب",
    },
    { id: "4", en: "Business", fr: "Commerce", ar: "إدارة الأعمال" },
    { id: "5", en: "Law", fr: "Droit", ar: "القانون" },
    { id: "6", en: "Architecture", fr: "Architecture", ar: "العمارة" },
    { id: "7", en: "Languages", fr: "Langues", ar: "اللغات" },
    { id: "8", en: "Economics", fr: "Économie", ar: "الاقتصاد" },
  ],
};

/**
 * Full default home payload returned when the API call fails.
 * Mirrors the shape of homeService.getHomePageData() response.data
 */
const defaultHomeData = {
  success: true,
  _isStaticFallback: true, // flag so components can show an optional offline hint
  data: {
    statistics: {
      totalCourses: 0,
      totalPrograms: 0,
      totalStudents: 0,
      totalTeachers: 0,
    },
    featuredCourses: [],
    latestCourses: [],
    featuredPrograms: [],
    latestPrograms: [],
    faqs: [],
    contactInfo: null,
    siteSettings: {
      brandName: "healthpathglobal",
      logoUrl: null,
    },
    homePageContent: defaultHomePageContent,
  },
};

export default defaultHomeData;
