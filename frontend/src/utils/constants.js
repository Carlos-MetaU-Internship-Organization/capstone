export const ELASTICITY_KEYS = [-10, -5, 0, 5, 10];

export const CAPITALIZE = (sentence) => {
  const splitSentence = sentence.split(" ");
  for (let i = 0; i < splitSentence.length; i++) {
    splitSentence[i] =
      splitSentence[i].charAt(0).toUpperCase() + splitSentence[i].substring(1);
  }
  return splitSentence.join(" ");
};

export const EARTH_RADIUS_MILES = 3_959;
export const RADIANS_PER_DEGREE = Math.PI / 180;

export const PAGE_SIZE = 20;
export const LISTINGS_PER_CYCLE = 4;

export const ALLOWED_PAUSE_DELAY = 6000;

export const LISTING_COUNT_PER_PAGE_CAROUSEL = 4;

export const COLORS = [
  "beige",
  "black",
  "blue",
  "brown",
  "gold",
  "gray",
  "green",
  "orange",
  "purple",
  "red",
  "silver",
  "white",
  "yellow",
];
