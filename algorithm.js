export const ELEMENTS = Object.freeze(['木', '火', '土', '金', '水']);
export const PILLAR_NAMES = Object.freeze(['年柱', '月柱', '日柱', '时柱']);

const STEMS = [...'甲乙丙丁戊己庚辛壬癸'];
const BRANCHES = [...'子丑寅卯辰巳午未申酉戌亥'];
const ELEMENT_INDEX = Object.freeze(Object.fromEntries(ELEMENTS.map((element, index) => [element, index])));
const STEM_ELEMENTS = Object.freeze(Object.fromEntries(
  STEMS.map((stem, index) => [stem, Math.floor(index / 2)]),
));

export const BRANCH_ROOTS = Object.freeze({
  子: Object.freeze({ 癸: 10 }),
  丑: Object.freeze({ 己: 6, 辛: 3, 癸: 1 }),
  寅: Object.freeze({ 甲: 6, 丙: 3, 戊: 1 }),
  卯: Object.freeze({ 乙: 10 }),
  辰: Object.freeze({ 戊: 6, 乙: 3, 癸: 1 }),
  巳: Object.freeze({ 丙: 6, 戊: 3, 庚: 1 }),
  午: Object.freeze({ 丁: 7, 己: 3 }),
  未: Object.freeze({ 己: 6, 丁: 3, 乙: 1 }),
  申: Object.freeze({ 庚: 6, 壬: 3, 戊: 1 }),
  酉: Object.freeze({ 辛: 10 }),
  戌: Object.freeze({ 戊: 6, 辛: 3, 丁: 1 }),
  亥: Object.freeze({ 壬: 7, 甲: 3 }),
});

export const BRANCH_MAIN_ELEMENT = Object.freeze({
  子: '水', 丑: '土', 寅: '木', 卯: '木', 辰: '土', 巳: '火',
  午: '火', 未: '土', 申: '金', 酉: '金', 戌: '土', 亥: '水',
});

export const GENERATING_SOURCE = Object.freeze({ 木: '水', 火: '木', 土: '火', 金: '土', 水: '金' });
export const CONTROLLING_ELEMENT = Object.freeze({ 木: '金', 火: '水', 土: '木', 金: '火', 水: '土' });

export const SEASON_HUNDREDTHS = Object.freeze({
  寅: Object.freeze([160, 125, 100, 70, 80]),
  卯: Object.freeze([170, 120, 95, 65, 75]),
  辰: Object.freeze([120, 100, 140, 90, 90]),
  巳: Object.freeze([110, 160, 110, 70, 60]),
  午: Object.freeze([90, 170, 120, 60, 50]),
  未: Object.freeze([90, 130, 150, 80, 70]),
  申: Object.freeze([70, 80, 110, 160, 120]),
  酉: Object.freeze([60, 70, 100, 170, 110]),
  戌: Object.freeze([80, 90, 150, 130, 100]),
  亥: Object.freeze([100, 70, 90, 120, 160]),
  子: Object.freeze([90, 60, 80, 130, 170]),
  丑: Object.freeze([80, 70, 140, 120, 130]),
});

export const SEASONAL_WEIGHTS = Object.freeze(Object.fromEntries(
  Object.entries(SEASON_HUNDREDTHS).map(([branch, values]) => [branch, values.map(value => value / 100)]),
));

export const TRANSFORM_HUNDREDTHS = Object.freeze([
  Object.freeze([77, 0, 0, -15, 8]),
  Object.freeze([8, 77, 0, 0, -15]),
  Object.freeze([-15, 8, 77, 0, 0]),
  Object.freeze([0, -15, 8, 77, 0]),
  Object.freeze([0, 0, -15, 8, 77]),
]);

const T_MATRIX = Object.freeze(TRANSFORM_HUNDREDTHS.map(row =>
  Object.freeze(row.map(coefficient => coefficient / 100)),
));

export const TRINE_DEFINITIONS = Object.freeze([
  Object.freeze({ name: '亥卯未合木', branches: Object.freeze(['亥', '卯', '未']), emperor: '卯', element: '木' }),
  Object.freeze({ name: '寅午戌合火', branches: Object.freeze(['寅', '午', '戌']), emperor: '午', element: '火' }),
  Object.freeze({ name: '丑巳酉合金', branches: Object.freeze(['丑', '巳', '酉']), emperor: '酉', element: '金' }),
  Object.freeze({ name: '申子辰合水', branches: Object.freeze(['申', '子', '辰']), emperor: '子', element: '水' }),
]);

const CLASH_PAIRS = Object.freeze([
  Object.freeze(['子', '午']), Object.freeze(['丑', '未']), Object.freeze(['寅', '申']),
  Object.freeze(['卯', '酉']), Object.freeze(['辰', '戌']), Object.freeze(['巳', '亥']),
]);

const SIX_COMBINATION_PAIRS = Object.freeze([
  Object.freeze(['子', '丑']), Object.freeze(['寅', '亥']), Object.freeze(['卯', '戌']),
  Object.freeze(['辰', '酉']), Object.freeze(['巳', '申']), Object.freeze(['午', '未']),
]);

export const DEFAULT_CONFIG = Object.freeze({
  branchTotals: Object.freeze([15, 30, 20, 25]),
  enableTrines: true,
  fullLambda: 0.6,
  halfWithEmperorLambda: 0.3,
  halfWithoutEmperorLambda: 0.1,
  monthParticipationMultiplier: 1.2,
  stemProjectionMultiplier: 1.15,
  separatedMultiplier: 0.7,
  clashMultiplier: 0.5,
  controlBreakMultiplier: 0.5,
  sixCombinationMultiplier: 0.5,
  enableControlBreak: true,
  enableSixCombination: true,
});

export function resolveConfig(overrides = {}) {
  return {
    ...DEFAULT_CONFIG,
    ...overrides,
    branchTotals: Array.isArray(overrides.branchTotals)
      ? [...overrides.branchTotals]
      : [...DEFAULT_CONFIG.branchTotals],
  };
}

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
    else if (pillar.length !== 2 || !Object.hasOwn(STEM_ELEMENTS, stem) || !Object.hasOwn(BRANCH_ROOTS, branch)) {
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

function zeroVector() {
  return ELEMENTS.map(() => 0);
}

export function vectorSum(vector) {
  return vector.reduce((sum, value) => sum + value, 0);
}

export function vectorDifference(left, right) {
  return left.map((value, index) => value - right[index]);
}

function nearlyInteger(value) {
  const rounded = Math.round(value);
  return Math.abs(value - rounded) < 1e-10 ? rounded : value;
}

export function buildInitialE0(input, overrides = {}) {
  const config = resolveConfig(overrides);
  const pillars = parsePillars(input);
  const values = zeroVector();
  const hiddenSources = [];
  const contributions = [];

  for (const [position, pillar] of pillars.entries()) {
    const [stem, branch] = pillar;
    const stemPoints = zeroVector();
    const branchPoints = zeroVector();
    const branchTotal = config.branchTotals[position];
    stemPoints[STEM_ELEMENTS[stem]] = 10;
    for (const [hiddenStem, ratioPoints] of Object.entries(BRANCH_ROOTS[branch])) {
      branchPoints[STEM_ELEMENTS[hiddenStem]] += branchTotal * ratioPoints / 10;
    }
    hiddenSources.push([...branchPoints]);
    for (let index = 0; index < ELEMENTS.length; index += 1) {
      values[index] += stemPoints[index] + branchPoints[index];
    }
    contributions.push(
      {
        pillar: PILLAR_NAMES[position], character: stem, kind: '天干',
        detail: `${stem}${ELEMENTS[STEM_ELEMENTS[stem]]}10`,
        points: stemPoints,
      },
      {
        pillar: PILLAR_NAMES[position], character: branch, kind: '地支',
        detail: Object.entries(BRANCH_ROOTS[branch])
          .map(([hiddenStem, ratioPoints]) => `${hiddenStem}${(branchTotal * ratioPoints / 10).toFixed(2)}（${ratioPoints}/10）`)
          .join('、'),
        points: branchPoints,
        branchTotal,
        ratio: BRANCH_ROOTS[branch],
      },
    );
  }

  return {
    pillars,
    values,
    hiddenSources,
    contributions,
    total: nearlyInteger(vectorSum(values)),
  };
}

function containsPair(pair, left, right) {
  return (pair[0] === left && pair[1] === right) || (pair[0] === right && pair[1] === left);
}

function combinations(values, size) {
  const output = [];
  function visit(start, current) {
    if (current.length === size) {
      output.push([...current]);
      return;
    }
    for (let index = start; index <= values.length - (size - current.length); index += 1) {
      current.push(values[index]);
      visit(index + 1, current);
      current.pop();
    }
  }
  visit(0, []);
  return output;
}

function cartesianPositionSets(positionGroups) {
  const output = [];
  function visit(groupIndex, current) {
    if (groupIndex === positionGroups.length) {
      const unique = [...new Set(current)].sort((left, right) => left - right);
      if (unique.length === current.length) output.push(unique);
      return;
    }
    for (const position of positionGroups[groupIndex]) {
      visit(groupIndex + 1, [...current, position]);
    }
  }
  visit(0, []);
  return output;
}

function positionsForBranches(pillars, branches) {
  const groups = branches.map(branch => pillars
    .map((pillar, position) => pillar[1] === branch ? position : -1)
    .filter(position => position >= 0));
  if (groups.some(group => group.length === 0)) return [];
  return cartesianPositionSets(groups);
}

function branchIsClashed(left, right) {
  return CLASH_PAIRS.some(pair => containsPair(pair, left, right));
}

function branchHasSixCombination(left, right) {
  return SIX_COMBINATION_PAIRS.some(pair => containsPair(pair, left, right));
}

function positionModifier(positions, config) {
  const maximumGap = Math.max(...positions) - Math.min(...positions);
  return maximumGap <= 1 ? 1 : config.separatedMultiplier;
}

function selectedBranchClashInfo(pillars, selectedPositions, definition) {
  const selectedSet = new Set(selectedPositions);
  let emperorClashed = false;
  let memberClashed = false;
  for (const position of selectedPositions) {
    const branch = pillars[position][1];
    const clashed = pillars.some((pillar, otherPosition) => (
      !selectedSet.has(otherPosition)
      && otherPosition !== position
      && branchIsClashed(branch, pillar[1])
    ));
    if (clashed) {
      memberClashed = true;
      if (branch === definition.emperor) emperorClashed = true;
    }
  }
  return { emperorClashed, memberClashed };
}

function hasExternalControlBranch(pillars, selectedPositions, element) {
  const selectedSet = new Set(selectedPositions);
  return pillars.some((pillar, position) => (
    !selectedSet.has(position) && BRANCH_MAIN_ELEMENT[pillar[1]] === CONTROLLING_ELEMENT[element]
  ));
}

function hasExternalSixCombination(pillars, selectedPositions) {
  const selectedSet = new Set(selectedPositions);
  return selectedPositions.some(position => pillars.some((pillar, otherPosition) => (
    !selectedSet.has(otherPosition) && branchHasSixCombination(pillars[position][1], pillar[1])
  )));
}

function hasStemProjection(pillars, element) {
  return pillars.some(pillar => STEM_ELEMENTS[pillar[0]] === ELEMENT_INDEX[element]);
}

function createCandidate(pillars, definition, selectedPositions, type, baseLambda, config) {
  const clashInfo = selectedBranchClashInfo(pillars, selectedPositions, definition);
  const modifiers = {
    position: positionModifier(selectedPositions, config),
    month: selectedPositions.includes(1) ? config.monthParticipationMultiplier : 1,
    stem: hasStemProjection(pillars, definition.element) ? config.stemProjectionMultiplier : 1,
    clash: clashInfo.emperorClashed ? 0 : (clashInfo.memberClashed ? config.clashMultiplier : 1),
    controlBreak: config.enableControlBreak && hasExternalControlBranch(pillars, selectedPositions, definition.element)
      ? config.controlBreakMultiplier
      : 1,
    sixCombination: config.enableSixCombination && hasExternalSixCombination(pillars, selectedPositions)
      ? config.sixCombinationMultiplier
      : 1,
  };
  const effectiveLambda = baseLambda * Object.values(modifiers).reduce((product, value) => product * value, 1);
  return {
    name: definition.name,
    element: definition.element,
    branches: [...definition.branches],
    emperor: definition.emperor,
    type,
    positions: [...selectedPositions],
    baseLambda,
    modifiers,
    effectiveLambda,
  };
}

export function buildTrineCandidates(pillars, overrides = {}) {
  const config = resolveConfig(overrides);
  const candidates = [];
  for (const definition of TRINE_DEFINITIONS) {
    const fullPositionSets = positionsForBranches(pillars, definition.branches);
    if (fullPositionSets.length > 0) {
      for (const positions of fullPositionSets) {
        candidates.push(createCandidate(pillars, definition, positions, '三支齐全', config.fullLambda, config));
      }
      continue;
    }
    for (const pair of combinations(definition.branches, 2)) {
      const pairPositionSets = positionsForBranches(pillars, pair);
      if (pairPositionSets.length === 0) continue;
      const includesEmperor = pair.includes(definition.emperor);
      const baseLambda = includesEmperor ? config.halfWithEmperorLambda : config.halfWithoutEmperorLambda;
      for (const positions of pairPositionSets) {
        candidates.push(createCandidate(
          pillars,
          definition,
          positions,
          includesEmperor ? '半合含帝旺' : '拱合不含帝旺',
          baseLambda,
          config,
        ));
      }
    }
  }

  const bestByName = new Map();
  for (const candidate of candidates) {
    const current = bestByName.get(candidate.name);
    if (!current || candidate.effectiveLambda > current.effectiveLambda) bestByName.set(candidate.name, candidate);
  }
  return [...bestByName.values()].sort((left, right) => right.effectiveLambda - left.effectiveLambda);
}

export function applyTrineTransfers(initial, overrides = {}) {
  const config = resolveConfig(overrides);
  if (!config.enableTrines) {
    const total = nearlyInteger(vectorSum(initial.values));
    return {
      values: [...initial.values], candidates: [], transfers: [],
      totalBefore: total, totalAfter: total, conservationError: 0,
    };
  }

  const candidates = buildTrineCandidates(initial.pillars, config);
  const values = [...initial.values];
  const consumed = initial.hiddenSources.map(() => zeroVector());
  const transfers = [];
  for (const candidate of candidates) {
    if (candidate.effectiveLambda <= 0) continue;
    for (const position of candidate.positions) {
      for (const sourceElement of ELEMENTS) {
        if (sourceElement === candidate.element) continue;
        const sourceIndex = ELEMENT_INDEX[sourceElement];
        const available = initial.hiddenSources[position][sourceIndex] - consumed[position][sourceIndex];
        const amount = available * candidate.effectiveLambda;
        if (amount <= 0) continue;
        consumed[position][sourceIndex] += amount;
        values[sourceIndex] -= amount;
        values[ELEMENT_INDEX[candidate.element]] += amount;
        transfers.push({
          trine: candidate.name,
          type: candidate.type,
          position,
          source: sourceElement,
          target: candidate.element,
          amount,
        });
      }
    }
  }
  const totalBefore = nearlyInteger(vectorSum(initial.values));
  const totalAfter = nearlyInteger(vectorSum(values));
  return {
    values,
    candidates,
    transfers,
    totalBefore,
    totalAfter,
    conservationError: totalAfter - totalBefore,
  };
}

function multiplyMatrixVector(matrix, vector) {
  return matrix.map(row => row.reduce((sum, coefficient, index) => sum + coefficient * vector[index], 0));
}

export function rankElements(values) {
  const sorted = ELEMENTS
    .map((element, index) => ({ element, value: values[index], index }))
    .sort((left, right) => right.value - left.value || left.index - right.index);
  return sorted.map((entry, index) => ({
    element: entry.element,
    value: entry.value,
    rank: index > 0 && entry.value === sorted[index - 1].value ? index : index + 1,
  }));
}

export function calculate(input, overrides = {}) {
  const config = resolveConfig(overrides);
  const base = buildInitialE0(input, config);
  const trine = applyTrineTransfers(base, config);
  const monthBranch = base.pillars[1][1];
  const seasonalFactors = SEASONAL_WEIGHTS[monthBranch];
  const seasonal = trine.values.map((value, index) => value * seasonalFactors[index]);
  const final = multiplyMatrixVector(T_MATRIX, seasonal);
  const ranking = rankElements(final);
  const rankingGroups = [];
  for (const entry of ranking) {
    const previous = rankingGroups.at(-1);
    if (previous && previous.rank === entry.rank) previous.elements.push(entry.element);
    else rankingGroups.push({ rank: entry.rank, elements: [entry.element] });
  }
  const dayStem = base.pillars[2][0];
  const dayElement = ELEMENTS[STEM_ELEMENTS[dayStem]];
  return {
    pillars: base.pillars,
    chart: base.pillars.join(' '),
    monthBranch,
    dayStem,
    dayElement,
    dayRank: ranking.find(entry => entry.element === dayElement).rank,
    baseInitial: base.values,
    baseInitialTotal: base.total,
    initial: trine.values,
    initialTotal: trine.totalAfter,
    contributions: base.contributions,
    seasonalFactors,
    seasonal,
    final,
    total: vectorSum(final),
    ranking,
    rankingText: rankingGroups.map(group => group.elements.join(' = ')).join(' > '),
    hasTies: rankingGroups.length < ELEMENTS.length,
    trine,
    config,
  };
}

export const calculateChart = calculate;
