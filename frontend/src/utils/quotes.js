export const quotes = [
  {
    quote: "Justice is truth in action. Every legal doctrine you conquer today carves your path to NLS Bangalore.",
    author: "Benjamin Disraeli / Counsel for Sukhman"
  },
  {
    quote: "The law is reason, free from passion. Train your intellect to be razor-sharp, Sukhman.",
    author: "Aristotle"
  },
  {
    quote: "Constitution is not a mere lawyer's document, it is a vehicle of Life, and its spirit is always the spirit of Age.",
    author: "Dr. B.R. Ambedkar"
  },
  {
    quote: "December 6, 2026 is not just an exam date — it's the gateway to the red-brick halls of NLSIU Bangalore.",
    author: "Counsel's Daily Conviction"
  },
  {
    quote: "In law, what seems impossible today becomes precedent tomorrow. Keep solving, keep believing.",
    author: "Justice H.R. Khanna"
  },
  {
    quote: "Small disciplines repeated with consistency every day lead to great achievements on exam day.",
    author: "John C. Maxwell"
  },
  {
    quote: "You don't have to be great to start, but you have to start to walk into NLS Bangalore as a scholar.",
    author: "Counsel"
  }
];

export function getDailyQuote() {
  const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0)) / 1000 / 60 / 60 / 24);
  return quotes[dayOfYear % quotes.length];
}
