// Realistic sample data for the child planner in Arabic
export const defaultSettings = {
  appName: "أسبوعي",
  childName: "ريان",
  childAge: 8,
  avatarType: "preset", // "preset" | "uploaded"
  avatarPreset: "assets/avatar_son.jpg",
  avatarDataUrl: null,
  theme: "light", // "light" | "dark"
  schoolDays: [0, 1, 2, 3, 4], // الأحد (0) إلى الخميس (4) - المعيار في أغلب الدول العربية
  weekendDays: [5, 6], // الجمعة والسبت
  schoolHours: { start: "07:30", end: "13:30" },
  sleepHours: { wake: "05:00", bed: "20:30" },
  subjects: [
    { id: "math", name: "الرياضيات", color: "#8B5CF6", icon: "🔢" },
    { id: "arabic", name: "اللغة العربية", color: "#10B981", icon: "📖" },
    { id: "science", name: "العلوم والطبيعة", color: "#06B6D4", icon: "🔬" },
    { id: "english", name: "اللغة الإنجليزية", color: "#F59E0B", icon: "🔤" },
    { id: "islamic", name: "التربية الإسلامية والقرآن", color: "#14B8A6", icon: "🕌" },
    { id: "art", name: "الرسم والفنون", color: "#EC4899", icon: "🎨" }
  ],
  clubs: [
    {
      id: "swim_club",
      name: "نادي السباحة",
      days: [1, 3], // الإثنين والأربعاء
      start: "16:30",
      end: "17:30",
      location: "المسبح الرياضي الأولمبي",
      prepMinutes: 30,
      icon: "🏊‍♂️",
      color: "#0284C7"
    },
    {
      id: "football_club",
      name: "أكاديمية كرة القدم",
      days: [6], // السبت
      start: "10:00",
      end: "11:30",
      location: "ملعب الحي الأخضر",
      prepMinutes: 20,
      icon: "⚽",
      color: "#16A34A"
    }
  ],
  reminders: {
    enabled: true,
    leadMinutes: 15,
    soundEnabled: true,
    studyReminders: true,
    clubReminders: true,
    breakReminders: true,
    prayerReminders: true
  },
  rewards: [
    { id: 1, title: "اختيار فيلم سهرة العطلة", starsRequired: 10, icon: "🎬", claimed: false },
    { id: 2, title: "نزهة عائلية في الحديقة المائية", starsRequired: 20, icon: "🎡", claimed: false },
    { id: 3, title: "وجبة طعام مفضلة أو مثلجات", starsRequired: 15, icon: "🍦", claimed: false },
    { id: 4, title: "ساعة لعب إضافية بالألعاب المفضلة", starsRequired: 25, icon: "🎮", claimed: false }
  ],
  stickers: [
    { id: "s1", name: "صاروخ الفضاء", icon: "🚀", unlocked: true },
    { id: "s2", name: "النجم الساطع", icon: "⭐", unlocked: true },
    { id: "s3", name: "الدب المحب", icon: "🧸", unlocked: true },
    { id: "s4", name: "البطل الخارق", icon: "🦸‍♂️", unlocked: false },
    { id: "s5", name: "التاج الذهبي", icon: "👑", unlocked: false },
    { id: "s6", name: "الدلفين الذكي", icon: "🐬", unlocked: false },
    { id: "s7", name: "قوس قزح البهيج", icon: "🌈", unlocked: false },
    { id: "s8", name: "ميدالية التفوق", icon: "🏅", unlocked: false }
  ],
  starsEarned: 0,
  parentPin: "1234",
  activeAccount: "child", // "child" | "parent"
  defaultAccount: "child", // "child" | "parent"
  gameConfig: {
    enabled: true,
    difficulty: "medium", // "easy" | "medium" (10 years) | "hard"
    defaultPlayMinutes: 15,
    allowedWindowEnabled: true,
    allowedWindowStart: "16:00",
    allowedWindowEnd: "20:00",
    requireMathOrPin: "math", // "math" | "pin" | "both"
    dailyLimitMinutes: 30,
    playedTodayMinutes: 0,
    highScore: 0
  }
};

export const defaultSchedule = [
  // ==============================================
  // الأحد (اليوم الدراسي الأول)
  // ==============================================
  {
    id: "sun-fajr",
    day: 0,
    title: "صلاة الفجر وبداية يوم مبارك 🕌",
    category: "prayer",
    subject: null,
    startTime: "05:00",
    endTime: "05:25",
    notes: "ركعتا الفجر والوضوء، وبداية يوم مليء بالنور والنشاط",
    location: "المنزل أو المسجد",
    isFlexible: false,
    completed: false
  },
  {
    id: "item-sun-1",
    day: 0,
    title: "الدوام المدرسي الصباحي",
    category: "school",
    subject: null,
    startTime: "07:30",
    endTime: "13:30",
    notes: "يوم دراسي ممتع مع الأصدقاء والمعلمين",
    location: "المدرسة الابتدائية",
    isFlexible: false,
    completed: false
  },
  {
    id: "sun-dhuhr",
    day: 0,
    title: "صلاة الظهر 🕌",
    category: "prayer",
    subject: null,
    startTime: "13:40",
    endTime: "14:00",
    notes: "صلاة الظهر بعد العودة من المدرسة وراحة البال",
    location: "المنزل",
    isFlexible: false,
    completed: false
  },
  {
    id: "item-sun-2",
    day: 0,
    title: "وجبة غداء لذيذة واسترخاء",
    category: "meal",
    subject: null,
    startTime: "14:00",
    endTime: "15:00",
    notes: "تناول وجبة متوازنة وشرب الماء مع الأسرة",
    location: "المنزل",
    isFlexible: true,
    completed: false
  },
  {
    id: "sun-asr",
    day: 0,
    title: "صلاة العصر وأذكار المساء 🕌",
    category: "prayer",
    subject: null,
    startTime: "15:30",
    endTime: "15:50",
    notes: "أداء صلاة العصر في وقتها وحفظ الأذكار الجميلة",
    location: "المنزل",
    isFlexible: false,
    completed: false
  },
  {
    id: "item-sun-3",
    day: 0,
    title: "حل واجب الرياضيات واللغة العربية",
    category: "homework",
    subject: "math",
    startTime: "16:00",
    endTime: "16:50",
    notes: "تمارين كتاب الرياضيات وقراءة الدرس",
    location: "غرفة المذاكرة",
    isFlexible: false,
    completed: false
  },
  {
    id: "sun-quran",
    day: 0,
    title: "درس حفظ ومراجعة القرآن الكريم 📖",
    category: "quran",
    subject: "islamic",
    startTime: "17:00",
    endTime: "17:40",
    notes: "حفظ آيات جديدة من سورة النبأ مع الترتيل والتسميع لماما أو بابا",
    location: "غرفة الجلوس الهادئة",
    isFlexible: false,
    completed: false
  },
  {
    id: "sun-maghrib",
    day: 0,
    title: "صلاة المغرب جماعة 🕌",
    category: "prayer",
    subject: null,
    startTime: "18:05",
    endTime: "18:25",
    notes: "صلاة المغرب مع الأسرة جماعة",
    location: "المنزل",
    isFlexible: false,
    completed: false
  },
  {
    id: "item-sun-6",
    day: 0,
    title: "وقت حر ولعب مع الأسرة",
    category: "freetime",
    subject: null,
    startTime: "18:30",
    endTime: "19:30",
    notes: "ألعاب تركيب وبناء ورسم حر",
    location: "المنزل",
    isFlexible: true,
    completed: false
  },
  {
    id: "sun-isha",
    day: 0,
    title: "صلاة العشاء وسنة الوضوء 🕌",
    category: "prayer",
    subject: null,
    startTime: "19:35",
    endTime: "19:55",
    notes: "صلاة العشاء والحمد والشكر لله على يوم جميل ومثمر",
    location: "المنزل",
    isFlexible: false,
    completed: false
  },
  {
    id: "item-sun-7",
    day: 0,
    title: "الاستعداد للنوم وقصة ما قبل النوم",
    category: "sleep",
    subject: null,
    startTime: "20:00",
    endTime: "20:45",
    notes: "تنظيف الأسنان وقراءة أذكار النوم",
    location: "غرفة النوم",
    isFlexible: false,
    completed: false
  },

  // ==============================================
  // الإثنين (يوم نادي السباحة)
  // ==============================================
  {
    id: "mon-fajr",
    day: 1,
    title: "صلاة الفجر وبداية يوم مبارك 🕌",
    category: "prayer",
    subject: null,
    startTime: "05:00",
    endTime: "05:25",
    notes: "صلاة الفجر والدعاء ببداية أسبوع ميسرة",
    location: "المنزل",
    isFlexible: false,
    completed: false
  },
  {
    id: "item-mon-1",
    day: 1,
    title: "الدوام المدرسي الصباحي",
    category: "school",
    subject: null,
    startTime: "07:30",
    endTime: "13:30",
    notes: "حصة العلوم والتربية البدنية اليوم",
    location: "المدرسة",
    isFlexible: false,
    completed: false
  },
  {
    id: "mon-dhuhr",
    day: 1,
    title: "صلاة الظهر 🕌",
    category: "prayer",
    subject: null,
    startTime: "13:40",
    endTime: "14:00",
    notes: "صلاة الظهر بعد الرجوع من المدرسة",
    location: "المنزل",
    isFlexible: false,
    completed: false
  },
  {
    id: "item-mon-2",
    day: 1,
    title: "غداء وقيلولة خفيفة",
    category: "meal",
    subject: null,
    startTime: "14:00",
    endTime: "15:00",
    notes: "راحة هادئة لشحن الطاقة للسباحة",
    location: "المنزل",
    isFlexible: true,
    completed: false
  },
  {
    id: "mon-asr",
    day: 1,
    title: "صلاة العصر 🕌",
    category: "prayer",
    subject: null,
    startTime: "15:30",
    endTime: "15:50",
    notes: "صلاة العصر قبل التوجه للنادي الرياضي",
    location: "المنزل",
    isFlexible: false,
    completed: false
  },
  {
    id: "item-mon-3",
    day: 1,
    title: "تجهيز الحقيبة والانطلاق لنادي السباحة",
    category: "club",
    subject: null,
    startTime: "16:00",
    endTime: "16:30",
    notes: "وضع المنشفة ونظارة السباحة وملابس التدريب",
    location: "المنزل ثم السيارة",
    isFlexible: false,
    completed: false
  },
  {
    id: "item-mon-4",
    day: 1,
    title: "تدريب نادي السباحة 🏊‍♂️",
    category: "club",
    subject: null,
    startTime: "16:30",
    endTime: "17:30",
    notes: "تمارين الطفو والتنفس والسباحة الحرة",
    location: "المسبح الأولمبي",
    isFlexible: false,
    completed: false
  },
  {
    id: "mon-maghrib",
    day: 1,
    title: "صلاة المغرب 🕌",
    category: "prayer",
    subject: null,
    startTime: "17:50",
    endTime: "18:10",
    notes: "أداء صلاة المغرب بعد العودة من النادي",
    location: "المنزل",
    isFlexible: false,
    completed: false
  },
  {
    id: "mon-quran",
    day: 1,
    title: "درس حفظ القرآن الكريم والتسميع 📖",
    category: "quran",
    subject: "islamic",
    startTime: "18:15",
    endTime: "18:45",
    notes: "مراجعة صفحة الحفظ اليومي وتكرار الآيات بخشوع",
    location: "غرفة المذاكرة",
    isFlexible: false,
    completed: false
  },
  {
    id: "item-mon-5",
    day: 1,
    title: "واجبات المدرسة ومذاكرة خفيفة",
    category: "homework",
    subject: "english",
    startTime: "18:50",
    endTime: "19:30",
    notes: "واجب اللغة الإنجليزية والعلوم",
    location: "غرفة المذاكرة",
    isFlexible: false,
    completed: false
  },
  {
    id: "mon-isha",
    day: 1,
    title: "صلاة العشاء 🕌",
    category: "prayer",
    subject: null,
    startTime: "19:35",
    endTime: "19:55",
    notes: "صلاة العشاء وشكر الله على نعم اليوم",
    location: "المنزل",
    isFlexible: false,
    completed: false
  },
  {
    id: "item-mon-6",
    day: 1,
    title: "عشاء صحي والاستعداد للنوم",
    category: "sleep",
    subject: null,
    startTime: "20:00",
    endTime: "20:45",
    notes: "كوب حليب دافئ ونوم مريح وهادئ",
    location: "غرفة النوم",
    isFlexible: false,
    completed: false
  },

  // ==============================================
  // الثلاثاء
  // ==============================================
  {
    id: "tue-fajr",
    day: 2,
    title: "صلاة الفجر 🕌",
    category: "prayer",
    subject: null,
    startTime: "05:00",
    endTime: "05:25",
    notes: "صلاة الفجر والوضوء",
    location: "المنزل",
    isFlexible: false,
    completed: false
  },
  {
    id: "item-tue-1",
    day: 2,
    title: "الدوام المدرسي",
    category: "school",
    subject: null,
    startTime: "07:30",
    endTime: "13:30",
    location: "المدرسة",
    isFlexible: false,
    completed: false
  },
  {
    id: "tue-dhuhr",
    day: 2,
    title: "صلاة الظهر 🕌",
    category: "prayer",
    subject: null,
    startTime: "13:40",
    endTime: "14:00",
    location: "المنزل",
    isFlexible: false,
    completed: false
  },
  {
    id: "tue-asr",
    day: 2,
    title: "صلاة العصر 🕌",
    category: "prayer",
    subject: null,
    startTime: "15:30",
    endTime: "15:50",
    location: "المنزل",
    isFlexible: false,
    completed: false
  },
  {
    id: "item-tue-2",
    day: 2,
    title: "مذاكرة استكشافية لمادة العلوم",
    category: "study",
    subject: "science",
    startTime: "16:00",
    endTime: "16:45",
    notes: "تجربة دورة المياه والنباتات",
    location: "غرفة المذاكرة",
    isFlexible: false,
    completed: false
  },
  {
    id: "tue-quran",
    day: 2,
    title: "درس حفظ القرآن الكريم والتجويد 📖",
    category: "quran",
    subject: "islamic",
    startTime: "17:15",
    endTime: "17:55",
    notes: "تطبيق أحكام التجويد البسيطة وحفظ الآيات الجديدة",
    location: "غرفة الجلوس",
    isFlexible: false,
    completed: false
  },
  {
    id: "tue-maghrib",
    day: 2,
    title: "صلاة المغرب جماعة 🕌",
    category: "prayer",
    subject: null,
    startTime: "18:05",
    endTime: "18:25",
    location: "المنزل",
    isFlexible: false,
    completed: false
  },
  {
    id: "tue-isha",
    day: 2,
    title: "صلاة العشاء 🕌",
    category: "prayer",
    subject: null,
    startTime: "19:30",
    endTime: "19:50",
    location: "المنزل",
    isFlexible: false,
    completed: false
  },

  // ==============================================
  // الأربعاء (نادي السباحة)
  // ==============================================
  {
    id: "wed-fajr",
    day: 3,
    title: "صلاة الفجر 🕌",
    category: "prayer",
    subject: null,
    startTime: "05:00",
    endTime: "05:25",
    location: "المنزل",
    isFlexible: false,
    completed: false
  },
  {
    id: "item-wed-1",
    day: 3,
    title: "الدوام المدرسي",
    category: "school",
    subject: null,
    startTime: "07:30",
    endTime: "13:30",
    location: "المدرسة",
    isFlexible: false,
    completed: false
  },
  {
    id: "wed-dhuhr",
    day: 3,
    title: "صلاة الظهر 🕌",
    category: "prayer",
    subject: null,
    startTime: "13:40",
    endTime: "14:00",
    location: "المنزل",
    isFlexible: false,
    completed: false
  },
  {
    id: "wed-asr",
    day: 3,
    title: "صلاة العصر 🕌",
    category: "prayer",
    subject: null,
    startTime: "15:30",
    endTime: "15:50",
    location: "المنزل",
    isFlexible: false,
    completed: false
  },
  {
    id: "item-wed-2",
    day: 3,
    title: "تدريب نادي السباحة 🏊‍♂️",
    category: "club",
    subject: null,
    startTime: "16:30",
    endTime: "17:30",
    location: "المسبح الأولمبي",
    isFlexible: false,
    completed: false
  },
  {
    id: "wed-maghrib",
    day: 3,
    title: "صلاة المغرب 🕌",
    category: "prayer",
    subject: null,
    startTime: "17:50",
    endTime: "18:10",
    location: "المنزل",
    isFlexible: false,
    completed: false
  },
  {
    id: "wed-quran",
    day: 3,
    title: "درس حفظ ومراجعة القرآن الكريم 📖",
    category: "quran",
    subject: "islamic",
    startTime: "18:15",
    endTime: "18:50",
    notes: "مراجعة ما تم حفظه خلال الأسبوع وتثبيت الآيات",
    location: "غرفة الجلوس",
    isFlexible: false,
    completed: false
  },
  {
    id: "wed-isha",
    day: 3,
    title: "صلاة العشاء 🕌",
    category: "prayer",
    subject: null,
    startTime: "19:30",
    endTime: "19:50",
    location: "المنزل",
    isFlexible: false,
    completed: false
  },

  // ==============================================
  // الخميس (نهاية الأسبوع المدرسي)
  // ==============================================
  {
    id: "thu-fajr",
    day: 4,
    title: "صلاة الفجر 🕌",
    category: "prayer",
    subject: null,
    startTime: "05:00",
    endTime: "05:25",
    location: "المنزل",
    isFlexible: false,
    completed: false
  },
  {
    id: "item-thu-1",
    day: 4,
    title: "الدوام المدرسي والاحتفال بنهاية الأسبوع",
    category: "school",
    subject: null,
    startTime: "07:30",
    endTime: "13:30",
    location: "المدرسة",
    isFlexible: false,
    completed: false
  },
  {
    id: "thu-dhuhr",
    day: 4,
    title: "صلاة الظهر 🕌",
    category: "prayer",
    subject: null,
    startTime: "13:40",
    endTime: "14:00",
    location: "المنزل",
    isFlexible: false,
    completed: false
  },
  {
    id: "thu-asr",
    day: 4,
    title: "صلاة العصر 🕌",
    category: "prayer",
    subject: null,
    startTime: "15:30",
    endTime: "15:50",
    location: "المنزل",
    isFlexible: false,
    completed: false
  },
  {
    id: "thu-quran",
    day: 4,
    title: "حلقة التسميع الأسبوعية للقرآن الكريم 📖",
    category: "quran",
    subject: "islamic",
    startTime: "16:45",
    endTime: "17:25",
    notes: "تسميع سورة الأسبوع كاملة ونيل وسام الحافظ الصغير 🏅",
    location: "المنزل",
    isFlexible: false,
    completed: false
  },
  {
    id: "thu-maghrib",
    day: 4,
    title: "صلاة المغرب 🕌",
    category: "prayer",
    subject: null,
    startTime: "18:05",
    endTime: "18:25",
    location: "المنزل",
    isFlexible: false,
    completed: false
  },
  {
    id: "thu-isha",
    day: 4,
    title: "صلاة العشاء 🕌",
    category: "prayer",
    subject: null,
    startTime: "19:30",
    endTime: "19:50",
    location: "المنزل",
    isFlexible: false,
    completed: false
  },
  {
    id: "item-thu-3",
    day: 4,
    title: "أمسية ترفيهية حرة ومرح عائلي 🎉",
    category: "freetime",
    subject: null,
    startTime: "20:00",
    endTime: "22:00",
    notes: "سهرة إجازة نهاية الأسبوع مع العائلة",
    location: "المنزل",
    isFlexible: true,
    completed: false
  },

  // ==============================================
  // الجمعة (عطلة أسبوعية مباركة)
  // ==============================================
  {
    id: "fri-fajr",
    day: 5,
    title: "صلاة الفجر في المسجد 🕌",
    category: "prayer",
    subject: null,
    startTime: "05:00",
    endTime: "05:30",
    notes: "صلاة فجر الجمعة جماعة مع بابا في المسجد",
    location: "مسجد الحي",
    isFlexible: false,
    completed: false
  },
  {
    id: "fri-quran-kahf",
    day: 5,
    title: "قراءة سورة الكهف والاستعداد لصلاة الجمعة 📖",
    category: "quran",
    subject: "islamic",
    startTime: "09:30",
    endTime: "10:15",
    notes: "سنة قراءة سورة الكهف، الاغتسال، ولبس الثوب الأبيض النظيف",
    location: "المنزل",
    isFlexible: true,
    completed: false
  },
  {
    id: "fri-jumaa",
    day: 5,
    title: "صلاة الجمعة وخطبة المسجد 🕌",
    category: "prayer",
    subject: null,
    startTime: "11:30",
    endTime: "13:00",
    notes: "التبكير لصلاة الجمعة والاستماع للخطبة والإنصات",
    location: "مسجد الحي الكبير",
    isFlexible: false,
    completed: false
  },
  {
    id: "fri-asr",
    day: 5,
    title: "صلاة العصر ودعاء ساعة الإجابة 🕌",
    category: "prayer",
    subject: null,
    startTime: "15:30",
    endTime: "15:50",
    notes: "صلاة العصر والتوجه بالدعاء في ساعة الإجابة المباركة",
    location: "المنزل",
    isFlexible: false,
    completed: false
  },
  {
    id: "item-fri-1",
    day: 5,
    title: "زيارة بيت الجدة والأقارب ومرح عائلي",
    category: "freetime",
    subject: null,
    startTime: "16:00",
    endTime: "18:00",
    notes: "صلة الرحم واللعب مع أبناء العمومة",
    location: "بيت الجدة",
    isFlexible: true,
    completed: false
  },
  {
    id: "fri-maghrib",
    day: 5,
    title: "صلاة المغرب 🕌",
    category: "prayer",
    subject: null,
    startTime: "18:05",
    endTime: "18:25",
    location: "المنزل",
    isFlexible: false,
    completed: false
  },
  {
    id: "fri-isha",
    day: 5,
    title: "صلاة العشاء 🕌",
    category: "prayer",
    subject: null,
    startTime: "19:30",
    endTime: "19:50",
    location: "المنزل",
    isFlexible: false,
    completed: false
  },

  // ==============================================
  // السبت (يوم كرة القدم)
  // ==============================================
  {
    id: "sat-fajr",
    day: 6,
    title: "صلاة الفجر 🕌",
    category: "prayer",
    subject: null,
    startTime: "05:15",
    endTime: "05:40",
    notes: "صلاة الفجر والوضوء",
    location: "المنزل",
    isFlexible: false,
    completed: false
  },
  {
    id: "item-sat-1",
    day: 6,
    title: "فطور صحي ونشيط",
    category: "meal",
    subject: null,
    startTime: "08:30",
    endTime: "09:15",
    notes: "فطور متوازن قبل تمرين كرة القدم",
    location: "المنزل",
    isFlexible: true,
    completed: false
  },
  {
    id: "item-sat-2",
    day: 6,
    title: "أكاديمية كرة القدم ومباراة ودية ⚽",
    category: "club",
    subject: null,
    startTime: "10:00",
    endTime: "11:30",
    notes: "حذاء الرياضة وواقي الساق وقارورة الماء",
    location: "ملعب الحي الأخضر",
    isFlexible: false,
    completed: false
  },
  {
    id: "sat-dhuhr",
    day: 6,
    title: "صلاة الظهر 🕌",
    category: "prayer",
    subject: null,
    startTime: "12:30",
    endTime: "12:50",
    location: "المنزل",
    isFlexible: false,
    completed: false
  },
  {
    id: "sat-asr",
    day: 6,
    title: "صلاة العصر 🕌",
    category: "prayer",
    subject: null,
    startTime: "15:30",
    endTime: "15:50",
    location: "المنزل",
    isFlexible: false,
    completed: false
  },
  {
    id: "sat-quran",
    day: 6,
    title: "درس وتثبيت حفظ القرآن الكريم 📖",
    category: "quran",
    subject: "islamic",
    startTime: "16:30",
    endTime: "17:15",
    notes: "مراجعة متقنة للحفظ استعداداً للأسبوع الدراسي الجديد",
    location: "غرفة الجلوس",
    isFlexible: false,
    completed: false
  },
  {
    id: "sat-maghrib",
    day: 6,
    title: "صلاة المغرب 🕌",
    category: "prayer",
    subject: null,
    startTime: "18:05",
    endTime: "18:25",
    location: "المنزل",
    isFlexible: false,
    completed: false
  },
  {
    id: "sat-isha",
    day: 6,
    title: "صلاة العشاء 🕌",
    category: "prayer",
    subject: null,
    startTime: "19:30",
    endTime: "19:50",
    location: "المنزل",
    isFlexible: false,
    completed: false
  }
];

export const CATEGORY_DEFINITIONS = {
  prayer: { label: "صلاة وفريضة", icon: "🕌", color: "#0D9488", bg: "#CCFBF1", darkBg: "#114B44" },
  quran: { label: "حفظ القرآن", icon: "📖", color: "#059669", bg: "#D1FAE5", darkBg: "#0F4633" },
  study: { label: "مذاكرة", icon: "📚", color: "#8B5CF6", bg: "#F3E8FF", darkBg: "#3B2864" },
  homework: { label: "واجب مدرسي", icon: "✏️", color: "#0284C7", bg: "#E0F2FE", darkBg: "#163E63" },
  school: { label: "مدرسة", icon: "🏫", color: "#059669", bg: "#D1FAE5", darkBg: "#134E3A" },
  club: { label: "نادي ونشاط", icon: "⚽", color: "#D97706", bg: "#FEF3C7", darkBg: "#5C3E08" },
  rest: { label: "استراحة وراحة", icon: "🌸", color: "#DB2777", bg: "#FCE7F3", darkBg: "#5A1A3B" },
  meal: { label: "وجبة طعام", icon: "🍎", color: "#EA580C", bg: "#FFEDD5", darkBg: "#5E250A" },
  sleep: { label: "نوم وهدوء", icon: "🌙", color: "#4F46E5", bg: "#EEF2FF", darkBg: "#23245C" },
  freetime: { label: "وقت حر ومرح", icon: "🎨", color: "#65A30D", bg: "#ECFCCB", darkBg: "#2B4708" }
};

export const ARABIC_DAYS = [
  { index: 0, name: "الأحد", short: "أحد" },
  { index: 1, name: "الإثنين", short: "إثنين" },
  { index: 2, name: "الثلاثاء", short: "ثلاثاء" },
  { index: 3, name: "الأربعاء", short: "أربعاء" },
  { index: 4, name: "الخميس", short: "خميس" },
  { index: 5, name: "الجمعة", short: "جمعة" },
  { index: 6, name: "السبت", short: "سبت" }
];
