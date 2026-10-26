import { ELEMENTS, TRANSFORM_HUNDREDTHS, calculate, parsePillars } from './algorithm.js';

const form = document.getElementById('chart-form');
const pillarInputs = ['year-pillar', 'month-pillar', 'day-pillar', 'hour-pillar']
  .map(identifier => document.getElementById(identifier));
const results = document.getElementById('results');
const emptyState = document.getElementById('empty-state');
const formError = document.getElementById('form-error');
const formStatus = document.getElementById('form-status');
const copyStatus = document.getElementById('copy-status');
const copyFallback = document.getElementById('copy-fallback');
const copyFallbackLabel = document.getElementById('copy-fallback-label');
const numberFormatter = new Intl.NumberFormat('zh-CN', {
  minimumFractionDigits: 3, maximumFractionDigits: 4, useGrouping: false,
});
let currentResult = null;

function formatNumber(value) {
  return numberFormatter.format(value);
}

function createRow(values, numericFrom = 1, headerFirst = false) {
  const row = document.createElement('tr');
  for (const [index, value] of values.entries()) {
    const cell = document.createElement(index === 0 && headerFirst ? 'th' : 'td');
    cell.textContent = String(value);
    if (index === 0 && headerFirst) cell.scope = 'row';
    if (index >= numericFrom) cell.className = 'numeric';
    row.append(cell);
  }
  return row;
}

function renderVector(identifier, values, format = formatNumber) {
  const vector = document.createElement('div');
  vector.className = 'column-vector';
  vector.setAttribute('role', 'img');
  vector.setAttribute('aria-label', `列向量：${ELEMENTS.map((element, index) => `${element}${format(values[index])}`).join('，')}`);
  const labels = document.createElement('ol');
  const components = document.createElement('ol');
  labels.className = 'vector-labels';
  components.className = 'vector-values';
  for (const [index, element] of ELEMENTS.entries()) {
    const label = document.createElement('li');
    const component = document.createElement('li');
    label.textContent = element;
    component.textContent = format(values[index]);
    component.dataset.element = element;
    labels.append(label);
    components.append(component);
  }
  vector.append(labels, components);
  document.getElementById(identifier).replaceChildren(vector);
}

function clearFeedback() {
  formError.textContent = '';
  formError.hidden = true;
  for (const input of pillarInputs) input.removeAttribute('aria-invalid');
}

function clearCopyFeedback() {
  copyStatus.textContent = '';
  copyFallback.value = '';
  copyFallback.hidden = true;
  copyFallbackLabel.hidden = true;
}

function invalidateResults() {
  currentResult = null;
  results.hidden = true;
  emptyState.hidden = false;
  clearCopyFeedback();
  document.getElementById('result-announcement').textContent = '';
}

function showError(error) {
  formError.textContent = error.message;
  formError.hidden = false;
  if (Number.isInteger(error.pillarIndex)) {
    pillarInputs[error.pillarIndex].setAttribute('aria-invalid', 'true');
    pillarInputs[error.pillarIndex].focus();
  }
}

function renderResult(result) {
  document.getElementById('result-chart').textContent = result.chart;
  document.getElementById('result-meta').textContent = `月令：${result.monthBranch}月 · 日主：${result.dayStem}${result.dayElement} · 日主五行第${result.dayRank}名${result.hasTies ? '（存在并列）' : ''}`;
  document.getElementById('ranking-text').textContent = result.rankingText;
  document.getElementById('ranking-body').replaceChildren(...result.ranking.map(entry =>
    createRow([entry.rank, entry.element, formatNumber(entry.value)], 2),
  ));
  document.getElementById('ranking-note').textContent = result.hasTies
    ? '相同力量值以等号表示并列；并列后的名次相应跳号。负数保留，不取绝对值。'
    : '按原始数值降序排序；负数保留，不取绝对值。';
  renderVector('final-vector', result.final);
  renderVector('initial-vector', result.initial, String);
  renderVector('seasonal-vector', result.seasonal);
  document.getElementById('initial-total').textContent = `ΣE₀ = ${result.initialTotal} · 校验通过`;
  document.getElementById('final-total').textContent = `ΣU = ${formatNumber(result.total)}；最终总分不强制为80。`;
  document.getElementById('month-description').textContent = `使用月柱「${result.pillars[1]}」的${result.monthBranch}月季节系数。`;
  document.getElementById('seasonal-formula').textContent = `S = diag(${result.seasonalFactors.map(value => value.toFixed(2)).join(', ')})`;
  document.getElementById('season-caption').textContent = `${result.monthBranch}月矩阵的五个对角系数，其余位置为0。`;
  document.getElementById('season-body').replaceChildren(
    createRow([`${result.monthBranch}月`, ...result.seasonalFactors.map(value => value.toFixed(2))], 1, true),
  );
  document.getElementById('contribution-body').replaceChildren(...result.contributions.map(entry =>
    createRow([`${entry.pillar}${entry.character}（${entry.kind}）`, entry.detail, ...entry.points], 2, true),
  ));
  clearCopyFeedback();
  emptyState.hidden = true;
  results.hidden = false;
  document.getElementById('result-announcement').textContent = `${result.chart}计算完成，力量排序为${result.rankingText}。`;
}

function submitCalculation() {
  clearFeedback();
  formStatus.textContent = '';
  try {
    currentResult = calculate(pillarInputs.map(input => input.value));
    renderResult(currentResult);
  } catch (error) {
    invalidateResults();
    showError(error);
  }
}

form.addEventListener('submit', event => {
  event.preventDefault();
  submitCalculation();
});

form.addEventListener('input', event => {
  if (!pillarInputs.includes(event.target)) return;
  clearFeedback();
  const hadResult = currentResult !== null;
  invalidateResults();
  if (hadResult) formStatus.textContent = '输入已更新，请重新计算。';
});

form.addEventListener('paste', event => {
  if (!pillarInputs.includes(event.target)) return;
  const text = event.clipboardData?.getData('text')?.trim();
  if (!text || text.length <= 2) return;
  event.preventDefault();
  clearFeedback();
  try {
    const pillars = parsePillars(text);
    pillars.forEach((pillar, index) => { pillarInputs[index].value = pillar; });
    invalidateResults();
    formStatus.textContent = '完整八字已填入，请点击计算。';
    pillarInputs[3].focus();
  } catch (error) {
    showError(error);
  }
});

document.getElementById('example-button').addEventListener('click', () => {
  ['丙戌', '己亥', '癸丑', '戊午'].forEach((pillar, index) => { pillarInputs[index].value = pillar; });
  submitCalculation();
});

document.getElementById('clear-button').addEventListener('click', () => {
  form.reset();
  clearFeedback();
  invalidateResults();
  formStatus.textContent = '';
  document.getElementById('calculation-details').open = false;
  pillarInputs[0].focus();
});

document.getElementById('copy-button').addEventListener('click', async () => {
  if (!currentResult) return;
  const result = currentResult;
  const text = [
    `八字：${result.chart}`,
    `月令：${result.monthBranch}月；日主：${result.dayStem}${result.dayElement}`,
    `五行力量排序：${result.rankingText}`,
    '分量顺序：木、火、土、金、水',
    `E₀ = (${result.initial.join(', ')})ᵀ`,
    `S·E₀ = (${result.seasonal.map(formatNumber).join(', ')})ᵀ`,
    'U = T·S·E₀，列向量：',
    ...result.final.map(value => `  ${formatNumber(value)}`),
    `ΣE₀ = ${result.initialTotal}；ΣU = ${formatNumber(result.total)}`,
  ].join('\n');
  try {
    await navigator.clipboard.writeText(text);
    if (currentResult === result) copyStatus.textContent = '结果已复制。';
  } catch {
    if (currentResult !== result) return;
    copyFallback.value = text;
    copyFallback.hidden = false;
    copyFallbackLabel.hidden = false;
    copyFallback.focus();
    copyFallback.select();
    copyStatus.textContent = '请手动复制选中的计算结果。';
  }
});

document.getElementById('transform-body').replaceChildren(...TRANSFORM_HUNDREDTHS.map((row, index) =>
  createRow([ELEMENTS[index], ...row.map(coefficient => (coefficient / 100).toFixed(2))], 1, true),
));
