export function shouldRetryTrace(report, attempt) {
  return attempt === 0 && report?.runtimeError?.code === 'NO_NAVSTART';
}

export function assessReport(report, thresholds, { noindex = false } = {}) {
  if (!report || typeof report !== 'object' || report.runtimeError)
    throw Error('Lighthouse measurement failed');
  return Object.entries(thresholds)
    .filter(([category]) => !(noindex && category === 'seo'))
    .map(([category, minimum]) => {
      const score = report.categories?.[category]?.score;
      if (
        typeof score !== 'number' ||
        !Number.isFinite(score) ||
        score < 0 ||
        score > 1
      )
        throw Error(`Invalid Lighthouse score: ${category}`);
      if (
        typeof minimum !== 'number' ||
        !Number.isFinite(minimum) ||
        minimum < 0 ||
        minimum > 1
      )
        throw Error('Invalid Lighthouse threshold');
      return { category, minimum, score, passed: score >= minimum };
    });
}
