export const ELASTICITY_KEYS = [-10, -5, 0, 5, 10]

export const CAPITALIZE = (sentence) => {
  const splitSentence = sentence.split(' ');
  for (let i = 0; i < splitSentence.length; i++) {
    splitSentence[i] = splitSentence[i].charAt(0).toUpperCase() + splitSentence[i].substring(1);
  }
  return splitSentence.join(' ');
}

export const PAGE_SIZE = 20;