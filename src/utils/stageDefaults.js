export const DEFAULT_STAGE_LABELS = [
  { level: 1,  label: 'Fremder',          isSafe: false },
  { level: 2,  label: 'Bekannter',        isSafe: false },
  { level: 3,  label: 'Flüchtiger',       isSafe: false },
  { level: 4,  label: 'Netter Typ',       isSafe: false },
  { level: 5,  label: 'Bekanntschaft',    isSafe: true  },
  { level: 6,  label: 'Kollege',          isSafe: false },
  { level: 7,  label: 'Kumpel',           isSafe: false },
  { level: 8,  label: 'Freund',           isSafe: false },
  { level: 9,  label: 'Guter Freund',     isSafe: false },
  { level: 10, label: 'Vertrauter',       isSafe: true  },
  { level: 11, label: 'Bester Freund',    isSafe: false },
  { level: 12, label: 'Herzensmensch',    isSafe: false },
  { level: 13, label: 'Seelenverwandter', isSafe: false },
  { level: 14, label: 'Lebensmensch',     isSafe: false },
  { level: 15, label: 'Seelenmensch',     isSafe: false },
];

export function getSafeStageFor(currentStage, stageLabels = DEFAULT_STAGE_LABELS) {
  const safeStages = stageLabels
    .filter(s => s.isSafe && s.level <= currentStage)
    .map(s => s.level);
  return safeStages.length > 0 ? Math.max(...safeStages) : 0;
}

export function getStageName(level, stageLabels = DEFAULT_STAGE_LABELS) {
  const found = stageLabels.find(s => s.level === level);
  return found ? found.label : `Stufe ${level}`;
}
