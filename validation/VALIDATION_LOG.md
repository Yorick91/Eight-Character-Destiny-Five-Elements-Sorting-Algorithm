# 验证与修改留痕

- 运行时间：2026-11-10T14:11:57.974Z
- 本轮目标：把四个地支改为年15、月30、日20、时25；天干继续各10；三合在 E₀ 层按转移守恒处理。
- 原始资料：目录内三份带表格报告，共解析 67 条记录；矩阵报告第4—6条假设盘不进入评分，图片16例单列为无明确标签行为检查。

## 修改规则

1. 四个天干各计10分；四个地支总分分别为15、30、20、25，藏干继续按原有比例分配，因此每盘 E₀ 总和固定为130。
2. 三支齐全基础 λ=0.60；含帝旺半合基础 λ=0.30；不含帝旺拱合基础 λ=0.10。月令、天干透出、位置间隔、冲破、外部克制和六合牵动均为可调参数。
3. 三合只在 E₀ 层转移非本局五行藏干，转移量从来源支扣除并加到目标五行；同一支的同一藏干来源只能被转移一次。
4. 参数搜索只使用矩阵参考集（排除3个假设盘）和一般网络难例，印强专题18例作为留出集；优化目标为两阶段扶身印比法的平衡准确率。

## 参数搜索结果

```json
{
  "branchTotals": [
    15,
    30,
    20,
    25
  ],
  "fullLambda": 0.6,
  "halfWithEmperorLambda": 0.3,
  "halfWithoutEmperorLambda": 0.1,
  "monthParticipationMultiplier": 1.2,
  "stemProjectionMultiplier": 1.15,
  "separatedMultiplier": 0.7,
  "clashMultiplier": 0.5,
  "controlBreakMultiplier": 0.5,
  "sixCombinationMultiplier": 0.5,
  "enableControlBreak": true,
  "enableSixCombination": true,
  "motherWeakThreshold": 0.27,
  "reducedMotherWeight": 0.2,
  "dayMasterThreshold": 0.4
}
```

## λ ±30%敏感性

| 参数 | 波动 | 检查记录 | 排名改变 | 日主名次改变 | 两阶段判定改变 |
|---|---|---:|---:|---:|---:|
| fullLambda | 低30% | 64 | 1 | 0 | 0 |
| fullLambda | 基准 | 64 | 0 | 0 | 0 |
| fullLambda | 高30% | 64 | 1 | 1 | 0 |
| halfWithEmperorLambda | 低30% | 64 | 5 | 2 | 1 |
| halfWithEmperorLambda | 基准 | 64 | 0 | 0 | 0 |
| halfWithEmperorLambda | 高30% | 64 | 1 | 0 | 0 |
| halfWithoutEmperorLambda | 低30% | 64 | 1 | 0 | 0 |
| halfWithoutEmperorLambda | 基准 | 64 | 0 | 0 | 0 |
| halfWithoutEmperorLambda | 高30% | 64 | 1 | 0 | 0 |

## 两阶段规则结果

| 数据集 | 样本 | TP | TN | FP | FN | 复核 | 准确率 | 平衡准确率 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| 训练集 | 30 | 12 | 9 | 4 | 5 | 0 | 70.00% | 69.91% |
| 印强专题留出集 | 18 | 3 | 10 | 3 | 2 | 0 | 72.22% | 68.46% |
| 全部48条评分记录 | 48 | 15 | 19 | 7 | 7 | 0 | 70.83% | 70.63% |
| 外部2例 | 2 | 0 | 2 | 0 | 0 | 0 | 100.00% | — |

## 与旧版本的整体比较

| 配置 | 分类方法 | 样本 | 准确率 | 平衡准确率 |
|---|---|---:|---:|---:|
| legacyEqualBranches | 前三法 | 48 | 56.25% | 59.62% |
| legacyEqualBranches | 前二法 | 48 | 58.33% | 60.84% |
| legacyEqualBranches | 扶身占比法 | 48 | 56.25% | 58.57% |
| legacyEqualBranches | 两阶段扶身印比法 | 48 | 75.00% | 75.52% |
| positionWeightedNoTrine | 前三法 | 48 | 56.25% | 59.62% |
| positionWeightedNoTrine | 前二法 | 48 | 60.42% | 62.06% |
| positionWeightedNoTrine | 扶身占比法 | 48 | 50.00% | 52.45% |
| positionWeightedNoTrine | 两阶段扶身印比法 | 48 | 70.83% | 70.63% |
| positionWeightedDefaultTrine | 前三法 | 48 | 58.33% | 61.54% |
| positionWeightedDefaultTrine | 前二法 | 48 | 58.33% | 59.79% |
| positionWeightedDefaultTrine | 扶身占比法 | 48 | 50.00% | 52.45% |
| positionWeightedDefaultTrine | 两阶段扶身印比法 | 48 | 70.83% | 70.63% |
| positionWeightedOptimizedTrine | 前三法 | 48 | 58.33% | 61.54% |
| positionWeightedOptimizedTrine | 前二法 | 48 | 58.33% | 59.79% |
| positionWeightedOptimizedTrine | 扶身占比法 | 48 | 50.00% | 52.45% |
| positionWeightedOptimizedTrine | 两阶段扶身印比法 | 48 | 70.83% | 70.63% |

## 完整性检查

- E₀ 总和偏差最大值：0
- 三合转移守恒误差最大值：0
- 结果应均为0；若后续改动使其非0，应先修复守恒再比较准确率。

## 解释边界

- 这里的强弱标签来自目录内原报告的公开参考结论，不代表客观真值。
- 三合参数是在有限样本上粗调，留出集结果仍不能替代新的独立样本验证。
- U 允许出现负数，扶身占比的分母可能被压低；本轮保留原公式并把这一风险记录下来，没有偷偷改成非负归一化。
- 旧报告中的传统命理解释与算法标签可能不一致，后续实现应以 E₀、U 和明确记录的验证标签分层处理。
