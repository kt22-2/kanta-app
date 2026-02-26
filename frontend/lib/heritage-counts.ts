/**
 * UNESCO 世界遺産登録数（国コード別）
 * 出典: UNESCO World Heritage List 2023
 */
export const HERITAGE_COUNT: Record<string, number> = {
  // 上位国
  IT: 58, CN: 57, DE: 52, FR: 52, ES: 50, IN: 42, MX: 35,
  GB: 33, RU: 30, IR: 27, BR: 23, JP: 25, US: 24, CA: 22,
  TR: 21, AU: 20, GR: 19, CZ: 17, PL: 17, PT: 17, KR: 16,
  SE: 15, BE: 15, CH: 13, PE: 13, AT: 12, NL: 12, AR: 12,
  // アジア
  VN: 8,  LK: 8,  TH: 6,  PH: 6,  PK: 6,  ID: 10, MY: 4,
  KH: 3,  NP: 4,  BD: 3,  MN: 4,  KZ: 5,  UZ: 5,  TM: 4,
  KG: 3,  TJ: 2,  AM: 3,  AZ: 4,  GE: 4,  AF: 2,
  // 中東
  SA: 7,  JO: 6,  IQ: 6,  IL: 9,  SY: 6,  LB: 5,
  OM: 5,  YE: 4,  BH: 3,  QA: 1,  AE: 1,
  // ヨーロッパ
  UA: 8,  HU: 8,  NO: 8,  RO: 9,  BG: 10, HR: 10, DK: 10,
  FI: 7,  SK: 7,  BY: 4,  RS: 4,  LT: 4,  LV: 4,  EE: 3,
  SI: 5,  AL: 3,  BA: 3,  MD: 1,  IS: 3,  IE: 2,  LU: 1,
  MT: 3,  CY: 3,  MK: 2,  ME: 1,  XK: 1,
  // アフリカ
  ET: 9,  ZA: 10, MA: 10, DZ: 7,  EG: 7,  TN: 8,  TZ: 8,
  KE: 7,  LY: 5,  ZW: 5,  ML: 4,  CI: 4,  NG: 2,  GH: 2,
  SD: 3,  NE: 3,  UG: 3,  CM: 2,  MG: 3,  MU: 2,  BW: 2,
  MZ: 1,  GN: 1,  ZM: 1,  SN: 2,  BJ: 2,  BF: 2,
  // アメリカ
  CO: 9,  CU: 9,  CL: 7,  BO: 7,  EC: 5,  VE: 3,
  GT: 3,  PA: 3,  CR: 4,  BZ: 1,  HN: 1,  SV: 1,  NI: 1,
  JM: 1,  HT: 1,  DO: 2,  BB: 1,  PY: 1,
  // オセアニア
  NZ: 3,  FJ: 1,  PG: 1,  VU: 1,  SB: 1,
  // シンガポール・香港
  SG: 1,
};
