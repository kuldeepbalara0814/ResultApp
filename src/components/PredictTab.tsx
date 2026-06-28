import React, { useState, useMemo, useEffect } from 'react';
import { Zap, Check, Copy, Send, Target, RefreshCw } from 'lucide-react';
import { PredictionInput, PredictionResult, TokariItem } from '../types';
import { calculateLedger } from '../utils/ledger';
import { saveTrackerEntry, getAllResultsSorted } from '../utils/storage';

// अलर्ट दिखाने के लिए इंटरफेस को थोड़ा बढ़ाया गया है
interface ExtendedPredictionResult extends PredictionResult {
  alerts?: string[];
}

// === सारे मास्टर कांस्टेंट और पुरानी शीट (कुछ नहीं छेड़ा गया) ===
const EVERGREEN = ['3', '8', '6', '1', '9', '0', '7', '2'];
const UNIVERSAL = ['02', '20', '04', '40', '06', '60', '24', '42', '28', '82', '46', '64', '68', '86'];
const MAGIC = ['12', '23', '84', '96'];

const DAY_WISE_FIXED: Record<number, string[]> = {
  0: ['93', '92', '75', '73', '71', '62', '52', '38', '13', '09', '04'],
  1: ['03', '92', '83', '82', '75', '71', '26', '25', '23', '22', '04'],
  2: ['72', '98', '97', '91', '87', '82', '71', '62', '54', '41', '40', '29', '23', '18', '13', '10'],
  3: ['51', '98', '97', '96', '92', '84', '62', '58', '57', '55', '53', '52', '33', '28', '27', '23', '16', '07'],
  4: ['70', '69', '68', '67', '64', '60', '94', '92', '83', '82', '77', '73', '71', '66', '65', '62', '52', '41', '40', '36', '35', '32', '30', '22', '05', '00'],
  5: ['95', '90', '89', '88', '87', '84', '82', '72', '40', '39', '38', '37', '34', '33'],
  6: ['97', '83', '81', '73', '72', '71', '58', '40', '36', '34', '33', '24', '21', '19', '08', '03']
};

const MASTER_SHEET: Record<string, string[]> = {
  '01': ['80', '71', '91', '79', '81', '07', '09', '70', '72', '16', '18', '90', '92', '18', '20'],
  '02': ['04', '37', '48', '03', '05', '39', '41', '36', '38', '72', '74', '47', '49', '83', '85'],
  '03': ['52', '87', '25', '51', '53', '24', '26', '86', '88', '77', '79', '24', '26', '51', '53'],
  '04': ['52', '62', '02', '51', '53', '24', '26', '61', '63', '25', '27', '01', '03', '19', '21'],
  '05': ['94', '04', '70', '93', '95', '48', '50', '03', '05', '39', '41', '69', '71', '06', '08'],
  '06': ['97', '09', '74', '96', '98', '78', '80', '08', '10', '89', '91', '73', '75', '46', '48'],
  '07': ['10', '61', '71', '09', '11', '00', '02', '60', '62', '15', '17', '70', '72', '16', '18'],
  '08': ['65', '17', '87', '64', '66', '55', '57', '16', '18', '70', '72', '86', '88', '77', '79'],
  '09': ['66', '88', '65', '65', '67', '65', '67', '87', '89', '87', '89', '64', '66', '55', '57'],
  '10': ['07', '04', '39', '06', '08', '69', '71', '03', '05', '39', '41', '38', '40', '92', '94'],
  '11': ['51', '98', '39', '50', '52', '14', '16', '97', '99', '88', '90', '38', '40', '92', '94'],
  '12': ['28', '07', '54', '27', '29', '81', '83', '06', '08', '69', '71', '53', '55', '44', '46'],
  '13': ['66', '70', '62', '65', '67', '65', '67', '69', '71', '06', '08', '61', '63', '25', '27'],
  '14': ['61', '89', '29', '60', '62', '15', '17', '88', '90', '97', '99', '28', '30', '91', '93'],
  '15': ['29', '71', '77', '28', '30', '91', '93', '70', '72', '16', '18', '76', '78', '76', '78'],
  '16': ['99', '68', '96', '98', '00', '98', '00', '67', '69', '85', '87', '95', '97', '68', '70'],
  '17': ['75', '33', '71', '74', '76', '56', '58', '32', '34', '32', '34', '70', '72', '16', '18'],
  '18': ['47', '84', '21', '46', '48', '73', '75', '83', '85', '47', '49', '20', '22', '11', '13'],
  '19': ['89', '81', '32', '88', '90', '97', '99', '80', '82', '17', '19', '31', '33', '22', '24'],
  '20': ['99', '07', '60', '98', '00', '98', '00', '06', '08', '69', '71', '59', '61', '05', '07'],
  '21': ['77', '52', '84', '76', '78', '76', '78', '51', '53', '24', '26', '83', '85', '47', '49'],
  '22': ['61', '83', '71', '60', '62', '15', '17', '82', '84', '37', '39', '70', '72', '16', '18'],
  '23': ['95', '52', '80', '94', '96', '58', '60', '51', '53', '24', '26', '79', '81', '07', '09'],
  '24': ['11', '73', '94', '10', '12', '10', '12', '72', '74', '36', '38', '93', '95', '48', '50'],
  '25': ['03', '67', '04', '02', '04', '29', '31', '66', '68', '75', '77', '03', '05', '39', '41'],
  '26': ['27', '33', '83', '26', '28', '71', '73', '32', '34', '32', '34', '82', '84', '37', '39'],
  '27': ['26', '49', '42', '25', '27', '61', '63', '48', '50', '93', '95', '41', '43', '23', '25'],
  '28': ['16', '12', '39', '15', '17', '60', '62', '11', '13', '20', '22', '38', '40', '92', '94'],
  '29': ['61', '14', '15', '60', '62', '15', '17', '13', '15', '40', '42', '14', '16', '50', '52'],
  '30': ['59', '64', '31', '58', '60', '94', '96', '63', '65', '45', '47', '30', '32', '12', '14'],
  '31': ['74', '61', '59', '73', '75', '46', '48', '60', '62', '15', '17', '58', '60', '94', '96'],
  '32': ['19', '79', '63', '18', '20', '90', '92', '78', '80', '96', '98', '62', '64', '35', '37'],
  '33': ['70', '17', '74', '69', '71', '06', '08', '16', '18', '70', '72', '73', '75', '46', '48'],
  '34': ['90', '60', '88', '89', '91', '08', '10', '59', '61', '05', '07', '87', '89', '87', '89'],
  '35': ['60', '90', '48', '59', '61', '05', '07', '89', '91', '08', '10', '47', '49', '83', '85'],
  '36': ['46', '98', '15', '45', '47', '63', '65', '97', '99', '88', '90', '14', '16', '50', '52'],
  '37': ['02', '28', '04', '01', '03', '19', '21', '27', '29', '81', '83', '03', '05', '39', '41'],
  '38': ['54', '99', '98', '53', '55', '44', '46', '98', '00', '98', '00', '97', '99', '88', '90'],
  '39': ['11', '28', '10', '10', '12', '10', '12', '27', '29', '81', '83', '09', '11', '00', '02'],
  '40': ['52', '53', '79', '51', '53', '24', '26', '52', '54', '34', '36', '78', '80', '96', '98'],
  '41': ['71', '22', '61', '70', '72', '16', '18', '21', '23', '21', '23', '60', '62', '15', '17'],
  '42': ['06', '27', '65', '05', '07', '59', '61', '26', '28', '71', '73', '64', '66', '55', '57'],
  '43': ['63', '22', '27', '62', '64', '35', '37', '21', '23', '21', '23', '26', '28', '71', '73'],
  '44': ['82', '81', '74', '81', '83', '27', '29', '80', '82', '17', '19', '73', '75', '46', '48'],
  '45': ['66', '88', '57', '65', '67', '65', '67', '87', '89', '87', '89', '56', '58', '74', '76'],
  '46': ['04', '82', '47', '03', '05', '39', '41', '81', '83', '27', '29', '46', '48', '73', '75'],
  '47': ['18', '46', '22', '17', '19', '80', '82', '45', '47', '63', '65', '21', '23', '21', '23'],
  '48': ['90', '84', '02', '89', '91', '08', '10', '83', '85', '47', '49', '01', '03', '19', '21'],
  '49': ['79', '94', '27', '78', '80', '96', '98', '93', '95', '48', '50', '26', '28', '71', '73'],
  '50': ['56', '82', '11', '55', '57', '64', '66', '81', '83', '27', '29', '10', '12', '10', '12'],
  '51': ['11', '64', '21', '10', '12', '10', '12', '63', '65', '45', '47', '20', '22', '11', '13'],
  '52': ['03', '04', '53', '02', '04', '29', '31', '03', '05', '39', '41', '52', '54', '34', '36'],
  '53': ['53', '52', '40', '52', '54', '34', '36', '51', '53', '24', '26', '39', '41', '03', '05'],
  '54': ['38', '48', '12', '37', '39', '82', '84', '47', '49', '83', '85', '11', '13', '20', '22'],
  '55': ['33', '81', '97', '32', '34', '32', '34', '80', '82', '17', '19', '96', '98', '78', '80'],
  '56': ['88', '98', '09', '87', '89', '87', '89', '97', '99', '88', '90', '08', '10', '89', '91'],
  '57': ['53', '45', '93', '52', '54', '34', '36', '44', '46', '53', '55', '92', '94', '38', '40'],
  '58': ['98', '51', '56', '97', '99', '88', '90', '50', '52', '14', '16', '55', '57', '64', '66'],
  '59': ['30', '85', '31', '29', '31', '02', '04', '84', '86', '57', '59', '30', '32', '12', '14'],
  '60': ['90', '34', '99', '89', '91', '08', '10', '33', '35', '42', '44', '98', '00', '98', '00'],
  '61': ['29', '22', '71', '28', '30', '91', '93', '21', '23', '21', '23', '70', '72', '16', '18'],
  '62': ['04', '52', '96', '03', '05', '39', '41', '51', '53', '24', '26', '95', '97', '68', '70'],
  '63': ['43', '91', '80', '42', '44', '33', '35', '90', '92', '18', '20', '79', '81', '07', '09'],
  '64': ['30', '64', '51', '29', '31', '02', '04', '63', '65', '45', '47', '50', '52', '14', '16'],
  '65': ['08', '09', '42', '07', '09', '79', '81', '08', '10', '89', '91', '41', '43', '23', '25'],
  '66': ['09', '88', '45', '08', '10', '89', '91', '87', '89', '87', '89', '44', '46', '53', '55'],
  '67': ['03', '87', '82', '02', '04', '29', '31', '86', '88', '77', '79', '81', '83', '27', '29'],
  '68': ['16', '92', '94', '15', '17', '60', '62', '91', '93', '28', '30', '93', '95', '48', '50'],
  '69': ['21', '30', '89', '20', '22', '11', '13', '29', '31', '02', '04', '88', '90', '97', '99'],
  '70': ['96', '33', '04', '95', '97', '68', '70', '32', '34', '32', '34', '03', '05', '39', '41'],
  '71': ['22', '61', '71', '21', '23', '21', '23', '60', '62', '15', '17', '70', '72', '16', '18'],
  '72': ['30', '91', '57', '29', '31', '02', '04', '90', '92', '18', '20', '56', '58', '74', '76'],
  '73': ['83', '98', '73', '82', '84', '37', '39', '97', '99', '88', '90', '72', '74', '36', '38'],
  '74': ['81', '31', '88', '80', '82', '17', '19', '30', '32', '12', '14', '87', '89', '87', '89'],
  '75': ['17', '56', '04', '16', '18', '70', '72', '55', '57', '64', '66', '03', '05', '39', '41'],
  '76': ['59', '30', '74', '58', '60', '94', '96', '29', '31', '02', '04', '73', '75', '46', '48'],
  '77': ['21', '81', '09', '20', '22', '11', '13', '80', '82', '17', '19', '08', '10', '89', '91'],
  '78': ['73', '40', '49', '72', '74', '36', '38', '39', '41', '03', '05', '48', '50', '93', '95'],
  '79': ['97', '40', '49', '96', '98', '78', '80', '39', '41', '03', '05', '48', '50', '93', '95'],
  '80': ['95', '23', '04', '94', '96', '58', '60', '22', '24', '31', '33', '03', '05', '39', '41'],
  '81': ['74', '89', '19', '73', '75', '46', '48', '88', '90', '97', '99', '18', '20', '90', '92'],
  '82': ['89', '44', '67', '88', '90', '97', '99', '43', '45', '43', '45', '66', '68', '75', '77'],
  '83': ['22', '73', '26', '21', '23', '21', '23', '72', '74', '36', '38', '25', '27', '61', '63'],
  '84': ['48', '21', '18', '47', '49', '83', '85', '20', '22', '11', '13', '17', '19', '80', '82'],
  '85': ['59', '61', '58', '58', '60', '94', '96', '60', '62', '15', '17', '57', '59', '84', '86'],
  '86': ['92', '00', '95', '91', '93', '28', '30', '99', '01', '99', '01', '94', '96', '58', '60'],
  '87': ['03', '67', '08', '02', '04', '29', '31', '66', '68', '75', '77', '07', '09', '79', '81'],
  '88': ['66', '56', '09', '65', '67', '65', '67', '55', '57', '64', '66', '08', '10', '89', '91'],
  '89': ['92', '82', '81', '91', '93', '28', '30', '81', '83', '27', '29', '80', '82', '17', '19'],
  '90': ['48', '34', '60', '47', '49', '83', '85', '33', '35', '42', '44', '59', '61', '05', '07'],
  '91': ['63', '61', '33', '62', '64', '35', '37', '60', '62', '15', '17', '32', '34', '32', '34'],
  '92': ['89', '86', '68', '88', '90', '97', '99', '85', '87', '67', '69', '67', '69', '85', '87'],
  '93': ['89', '22', '97', '88', '90', '97', '99', '21', '23', '21', '23', '96', '98', '78', '80'],
  '94': ['05', '82', '04', '04', '06', '49', '51', '81', '83', '27', '29', '03', '05', '39', '41'],
  '95': ['80', '23', '86', '79', '81', '07', '09', '22', '24', '31', '33', '85', '87', '67', '69'],
  '96': ['70', '16', '68', '69', '71', '06', '08', '15', '17', '60', '62', '67', '69', '85', '87'],
  '97': ['06', '79', '89', '05', '07', '59', '61', '78', '80', '96', '98', '88', '90', '97', '99'],
  '98': ['11', '56', '73', '10', '12', '10', '12', '55', '57', '64', '66', '72', '74', '36', '38'],
  '99': ['16', '38', '60', '15', '17', '60', '62', '37', '39', '82', '84', '59', '61', '05', '07'],
  '00': ['86', '97', '49', '85', '87', '67', '69', '96', '98', '78', '80', '48', '50', '93', '95'],
};

// फैमिली निकालने का फंक्शन
const getFamily = (jodi: string): string[] => {
  const rashiMap: Record<string, string> = {
    '0': '5', '1': '6', '2': '7', '3': '8', '4': '9',
    '5': '0', '6': '1', '7': '2', '8': '3', '9': '4'
  };
  const a = jodi[0];
  const b = jodi[1];
  const ar = rashiMap[a];
  const br = rashiMap[b];
  return [a+b, b+a, a+br, br+a, ar+b, b+ar, ar+br, br+ar];
};

// --- नया: दाने (Difference) निकालने का फंक्शन ---
const getDifference = (num1: string, num2: string) => Math.abs(parseInt(num1) - parseInt(num2));
const TARGET_DANAY = [1, 2, 3, 10, 20, 30]; // ऑपरेटर का ट्रैप

// === सारी कैलकुलेशन इसी फाइल के अंदर ताकि कोई बाहरी फाइल न छेड़नी पड़े ===
const calculatePredictionLocally = (
  inputs: PredictionInput,
  selectedFormulas: string[],
  pastMurda: string[],
  currentMonthNums: string[],
  todaysRes: string[],
  past4DaysMurda: string[],
  past10DaysNums: string[],
  past15DaysNums: string[]
): ExtendedPredictionResult => {
  const dateObj = new Date(inputs.date);
  const jsDay = dateObj.getDay();
  const dayOfMonth = dateObj.getDate();
  
  const jodiScores: Record<string, number> = {};
  const rawList: string[] = [];

  todaysRes.forEach(r => {
    let key = parseInt(r.trim(), 10).toString().padStart(2, '0');
    if (MASTER_SHEET[key]) {
      rawList.push(...MASTER_SHEET[key]);
    }
  });

  const counts: Record<string, number> = {};
  rawList.forEach(num => {
    counts[num] = (counts[num] || 0) + 1;
  });

  const outerHaruf = parseInt(dayOfMonth.toString().slice(-1));
  const rashi = (outerHaruf + 5) % 10;
  const LOGIC_3_JORIS = ['30', '03', '41', '14', '74', '47', '85', '58', '96', '69'];

  // पूरे 100 नंबरों का लूप और स्कोरिंग
  for (let i = 1; i <= 100; i++) {
    const jodi = i === 100 ? '00' : i.toString().padStart(2, '0');
    let score = counts[jodi] || 0; 

    // पुराने 8 फॉर्मूले
    if (selectedFormulas.includes('6')) {
      if (pastMurda.includes(jodi)) { score += 10; }
      else {
        let isMurFam = false;
        for (const pm of pastMurda) {
          if (getFamily(pm).includes(jodi)) { isMurFam = true; break; }
        }
        if (isMurFam) { score += 6; }
      }
    }

    if (selectedFormulas.includes('3') && [1,2,3].includes(dayOfMonth) && UNIVERSAL.includes(jodi)) { score += 10; }
    if (selectedFormulas.includes('4') && MAGIC.includes(jodi)) { score += 15; }
    if (selectedFormulas.includes('7') && (jodi.includes(outerHaruf.toString()) || jodi.includes(rashi.toString()))) { score += 5; }
    if (selectedFormulas.includes('5') && (DAY_WISE_FIXED[jsDay] || []).includes(jodi)) { score += 5; }

    if (selectedFormulas.includes('8')) {
      const jodiNum = parseInt(jodi);
      const baki = 100 - (jodiNum === 0 ? 100 : jodiNum);
      const bakiStr = baki === 100 ? '00' : baki.toString().padStart(2, '0');
      if (pastMurda.includes(bakiStr) || MAGIC.includes(bakiStr)) { score += 3; }
    }

    if (selectedFormulas.includes('2') && EVERGREEN.includes(jodi[0]) && EVERGREEN.includes(jodi[1])) { score += 7; }
    if (selectedFormulas.includes('9') && currentMonthNums.includes(jodi)) { score += 3; }

    if (selectedFormulas.includes('10')) {
      const isLogic3Active = LOGIC_3_JORIS.some(j => past4DaysMurda.includes(j));
      if (isLogic3Active && LOGIC_3_JORIS.includes(jodi)) {
        score += 3;
      }
    }

    // 10 दिन का पुराना नियम
    if (past10DaysNums && past10DaysNums.length > 0) {
      const fam = getFamily(jodi);
      const hasAppeared = fam.some(f => past10DaysNums.includes(f));
      if (!hasAppeared) score += 2;
    }

    // ==========================================
    // 🔴 3 नये मास्टर फॉर्मूले (आपका दिया हुआ)
    // ==========================================

    // 1. दाने का फॉर्मूला (Difference Trap - 3rd Step)
    if (past4DaysMurda && past4DaysMurda.length > 0) {
      let isDanayTrap = false;
      for (const pastNum of past4DaysMurda) {
        const diff = getDifference(jodi, pastNum);
        // अगर 1, 2, 3, 10, 20, 30 का अंतर है, तो ऑपरेटर ट्रैप काम कर रहा है
        if (TARGET_DANAY.includes(diff)) {
          isDanayTrap = true;
          break;
        }
      }
      if (isDanayTrap) score += 2;
    }

    // 2. 22 तारीख का ट्रिगर (+3 पॉइंट)
    if (dayOfMonth >= 22 && currentMonthNums && currentMonthNums.length > 0) {
      const fam = getFamily(jodi);
      const appearedInMonth = fam.some(f => currentMonthNums.includes(f));
      if (!appearedInMonth) score += 3; // जो फैमिली महीने में नहीं आई उसे ताक़त
    }

    // 3. 15 दिन बंद घर अलर्ट (+2 पॉइंट)
    if (past15DaysNums && past15DaysNums.length > 0) {
      const fam = getFamily(jodi);
      const appearedIn15Days = fam.some(f => past15DaysNums.includes(f));
      if (!appearedIn15Days) score += 2;
    }

    jodiScores[jodi] = score;
  }

  // टॉप 30 निकालना
  const sortedJodis = Object.keys(jodiScores).sort((a, b) => jodiScores[b] - jodiScores[a]);
  const final30 = sortedJodis.slice(0, 30);

  // अलर्ट मैसेज जनरेट करना (15 दिन बंद फैमिली के लिए)
  const alertsSet = new Set<string>();
  final30.forEach(jodi => {
    const fam = getFamily(jodi);
    const appearedIn15Days = fam.some(f => past15DaysNums.includes(f));
    if (!appearedIn15Days) {
      const baseFam = Math.min(...fam.map(n => parseInt(n))).toString().padStart(2, '0');
      alertsSet.add(`⚠️ ${baseFam} की फैमिली 15 दिन से बंद है, आज इसके पूरे चांस हैं!`);
    }
  });

  const l1 = final30.slice(0, 4);
  const l2 = final30.slice(4, 14);
  const l3 = final30.slice(14, 30);

  const tokariItems: TokariItem[] = [];
  Object.entries(counts).forEach(([jodi, count]) => {
    if (count > 0) {
      tokariItems.push({ id: jodi, jodis: [jodi], count: count });
    }
  });
  tokariItems.sort((a, b) => b.count - a.count || parseInt(a.id) - parseInt(b.id));

  return { 
    l1, l2, l3, tokari: tokariItems, alerts: Array.from(alertsSet) 
  };
};

const FORMULAS = [
  { id: '2', label: '2 - Evergreen' },
  { id: '3', label: '3 - Universal' },
  { id: '4', label: '4 - Magic' },
  { id: '5', label: '5 - Day Fix' },
  { id: '6', label: '6 - Murda' },
  { id: '7', label: '7 - Haruf' },
  { id: '8', label: '8 - Baki' },
  { id: '9', label: '9 - Month Trend' }
];

export default function PredictTab() {
  const [inputMode, setInputMode] = useState<'auto' | 'manual'>('auto');
  
  const [inputs, setInputs] = useState<PredictionInput>({
    date: new Date().toISOString().split('T')[0],
    fd: '', gb: '', gl: '', ds: ''
  });
  
  const [selectedFormulas, setSelectedFormulas] = useState<string[]>(FORMULAS.map(f => f.id));
  const [result, setResult] = useState<ExtendedPredictionResult | null>(null);
  const [isPredicting, setIsPredicting] = useState(false);
  
  const [selectedGame, setSelectedGame] = useState<'FD' | 'GB' | 'GL' | 'DS'>('FD');
  const [copied, setCopied] = useState(false);
  const [logged, setLogged] = useState(false);

  const ledger = useMemo(() => calculateLedger(), []);

  useEffect(() => {
    if (inputMode === 'auto') {
      const allResults = getAllResultsSorted();
      if (allResults.length > 0) {
        const latest = allResults[0];
        setInputs(prev => ({
          ...prev, fd: latest.fd, gb: latest.gb, gl: latest.gl, ds: latest.ds
        }));
      }
    } else {
      setInputs(prev => ({ ...prev, fd: '', gb: '', gl: '', ds: '' }));
    }
  }, [inputMode]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputs(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const toggleFormula = (id: string) => {
    setSelectedFormulas(prev => 
      prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id]
    );
  };

  const handlePredict = () => {
    setIsPredicting(true);
    setResult(null);
    setCopied(false);
    setLogged(false);

    setTimeout(() => {
      const pastResults = getAllResultsSorted();
      
      const pastMurda: string[] = [];
      pastResults.filter(r => new Date(r.date) < new Date(inputs.date)).slice(0, 3).forEach(r => {
        if (r.fd) pastMurda.push(r.fd); if (r.gb) pastMurda.push(r.gb);
        if (r.gl) pastMurda.push(r.gl); if (r.ds) pastMurda.push(r.ds);
      });

      const past4DaysMurda: string[] = [];
      pastResults.filter(r => new Date(r.date) < new Date(inputs.date)).slice(0, 4).forEach(r => {
        if (r.fd) past4DaysMurda.push(r.fd); if (r.gb) past4DaysMurda.push(r.gb);
        if (r.gl) past4DaysMurda.push(r.gl); if (r.ds) past4DaysMurda.push(r.ds);
      });

      const past10DaysNums: string[] = [];
      pastResults.filter(r => new Date(r.date) < new Date(inputs.date)).slice(0, 10).forEach(r => {
        if (r.fd) past10DaysNums.push(r.fd); if (r.gb) past10DaysNums.push(r.gb);
        if (r.gl) past10DaysNums.push(r.gl); if (r.ds) past10DaysNums.push(r.ds);
      });

      // 15 दिनों का डेटा (अलर्ट और स्कोर के लिए)
      const past15DaysNums: string[] = [];
      pastResults.filter(r => new Date(r.date) < new Date(inputs.date)).slice(0, 15).forEach(r => {
        if (r.fd) past15DaysNums.push(r.fd); if (r.gb) past15DaysNums.push(r.gb);
        if (r.gl) past15DaysNums.push(r.gl); if (r.ds) past15DaysNums.push(r.ds);
      });

      const currentYm = inputs.date.substring(0, 7);
      const currentMonthNums: string[] = [];
      pastResults.filter(r => r.date.startsWith(currentYm)).forEach(r => {
        if (r.fd) currentMonthNums.push(r.fd); if (r.gb) currentMonthNums.push(r.gb);
        if (r.gl) currentMonthNums.push(r.gl); if (r.ds) currentMonthNums.push(r.ds);
      });

      const todaysRes: string[] = [];
      const userInputs = [inputs.ds, inputs.gl, inputs.gb, inputs.fd].filter(v => v !== '');
      todaysRes.push(...userInputs);

      if (todaysRes.length < 4) {
        const allPastNums: string[] = [];
        pastResults.forEach(r => {
          if (r.ds) allPastNums.push(r.ds); if (r.gl) allPastNums.push(r.gl);
          if (r.gb) allPastNums.push(r.gb); if (r.fd) allPastNums.push(r.fd);
        });
        for (let i = 0; i < allPastNums.length && todaysRes.length < 4; i++) {
          todaysRes.push(allPastNums[i]);
        }
      }

      // बाहरी फाइल के बजाय इसी फाइल के फंक्शन का इस्तेमाल
      let res = calculatePredictionLocally(
        inputs, selectedFormulas, pastMurda, currentMonthNums, 
        todaysRes.slice(0, 4), past4DaysMurda, past10DaysNums, past15DaysNums
      );
      
      const userRole = sessionStorage.getItem('sahil_master_current_role') || 'guest';
      const isGuestUser = userRole !== 'admin' && userRole !== 'user';
      
      if (isGuestUser) {
        res = {
          l1: ['01', '02', '03', '04'],
          l2: ['05', '06', '07', '08', '09', '10', '11', '12', '13', '14'],
          l3: ['15', '16', '17', '18', '19', '20', '21', '22', '23', '24', '25', '26', '27', '28', '29', '30'],
          tokari: [],
          alerts: []
        };
      }

      const final30Jodis = [...res.l1, ...res.l2, ...res.l3];
      localStorage.setItem("lastPrediction", JSON.stringify(final30Jodis));

      setResult(res);
      setIsPredicting(false);
    }, 800);
  };

  const allJodis = result ? [...result.l1, ...result.l2, ...result.l3] : [];
  const currentRate = ledger.currentRates[selectedGame];
  const totalAmount = allJodis.length * currentRate;

  const copyToClipboard = () => {
    const text = `📅 Date: ${inputs.date}\n🎯 Game: ${selectedGame}\n🎲 Jodis (${allJodis.length}):\n${allJodis.join(', ')}\n\n💰 Rate: ${currentRate} Into\n💵 Total: ₹${totalAmount}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleLogToTracker = () => {
    saveTrackerEntry({ id: inputs.date, date: inputs.date, isPlay: true, passLocation: 'PENDING' });
    setLogged(true);
    setTimeout(() => setLogged(false), 2000);
  };

  return (
    <div className="p-4 space-y-6 pb-24">
      <h1 className="text-xl font-bold text-teal-400 mb-2">आज की प्रेडिक्शन</h1>

      <div className="bg-[#111827] border border-slate-800 rounded-2xl p-5 space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-white font-semibold">नंबर दर्ज करें</h2>
          <div className="flex bg-[#0B1120] rounded-lg p-1 border border-slate-800">
            <button 
              onClick={() => setInputMode('auto')}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${inputMode === 'auto' ? 'bg-teal-400 text-slate-900' : 'text-slate-400 hover:text-white'}`}
            >
              ऑटो (पिछला)
            </button>
            <button 
              onClick={() => setInputMode('manual')}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${inputMode === 'manual' ? 'bg-teal-400 text-slate-900' : 'text-slate-400 hover:text-white'}`}
            >
              मैनुअल
            </button>
          </div>
        </div>
        
        <div className="space-y-2">
          <label className="text-sm text-slate-300">प्रेडिक्शन की तारीख</label>
          <input 
            type="date" 
            name="date"
            value={inputs.date}
            onChange={handleInputChange}
            className="w-full bg-[#0B1120] border border-slate-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-teal-400 transition-colors"
          />
        </div>

        <div className="grid grid-cols-4 gap-3">
          {(['fd', 'gb', 'gl', 'ds'] as const).map((key) => (
            <div key={key} className="space-y-2 text-center">
              <label className="text-sm font-medium text-slate-300 uppercase">{key}</label>
              <input 
                type="text" 
                name={key}
                value={inputs[key]}
                onChange={handleInputChange}
                readOnly={inputMode === 'auto'}
                maxLength={2}
                placeholder="--"
                className={`w-full border rounded-lg px-2 py-3 text-center text-white focus:outline-none transition-colors font-mono ${
                  inputMode === 'auto' 
                    ? 'bg-slate-800/50 border-slate-700 text-slate-400' 
                    : 'bg-[#0B1120] border-slate-800 focus:border-teal-400 focus:ring-1 focus:ring-teal-400'
                }`}
              />
            </div>
          ))}
        </div>
        
        {inputMode === 'auto' && (
          <div className="text-xs text-slate-500 flex items-center justify-center gap-1">
            <RefreshCw className="w-3 h-3" /> लेटेस्ट रिजल्ट से डेटा ऑटो-फेच किया गया है।
          </div>
        )}
      </div>

      <div className="bg-[#111827] border border-slate-800 rounded-2xl p-5 space-y-5">
        <h2 className="text-white font-semibold">फॉर्मूला चुनें</h2>
        
        <div className="grid grid-cols-2 gap-4">
          {FORMULAS.map(formula => {
            const isSelected = selectedFormulas.includes(formula.id);
            return (
              <button 
                key={formula.id}
                onClick={() => toggleFormula(formula.id)}
                className="flex items-center space-x-3 text-left"
              >
                <div className={`w-5 h-5 rounded-full flex items-center justify-center border transition-colors ${
                  isSelected ? 'bg-teal-400 border-teal-400' : 'border-slate-600'
                }`}>
                  {isSelected && <Check className="w-3 h-3 text-slate-900 stroke-[3]" />}
                </div>
                <span className="text-sm text-slate-200">{formula.label}</span>
              </button>
            )
          })}
        </div>
      </div>

      <button 
        onClick={handlePredict}
        disabled={isPredicting || !inputs.fd || !inputs.gb || !inputs.gl || !inputs.ds}
        className="w-full bg-teal-400 hover:bg-teal-300 text-slate-900 font-bold py-4 rounded-xl flex items-center justify-center space-x-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <Zap className={`w-5 h-5 ${isPredicting ? 'animate-pulse' : ''}`} />
        <span>{isPredicting ? 'प्रेडिक्शन हो रही है...' : 'प्रेडिक्शन निकालें'}</span>
      </button>

      {result && (
        <div className="space-y-6 mt-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <h2 className="text-2xl font-bold text-teal-400 text-center">प्रेडिक्शन का रिजल्ट</h2>
          
          {/* === 15 दिन बंद घर का अलर्ट बॉक्स === */}
          {result.alerts && result.alerts.length > 0 && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-4 shadow-[0_0_15px_rgba(239,68,68,0.2)]">
              {result.alerts.map((msg, idx) => (
                <div key={idx} className="flex items-start gap-2 text-red-400 font-bold text-sm mb-2 last:mb-0">
                  <span className="animate-pulse mt-0.5">🔥</span> 
                  <span>{msg}</span>
                </div>
              ))}
            </div>
          )}

          <div className="bg-gradient-to-b from-[#374151] to-[#111827] border border-slate-700 rounded-2xl p-5 shadow-xl">
            <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
              <Send className="w-5 h-5 text-teal-400" />
              प्ले ऑप्शन और शेयर
            </h3>

            <div className="space-y-4">
              <div className="flex gap-2 p-1 bg-[#0B1120] rounded-xl overflow-hidden">
                {(['FD', 'GB', 'GL', 'DS'] as const).map(game => (
                  <button
                    key={game}
                    onClick={() => setSelectedGame(game)}
                    className={`flex-1 py-2 text-sm font-bold rounded-lg transition-colors ${
                      selectedGame === game 
                        ? 'bg-teal-400 text-slate-900' 
                        : 'text-slate-400 hover:bg-slate-800'
                    }`}
                  >
                    {game}
                  </button>
                ))}
              </div>

              <div className="bg-[#0B1120] rounded-xl p-4 border border-slate-800 text-center font-mono">
                <div className="text-slate-400 text-sm mb-1">{selectedGame} प्ले इन्फो</div>
                <div className="text-2xl font-bold text-white mb-1">
                  {currentRate} <span className="text-sm font-normal text-slate-500">Into</span>
                </div>
                <div className="text-teal-400 font-medium">कुल: ₹{totalAmount}</div>
              </div>

              <div className="flex flex-col gap-3 pt-2">
                <button 
                  onClick={copyToClipboard}
                  className="w-full bg-[#1F2937] hover:bg-[#374151] border border-slate-700 text-white font-medium py-3 rounded-xl flex items-center justify-center gap-2 transition-colors"
                >
                  {copied ? <Check className="w-5 h-5 text-green-500" /> : <Copy className="w-5 h-5" />}
                  {copied ? 'कॉपी हो गया!' : 'खाईवाल के लिए कॉपी करें'}
                </button>

                <button 
                  onClick={handleLogToTracker}
                  className={`w-full font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-colors ${
                    logged 
                      ? 'bg-green-500/20 text-green-500 border border-green-500/30' 
                      : 'bg-teal-400/10 hover:bg-teal-400/20 text-teal-400 border border-teal-400/30'
                  }`}
                >
                  {logged ? <Check className="w-5 h-5" /> : <Target className="w-5 h-5" />}
                  {logged ? 'ट्रैकर में सेव हो गया!' : 'ट्रैकर में प्ले कन्फर्म करें'}
                </button>
              </div>
            </div>
          </div>

          <div className="border border-green-500/30 rounded-2xl overflow-hidden bg-[#111827]">
            <div className="bg-green-500/10 px-4 py-3 border-b border-green-500/20">
              <h3 className="text-green-500 font-medium">L1 - सुपर VIP ({result.l1.length} जोड़ी)</h3>
            </div>
            <div className="p-4 flex flex-wrap gap-3">
              {result.l1.map((num, i) => (
                <div key={i} className="bg-green-500/20 text-green-400 font-mono text-lg px-3 py-2 rounded-lg border border-green-500/30">
                  {num}
                </div>
              ))}
              {result.l1.length === 0 && <p className="text-slate-500 text-sm">कोई नंबर नहीं</p>}
            </div>
          </div>

          <div className="border border-blue-500/30 rounded-2xl overflow-hidden bg-[#111827]">
            <div className="bg-blue-500/10 px-4 py-3 border-b border-blue-500/20">
              <h3 className="text-blue-500 font-medium">L2 - मेन ({result.l2.length} जोड़ी)</h3>
            </div>
            <div className="p-4 flex flex-wrap gap-3">
              {result.l2.map((num, i) => (
                <div key={i} className="bg-blue-500/20 text-blue-400 font-mono text-lg px-3 py-2 rounded-lg border border-blue-500/30">
                  {num}
                </div>
              ))}
              {result.l2.length === 0 && <p className="text-slate-500 text-sm">कोई नंबर नहीं</p>}
            </div>
          </div>

          <div className="border border-teal-400/30 rounded-2xl overflow-hidden bg-[#111827]">
            <div className="bg-teal-400/10 px-4 py-3 border-b border-teal-400/20">
              <h3 className="text-teal-400 font-medium">L3 - सपोर्ट ({result.l3.length} जोड़ी)</h3>
            </div>
            <div className="p-4 flex flex-wrap gap-3">
              {result.l3.map((num, i) => (
                <div key={i} className="bg-teal-400/20 text-teal-300 font-mono text-lg px-3 py-2 rounded-lg border border-teal-400/30">
                  {num}
                </div>
              ))}
              {result.l3.length === 0 && <p className="text-slate-500 text-sm">कोई नंबर नहीं</p>}
            </div>
          </div>

          {result.tokari && result.tokari.length > 0 && (
            <div className="bg-[#111827] border border-slate-800 rounded-2xl p-5">
              <h3 className="text-white font-semibold mb-4">टोकरी काउंट्स</h3>
              <div className="grid grid-cols-4 md:grid-cols-5 gap-3">
                {result.tokari.map((item, i) => (
                  <div key={i} className="bg-[#374151] rounded-lg p-2 flex flex-col items-center justify-center border border-slate-700/50">
                    <div className="text-white font-mono font-medium text-sm md:text-base">
                      {item.id}
                    </div>
                    <div className="text-xs text-slate-400 mt-1">
                      {item.count}x
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
