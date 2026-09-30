export const counselPepTalks = [
  "CLAT 2027 is on December 6th. Every page you read today brings NLS closer. 💜",
  "Hey Sukhman! Remember why you started. NLS Bangalore is waiting for someone with your passion and drive. ⚖️✨",
  "120 questions. 120 minutes. But today is about deliberate mastery. One concept, one case law at a time. 👑",
  "Your legal mind is getting sharper with every mock passage you dissect. Counsel is proud of you! 🌟",
  "When the reading fatigue sets in, pause, take a breath, and envision walking through the iconic gates of NLSIU. 🏛️",
  "Accuracy over guesswork, Sukhman. Protect your +1s and eliminate the -0.25s. You've got this! 🎯",
  "Don't forget to smile today! A calm, joyful mind absorbs legal principles twice as fast. 🌸"
];

export function getCounselDailyMessage() {
  const day = new Date().getDay();
  return counselPepTalks[day % counselPepTalks.length];
}
