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
  },

  // ── STREAKS ──
  getStreak() {
    if (!this.user) return { current: 0, longest: 0, lastDate: null };
    const saved = localStorage.getItem('fz_streak_' + this.user.uid);
    return saved ? JSON.parse(saved) : { current: 0, longest: 0, lastDate: null };
  },

  saveStreak(data) {
    if (!this.user) return;
    localStorage.setItem('fz_streak_' + this.user.uid, JSON.stringify(data));
  },

  updateStreak() {
    if (!this.user) return;
    const streak = this.getStreak();
    const today = new Date().toDateString();

    // Check if user already actioned today
    if (streak.lastDate === today) {
      return streak.current; // Already updated today
    }

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toDateString();

    // Continue streak if action was yesterday
    if (streak.lastDate === yesterdayStr) {
      streak.current++;
    } else {
      // Streak broken, restart
      streak.current = 1;
    }

    streak.longest = Math.max(streak.longest, streak.current);
    streak.lastDate = today;
    this.saveStreak(streak);

    return streak.current;
  },

  // ── CHALLENGES ──
  getChallenges() {
    if (!this.user) return [];
    const saved = localStorage.getItem('fz_challenges_' + this.user.uid);
    return saved ? JSON.parse(saved) : this.getDefaultChallenges();
  },

  getDefaultChallenges() {
    const today = new Date().toDateString();
    return [
      { id: 1, title: 'React Master', desc: 'Post 10 reactions', target: 10, current: 0, reward: 250, type: 'reactions', date: today },
      { id: 2, title: 'Penalty Pro', desc: 'Score 5 goals', target: 5, current: 0, reward: 300, type: 'goals', date: today },
      { id: 3, title: 'Predictor', desc: 'Make 3 predictions', target: 3, current: 0, reward: 150, type: 'predictions', date: today },
      { id: 4, title: 'Social Butterfly', desc: 'Add 2 friends', target: 2, current: 0, reward: 200, type: 'friends', date: today }
    ];
  },

  saveChallenges(challenges) {
    if (!this.user) return;
    localStorage.setItem('fz_challenges_' + this.user.uid, JSON.stringify(challenges));
  },

  updateChallenge(type, increment = 1) {
    if (!this.user) return [];
    const challenges = this.getChallenges();
    const today = new Date().toDateString();

    // Reset challenges if new day
    challenges.forEach(c => {
      if (c.date !== today) {
        c.current = 0;
        c.date = today;
        c.completed = false;
      }
    });

    challenges.forEach(c => {
      if (c.type === type && c.current < c.target) {
        c.current += increment;
        if (c.current >= c.target && !c.completed) {
          c.completed = true;
          const stats = this.getStats();
          stats.xp += c.reward;
          this.saveStats(stats);

          // Celebratory notification
          showToast('🏆 ' + c.title + ' Complete! +' + c.reward + ' XP');
          this.sendNotification('🏆 ' + c.title, {
            body: 'You earned ' + c.reward + ' XP! Keep it up!',
            tag: 'challenge-' + c.id
          });
        }
      }
    });

    this.saveChallenges(challenges);
    return challenges;
  },

  // ── NOTIFICATIONS ──
  async requestNotificationPermission() {
    if (!('Notification' in window)) {
      console.log('Notifications not supported');
      return false;
    }

    if (Notification.permission === 'granted') {
      return true;
    }

    if (Notification.permission !== 'denied') {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    }
    return false;
  },

  sendNotification(title, options = {}) {
    if (Notification.permission === 'granted') {
      try {
        new Notification(title, {
          icon: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y="75" font-size="90">⚽</text></svg>',
          badge: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y="75" font-size="90">★</text></svg>',
          ...options
        });
      } catch (e) {
        console.error('Notification error:', e);
      }
    }
  },

  // ── DAILY BONUS ──
  claimDailyBonus() {
    if (!this.user) return false;
    const today = new Date().toDateString();
    const lastBonus = localStorage.getItem('fz_bonus_' + this.user.uid);

    if (lastBonus === today) {
      return false; // Already claimed today
    }

    const stats = this.getStats();
    stats.xp += 100;
    stats.dailyBonus = (stats.dailyBonus || 0) + 1;
    this.saveStats(stats);

    localStorage.setItem('fz_bonus_' + this.user.uid, today);

    showToast('🎁 Daily Bonus +100 XP');
    this.sendNotification('🎁 Daily Bonus Claimed!', {
      body: '+100 XP for showing up today!',
      tag: 'daily-bonus'
    });

    return true;
  },

  // ── YOUTUBE SUBSCRIPTION PROMPT ──
  showYouTubePrompt() {
    if (!this.user) return;
    const today = new Date().toDateString();
    const promptShown = localStorage.getItem('fz_youtube_prompt_' + this.user.uid);

    if (promptShown === today) return; // Already shown today

    localStorage.setItem('fz_youtube_prompt_' + this.user.uid, today);

    const html = `
      <div style="position:fixed;inset:0;background:rgba(0,0,0,.8);display:flex;align-items:center;justify-content:center;z-index:999;padding:16px;animation:fadeIn .3s">
        <div style="background:linear-gradient(135deg,#000 0%,#1a1a1a 100%);border:1px solid #ff0000;border-radius:var(--radius);padding:24px;max-width:340px;width:100%;text-align:center;animation:slideUp .4s">
          <div style="font-size:3rem;margin-bottom:12px">🎥</div>
          <div style="font-family:var(--font-display);font-size:1.4rem;font-weight:900;color:#fff;margin-bottom:8px">Subscribe to RESSI</div>
          <div style="font-size:.9rem;color:#aaa;margin-bottom:16px;line-height:1.6">
            Get exclusive clips, behind-the-scenes content, and live reactions. Don't miss out!
          </div>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:12px">
            <a href="https://www.youtube.com/@RESSI-u3n" target="_blank" rel="noopener noreferrer" style="background:#ff0000;color:#fff;border:none;padding:12px;border-radius:6px;font-weight:700;text-decoration:none;cursor:pointer;font-size:.9rem;display:flex;align-items:center;justify-content:center;gap:6px">
              📺 Subscribe Now
            </a>
            <button onclick="closeYouTubePrompt()" style="background:transparent;border:1px solid #444;color:#aaa;padding:12px;border-radius:6px;font-weight:700;cursor:pointer;font-size:.9rem">Maybe Later</button>
          </div>
          <div style="font-size:.75rem;color:#666;margin-top:8px">You'll earn an extra +50 XP for subscribing</div>
        </div>
      </div>
    `;

    document.body.insertAdjacentHTML('beforeend', html);
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

window.closeYouTubePrompt = function() {
  const modal = document.querySelector('[style*="position:fixed"][style*="z-index:999"]');
  if (modal) {
    modal.style.animation = 'fadeOut .3s';
    setTimeout(() => modal.remove(), 300);
  }
};

window.showYouTubePrompt = function() {
  FZ.showYouTubePrompt();
};
