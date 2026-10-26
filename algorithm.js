export const ELEMENTS = ['木', '火', '土', '金', '水'];
export const PILLAR_NAMES = ['年柱', '月柱', '日柱', '时柱'];
const STEMS = [...'甲乙丙丁戊己庚辛壬癸'];
const BRANCHES = [...'子丑寅卯辰巳午未申酉戌亥'];
const STEM_ELEMENTS = Object.fromEntries(
  STEMS.map((stem, index) => [stem, Math.floor(index / 2)]),
);

export const BRANCH_ROOTS = {
  子: { 癸: 10 }, 丑: { 己: 6, 辛: 3, 癸: 1 },
  寅: { 甲: 6, 丙: 3, 戊: 1 }, 卯: { 乙: 10 },
  辰: { 戊: 6, 乙: 3, 癸: 1 }, 巳: { 丙: 6, 戊: 3, 庚: 1 },
  午: { 丁: 7, 己: 3 }, 未: { 己: 6, 丁: 3, 乙: 1 },
  申: { 庚: 6, 壬: 3, 戊: 1 }, 酉: { 辛: 10 },
  戌: { 戊: 6, 辛: 3, 丁: 1 }, 亥: { 壬: 7, 甲: 3 },
};

export const SEASON_HUNDREDTHS = {
  寅: [160, 125, 100, 70, 80], 卯: [170, 120, 95, 65, 75],
  辰: [120, 100, 140, 90, 90], 巳: [110, 160, 110, 70, 60],
  午: [90, 170, 120, 60, 50], 未: [90, 130, 150, 80, 70],
  申: [70, 80, 110, 160, 120], 酉: [60, 70, 100, 170, 110],
  戌: [80, 90, 150, 130, 100], 亥: [100, 70, 90, 120, 160],
  子: [90, 60, 80, 130, 170], 丑: [80, 70, 140, 120, 130],
};

export const TRANSFORM_HUNDREDTHS = [
  [77, 0, 0, -15, 8],
  [8, 77, 0, 0, -15],
  [-15, 8, 77, 0, 0],
  [0, -15, 8, 77, 0],
  [0, 0, -15, 8, 77],
];

export function parsePillars(input) {
  let pillars;
  if (typeof input === 'string') {
    const compact = input.replace(/[\s,，、;；|｜年月日时時柱]+/gu, '');
    if (compact.length !== 8) {
      throw new Error('请输入完整八字：四柱共八个字，例如「丙戌 己亥 癸丑 戊午」。');
    }
    pillars = compact.match(/.{2}/gu);
  } else if (Array.isArray(input) && input.length === 4) {
    pillars = input.map(pillar => String(pillar).trim());
  } else {
    throw new Error('请按年柱、月柱、日柱、时柱的顺序输入四柱。');
  }
  for (const [index, pillar] of pillars.entries()) {
    const [stem, branch] = pillar;
    let message = '';
    if (!pillar) message = `请填写${PILLAR_NAMES[index]}。`;
    else if (pillar.length !== 2 || !STEMS.includes(stem) || !BRANCHES.includes(branch)) {
      message = `${PILLAR_NAMES[index]}应为一个天干和一个地支，例如「甲子」。`;
    } else if (STEMS.indexOf(stem) % 2 !== BRANCHES.indexOf(branch) % 2) {
      message = `${PILLAR_NAMES[index]}「${pillar}」不是有效的干支组合，请检查输入。`;
    }
    if (message) {
      const error = new Error(message);
      error.pillarIndex = index;
      throw error;
    }
  }
  return pillars;
}

export function calculate(input) {
  const pillars = parsePillars(input);
  const initial = Array(5).fill(0);
  const contributions = [];
  for (const [index, pillar] of pillars.entries()) {
    const [stem, branch] = pillar;
    const stemPoints = Array(5).fill(0);
    const branchPoints = Array(5).fill(0);
    stemPoints[STEM_ELEMENTS[stem]] = 10;
    for (const [hiddenStem, points] of Object.entries(BRANCH_ROOTS[branch])) {
      branchPoints[STEM_ELEMENTS[hiddenStem]] += points;
    }
    for (let elementIndex = 0; elementIndex < 5; elementIndex++) {
      initial[elementIndex] += stemPoints[elementIndex] + branchPoints[elementIndex];
    }
    contributions.push(
      { pillar: PILLAR_NAMES[index], character: stem, kind: '天干',
        detail: `${stem}${ELEMENTS[STEM_ELEMENTS[stem]]}10`, points: stemPoints },
      { pillar: PILLAR_NAMES[index], character: branch, kind: '地支',
        detail: Object.entries(BRANCH_ROOTS[branch]).map(([hiddenStem, points]) => `${hiddenStem}${points}`).join('、'),
        points: branchPoints },
    );
  }
  const initialTotal = initial.reduce((total, points) => total + points, 0);
  if (initialTotal !== 80) throw new Error('原始计分校验失败：E₀合计必须为80。');
  const monthBranch = pillars[1][1];
  const seasonalUnits = initial.map((points, index) => points * SEASON_HUNDREDTHS[monthBranch][index]);
  const finalUnits = TRANSFORM_HUNDREDTHS.map(row =>
    row.reduce((total, coefficient, index) => total + coefficient * seasonalUnits[index], 0),
  );
  const indices = ELEMENTS.map((element, index) => index).sort(
    (left, right) => finalUnits[right] - finalUnits[left] || left - right,
  );
  const ranking = [];
  for (const [position, index] of indices.entries()) {
    const tied = position > 0 && finalUnits[index] === finalUnits[indices[position - 1]];
    ranking.push({ element: ELEMENTS[index], value: finalUnits[index] / 10000,
      rank: tied ? ranking[position - 1].rank : position + 1 });
  }
  const rankingGroups = [];
  for (const entry of ranking) {
    const previous = rankingGroups.at(-1);
    if (previous && previous.rank === entry.rank) previous.elements.push(entry.element);
    else rankingGroups.push({ rank: entry.rank, elements: [entry.element] });
  }
  const dayStem = pillars[2][0];
  const dayElement = ELEMENTS[STEM_ELEMENTS[dayStem]];
  return {
    pillars, chart: pillars.join(' '), monthBranch, dayStem, dayElement,
    dayRank: ranking.find(entry => entry.element === dayElement).rank,
    initial, initialTotal, contributions,
    seasonalFactors: SEASON_HUNDREDTHS[monthBranch].map(coefficient => coefficient / 100),
    seasonal: seasonalUnits.map(points => points / 100),
    final: finalUnits.map(points => points / 10000),
    total: finalUnits.reduce((total, points) => total + points, 0) / 10000,
    ranking,
    rankingText: rankingGroups.map(group => group.elements.join(' = ')).join(' > '),
    hasTies: rankingGroups.length < 5,
  };
}
