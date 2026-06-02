// ── FIREBASE ──
const FB_CONFIG = {
  apiKey: "AIzaSyAzHmxAactheJtzj-fOF2iv6AehJzTLkTo",
  authDomain: "fanzone-worldcup.firebaseapp.com",
  projectId: "fanzone-worldcup",
  storageBucket: "fanzone-worldcup.firebasestorage.app",
  messagingSenderId: "850033266100",
  appId: "1:850033266100:web:58faf907ac418ad2a5f6e1"
};

// ── USER STATE ──
window.FZ = {
  user: null,
  profile: null,

  getProfile() {
    if (!this.user) return null;
    const saved = localStorage.getItem('fz_profile_' + this.user.uid);
    return saved ? JSON.parse(saved) : null;
  },

  saveProfile(data) {
    if (!this.user) return;
    const current = this.getProfile() || {};
    const updated = { ...current, ...data };
    localStorage.setItem('fz_profile_' + this.user.uid, JSON.stringify(updated));
    this.profile = updated;
    return updated;
  },

  getStats() {
    if (!this.user) return { xp: 0, streak: 0, predictions: 0, accuracy: 0 };
    const saved = localStorage.getItem('fz_stats_' + this.user.uid);
    return saved ? JSON.parse(saved) : { xp: 0, streak: 0, predictions: 0, accuracy: 68 };
  },

  saveStats(data) {
    if (!this.user) return;
    const current = this.getStats();
    const updated = { ...current, ...data };
    localStorage.setItem('fz_stats_' + this.user.uid, JSON.stringify(updated));
    return updated;
  },

  addXP(amount) {
    const stats = this.getStats();
    stats.xp += amount;
    stats.streak = (stats.streak || 0) + 1;
    this.saveStats(stats);
    showToast('⚡ +' + amount + ' XP');
    return stats;
  },

  isOnboarded() {
    if (!this.user) return !!localStorage.getItem('fz_guest_onboarded');
    return !!localStorage.getItem('fz_onboarded_' + this.user.uid);
  },

  markOnboarded() {
    if (this.user) localStorage.setItem('fz_onboarded_' + this.user.uid, '1');
    else localStorage.setItem('fz_guest_onboarded', '1');
  },

  generateReferralCode() {
    const chars = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
    let code = '';
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  },

  getReferralCode() {
    if (!this.user) return null;
    let profile = this.getProfile();
    if (!profile) profile = {};

    // Generate if doesn't exist
    if (!profile.referralCode) {
      profile.referralCode = this.generateReferralCode();
      this.saveProfile(profile);
    }
    return profile.referralCode;
  },

  getInviteUrl() {
    const code = this.getReferralCode();
    if (!code) return null;
    const base = window.location.origin;
    return base + '/game/?ref=' + code;
  },

  applyReferral(referralCode) {
    if (!this.user) return;
    const stats = this.getStats();
    // Check if already claimed
    if (stats.referralApplied) return false;

    stats.referralApplied = true;
    stats.xp += 200;
    this.saveStats(stats);
    return true;
  },

  checkAndApplyReferral() {
    if (!this.user) return null;
    const params = new URLSearchParams(window.location.search);
    const refCode = params.get('ref');

    if (refCode && this.applyReferral(refCode)) {
      // Clear the URL parameter
      window.history.replaceState({}, document.title, window.location.pathname);
      return refCode;
    }
    return null;
  }
};

// ── TOAST ──
let _toastTimer;
window.showToast = function(msg, duration = 2600) {
  let t = document.getElementById('fz-toast');
  if (!t) {
    t = document.createElement('div');
    t.id = 'fz-toast';
    t.className = 'toast';
    document.body.appendChild(t);
  }
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(_toastTimer);
  _toastTimer = setTimeout(() => t.classList.remove('show'), duration);
};

// ── NAV ACTIVE STATE ──
window.setActiveNav = function(page) {
  document.querySelectorAll('.nav-item').forEach(el => {
    el.classList.toggle('active', el.dataset.page === page);
  });
};

// ── HELPERS ──
window.formatXP = n => n >= 1000 ? (n/1000).toFixed(1).replace('.0','') + 'K' : n;
