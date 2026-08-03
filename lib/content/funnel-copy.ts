export const funnelCopy = {
  signIn: {
    eyebrow: "IMSU Psychology exam prep",
    heading: "Welcome to your IMSU exam companion",
    greeting: "Hi 👋",
    body: "Kindly use your Google account to create your account and get started. This helps us personalize your exam timetable, recommend the right courses for your level, and save your progress.",
    button: "Continue with Google",
    trust: "Your account is safe. We only use your Google details to create your student profile."
  },
  levelSelection: {
    eyebrow: "Personal setup",
    heading: "Let's personalize your experience",
    body: "Tell us your current level so we can prepare the right exam materials and timetable for you.",
    button: "Continue"
  },
  founder: {
    eyebrow: "A note before you begin",
    title: "A message from the creator",
    button: "Start my free exams",
    signature: "— Martinz"
  },
  firstExamSuccess: {
    title: (name: string) => `Nice work, ${name}! 🎉`,
    body: [
      "You just completed your first exam preparation.",
      "Keep going. Your second free exam is waiting for you.",
      "Small steps like this add up before exam day."
    ],
    button: "Continue preparing"
  },
  paywall: {
    title: (name: string) => `Hey ${name}, Martinz here again 👋`,
    button: (price: string) => `Unlock all courses — ${price}`
  },
  trialReminder: {
    greeting: (name: string) => `Hi ${name} 👋`,
    continue: "Continue preparing",
    dismiss: "Maybe later"
  },
  paymentSuccess: {
    title: (name: string) => `You're all set, ${name}! 🎉`,
    body: [
      "Welcome to full access.",
      "You now have everything you need to prepare for your exams.",
      "Start with the courses closest to your exam dates and keep building momentum.",
      "Good luck, you've got this 💪"
    ]
  }
} as const;

export function getFirstName(fullName: string | null | undefined) {
  return fullName?.trim().split(/\s+/)[0] || "there";
}

export function formatPlanPrice(plan: { amountMinor: number; currency: string } | null) {
  if (!plan) return null;

  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: plan.currency,
    maximumFractionDigits: 0
  }).format(plan.amountMinor / 100);
}

export function founderMessage(name: string, price: string) {
  return [
    `Hi ${name} 👋`,
    "My name is Martinz, and I created this platform specifically for IMSU students.",
    "I know how stressful exam periods can become.",
    "Sometimes lectures move too quickly. Sometimes the semester becomes overwhelming. Sometimes you realize exams are approaching and you are not sure where to start.",
    "I built this platform because I wanted students to have a simpler way to prepare.",
    "A place where you can see your exam timetable, know what courses to focus on, and prepare with more confidence.",
    "My goal is simple: to help you walk into your exams feeling more prepared.",
    "I have put together the resources you need to get started.",
    `I would honestly love to make everything completely free, but building and maintaining software comes with real costs — servers, development, and keeping everything running smoothly. So I have tried to make it as affordable as possible. Full access is ${price} once. No subscriptions. No hidden charges.`,
    "But before you decide anything, I want you to experience it yourself.",
    "I have given you 2 free exam preparations so you can test the platform and see if it helps you.",
    "Try them out. If you find it useful, you can unlock everything later.",
    "I hope this helps you prepare better.",
    "Good luck with your exams ❤️"
  ];
}

export function paywallMessage(price: string) {
  return [
    "Looks like you have completed your two free exam preparations.",
    "I hope you enjoyed using the platform and that it helped you organize your study process.",
    `You can now unlock access to all available courses across the platform. With one payment of ${price}, you get full access to the available exam preparation content.`,
    "No subscription. No recurring payments.",
    "Just prepare, learn, and focus on passing your exams."
  ];
}

export function trialReminderMessage(price: string) {
  return [
    "It's Martinz again.",
    "I noticed today is your last free exam preparation.",
    "Before you leave, I just wanted to ask: did the platform help you prepare better for your previous exam?",
    `If yes, I would love for you to continue using it. You can unlock the rest of your exam preparations for ${price} and continue preparing without interruptions.`,
    "Either way, thank you for giving it a try.",
    "I built this because I genuinely want IMSU students to have an easier exam experience.",
    "Good luck with your exams ❤️"
  ];
}
