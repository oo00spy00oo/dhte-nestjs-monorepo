import _ from 'lodash';

import { LarvaCourseServiceAnalyzeGqlOutput } from '../core/outputs/analyze.output';
import { LarvaCourseServiceAnalyzeStatus } from '../core/types/enums';

export function speakingScoring({
  correctCount,
  totalPhonemes,
}: {
  correctCount: number;
  totalPhonemes: number;
}) {
  if (totalPhonemes === 0) {
    return 100;
  }
  const accuracy = Math.round((correctCount / totalPhonemes) * 100);
  if (accuracy === 100) {
    return 100;
  }
  if (accuracy === 0) {
    return 0;
  }
  const rangeStart = Math.floor(accuracy / 10) * 10 + 1;
  const rangeEnd = rangeStart + 9;
  return _.random(rangeStart, rangeEnd);
}

export function speakingScoringWord({ analyze }: { analyze: LarvaCourseServiceAnalyzeGqlOutput }) {
  const counts = _.countBy(analyze.analyzeWordPhonetics, 'status');
  const correctCount = counts[LarvaCourseServiceAnalyzeStatus.Correct] ?? 0;
  const incorrectCount = counts[LarvaCourseServiceAnalyzeStatus.Incorrect] ?? 0;
  const omittedCount = counts[LarvaCourseServiceAnalyzeStatus.Omitted] ?? 0;
  const extraCount = counts[LarvaCourseServiceAnalyzeStatus.Extra] ?? 0;

  const correctPhonemes = analyze.analyzeWordPhonetics.filter(
    (item) => item.status === LarvaCourseServiceAnalyzeStatus.Correct,
  ).length;
  if (correctPhonemes === 0) {
    return 0;
  }

  const phonemes = analyze.analyzeWordPhonetics.filter(
    (item) =>
      item.status === LarvaCourseServiceAnalyzeStatus.Correct ||
      item.status === LarvaCourseServiceAnalyzeStatus.Incorrect ||
      item.status === LarvaCourseServiceAnalyzeStatus.Omitted,
  ).length;
  // console.log(phonemes, correctCount, incorrectCount, omittedCount, extraCount);
  const avgMark = 100 / phonemes;
  const correctMark = correctCount * avgMark;
  const incorrectMark = incorrectCount * 0.35 * avgMark;
  const extraMark = extraCount * 0.5 * avgMark;
  const omittedMark = 0;
  const baseMark = correctMark + incorrectMark + omittedMark - extraMark;
  const failRate = 1 - (incorrectCount * 0.5 + omittedCount + extraCount * 0.5) / phonemes;
  const totalMark = Math.round(baseMark * (failRate > 0 ? failRate : 0));
  return totalMark;
}

export function speakingScoringSentence({
  analyze,
}: {
  analyze: LarvaCourseServiceAnalyzeGqlOutput;
}) {
  const counts = _.countBy(analyze.analyzeSentence, 'status');
  const correctCount = counts[LarvaCourseServiceAnalyzeStatus.Correct] ?? 0;
  const incorrectCount = counts[LarvaCourseServiceAnalyzeStatus.Incorrect] ?? 0;
  const omittedCount = counts[LarvaCourseServiceAnalyzeStatus.Omitted] ?? 0;
  const extraCount = counts[LarvaCourseServiceAnalyzeStatus.Extra] ?? 0;

  const correctPhonemes = analyze.analyzeSentence.filter(
    (item) => item.status === LarvaCourseServiceAnalyzeStatus.Correct,
  ).length;
  if (correctPhonemes === 0) {
    return 0;
  }

  const phonemes = analyze.analyzeSentence.filter(
    (item) =>
      item.status === LarvaCourseServiceAnalyzeStatus.Correct ||
      item.status === LarvaCourseServiceAnalyzeStatus.Incorrect ||
      item.status === LarvaCourseServiceAnalyzeStatus.Omitted,
  ).length;

  const avgMark = 100 / phonemes;
  const correctMark = correctCount * avgMark;

  const incorrectPhonemes = analyze.analyzeSentence.filter(
    (item) => item.status === LarvaCourseServiceAnalyzeStatus.Incorrect,
  );
  const incorrectMark = incorrectPhonemes.reduce((acc, item) => {
    const wordMark = speakingScoringWord({
      analyze: { analyzeWordPhonetics: item.detailPhonetics },
    });
    return acc + (wordMark * avgMark) / 100;
  }, 0);
  const extraMark = omittedCount * 0.5 * avgMark;
  const omittedMark = 0;
  const baseMark = correctMark + incorrectMark + omittedMark - extraMark;
  const failRate = 1 - (incorrectCount * 0.5 + omittedCount + extraCount * 0.5) / phonemes;
  const totalMark = Math.round(baseMark * (failRate > 0 ? failRate : 0));
  if (totalMark < 0) {
    return 0;
  }
  return totalMark;
}
