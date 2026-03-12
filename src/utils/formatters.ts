/** 数值格式化工具 */

/** 格式化电压 */
export function formatVoltage(v: number): string {
  return v >= 1 ? `${v.toFixed(1)}V` : `${(v * 1000).toFixed(0)}mV`;
}

/** 格式化电流 */
export function formatCurrent(a: number): string {
  return a >= 1 ? `${a.toFixed(1)}A` : `${(a * 1000).toFixed(0)}mA`;
}

/** 格式化功率 */
export function formatPower(w: number): string {
  return w >= 1000 ? `${(w / 1000).toFixed(2)}kW` : `${w.toFixed(1)}W`;
}

/** 格式化效率 */
export function formatEfficiency(e: number): string {
  return `${e.toFixed(1)}%`;
}

/** 格式化温度 */
export function formatTemperature(t: number): string {
  return `${t.toFixed(1)}°C`;
}

/** 格式化转速 */
export function formatRPM(rpm: number): string {
  return `${rpm} RPM`;
}

/** 温度颜色映射 */
export function getTemperatureColor(temp: number): string {
  if (temp < 40) return '#52c41a';
  if (temp < 60) return '#faad14';
  if (temp < 80) return '#ff7a45';
  return '#ff4d4f';
}

/** 效率颜色映射 */
export function getEfficiencyColor(eff: number): string {
  if (eff >= 95) return '#52c41a';
  if (eff >= 90) return '#73d13d';
  if (eff >= 85) return '#faad14';
  return '#ff4d4f';
}

/** 损耗颜色映射 */
export function getLossColor(lossPercent: number): string {
  if (lossPercent < 1) return '#52c41a';
  if (lossPercent < 3) return '#faad14';
  return '#ff4d4f';
}
