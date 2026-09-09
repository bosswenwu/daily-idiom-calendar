// 农历 / 二十四节气 计算模块（纯函数，无依赖）
// 农历算法采用广泛使用的 1900–2100 lunarInfo 数据表；节气用近似天文公式。

/* eslint-disable */

// 逐年在位编码：高 4 位为闰月月份(0=无闰月)，低 12 位…，见标准实现。
const LUNAR_INFO = [
  0x04bd8,0x04ae0,0x0a570,0x054d5,0x0d260,0x0d950,0x16554,0x056a0,0x09ad0,0x055d2,// 1900-1909
  0x04ae0,0x0a5b6,0x0a4d0,0x0d250,0x1d255,0x0b540,0x0d6a0,0x0ada2,0x095b0,0x14977,// 1910-1919
  0x04970,0x0a4b0,0x0b4b5,0x06a50,0x06d40,0x1ab54,0x02b60,0x09570,0x052f2,0x04970,// 1920-1929
  0x06566,0x0d4a0,0x0ea50,0x06e95,0x05ad0,0x02b60,0x186e3,0x092e0,0x1c8d7,0x0c950,// 1930-1939
  0x0d4a0,0x1d8a6,0x0b550,0x056a0,0x1a5b4,0x025d0,0x092d0,0x0d2b2,0x0a950,0x0b557,// 1940-1949
  0x06ca0,0x0b550,0x15355,0x04da0,0x0a5b0,0x14573,0x052b0,0x0a9a8,0x0e950,0x06aa0,// 1950-1959
  0x0aea6,0x0ab50,0x04b60,0x0aae4,0x0a570,0x05260,0x0f263,0x0d950,0x05b57,0x056a0,// 1960-1969
  0x096d0,0x04dd5,0x04ad0,0x0a4d0,0x0d4d4,0x0d250,0x0d558,0x0b540,0x0b5a0,0x195a6,// 1970-1979
  0x095b0,0x049b0,0x0a974,0x0a4b0,0x0b27a,0x06a50,0x06d40,0x0af46,0x0ab60,0x09570,// 1980-1989
  0x04af5,0x04970,0x064b0,0x074a3,0x0ea50,0x06b58,0x055c0,0x0ab60,0x096d5,0x092e0,// 1990-1999
  0x0c960,0x0d954,0x0d4a0,0x0da50,0x07552,0x056a0,0x0abb7,0x025d0,0x092d0,0x0cab5,// 2000-2009
  0x0a950,0x0b4a0,0x0baa4,0x0ad50,0x055d9,0x04ba0,0x0a5b0,0x15176,0x052b0,0x0a930,// 2010-2019
  0x07954,0x06aa0,0x0ad50,0x05b52,0x04b60,0x0a6e6,0x0a4e0,0x0d260,0x0ea65,0x0d530,// 2020-2029
  0x05aa0,0x076a3,0x096d0,0x04afb,0x04ad0,0x0a4d0,0x1d0b6,0x0d250,0x0d520,0x0dd45,// 2030-2039
  0x0b5a0,0x056d0,0x055b2,0x049b0,0x0a577,0x0a4b0,0x0aa50,0x1b255,0x06d20,0x0ada0,// 2040-2049
  0x14b63,0x09370,0x049f8,0x04970,0x064b0,0x168a6,0x0ea50,0x06b20,0x1a6c4,0x0aae0,// 2050-2059
  0x0a2e0,0x0d2e3,0x0c960,0x0d557,0x0d4a0,0x0da50,0x05d55,0x056a0,0x0a6d0,0x055d4,// 2060-2069
  0x052d0,0x0a9b8,0x0a950,0x0b4a0,0x0b6a6,0x0ad50,0x055a0,0x0aba4,0x0a5b0,0x052b0,// 2070-2079
  0x0b273,0x06930,0x07337,0x06aa0,0x0ad50,0x14b55,0x04b60,0x0a570,0x054e4,0x0d160,// 2080-2089
  0x0e968,0x0d520,0x0daa0,0x16aa6,0x056d0,0x04ae0,0x0a9d4,0x0a2d0,0x0d150,0x0f252,// 2090-2099
  0x0d520 // 2100
];

const GAN = ["甲","乙","丙","丁","戊","己","庚","辛","壬","癸"];
const ZHI = ["子","丑","寅","卯","辰","巳","午","未","申","酉","戌","亥"];
const ZODIAC = ["鼠","牛","虎","兔","龙","蛇","马","羊","猴","鸡","狗","猪"];
const LUNAR_MONTH = ["正","二","三","四","五","六","七","八","九","十","冬","腊"];
const LUNAR_DAY = [
  "初一","初二","初三","初四","初五","初六","初七","初八","初九","初十",
  "十一","十二","十三","十四","十五","十六","十七","十八","十九","二十",
  "廿一","廿二","廿三","廿四","廿五","廿六","廿七","廿八","廿九","三十"
];

// 每农历年的总天数
function lYearDays(y) {
  let sum = 348;
  for (let i = 0x8000; i > 0x8; i >>= 1) sum += (LUNAR_INFO[y - 1900] & i) ? 1 : 0;
  return sum + leapDays(y);
}
// 农历闰月月份(1-12)，0=无闰月
function leapMonth(y) { return LUNAR_INFO[y - 1900] & 0xf; }
// 闰月天数(29或30)，无闰月返回0
function leapDays(y) {
  if (leapMonth(y)) return (LUNAR_INFO[y - 1900] & 0x10000) ? 30 : 29;
  return 0;
}
// 某农历年某月天数
function monthDays(y, m) {
  return (LUNAR_INFO[y - 1900] & (0x10000 >> m)) ? 30 : 29;
}

/**
 * 农历日期转换。
 * @param {number} y 公历年
 * @param {number} m 公历月(1-12)
 * @param {number} d 公历日(1-31)
 * @returns {{lYear:number,lMonth:number,lDay:number,isLeap:boolean}}
 */
function lunarFromSolar(y, m, d) {
  if (y < 1900 || y > 2100) return { lYear: y, lMonth: 1, lDay: 1, isLeap: false };
  let offset = (Date.UTC(y, m - 1, d) - Date.UTC(1900, 0, 31)) / 86400000;
  let temp = 0;
  let i;
  for (i = 1900; i < 2101 && offset > 0; i++) {
    temp = lYearDays(i);
    offset -= temp;
  }
  if (offset < 0) { offset += temp; i--; }
  const lYear = i;
  const leap = leapMonth(lYear);
  let isLeap = false;
  for (i = 1; i < 13 && offset > 0; i++) {
    if (leap > 0 && i === (leap + 1) && isLeap === false) {
      --i; isLeap = true; temp = leapDays(lYear);
    } else {
      temp = monthDays(lYear, i);
    }
    if (isLeap === true && i === (leap + 1)) isLeap = false;
    offset -= temp;
  }
  if (offset === 0 && leap > 0 && i === leap + 1) {
    if (isLeap) { isLeap = false; }
    else { isLeap = true; --i; }
  }
  if (offset < 0) { offset += temp; --i; }
  const lMonth = Math.max(1, Math.min(12, i));
  const lDay = offset + 1;
  return { lYear, lMonth, lDay, isLeap };
}

// 农历日期的中文表示：如「六月初九」
function lunarLabel(l) {
  let s = LUNAR_MONTH[l.lMonth - 1] + "月";
  s += LUNAR_DAY[l.lDay - 1];
  return (l.isLeap ? "闰" : "") + s;
}

// 该农历年的干支 + 生肖：如「丙午年 · 马」
function lunarYearGz(lYear) {
  const gan = GAN[(lYear - 4) % 10];
  const zhi = ZHI[(lYear - 4) % 12];
  const zodiac = ZODIAC[(lYear - 4) % 12];
  return { ganzhi: gan + zhi + "年", zodiac };
}

/* ---------- 二十四节气（近似公式，适用近现代年份） ---------- */
const STERM_NAME = ["小寒","大寒","立春","雨水","惊蛰","春分","清明","谷雨","立夏","小满","芒种","夏至",
                    "小暑","大暑","立秋","处暑","白露","秋分","寒露","霜降","立冬","小雪","大雪","冬至"];
const STERM_INFO = [0,21208,42467,63836,85337,107014,128867,150921,173149,195551,218072,240693,
                    263343,285989,308563,331033,353350,375494,397447,419210,440795,462224,483532,504758];
const STERM_MONTH = [1,1,2,2,3,3,4,4,5,5,6,6,7,7,8,8,9,9,10,10,11,11,12,12];

/**
 * 某年某节气的日期(日)。
 * @param {number} y 公历年
 * @param {number} n 节气序号 0-23（0=小寒 … 23=冬至）
 */
function solarTermDay(y, n) {
  const offDate = new Date((31556925974.7 * (y - 1900) + STERM_INFO[n] * 60000) + Date.UTC(1900, 0, 6, 2, 5));
  return offDate.getUTCDate();
}

/**
 * 返回某公历日的节气信息。
 * @param {number} y @param {number} m @param {number} d
 * @returns {{name:string,isOn:boolean,isFirstOfMonth:boolean}|null}
 */
function solarTermOf(y, m, d) {
  // 节气按公历月固定两个（月内先后两个序号）。找当前公历月的两个节气。
  const firstIdx = STERM_MONTH.indexOf(m);       // 该月第一个节气的序号
  const secondIdx = STERM_MONTH.lastIndexOf(m);  // 该月第二个节气的序号
  for (const idx of [firstIdx, secondIdx]) {
    if (idx === -1) continue;
    if (solarTermDay(y, idx) === d) {
      return { name: STERM_NAME[idx], isOn: true, isFirstOfMonth: idx === firstIdx };
    }
  }
  return null;
}

// 计算离下一个节气的天数以及名称
function nextSolarTerm(y, m, d) {
  const today = new Date(y, m - 1, d);
  for (let delta = 0; delta <= 31; delta++) {
    const t = new Date(y, m - 1, d + delta);
    const info = solarTermOf(t.getFullYear(), t.getMonth() + 1, t.getDate());
    if (info && info.isOn) {
      return { name: info.name, days: delta };
    }
  }
  return { name: "", days: 0 };
}

// 导出到全局，供 index.html 使用
if (typeof window !== "undefined") {
  window.lunar = {
    lunarFromSolar, lunarLabel, lunarYearGz,
    solarTermOf, nextSolarTerm, STERM_NAME,
  };
}
if (typeof module !== "undefined" && module.exports) {
  module.exports = { lunarFromSolar, lunarLabel, lunarYearGz, solarTermDay, solarTermOf, nextSolarTerm, STERM_NAME };
}
