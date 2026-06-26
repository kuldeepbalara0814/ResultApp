// src/utils/feedback.ts

export const triggerSuccessFeedback = () => {
  // 1. वाइब्रेशन (Vibration) - 40ms का एक हल्का सा झटका
  if (typeof navigator !== 'undefined' && navigator.vibrate) {
    navigator.vibrate(40);
  }

  // 2. 'Ting' Sound (बिना किसी MP3 फाइल के)
  try {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContext) return;
    
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();

    // साउंड की सेटिंग (एकदम मीठी 'Ting' जैसी आवाज़)
    osc.type = 'sine';
    osc.frequency.setValueAtTime(1200, ctx.currentTime); 
    
    // वॉल्यूम कंट्रोल (तेज़ से शुरू होकर एकदम कम होना)
    gainNode.gain.setValueAtTime(0.3, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);

    osc.connect(gainNode);
    gainNode.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.5);
  } catch (e) {
    console.error("Audio feedback not supported", e);
  }
};

