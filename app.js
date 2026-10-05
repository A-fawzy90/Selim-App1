// ==========================================================================
// أسبوعي (My Week) - Child Friendly Study Planner
// Modular Application Logic & Reactive State
// ==========================================================================

import { defaultSettings, defaultSchedule, CATEGORY_DEFINITIONS, ARABIC_DAYS } from './sample-data.js';

// ==========================================================================
// HTML5 Canvas Mini-Game Engine: "مغامرة بطل النجوم" (Star Hero Adventure)
// High-Octane 10-Year-Old Challenge Edition: Hearts, Meteors, Lightning, Combos & Power-ups
// ==========================================================================
class StarHeroGame {
  constructor(canvas, app) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.app = app;
    this.width = 800;
    this.height = 420;

    // Retina display support
    this.setupCanvasDpi();

    this.difficulty = this.app.settings.gameConfig?.difficulty || 'medium';
    this.maxLives = this.difficulty === 'easy' ? Infinity : 3;
    this.lives = this.maxLives;
    this.runScore = 0;
    this.combo = 0;
    this.comboTimer = 0;
    this.stage = 1; // 1: morning, 2: sunset, 3: space
    this.cameraShake = 0;

    this.player = {
      x: 120,
      y: 200,
      vy: 0,
      radius: 26,
      gravity: 0.36,
      jumpForce: -7.6,
      shieldFrames: 0,
      capeWave: 0
    };

    // Power-ups state (frames remaining)
    this.powerups = {
      magnet: 0,
      turbo: 0,
      shield: false
    };

    this.collectibles = [];
    this.obstacles = [];
    this.particles = [];
    this.scorePopups = [];
    this.speedStreaks = [];
    this.bgClouds = [
      { x: 80, y: 40, scale: 1.1, speed: 0.4 },
      { x: 300, y: 70, scale: 0.8, speed: 0.3 },
      { x: 550, y: 35, scale: 1.2, speed: 0.5 },
      { x: 750, y: 80, scale: 0.9, speed: 0.35 }
    ];

    this.frameCount = 0;
    this.isRunning = false;
    this.animId = null;

    // Avatar image
    this.avatarImg = new Image();
    this.updateAvatarImage();

    this.bindControls();
  }

  setupCanvasDpi() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.canvas.width = this.width * dpr;
    this.canvas.height = this.height * dpr;
    this.ctx.scale(dpr, dpr);
  }

  updateAvatarImage() {
    const src = this.app.settings.avatarDataUrl || this.app.settings.avatarPreset || 'assets/avatar_son.jpg';
    this.avatarImg.src = src;
  }

  setDifficulty(diff) {
    this.difficulty = diff;
    this.maxLives = (diff === 'easy') ? Infinity : 3;
    this.lives = this.maxLives;
    this.app.updateGameHud();
  }

  bindControls() {
    const triggerJump = () => {
      if (!this.app.gameSession.unlocked || !this.isRunning || this.app.gameSession.paused) return;
      this.jump();
    };

    // Canvas click / touch
    this.canvas.addEventListener('pointerdown', (e) => {
      e.preventDefault();
      triggerJump();
    });

    // Space & Arrow Up
    window.addEventListener('keydown', (e) => {
      if (this.app.activeTab !== 'game' || !this.isRunning) return;
      if (e.code === 'Space' || e.code === 'ArrowUp') {
        e.preventDefault();
        triggerJump();
      } else if (e.code === 'ArrowRight') {
        this.player.x = Math.min(this.player.x + 22, 380);
      } else if (e.code === 'ArrowLeft') {
        this.player.x = Math.max(this.player.x - 22, 60);
      }
    });

    // Touch controls
    const btnJump = document.getElementById('btn-touch-jump');
    if (btnJump) {
      btnJump.addEventListener('pointerdown', (e) => {
        e.preventDefault();
        triggerJump();
      });
    }

    const btnRight = document.getElementById('btn-touch-right');
    if (btnRight) {
      btnRight.addEventListener('pointerdown', (e) => {
        e.preventDefault();
        this.player.x = Math.min(this.player.x + 26, 380);
      });
    }

    const btnLeft = document.getElementById('btn-touch-left');
    if (btnLeft) {
      btnLeft.addEventListener('pointerdown', (e) => {
        e.preventDefault();
        this.player.x = Math.max(this.player.x - 26, 60);
      });
    }

    // Run over retry button
    const retryBtn = document.getElementById('btn-runover-retry');
    if (retryBtn) {
      retryBtn.addEventListener('click', () => this.retryRun());
    }

    const exitBtn = document.getElementById('btn-runover-exit');
    if (exitBtn) {
      exitBtn.addEventListener('click', () => {
        const overlay = document.getElementById('game-runover-overlay');
        if (overlay) overlay.style.display = 'none';
        this.app.endGameSession();
      });
    }
  }

  jump() {
    this.player.vy = this.player.jumpForce;
    this.app.playGentleTone(520, 'sine', 0.12, 0.08);

    // Rocket booster particles
    const flameColor = this.powerups.turbo > 0 ? '#06B6D4' : '#F59E0B';
    for (let i = 0; i < 5; i++) {
      this.particles.push({
        x: this.player.x - 20,
        y: this.player.y + 18 + (Math.random() - 0.5) * 6,
        vx: -(Math.random() * 4 + 2),
        vy: (Math.random() - 0.5) * 2.5,
        radius: Math.random() * 4 + 2,
        color: flameColor,
        alpha: 1
      });
    }
  }

  start() {
    this.isRunning = true;
    this.updateAvatarImage();
    this.difficulty = this.app.settings.gameConfig?.difficulty || 'medium';
    this.maxLives = this.difficulty === 'easy' ? Infinity : 3;
    this.lives = this.maxLives;
    this.player.y = 200;
    this.player.x = 120;
    this.player.vy = 0;
    this.player.shieldFrames = 0;
    this.runScore = 0;
    this.combo = 0;
    this.comboTimer = 0;
    this.stage = 1;
    this.cameraShake = 0;
    this.powerups = { magnet: 0, turbo: 0, shield: false };
    this.collectibles = [];
    this.obstacles = [];
    this.particles = [];
    this.scorePopups = [];
    this.speedStreaks = [];
    this.frameCount = 0;

    const overlay = document.getElementById('game-runover-overlay');
    if (overlay) overlay.style.display = 'none';

    this.app.updateGameHud();
    if (this.animId) cancelAnimationFrame(this.animId);
    this.loop();
  }

  retryRun() {
    const overlay = document.getElementById('game-runover-overlay');
    if (overlay) overlay.style.display = 'none';
    this.start();
  }

  pause() {
    this.isRunning = false;
    if (this.animId) cancelAnimationFrame(this.animId);
  }

  resume() {
    if (!this.isRunning) {
      this.isRunning = true;
      this.loop();
    }
  }

  stop() {
    this.isRunning = false;
    if (this.animId) cancelAnimationFrame(this.animId);
    this.ctx.clearRect(0, 0, this.width, this.height);
  }

  loop() {
    if (!this.isRunning) return;
    this.update();
    this.render();
    this.animId = requestAnimationFrame(() => this.loop());
  }

  update() {
    this.frameCount++;
    this.player.capeWave += 0.16;

    if (this.cameraShake > 0) {
      this.cameraShake--;
    }

    // Power-up timers
    if (this.powerups.magnet > 0) this.powerups.magnet--;
    if (this.powerups.turbo > 0) this.powerups.turbo--;

    // Update power-up DOM bar
    const puBar = document.getElementById('game-powerup-bar');
    const magnetPill = document.getElementById('powerup-magnet');
    const turboPill = document.getElementById('powerup-turbo');
    const shieldPill = document.getElementById('powerup-shield');
    const magnetTime = document.getElementById('pu-magnet-time');
    const turboTime = document.getElementById('pu-turbo-time');

    if (puBar) {
      const anyActive = this.powerups.magnet > 0 || this.powerups.turbo > 0 || this.powerups.shield;
      puBar.style.display = anyActive ? 'flex' : 'none';
      if (magnetPill) {
        magnetPill.style.display = this.powerups.magnet > 0 ? 'inline-flex' : 'none';
        if (magnetTime) magnetTime.textContent = `${Math.ceil(this.powerups.magnet / 60)}s`;
      }
      if (turboPill) {
        turboPill.style.display = this.powerups.turbo > 0 ? 'inline-flex' : 'none';
        if (turboTime) turboTime.textContent = `${Math.ceil(this.powerups.turbo / 60)}s`;
      }
      if (shieldPill) {
        shieldPill.style.display = this.powerups.shield ? 'inline-flex' : 'none';
      }
    }

    // Combo timer
    if (this.comboTimer > 0) {
      this.comboTimer--;
      if (this.comboTimer <= 0) {
        this.combo = 0;
        this.app.updateGameHud();
      }
    }

    // Stage progression
    const prevStage = this.stage;
    if (this.runScore >= 800) {
      this.stage = 3; // Space
    } else if (this.runScore >= 350) {
      this.stage = 2; // Sunset
    } else {
      this.stage = 1; // Morning
    }

    if (this.stage !== prevStage) {
      const stageNames = { 2: 'المرحلة 2: سماء الغروب السريعة! 🌅', 3: 'المرحلة 3: الفضاء الكوني المليء بالنيازك! 🌌🚀' };
      if (stageNames[this.stage]) {
        this.app.showToast(stageNames[this.stage], 'success');
        this.app.playCelebrationSound();
      }
      this.app.updateGameHud();
    }

    // Base speed
    let stageSpeed = this.stage === 3 ? 4.8 : (this.stage === 2 ? 3.8 : 3.0);
    if (this.difficulty === 'hard') stageSpeed += 0.8;
    if (this.difficulty === 'easy') stageSpeed -= 0.6;
    if (this.powerups.turbo > 0) stageSpeed *= 1.5;

    // Physics
    this.player.vy += this.player.gravity;
    this.player.y += this.player.vy;

    // Screen bounds
    if (this.player.y < 35) {
      this.player.y = 35;
      this.player.vy = 0;
    }
    if (this.player.y > this.height - 45) {
      this.player.y = this.height - 45;
      this.player.vy = 0;
    }

    if (this.player.shieldFrames > 0) {
      this.player.shieldFrames--;
    }

    // Spawn Collectibles
    const itemInterval = this.difficulty === 'hard' ? 45 : 55;
    if (this.frameCount % itemInterval === 0) {
      const types = [
        { type: 'star', icon: '⭐', points: 10, color: '#F59E0B', radius: 18 },
        { type: 'book', icon: '📚', points: 20, color: '#10B981', radius: 18 },
        { type: 'gem', icon: '💎', points: 30, color: '#06B6D4', radius: 18 },
        { type: 'medal', icon: '🏅', points: 50, color: '#8B5CF6', radius: 20 }
      ];
      const rand = Math.random();
      let chosen = types[0];
      if (rand > 0.85) chosen = types[3];
      else if (rand > 0.65) chosen = types[2];
      else if (rand > 0.40) chosen = types[1];

      this.collectibles.push({
        ...chosen,
        x: this.width + 30,
        y: Math.random() * (this.height - 120) + 50,
        baseY: Math.random() * (this.height - 120) + 50,
        floatOffset: Math.random() * Math.PI * 2,
        speed: stageSpeed * 0.95
      });
    }

    // Spawn Power-Ups (Magnet, Turbo, Shield, Heart)
    const powerupInterval = this.difficulty === 'hard' ? 180 : 150;
    if (this.frameCount % powerupInterval === 0 && Math.random() > 0.35) {
      const puTypes = [
        { type: 'magnet', icon: '🧲', name: 'مغناطيس', color: '#3B82F6', radius: 20 },
        { type: 'turbo', icon: '⚡', name: 'تيربو خارق', color: '#F59E0B', radius: 20 },
        { type: 'shield', icon: '🛡️', name: 'درع طاقة', color: '#8B5CF6', radius: 20 }
      ];
      // If injured, chance of heart
      if (this.lives < 3 && this.difficulty !== 'easy' && Math.random() > 0.5) {
        puTypes.push({ type: 'heart', icon: '💖', name: 'قلب طاقة', color: '#EC4899', radius: 20 });
      }
      const chosenPu = puTypes[Math.floor(Math.random() * puTypes.length)];

      this.collectibles.push({
        ...chosenPu,
        isPowerup: true,
        points: 25,
        x: this.width + 30,
        y: Math.random() * (this.height - 140) + 60,
        baseY: Math.random() * (this.height - 140) + 60,
        floatOffset: Math.random() * Math.PI * 2,
        speed: stageSpeed
      });
    }

    // Spawn Obstacles (Clouds, Storm clouds, Meteors, Plasma Orbs)
    const obsInterval = this.difficulty === 'hard' ? 110 : (this.difficulty === 'medium' ? 140 : 200);
    if (this.frameCount % obsInterval === 0) {
      if (this.difficulty === 'easy') {
        // Gentle clouds only
        this.obstacles.push({
          type: 'gentle_cloud',
          x: this.width + 50,
          y: Math.random() * (this.height - 140) + 60,
          radius: 30,
          speed: stageSpeed * 0.8
        });
      } else {
        // Dynamic obstacle pool for 10-year-olds
        const obsPool = ['storm_cloud', 'meteor', 'plasma_orb'];
        if (this.stage === 1) obsPool.push('gentle_cloud', 'storm_cloud');
        if (this.stage >= 2) obsPool.push('meteor', 'meteor');
        const chosenType = obsPool[Math.floor(Math.random() * obsPool.length)];

        if (chosenType === 'meteor') {
          this.obstacles.push({
            type: 'meteor',
            x: this.width + 50,
            y: Math.random() * (this.height - 150) + 40,
            radius: 24,
            speed: stageSpeed * 1.35,
            vy: (Math.random() - 0.3) * 1.5,
            trail: []
          });
        } else if (chosenType === 'storm_cloud') {
          this.obstacles.push({
            type: 'storm_cloud',
            x: this.width + 60,
            y: Math.random() * (this.height - 180) + 40,
            radius: 32,
            speed: stageSpeed * 0.85,
            lightningTimer: 0
          });
        } else if (chosenType === 'plasma_orb') {
          this.obstacles.push({
            type: 'plasma_orb',
            x: this.width + 50,
            y: Math.random() * (this.height - 140) + 60,
            baseY: Math.random() * (this.height - 140) + 60,
            radius: 22,
            speed: stageSpeed,
            oscillationOffset: Math.random() * Math.PI * 2
          });
        } else {
          this.obstacles.push({
            type: 'gentle_cloud',
            x: this.width + 50,
            y: Math.random() * (this.height - 140) + 60,
            radius: 30,
            speed: stageSpeed * 0.8
          });
        }
      }
    }

    // Magnet: Pull collectibles toward player
    if (this.powerups.magnet > 0) {
      this.collectibles.forEach(c => {
        const dx = this.player.x - c.x;
        const dy = this.player.y - c.y;
        const dist = Math.hypot(dx, dy);
        if (dist < 260) {
          c.x += (dx / dist) * 8.5;
          c.y += (dy / dist) * 8.5;
        }
      });
    }

    // Update Collectibles
    for (let i = this.collectibles.length - 1; i >= 0; i--) {
      const c = this.collectibles[i];
      c.x -= c.speed;
      c.y = c.baseY + Math.sin(this.frameCount * 0.08 + c.floatOffset) * 12;

      // Collision check with player
      const dist = Math.hypot(c.x - this.player.x, c.y - this.player.y);
      if (dist < this.player.radius + c.radius) {
        // Collect item!
        this.combo++;
        this.comboTimer = 180; // 3 seconds to keep combo alive

        let mult = 1;
        if (this.combo >= 10) mult = 5;
        else if (this.combo >= 6) mult = 3;
        else if (this.combo >= 3) mult = 2;

        const earned = c.points * mult;
        this.runScore += earned;
        this.app.gameSession.score += earned;
        this.app.updateGameHud();

        // Handle Power-Up pickups
        if (c.isPowerup) {
          this.app.playCelebrationSound();
          if (c.type === 'magnet') {
            this.powerups.magnet = 8 * 60;
            this.scorePopups.push({ text: '🧲 مغناطيس النجوم!', x: c.x, y: c.y, alpha: 1, vy: -1.8, color: '#3B82F6' });
          } else if (c.type === 'turbo') {
            this.powerups.turbo = 5 * 60;
            this.scorePopups.push({ text: '⚡ تيربو خارق نفاث!', x: c.x, y: c.y, alpha: 1, vy: -1.8, color: '#F59E0B' });
          } else if (c.type === 'shield') {
            this.powerups.shield = true;
            this.scorePopups.push({ text: '🛡️ درع حماية بلوري!', x: c.x, y: c.y, alpha: 1, vy: -1.8, color: '#8B5CF6' });
          } else if (c.type === 'heart') {
            this.lives = Math.min(3, this.lives + 1);
            this.app.updateGameHud();
            this.scorePopups.push({ text: '💖 استعادة قلب طاقة!', x: c.x, y: c.y, alpha: 1, vy: -1.8, color: '#EC4899' });
          }
        } else {
          // Standard item
          if (c.type === 'medal') {
            this.app.playCelebrationSound();
          } else if (c.type === 'book') {
            this.app.playGentleTone(784, 'triangle', 0.2, 0.15);
            setTimeout(() => this.app.playGentleTone(987.77, 'sine', 0.25, 0.12), 80);
          } else {
            this.app.playGentleTone(880, 'sine', 0.15, 0.12);
          }

          const comboLabel = mult > 1 ? ` (x${mult}🔥)` : '';
          this.scorePopups.push({
            text: `+${earned} ${c.icon}${comboLabel}`,
            x: c.x,
            y: c.y,
            alpha: 1,
            vy: -1.6,
            color: c.color
          });
        }

        // Sparkle burst
        for (let p = 0; p < 8; p++) {
          const angle = (Math.PI * 2 / 8) * p;
          this.particles.push({
            x: c.x,
            y: c.y,
            vx: Math.cos(angle) * (Math.random() * 3 + 2),
            vy: Math.sin(angle) * (Math.random() * 3 + 2),
            radius: Math.random() * 3 + 2,
            color: c.color,
            alpha: 1
          });
        }

        this.collectibles.splice(i, 1);
        continue;
      }

      if (c.x < -40) {
        this.collectibles.splice(i, 1);
      }
    }

    // Update Obstacles & Collision Check
    for (let i = this.obstacles.length - 1; i >= 0; i--) {
      const obs = this.obstacles[i];
      obs.x -= obs.speed;

      if (obs.type === 'meteor') {
        obs.y += obs.vy || 0.5;
        // Meteor fire tail
        if (this.frameCount % 2 === 0) {
          this.particles.push({
            x: obs.x + 16,
            y: obs.y + (Math.random() - 0.5) * 8,
            vx: Math.random() * 3 + 1,
            vy: (Math.random() - 0.5) * 1.5,
            radius: Math.random() * 4 + 2,
            color: ['#EF4444', '#F59E0B', '#FCD34D'][Math.floor(Math.random() * 3)],
            alpha: 0.9
          });
        }
      } else if (obs.type === 'plasma_orb') {
        obs.y = obs.baseY + Math.sin(this.frameCount * 0.09 + obs.oscillationOffset) * 28;
      } else if (obs.type === 'storm_cloud') {
        obs.lightningTimer++;
      }

      // Check collision with player
      const dist = Math.hypot(obs.x - this.player.x, obs.y - this.player.y);
      let isHit = dist < this.player.radius + obs.radius;

      // Special check: storm cloud lightning bolt
      if (obs.type === 'storm_cloud' && !isHit) {
        const isUnderCloud = Math.abs(this.player.x - obs.x) < 22 && this.player.y > obs.y && this.player.y < obs.y + 110;
        const isLightningActive = (obs.lightningTimer % 70) > 45;
        if (isUnderCloud && isLightningActive) {
          isHit = true;
        }
      }

      if (isHit) {
        // CASE 1: TURBO active -> Smash obstacle!
        if (this.powerups.turbo > 0) {
          this.cameraShake = 8;
          this.app.gameSession.score += 30;
          this.runScore += 30;
          this.app.updateGameHud();
          this.app.playGentleTone(440, 'triangle', 0.25, 0.2);

          this.scorePopups.push({
            text: 'تحطيم نفاث! 💥 +30',
            x: obs.x,
            y: obs.y,
            alpha: 1,
            vy: -1.6,
            color: '#F59E0B'
          });

          // Explosion particles
          for (let p = 0; p < 12; p++) {
            const angle = (Math.PI * 2 / 12) * p;
            this.particles.push({
              x: obs.x,
              y: obs.y,
              vx: Math.cos(angle) * (Math.random() * 5 + 3),
              vy: Math.sin(angle) * (Math.random() * 5 + 3),
              radius: Math.random() * 5 + 3,
              color: '#F59E0B',
              alpha: 1
            });
          }

          this.obstacles.splice(i, 1);
          continue;
        }

        // CASE 2: Crystal Shield active -> Shatter shield without losing heart!
        if (this.powerups.shield) {
          this.powerups.shield = false;
          this.player.shieldFrames = 45;
          this.cameraShake = 6;
          this.player.vy = -5;
          this.app.playGentleTone(600, 'sawtooth', 0.2, 0.15);

          this.scorePopups.push({
            text: 'حماك الدرع البلوري! 🛡️✨',
            x: this.player.x,
            y: this.player.y - 30,
            alpha: 1,
            vy: -1.4,
            color: '#8B5CF6'
          });

          for (let p = 0; p < 10; p++) {
            this.particles.push({
              x: this.player.x,
              y: this.player.y,
              vx: (Math.random() - 0.5) * 6,
              vy: (Math.random() - 0.5) * 6,
              radius: Math.random() * 4 + 2,
              color: '#A78BFA',
              alpha: 1
            });
          }
          continue;
        }

        // CASE 3: Normal collision
        if (this.player.shieldFrames <= 0) {
          if (obs.type === 'gentle_cloud' && this.difficulty === 'easy') {
            // Friendly bounce
            this.player.vy = -6;
            this.player.shieldFrames = 60;
            this.app.playGentleTone(300, 'sine', 0.2, 0.1);
            this.scorePopups.push({ text: 'قفزة سحابية! ☁️🌸', x: this.player.x, y: this.player.y - 30, alpha: 1, vy: -1.2, color: '#6366F1' });
          } else {
            // Damage! Lose 1 Heart
            this.lives--;
            this.combo = 0;
            this.cameraShake = 12;
            this.player.shieldFrames = 80;
            this.player.vy = -5.5;
            this.app.playGentleTone(196, 'sawtooth', 0.35, 0.18);
            this.app.updateGameHud();

            this.scorePopups.push({
              text: '-1 ❤️ انتبه يا بطل!',
              x: this.player.x,
              y: this.player.y - 30,
              alpha: 1,
              vy: -1.5,
              color: '#EF4444'
            });

            // Damage particles
            for (let p = 0; p < 8; p++) {
              this.particles.push({
                x: this.player.x,
                y: this.player.y,
                vx: (Math.random() - 0.5) * 5,
                vy: (Math.random() - 0.5) * 5,
                radius: 3,
                color: '#EF4444',
                alpha: 1
              });
            }

            // Check if lives reached 0
            if (this.lives <= 0) {
              this.onRunOver();
              return;
            }
          }
        }
      }

      if (obs.x < -70) {
        this.obstacles.splice(i, 1);
      }
    }

    // Update Particles
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.alpha -= 0.035;
      if (p.alpha <= 0) {
        this.particles.splice(i, 1);
      }
    }

    // Update Score Popups
    for (let i = this.scorePopups.length - 1; i >= 0; i--) {
      const sp = this.scorePopups[i];
      sp.y += sp.vy;
      sp.alpha -= 0.025;
      if (sp.alpha <= 0) {
        this.scorePopups.splice(i, 1);
      }
    }

    // Background clouds
    this.bgClouds.forEach(bgc => {
      bgc.x -= bgc.speed;
      if (bgc.x < -120) bgc.x = this.width + 60;
    });
  }

  onRunOver() {
    this.isRunning = false;
    if (this.animId) cancelAnimationFrame(this.animId);

    // Update session high score
    const prevBest = this.app.gameSession.highScore || 0;
    this.app.gameSession.highScore = Math.max(prevBest, this.runScore);

    // Sound
    this.app.playGentleTone(330, 'triangle', 0.4, 0.2);

    // Show runover overlay
    const overlay = document.getElementById('game-runover-overlay');
    const scoreVal = document.getElementById('runover-score-val');
    const bestVal = document.getElementById('runover-best-val');
    const timeVal = document.getElementById('runover-time-val');

    if (scoreVal) scoreVal.textContent = this.runScore;
    if (bestVal) bestVal.textContent = this.app.gameSession.highScore;
    if (timeVal) {
      const mins = Math.floor(this.app.gameSession.remainingSeconds / 60);
      const secs = this.app.gameSession.remainingSeconds % 60;
      timeVal.textContent = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    }

    if (overlay) overlay.style.display = 'flex';
  }

  render() {
    this.ctx.save();

    // Camera shake
    if (this.cameraShake > 0) {
      const s = this.cameraShake;
      this.ctx.translate((Math.random() - 0.5) * s, (Math.random() - 0.5) * s);
    }

    this.ctx.clearRect(0, 0, this.width, this.height);

    // 1. Sky Gradient based on Stage
    const skyGrad = this.ctx.createLinearGradient(0, 0, 0, this.height);
    if (this.stage === 3) {
      // Cosmic Space
      skyGrad.addColorStop(0, '#090D16');
      skyGrad.addColorStop(0.5, '#131127');
      skyGrad.addColorStop(1, '#2E1065');
    } else if (this.stage === 2) {
      // Sunset Sky
      skyGrad.addColorStop(0, '#7C2D12');
      skyGrad.addColorStop(0.4, '#C2410C');
      skyGrad.addColorStop(0.8, '#EA580C');
      skyGrad.addColorStop(1, '#FDE047');
    } else {
      // Morning Sky
      skyGrad.addColorStop(0, '#38BDF8');
      skyGrad.addColorStop(0.65, '#BAE6FD');
      skyGrad.addColorStop(1, '#FEF3C7');
    }
    this.ctx.fillStyle = skyGrad;
    this.ctx.fillRect(0, 0, this.width, this.height);

    // 2. Stars & Celestial Elements
    if (this.stage >= 2) {
      this.ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
      for (let i = 0; i < 35; i++) {
        const sx = ((i * 31 + this.frameCount * 0.15) % this.width);
        const sy = (i * 19) % (this.height - 100);
        this.ctx.beginPath();
        this.ctx.arc(sx, sy, (i % 3 === 0 ? 2 : 1), 0, Math.PI * 2);
        this.ctx.fill();
      }
    } else {
      // Sun
      this.ctx.beginPath();
      this.ctx.arc(720, 60, 36, 0, Math.PI * 2);
      this.ctx.fillStyle = '#FDE68A';
      this.ctx.fill();
      this.ctx.beginPath();
      this.ctx.arc(720, 60, 50, 0, Math.PI * 2);
      this.ctx.fillStyle = 'rgba(253, 230, 138, 0.3)';
      this.ctx.fill();
    }

    // 3. Background Clouds
    this.bgClouds.forEach(bgc => {
      const col = this.stage === 3 ? 'rgba(255, 255, 255, 0.1)' : (this.stage === 2 ? 'rgba(254, 215, 170, 0.5)' : 'rgba(255, 255, 255, 0.7)');
      this.drawCartoonCloud(bgc.x, bgc.y, bgc.scale, col);
    });

    // 4. Parallax Hills
    this.drawHills();

    // 5. Draw Collectibles & Power-Ups
    this.collectibles.forEach(c => {
      this.drawCollectible(c);
    });

    // 6. Draw Obstacles (Meteors, Storm clouds with lightning, Orbs)
    this.obstacles.forEach(obs => {
      this.drawObstacle(obs);
    });

    // 7. Draw Player Avatar + Cape + Hoverboard + Shield + Magnet Aura
    this.drawPlayer();

    // 8. Particles
    this.particles.forEach(p => {
      this.ctx.save();
      this.ctx.globalAlpha = Math.max(0, p.alpha);
      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      this.ctx.fillStyle = p.color;
      this.ctx.fill();
      this.ctx.restore();
    });

    // 9. Floating Score Popups
    this.scorePopups.forEach(sp => {
      this.ctx.save();
      this.ctx.globalAlpha = Math.max(0, sp.alpha);
      this.ctx.font = 'bold 16px "Tajawal", sans-serif';
      this.ctx.fillStyle = sp.color;
      this.ctx.textAlign = 'center';
      this.ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
      this.ctx.shadowBlur = 4;
      this.ctx.fillText(sp.text, sp.x, sp.y);
      this.ctx.restore();
    });

    // 10. Speed Streaks when Turbo active
    if (this.powerups.turbo > 0) {
      this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.35)';
      this.ctx.lineWidth = 2;
      for (let s = 0; s < 6; s++) {
        const sy = (s * 65 + this.frameCount * 7) % this.height;
        const sx = this.width - ((this.frameCount * 25 + s * 90) % (this.width + 200));
        this.ctx.beginPath();
        this.ctx.moveTo(sx, sy);
        this.ctx.lineTo(sx + 80, sy);
        this.ctx.stroke();
      }
    }

    this.ctx.restore();
  }

  drawHills() {
    this.ctx.save();
    let backColor = '#A7F3D0';
    let frontColor = '#34D399';
    if (this.stage === 3) {
      backColor = '#1E1B4B';
      frontColor = '#0F172A';
    } else if (this.stage === 2) {
      backColor = '#B45309';
      frontColor = '#78350F';
    }

    // Distant hill
    this.ctx.beginPath();
    this.ctx.moveTo(0, this.height);
    this.ctx.quadraticCurveTo(240, this.height - 80, 520, this.height - 40);
    this.ctx.quadraticCurveTo(680, this.height - 20, this.width, this.height - 60);
    this.ctx.lineTo(this.width, this.height);
    this.ctx.closePath();
    this.ctx.fillStyle = backColor;
    this.ctx.fill();

    // Front hill
    this.ctx.beginPath();
    this.ctx.moveTo(0, this.height);
    this.ctx.quadraticCurveTo(180, this.height - 50, 400, this.height - 30);
    this.ctx.quadraticCurveTo(620, this.height - 10, this.width, this.height - 35);
    this.ctx.lineTo(this.width, this.height);
    this.ctx.closePath();
    this.ctx.fillStyle = frontColor;
    this.ctx.fill();
    this.ctx.restore();
  }

  drawCartoonCloud(x, y, scale, color) {
    this.ctx.save();
    this.ctx.fillStyle = color;
    this.ctx.beginPath();
    this.ctx.arc(x, y, 22 * scale, 0, Math.PI * 2);
    this.ctx.arc(x + 20 * scale, y - 8 * scale, 26 * scale, 0, Math.PI * 2);
    this.ctx.arc(x + 45 * scale, y, 22 * scale, 0, Math.PI * 2);
    this.ctx.arc(x + 22 * scale, y + 10 * scale, 18 * scale, 0, Math.PI * 2);
    this.ctx.fill();
    this.ctx.restore();
  }

  drawObstacle(obs) {
    this.ctx.save();

    if (obs.type === 'meteor') {
      // Burning Meteor
      const radGrad = this.ctx.createRadialGradient(obs.x, obs.y, 2, obs.x, obs.y, obs.radius);
      radGrad.addColorStop(0, '#FEF08A');
      radGrad.addColorStop(0.4, '#F97316');
      radGrad.addColorStop(1, '#991B1B');
      this.ctx.fillStyle = radGrad;
      this.ctx.beginPath();
      this.ctx.arc(obs.x, obs.y, obs.radius, 0, Math.PI * 2);
      this.ctx.fill();

      // Flame icon on front
      this.ctx.font = '22px sans-serif';
      this.ctx.textAlign = 'center';
      this.ctx.textBaseline = 'middle';
      this.ctx.fillText('☄️', obs.x, obs.y);
    } else if (obs.type === 'storm_cloud') {
      // Dark Thundercloud
      this.ctx.fillStyle = '#334155';
      this.ctx.beginPath();
      this.ctx.arc(obs.x, obs.y, 24, 0, Math.PI * 2);
      this.ctx.arc(obs.x + 20, obs.y - 10, 28, 0, Math.PI * 2);
      this.ctx.arc(obs.x + 42, obs.y, 22, 0, Math.PI * 2);
      this.ctx.fill();

      // Lightning bolt periodically firing down
      const isLightning = (obs.lightningTimer % 70) > 45;
      if (isLightning) {
        this.ctx.strokeStyle = '#FDE047';
        this.ctx.lineWidth = 3.5;
        this.ctx.shadowColor = '#FACC15';
        this.ctx.shadowBlur = 8;
        this.ctx.beginPath();
        const startX = obs.x + 20;
        const startY = obs.y + 18;
        this.ctx.moveTo(startX, startY);
        this.ctx.lineTo(startX - 6, startY + 28);
        this.ctx.lineTo(startX + 8, startY + 36);
        this.ctx.lineTo(startX - 4, startY + 70);
        this.ctx.stroke();
      }

      this.ctx.font = '16px sans-serif';
      this.ctx.textAlign = 'center';
      this.ctx.fillText('⚡', obs.x + 20, obs.y);
    } else if (obs.type === 'plasma_orb') {
      // Pulsing Electric Orb
      const orbGrad = this.ctx.createRadialGradient(obs.x, obs.y, 2, obs.x, obs.y, obs.radius);
      orbGrad.addColorStop(0, '#A7F3D0');
      orbGrad.addColorStop(0.7, '#059669');
      orbGrad.addColorStop(1, '#064E3B');
      this.ctx.fillStyle = orbGrad;
      this.ctx.beginPath();
      this.ctx.arc(obs.x, obs.y, obs.radius, 0, Math.PI * 2);
      this.ctx.fill();

      this.ctx.strokeStyle = '#34D399';
      this.ctx.lineWidth = 2;
      this.ctx.stroke();

      this.ctx.font = '18px sans-serif';
      this.ctx.textAlign = 'center';
      this.ctx.textBaseline = 'middle';
      this.ctx.fillText('🌀', obs.x, obs.y);
    } else {
      // Gentle Cloud
      this.ctx.fillStyle = 'rgba(203, 213, 225, 0.85)';
      this.ctx.beginPath();
      this.ctx.arc(obs.x, obs.y, 22, 0, Math.PI * 2);
      this.ctx.arc(obs.x + 18, obs.y - 10, 24, 0, Math.PI * 2);
      this.ctx.arc(obs.x + 36, obs.y, 20, 0, Math.PI * 2);
      this.ctx.fill();

      // Cute sleepy eyes
      this.ctx.strokeStyle = '#475569';
      this.ctx.lineWidth = 2;
      this.ctx.beginPath();
      this.ctx.arc(obs.x + 12, obs.y - 2, 4, 0, Math.PI);
      this.ctx.stroke();
      this.ctx.beginPath();
      this.ctx.arc(obs.x + 24, obs.y - 2, 4, 0, Math.PI);
      this.ctx.stroke();
    }

    this.ctx.restore();
  }

  drawCollectible(c) {
    this.ctx.save();
    // Glowing halo
    this.ctx.beginPath();
    this.ctx.arc(c.x, c.y, c.radius + 6, 0, Math.PI * 2);
    this.ctx.fillStyle = `${c.color}44`;
    this.ctx.fill();

    if (c.isPowerup) {
      // Power-up pulsing border
      this.ctx.strokeStyle = c.color;
      this.ctx.lineWidth = 2.5;
      this.ctx.beginPath();
      this.ctx.arc(c.x, c.y, c.radius + 2, 0, Math.PI * 2);
      this.ctx.stroke();
    }

    // Emoji icon
    this.ctx.font = `${c.radius * 1.5}px "Apple Color Emoji", "Segoe UI Emoji", sans-serif`;
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';
    this.ctx.fillText(c.icon, c.x, c.y);
    this.ctx.restore();
  }

  drawPlayer() {
    const { x, y, radius, shieldFrames, capeWave } = this.player;
    this.ctx.save();

    // 0. Magnet Aura (electric arcs)
    if (this.powerups.magnet > 0) {
      this.ctx.strokeStyle = 'rgba(59, 130, 246, 0.6)';
      this.ctx.lineWidth = 2;
      this.ctx.beginPath();
      this.ctx.arc(x, y, radius + 20, 0, Math.PI * 2);
      this.ctx.stroke();

      this.ctx.font = '16px sans-serif';
      this.ctx.fillText('🧲', x + 16, y - radius - 6);
    }

    // 1. Cape fluttering behind
    const capeColor = this.powerups.turbo > 0 ? '#06B6D4' : '#6366F1';
    this.ctx.fillStyle = capeColor;
    this.ctx.beginPath();
    this.ctx.moveTo(x - 12, y);
    const waveOffset = Math.sin(capeWave) * 10;
    this.ctx.quadraticCurveTo(x - 35, y + 8 + waveOffset, x - 45, y + 25 + waveOffset);
    this.ctx.quadraticCurveTo(x - 25, y + 18, x - 8, y + 14);
    this.ctx.closePath();
    this.ctx.fill();

    // 2. Hoverboard
    const boardY = y + radius + 4;
    this.ctx.fillStyle = this.powerups.turbo > 0 ? '#0891B2' : '#3B82F6';
    this.ctx.beginPath();
    if (this.ctx.roundRect) {
      this.ctx.roundRect(x - 24, boardY, 48, 8, [4]);
    } else {
      this.ctx.rect(x - 24, boardY, 48, 8);
    }
    this.ctx.fill();

    // Lights
    this.ctx.fillStyle = this.powerups.turbo > 0 ? '#FACC15' : '#10B981';
    this.ctx.beginPath();
    this.ctx.arc(x - 14, boardY + 4, 2.5, 0, Math.PI * 2);
    this.ctx.arc(x + 14, boardY + 4, 2.5, 0, Math.PI * 2);
    this.ctx.fill();

    // Booster Flame
    const flameBaseLen = this.powerups.turbo > 0 ? 28 : 14;
    const flameLen = flameBaseLen + Math.sin(this.frameCount * 0.4) * 6;
    this.ctx.fillStyle = this.powerups.turbo > 0 ? '#06B6D4' : '#F59E0B';
    this.ctx.beginPath();
    this.ctx.moveTo(x - 24, boardY + 2);
    this.ctx.lineTo(x - 24 - flameLen, boardY + 4);
    this.ctx.lineTo(x - 24, boardY + 6);
    this.ctx.closePath();
    this.ctx.fill();

    // 3. Child Avatar Image
    this.ctx.save();
    this.ctx.beginPath();
    this.ctx.arc(x, y, radius, 0, Math.PI * 2);
    this.ctx.clip();

    if (this.avatarImg.complete && this.avatarImg.naturalWidth > 0) {
      this.ctx.drawImage(this.avatarImg, x - radius, y - radius, radius * 2, radius * 2);
    } else {
      this.ctx.fillStyle = '#FED7AA';
      this.ctx.fill();
    }
    this.ctx.restore();

    // 4. Golden Ring Border (or Rainbow Border if Combo >= 3)
    if (this.combo >= 3) {
      const rainbowColors = ['#EF4444', '#F59E0B', '#10B981', '#06B6D4', '#8B5CF6'];
      this.ctx.strokeStyle = rainbowColors[Math.floor(this.frameCount / 6) % rainbowColors.length];
      this.ctx.lineWidth = 4.5;
    } else {
      this.ctx.strokeStyle = '#F59E0B';
      this.ctx.lineWidth = 3.5;
    }
    this.ctx.beginPath();
    this.ctx.arc(x, y, radius, 0, Math.PI * 2);
    this.ctx.stroke();

    // 5. Crown / Turbo Horn
    this.ctx.font = '14px sans-serif';
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'bottom';
    this.ctx.fillText(this.powerups.turbo > 0 ? '⚡' : '👑', x, y - radius + 4);

    // 6. Crystal Shield (if shield power-up active)
    if (this.powerups.shield) {
      this.ctx.strokeStyle = 'rgba(139, 92, 246, 0.9)';
      this.ctx.lineWidth = 3.5;
      this.ctx.fillStyle = 'rgba(139, 92, 246, 0.25)';
      this.ctx.beginPath();
      this.ctx.arc(x, y, radius + 12, 0, Math.PI * 2);
      this.ctx.stroke();
      this.ctx.fill();
    } else if (shieldFrames > 0) {
      // Temporary invulnerability blinking
      if (Math.floor(this.frameCount / 4) % 2 === 0) {
        this.ctx.strokeStyle = 'rgba(239, 68, 68, 0.8)';
        this.ctx.lineWidth = 2.5;
        this.ctx.beginPath();
        this.ctx.arc(x, y, radius + 10, 0, Math.PI * 2);
        this.ctx.stroke();
      }
    }

    this.ctx.restore();
  }
}

class StudyPlannerApp {
  constructor() {
    this.STORAGE_KEY_SETTINGS = 'my_week_settings_v1';
    this.STORAGE_KEY_SCHEDULE = 'my_week_schedule_v1';

    // Load State
    this.settings = this.loadSettings();
    this.schedule = this.loadSchedule();
    
    // UI Navigation State
    const now = new Date();
    this.currentDayIndex = now.getDay(); // 0 is Sunday, 1 Monday, etc.
    this.selectedWeeklyDay = this.currentDayIndex;
    this.todayFilter = 'all';
    this.activeTab = 'today';
    this.editingItemId = null;
    this.reschedulingItem = null;

    // Focus Timer State
    this.timer = {
      running: false,
      mode: 'study', // 'study' | 'break'
      durationMinutes: 15,
      breakMinutes: 5,
      totalSeconds: 15 * 60,
      remainingSeconds: 15 * 60,
      intervalId: null,
      subject: 'math',
      taskDescription: 'حل تمارين كتاب الرياضيات'
    };

    // Mini-Game & Parental Screen Time State
    this.gameSession = {
      unlocked: false,
      running: false,
      paused: false,
      durationMinutes: 15,
      totalSeconds: 15 * 60,
      remainingSeconds: 15 * 60,
      timerInterval: null,
      score: 0,
      mathChallenge: { q: '6 × 7 = ؟', answer: 42 }
    };
    this.heroGame = null;

    // Web Audio Context for Gentle Chimes
    this.audioCtx = null;

    // Expose instance globally
    window.app = this;

    // Points Reset Migration requested by user:
    // Reset points/stars to 0, reset claimed rewards, clear game score while preserving ALL tasks!
    if (!localStorage.getItem('my_week_points_reset_zero_v3')) {
      this.settings.starsEarned = 0;
      if (this.settings.rewards) {
        this.settings.rewards.forEach(r => { r.claimed = false; });
      }
      if (this.settings.gameConfig) {
        this.settings.gameConfig.highScore = 0;
        this.settings.gameConfig.playedTodayMinutes = 0;
      }
      if (this.schedule && Array.isArray(this.schedule)) {
        this.schedule.forEach(item => { item.completed = false; });
        this.saveSchedule();
      }
      this.saveSettings();
      localStorage.setItem('my_week_points_reset_zero_v3', 'true');
    }

    this.init();
  }

  // ==========================================================================
  // Persistence & Storage
  // ==========================================================================
  loadSettings() {
    try {
      const saved = localStorage.getItem(this.STORAGE_KEY_SETTINGS);
      if (!saved) return { ...defaultSettings };
      const parsed = JSON.parse(saved);
      const merged = { ...defaultSettings, ...parsed };
      merged.gameConfig = { ...defaultSettings.gameConfig, ...(parsed.gameConfig || {}) };
      return merged;
    } catch (e) {
      console.error('Error loading settings from localStorage', e);
      return { ...defaultSettings };
    }
  }

  saveSettings() {
    try {
      localStorage.setItem(this.STORAGE_KEY_SETTINGS, JSON.stringify(this.settings));
    } catch (e) {
      console.error('Error saving settings', e);
    }
  }

  loadSchedule() {
    try {
      const saved = localStorage.getItem(this.STORAGE_KEY_SCHEDULE);
      if (!saved) return [...defaultSchedule];
      const parsed = JSON.parse(saved);
      // Auto-migrate: If user's stored schedule doesn't have prayer items yet, merge prayers & Quran
      const hasPrayers = parsed.some(i => i.category === 'prayer');
      if (!hasPrayers) {
        const prayerItems = defaultSchedule.filter(i => i.category === 'prayer' || i.category === 'quran');
        const merged = [...parsed, ...prayerItems];
        try {
          localStorage.setItem(this.STORAGE_KEY_SCHEDULE, JSON.stringify(merged));
        } catch (e) {}
        return merged;
      }
      return parsed;
    } catch (e) {
      console.error('Error loading schedule from localStorage', e);
      return [...defaultSchedule];
    }
  }

  saveSchedule() {
    try {
      localStorage.setItem(this.STORAGE_KEY_SCHEDULE, JSON.stringify(this.schedule));
    } catch (e) {
      console.error('Error saving schedule', e);
    }
  }

  // ==========================================================================
  // Gentle Web Audio Sound Synthesizer (Zero External Dependencies)
  // ==========================================================================
  initAudio() {
    if (!this.audioCtx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
        this.audioCtx = new AudioContext();
      }
    }
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
  }

  playGentleTone(frequency, type = 'sine', duration = 0.3, gainLevel = 0.15) {
    if (!this.settings.reminders.soundEnabled) return;
    try {
      this.initAudio();
      if (!this.audioCtx) return;

      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(frequency, this.audioCtx.currentTime);

      gain.gain.setValueAtTime(gainLevel, this.audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, this.audioCtx.currentTime + duration);

      osc.connect(gain);
      gain.connect(this.audioCtx.destination);

      osc.start();
      osc.stop(this.audioCtx.currentTime + duration);
    } catch (e) {
      console.log('Audio playback ignored', e);
    }
  }

  playCelebrationSound() {
    // Joyful soft arpeggio: C5, E5, G5, C6
    const notes = [523.25, 659.25, 783.99, 1046.50];
    notes.forEach((freq, idx) => {
      setTimeout(() => {
        this.playGentleTone(freq, 'triangle', 0.45, 0.18);
      }, idx * 110);
    });
  }

  playTimerCompleteSound() {
    // Gentle warm chime: A4, E5, A5
    const notes = [440.00, 659.25, 880.00];
    notes.forEach((freq, idx) => {
      setTimeout(() => {
        this.playGentleTone(freq, 'sine', 0.8, 0.15);
      }, idx * 220);
    });
  }

  playClickSound() {
    this.playGentleTone(400, 'sine', 0.08, 0.05);
  }

  // ==========================================================================
  // Cheerful Confetti Animation
  // ==========================================================================
  triggerCelebrationConfetti() {
    const canvas = document.getElementById('confetti-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const colors = ['#6366F1', '#EC4899', '#10B981', '#F59E0B', '#06B6D4', '#8B5CF6'];
    const particles = [];
    for (let i = 0; i < 70; i++) {
      particles.push({
        x: canvas.width / 2 + (Math.random() - 0.5) * 200,
        y: canvas.height / 3 + (Math.random() - 0.5) * 100,
        r: Math.random() * 6 + 4,
        d: Math.random() * 40,
        color: colors[Math.floor(Math.random() * colors.length)],
        tilt: Math.floor(Math.random() * 10) - 10,
        tiltAngle: 0,
        tiltAngleIncremental: (Math.random() * 0.07) + 0.05,
        vx: (Math.random() - 0.5) * 8,
        vy: (Math.random() * -5) - 3
      });
    }

    let animationFrame;
    let framesCount = 0;
    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      framesCount++;
      particles.forEach(p => {
        p.tiltAngle += p.tiltAngleIncremental;
        p.y += (Math.cos(p.d) + 3 + p.r / 2) / 2;
        p.x += Math.sin(p.d);
        p.tilt = Math.sin(p.tiltAngle - (framesCount / 3)) * 15;

        ctx.beginPath();
        ctx.lineWidth = p.r / 2;
        ctx.strokeStyle = p.color;
        ctx.moveTo(p.x + p.tilt + (p.r / 4), p.y);
        ctx.lineTo(p.x + p.tilt, p.y + p.tilt + (p.r / 4));
        ctx.stroke();
      });

      if (framesCount < 120) {
        animationFrame = requestAnimationFrame(render);
      } else {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        cancelAnimationFrame(animationFrame);
      }
    };
    render();
  }

  // ==========================================================================
  // Initialization & UI Binding
  // ==========================================================================
  init() {
    this.applyTheme(this.settings.theme || 'light');
    this.initAccountSystem();
    this.renderHeaderAndBrand();
    this.renderTodayView();
    this.renderWeeklyView();
    this.renderTimerView();
    this.renderRewardsView();
    this.renderGameView();
    this.renderParentView();
    this.initHeroGame();
    this.setupEventListeners();
    this.setupConflictListener();
    this.startLiveClockCheck();
  }

  applyTheme(theme) {
    this.settings.theme = theme;
    const body = document.body;
    const themeIcon = document.getElementById('theme-icon');
    if (theme === 'dark') {
      body.classList.remove('theme-light');
      body.classList.add('theme-dark');
      if (themeIcon) themeIcon.textContent = '☀️';
    } else {
      body.classList.remove('theme-dark');
      body.classList.add('theme-light');
      if (themeIcon) themeIcon.textContent = '🌙';
    }
  }

  renderHeaderAndBrand() {
    // App Title & Tagline
    const appNameEl = document.getElementById('display-app-name');
    if (appNameEl) appNameEl.textContent = this.settings.appName || 'أسبوعي';

    // Child Profile Name & Avatar
    const headerChildName = document.getElementById('header-child-name');
    if (headerChildName) headerChildName.textContent = this.settings.childName || 'ريان';

    const avatarSrc = this.settings.avatarDataUrl || this.settings.avatarPreset || 'assets/avatar_son.jpg';
    const headerAvatar = document.getElementById('header-child-avatar');
    if (headerAvatar) headerAvatar.src = avatarSrc;

    const heroAvatar = document.getElementById('hero-avatar-img');
    if (heroAvatar) heroAvatar.src = avatarSrc;

    const appLogo = document.getElementById('app-logo-img');
    if (appLogo) appLogo.src = 'assets/logo_mascot.jpg';

    // Header Stars Count
    const headerStarsCount = document.getElementById('header-stars-count');
    if (headerStarsCount) headerStarsCount.textContent = this.settings.starsEarned || 0;
  }

  // ==========================================================================
  // TAB 1: TODAY'S VIEW
  // ==========================================================================
  renderTodayView() {
    const todayIndex = this.currentDayIndex;
    const arabicDay = ARABIC_DAYS.find(d => d.index === todayIndex) || ARABIC_DAYS[0];

    // Arabic Date Formatter
    const now = new Date();
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    const dateFormatted = now.toLocaleDateString('ar-EG', options);
    
    const todayDateEl = document.getElementById('today-arabic-date');
    if (todayDateEl) todayDateEl.textContent = dateFormatted;

    const todayDayLabel = document.getElementById('today-day-label');
    if (todayDayLabel) todayDayLabel.textContent = arabicDay.name;

    // Greeting according to time of day
    const currentHour = now.getHours();
    let greetingPrefix = 'صباح النشاط';
    let greetingEmoji = '☀️';
    if (currentHour >= 12 && currentHour < 17) {
      greetingPrefix = 'مساء الخير والهمّة';
      greetingEmoji = '🌤️';
    } else if (currentHour >= 17) {
      greetingPrefix = 'مساء الهدوء والإنجاز';
      greetingEmoji = '🌙';
    }

    const greetingEl = document.getElementById('today-greeting-text');
    if (greetingEl) {
      greetingEl.textContent = `${greetingPrefix} يا ${this.settings.childName}! ${greetingEmoji}`;
    }

    // Filter items for today
    let todayItems = this.schedule
      .filter(item => item.day === todayIndex)
      .sort((a, b) => a.startTime.localeCompare(b.startTime));

    // Progress Calculation
    const totalToday = todayItems.length;
    const completedToday = todayItems.filter(i => i.completed).length;
    const progressPercent = totalToday > 0 ? Math.round((completedToday / totalToday) * 100) : 100;

    const fillBar = document.getElementById('today-progress-fill');
    if (fillBar) fillBar.style.width = `${progressPercent}%`;

    const statsPill = document.getElementById('today-progress-stats');
    if (statsPill) statsPill.textContent = `${completedToday} من ${totalToday} أنشطة`;

    const captionEl = document.getElementById('today-progress-caption');
    if (captionEl) {
      if (completedToday === totalToday && totalToday > 0) {
        captionEl.textContent = 'ما شاء الله! أنجزت كل أنشطة اليوم ببراعة وفخر! استمتع بوقتك 🌟';
      } else if (completedToday > 0) {
        captionEl.textContent = `أحسنت جداً! خطوة بخطوة تتقدم وتجمع النجوم، واصل بابتسامتك اللطيفة 🌸`;
      } else {
        captionEl.textContent = `يوم جميل بانتظارك! ابدأ بأي نشاط تحبه وسنكون معك 🎈`;
      }
    }

    // Highlight Card: Upcoming / Current activity
    this.renderUpcomingHighlight(todayItems);

    // Apply Filter Chips
    if (this.todayFilter !== 'all') {
      todayItems = todayItems.filter(item => item.category === this.todayFilter);
    }

    // Render Timeline Cards
    const timelineList = document.getElementById('today-timeline-list');
    const emptyState = document.getElementById('today-empty-state');

    if (!timelineList) return;
    timelineList.innerHTML = '';

    if (todayItems.length === 0) {
      if (emptyState) emptyState.style.display = 'block';
    } else {
      if (emptyState) emptyState.style.display = 'none';

      todayItems.forEach(item => {
        const catDef = CATEGORY_DEFINITIONS[item.category] || CATEGORY_DEFINITIONS.study;
        const card = document.createElement('div');
        card.className = `timeline-card ${item.completed ? 'completed' : ''}`;
        card.id = `item-card-${item.id}`;

        const isFlexTag = item.isFlexible ? `<span class="flexible-badge">وقت مرن 🌸</span>` : '';
        const locationTag = item.location ? `<span>📍 ${item.location}</span>` : '';
        const notesTag = item.notes ? `<p class="card-notes">📝 ${item.notes}</p>` : '';

        card.innerHTML = `
          <div class="timeline-side-indicator" style="background-color: ${catDef.color};"></div>
          <div class="card-main-content">
            <div class="card-icon-box" style="background-color: ${catDef.bg}; color: ${catDef.color};">
              <span>${catDef.icon}</span>
            </div>
            <div class="card-details">
              <div class="card-tags-row">
                <span class="category-tag" style="background-color: ${catDef.bg}; color: ${catDef.color};">
                  ${catDef.label}
                </span>
                <span class="time-badge">${this.formatTimeRange(item.startTime, item.endTime)}</span>
                ${isFlexTag}
              </div>
              <h4 class="card-item-title">${item.title}</h4>
              ${notesTag}
              <div class="card-meta-row">
                ${locationTag}
              </div>
            </div>
          </div>
          <div class="card-actions">
            ${item.category === 'study' || item.category === 'homework' ? `
              <button class="btn btn-secondary-child btn-quick-timer" data-id="${item.id}" title="بدء مؤقت التركيز لهذه المادة">
                <span>⏱️ ركز الآن</span>
              </button>
            ` : ''}
            <button class="btn btn-done-check ${item.completed ? 'is-done' : ''}" data-id="${item.id}" title="أنجزت النشاط">
              <span>${item.completed ? 'أنجزت! ✨' : 'إنجاز 👍'}</span>
            </button>
            <button class="btn-card-more" data-id="${item.id}" title="خيارات أخرى (تعديل، إعادة جدولة)">
              <span>⚙️</span>
            </button>
          </div>
        `;
        timelineList.appendChild(card);
      });
    }
  }

  renderUpcomingHighlight(todayItems) {
    const container = document.getElementById('upcoming-focus-banner');
    if (!container) return;

    if (todayItems.length === 0) {
      container.innerHTML = '';
      return;
    }

    // Find the next incomplete item, or the first item
    const nextItem = todayItems.find(i => !i.completed) || todayItems[0];
    const nextIndex = todayItems.indexOf(nextItem);
    const followingItem = todayItems[nextIndex + 1];

    const catDef = CATEGORY_DEFINITIONS[nextItem.category] || CATEGORY_DEFINITIONS.study;
    const followingText = followingItem ? 
      `النشاط التالي بعدها: <strong>${followingItem.title}</strong> (${CATEGORY_DEFINITIONS[followingItem.category]?.icon || '✨'})` : 
      'بعد هذا النشاط: وقت هادئ ومريح للراحة!';

    container.innerHTML = `
      <div class="upcoming-card">
        <span class="upcoming-badge-flag">النشاط القادم الآن ⭐</span>
        <div class="upcoming-info-col">
          <div class="upcoming-icon-box" style="background-color: ${catDef.bg}; color: ${catDef.color};">
            ${catDef.icon}
          </div>
          <div class="upcoming-text">
            <span class="upcoming-label">${catDef.label} - الموعد الأقرب</span>
            <h3 class="upcoming-title">${nextItem.title}</h3>
            <span class="upcoming-time-place">⏰ ${this.formatTimeRange(nextItem.startTime, nextItem.endTime)} ${nextItem.location ? ` • 📍 ${nextItem.location}` : ''}</span>
            <span class="upcoming-next-inline">🌸 ${followingText}</span>
          </div>
        </div>
        <div class="upcoming-actions-col">
          <button class="btn btn-done-check ${nextItem.completed ? 'is-done' : ''}" data-id="${nextItem.id}">
            <span>${nextItem.completed ? 'أنجزت! ✨' : 'أنجزت الآن 🌟'}</span>
          </button>
          ${nextItem.category === 'study' || nextItem.category === 'homework' ? `
            <button class="btn btn-primary-child btn-quick-timer" data-id="${nextItem.id}">
              <span>⏱️ ابدأ المذاكرة بالمؤقت</span>
            </button>
          ` : ''}
        </div>
      </div>
    `;
  }

  // ==========================================================================
  // TAB 2: WEEKLY VIEW
  // ==========================================================================
  renderWeeklyView() {
    const daysNav = document.getElementById('weekly-days-nav');
    if (!daysNav) return;
    daysNav.innerHTML = '';

    ARABIC_DAYS.forEach(day => {
      const itemsForDay = this.schedule.filter(i => i.day === day.index);
      const isSelected = day.index === this.selectedWeeklyDay;
      const isToday = day.index === this.currentDayIndex;

      const btn = document.createElement('button');
      btn.className = `weekly-day-btn ${isSelected ? 'active' : ''}`;
      btn.dataset.day = day.index;

      btn.innerHTML = `
        <span class="day-name">${day.name}</span>
        <span class="day-item-count">${itemsForDay.length} أنشطة</span>
        ${isToday ? `<span style="font-size: 0.7rem; color: #F59E0B; font-weight: 800;">(اليوم 🌟)</span>` : ''}
      `;

      btn.addEventListener('click', () => {
        this.selectedWeeklyDay = day.index;
        this.renderWeeklyView();
      });

      daysNav.appendChild(btn);
    });

    // Update Metrics
    const studyCount = this.schedule.filter(i => i.category === 'study' || i.category === 'homework').length;
    const clubCount = this.schedule.filter(i => i.category === 'club').length;
    const restCount = this.schedule.filter(i => i.category === 'rest').length;
    const completedCount = this.schedule.filter(i => i.completed).length;

    const elStudy = document.getElementById('metric-study-count');
    if (elStudy) elStudy.textContent = studyCount;
    const elClub = document.getElementById('metric-club-count');
    if (elClub) elClub.textContent = clubCount;
    const elRest = document.getElementById('metric-rest-count');
    if (elRest) elRest.textContent = restCount;
    const elCompleted = document.getElementById('metric-completed-count');
    if (elCompleted) elCompleted.textContent = completedCount;

    // Active Selected Day Header & Items
    const activeDayObj = ARABIC_DAYS.find(d => d.index === this.selectedWeeklyDay) || ARABIC_DAYS[0];
    const isSchoolDay = this.settings.schoolDays.includes(this.selectedWeeklyDay);

    const headingEl = document.getElementById('weekly-active-day-heading');
    if (headingEl) headingEl.textContent = `أنشطة يوم ${activeDayObj.name}`;

    const typeBadge = document.getElementById('weekly-active-day-type');
    if (typeBadge) {
      typeBadge.textContent = isSchoolDay ? 'يوم دوام مدرسي 🏫' : 'عطلة نهاية الأسبوع 🎈';
      typeBadge.style.backgroundColor = isSchoolDay ? 'var(--primary-light)' : 'var(--cat-club-bg)';
      typeBadge.style.color = isSchoolDay ? 'var(--primary-color)' : 'var(--cat-club)';
    }

    const itemsGrid = document.getElementById('weekly-day-items-grid');
    if (!itemsGrid) return;
    itemsGrid.innerHTML = '';

    const dayItems = this.schedule
      .filter(i => i.day === this.selectedWeeklyDay)
      .sort((a, b) => a.startTime.localeCompare(b.startTime));

    if (dayItems.length === 0) {
      itemsGrid.innerHTML = `
        <div class="empty-state-card" style="margin: 0;">
          <div class="empty-icon">🌱</div>
          <h4>لا توجد مواعيد لهذا اليوم</h4>
          <p>يمكن لوليّ الأمر إضافة جلسة مذاكرة أو نشاط نادٍ أو فترة استراحة بكل بساطة.</p>
          <button class="btn btn-primary-child" id="btn-add-for-selected-day">
            <span>➕ إضافة نشاط ليوم ${activeDayObj.name}</span>
          </button>
        </div>
      `;
      const addForDayBtn = document.getElementById('btn-add-for-selected-day');
      if (addForDayBtn) {
        addForDayBtn.addEventListener('click', () => {
          this.openScheduleModal(null, this.selectedWeeklyDay);
        });
      }
    } else {
      dayItems.forEach(item => {
        const catDef = CATEGORY_DEFINITIONS[item.category] || CATEGORY_DEFINITIONS.study;
        const row = document.createElement('div');
        row.className = `timeline-card ${item.completed ? 'completed' : ''}`;
        row.innerHTML = `
          <div class="timeline-side-indicator" style="background-color: ${catDef.color};"></div>
          <div class="card-main-content">
            <div class="card-icon-box" style="background-color: ${catDef.bg}; color: ${catDef.color};">
              <span>${catDef.icon}</span>
            </div>
            <div class="card-details">
              <div class="card-tags-row">
                <span class="category-tag" style="background-color: ${catDef.bg}; color: ${catDef.color};">
                  ${catDef.label}
                </span>
                <span class="time-badge">${this.formatTimeRange(item.startTime, item.endTime)}</span>
                ${item.isFlexible ? '<span class="flexible-badge">وقت مرن</span>' : ''}
              </div>
              <h4 class="card-item-title">${item.title}</h4>
              ${item.notes ? `<p class="card-notes">${item.notes}</p>` : ''}
            </div>
          </div>
          <div class="card-actions">
            <button class="btn btn-done-check ${item.completed ? 'is-done' : ''}" data-id="${item.id}">
              <span>${item.completed ? 'أنجزت! ✨' : 'تم'}</span>
            </button>
            <button class="btn btn-secondary-child" data-action="reschedule" data-id="${item.id}" title="نقل لموعد آخر">
              <span>🔄 نقل</span>
            </button>
            <button class="btn-card-more" data-id="${item.id}" title="تعديل">
              <span>✏️</span>
            </button>
          </div>
        `;
        itemsGrid.appendChild(row);
      });
    }
  }

  // ==========================================================================
  // TAB 3: FOCUS TIMER & STUDY SESSIONS
  // ==========================================================================
  renderTimerView() {
    this.updateTimerDisplay();
    const taskInput = document.getElementById('timer-task-input');
    if (taskInput) {
      taskInput.value = this.timer.taskDescription;
    }
  }

  updateTimerDisplay() {
    const minutes = Math.floor(this.timer.remainingSeconds / 60);
    const seconds = this.timer.remainingSeconds % 60;
    const formatted = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

    const displayEl = document.getElementById('timer-display');
    if (displayEl) displayEl.textContent = formatted;

    // SVG Ring Calculation
    const circle = document.getElementById('timer-progress-circle');
    if (circle) {
      const radius = 100;
      const circumference = 2 * Math.PI * radius; // ~628.3
      const progressFraction = this.timer.remainingSeconds / this.timer.totalSeconds;
      const offset = circumference * (1 - progressFraction);
      circle.style.strokeDashoffset = offset;

      if (this.timer.mode === 'break') {
        circle.style.stroke = 'var(--cat-rest)';
      } else {
        circle.style.stroke = 'var(--primary-color)';
      }
    }

    // Status Badge & Controls
    const badge = document.getElementById('timer-mode-badge');
    const badgeText = document.getElementById('timer-mode-text');
    const btnText = document.getElementById('timer-btn-text');
    const btnIcon = document.getElementById('timer-btn-icon');
    const timerTaskLabel = document.getElementById('timer-current-task-label');

    if (timerTaskLabel) {
      timerTaskLabel.textContent = this.timer.mode === 'break' ? 'وقت استراحة ممتعة وشرب ماء 🌸' : this.timer.taskDescription;
    }

    if (badge && badgeText) {
      if (this.timer.running) {
        badge.style.background = this.timer.mode === 'break' ? 'var(--cat-rest-bg)' : 'var(--cat-school-bg)';
        badge.style.color = this.timer.mode === 'break' ? 'var(--cat-rest)' : 'var(--cat-school)';
        badgeText.textContent = this.timer.mode === 'break' ? 'استراحة مستحقة 🌸' : 'تركيز نشط الآن 🚀';
      } else {
        badge.style.background = 'var(--primary-light)';
        badge.style.color = 'var(--primary-color)';
        badgeText.textContent = 'جاهز للانطلاق 🌟';
      }
    }

    if (btnText && btnIcon) {
      if (this.timer.running) {
        btnText.textContent = 'إيقاف مؤقت';
        btnIcon.textContent = '⏸️';
      } else {
        btnText.textContent = 'ابدأ الجلسة الآن';
        btnIcon.textContent = '▶️';
      }
    }
  }

  toggleTimer() {
    if (this.timer.running) {
      this.pauseTimer();
    } else {
      this.startTimer();
    }
  }

  startTimer() {
    this.initAudio();
    this.playClickSound();
    this.timer.running = true;

    // Show pulsing indicator in tab
    const indicator = document.getElementById('timer-active-indicator');
    if (indicator) indicator.style.display = 'inline-block';

    if (this.timer.intervalId) clearInterval(this.timer.intervalId);

    this.timer.intervalId = setInterval(() => {
      if (this.timer.remainingSeconds > 0) {
        this.timer.remainingSeconds--;
        this.updateTimerDisplay();
      } else {
        this.handleTimerFinished();
      }
    }, 1000);

    this.updateTimerDisplay();
  }

  pauseTimer() {
    this.playClickSound();
    this.timer.running = false;
    if (this.timer.intervalId) {
      clearInterval(this.timer.intervalId);
      this.timer.intervalId = null;
    }
    const indicator = document.getElementById('timer-active-indicator');
    if (indicator) indicator.style.display = 'none';

    this.updateTimerDisplay();
    this.showToast('تم إيقاف المؤقت مؤقتاً، خذ نفساً عميقاً 🌸', 'info');
  }

  resetTimer() {
    this.pauseTimer();
    this.timer.remainingSeconds = this.timer.totalSeconds;
    this.updateTimerDisplay();
  }

  handleTimerFinished() {
    this.pauseTimer();
    this.playTimerCompleteSound();

    if (this.timer.mode === 'study') {
      // Award 2 stars for study session!
      this.settings.starsEarned = (this.settings.starsEarned || 0) + 2;
      this.saveSettings();
      this.renderHeaderAndBrand();
      this.renderRewardsView();

      this.triggerCelebrationConfetti();
      this.showToast('أحسنت يا بطل! أنهيت جلسة التركيز بنجاح وكسبت نجمتين 🌟🌟', 'success');

      // Switch to Break Mode
      this.timer.mode = 'break';
      this.timer.totalSeconds = this.timer.breakMinutes * 60;
      this.timer.remainingSeconds = this.timer.totalSeconds;
      this.updateTimerDisplay();
    } else {
      // Break finished
      this.showToast('انتهت الاستراحة! هل نواصل التعلم أم ننهي اليوم بنجاح؟ 🎈', 'info');
      this.timer.mode = 'study';
      this.timer.totalSeconds = this.timer.durationMinutes * 60;
      this.timer.remainingSeconds = this.timer.totalSeconds;
      this.updateTimerDisplay();
    }
  }

  completeSessionEarly() {
    // Guilt-free manual finish
    this.pauseTimer();
    this.settings.starsEarned = (this.settings.starsEarned || 0) + 1;
    this.saveSettings();
    this.renderHeaderAndBrand();
    this.renderRewardsView();

    this.playCelebrationSound();
    this.triggerCelebrationConfetti();

    this.openCelebrationModal('عمل رائع ومجهود تشكر عليه!', 'كل دقيقة قضيتها في المذاكرة والتعلم هي إنجاز جميل تستحق الفخر به! 🌸');
  }

  // ==========================================================================
  // TAB 4: REWARDS & STICKERS
  // ==========================================================================
  renderRewardsView() {
    const totalStars = this.settings.starsEarned || 0;
    const rewardsCountEl = document.getElementById('rewards-total-stars');
    if (rewardsCountEl) rewardsCountEl.textContent = totalStars;

    // Render Floating Stars in the Jar
    const jarLayer = document.getElementById('jar-floating-stars');
    if (jarLayer) {
      jarLayer.innerHTML = '';
      const displayStars = Math.min(totalStars, 24); // max visual stars inside jar
      for (let i = 0; i < displayStars; i++) {
        const star = document.createElement('span');
        star.textContent = '⭐';
        star.style.animationDelay = `${(i % 5) * 0.2}s`;
        jarLayer.appendChild(star);
      }
    }

    // Render Reward Goals
    const goalsGrid = document.getElementById('reward-goals-grid');
    if (goalsGrid) {
      goalsGrid.innerHTML = '';
      (this.settings.rewards || []).forEach(reward => {
        const isReady = totalStars >= reward.starsRequired;
        const percent = Math.min(100, Math.round((totalStars / reward.starsRequired) * 100));

        const card = document.createElement('div');
        card.className = `goal-card ${reward.claimed ? 'claimed' : (isReady ? 'unlocked' : '')}`;

        let btnHtml = '';
        if (reward.claimed) {
          btnHtml = `<button class="btn-claim-reward claimed" disabled>تم استلامها مسبقاً 🎉</button>`;
        } else if (isReady) {
          btnHtml = `<button class="btn-claim-reward ready" data-claim-id="${reward.id}">🎁 مبروك! استلم المكافأة الآن</button>`;
        } else {
          btnHtml = `<button class="btn-claim-reward" disabled>تحتاج ${reward.starsRequired - totalStars} نجوم إضافية</button>`;
        }

        card.innerHTML = `
          <div>
            <div class="goal-header">
              <span class="goal-icon">${reward.icon}</span>
              <h4 class="goal-title">${reward.title}</h4>
            </div>
            <div class="goal-progress-wrap">
              <div class="goal-bar-track">
                <div class="goal-bar-fill" style="width: ${percent}%;"></div>
              </div>
              <span class="goal-status-text">${totalStars} من أصل ${reward.starsRequired} نجمة (${percent}%)</span>
            </div>
          </div>
          ${btnHtml}
        `;
        goalsGrid.appendChild(card);
      });
    }

    // Render Stickers Album
    const stickersGrid = document.getElementById('stickers-album-grid');
    const summaryEl = document.getElementById('sticker-unlock-summary');
    if (stickersGrid) {
      stickersGrid.innerHTML = '';
      let unlockedCount = 0;

      (this.settings.stickers || []).forEach(sticker => {
        // Unlock criteria: 1 sticker unlocked for every 3 stars earned
        const shouldUnlock = totalStars >= 3;
        const isUnlocked = sticker.unlocked || shouldUnlock;
        if (isUnlocked) unlockedCount++;

        const box = document.createElement('div');
        box.className = `sticker-box ${isUnlocked ? 'unlocked' : 'locked'}`;
        box.innerHTML = `
          <span class="sticker-icon-big">${sticker.icon}</span>
          <span class="sticker-name">${sticker.name}</span>
          <span style="font-size: 0.72rem; color: ${isUnlocked ? '#15803D' : 'var(--text-muted)'}; font-weight: 700;">
            ${isUnlocked ? 'مفتوح ومبهج ✨' : 'يُفتح مع إنجازاتك'}
          </span>
        `;
        stickersGrid.appendChild(box);
      });

      if (summaryEl) {
        summaryEl.textContent = `${unlockedCount} من ${(this.settings.stickers || []).length} ملصقات`;
      }
    }
  }

  // ==========================================================================
  // TAB: SMART MINI-GAME ("مغامرة بطل النجوم" - بإذن ولي الأمر)
  // ==========================================================================
  initHeroGame() {
    const canvas = document.getElementById('hero-game-canvas');
    if (!canvas) return;
    this.heroGame = new StarHeroGame(canvas, this);
  }

  renderGameView() {
    const lockedView = document.getElementById('game-locked-view');
    const activeView = document.getElementById('game-active-view');
    const statusPill = document.getElementById('game-top-status-pill');
    const lockIcon = document.getElementById('game-lock-indicator-icon');
    const lockText = document.getElementById('game-lock-status-text');
    const navBadge = document.getElementById('game-nav-status');

    if (this.gameSession.unlocked) {
      if (lockedView) lockedView.style.display = 'none';
      if (activeView) activeView.style.display = 'flex';
      if (statusPill) statusPill.classList.add('unlocked');
      if (lockIcon) lockIcon.textContent = '🔓';
      if (lockText) lockText.textContent = 'وقت اللعب مسموح ونشط ⭐';
      if (navBadge) navBadge.textContent = '🎮';
      this.updateGameHud();
    } else {
      if (lockedView) lockedView.style.display = 'flex';
      if (activeView) activeView.style.display = 'none';
      if (statusPill) statusPill.classList.remove('unlocked');
      if (lockIcon) lockIcon.textContent = '🔒';
      if (lockText) lockText.textContent = 'بانتظار إذن وليّ الأمر';
      if (navBadge) navBadge.textContent = '🔒';
    }
  }

  updateGameHud() {
    const countdownEl = document.getElementById('game-hud-countdown');
    const scoreEl = document.getElementById('game-hud-score');
    if (countdownEl) {
      const mins = Math.floor(this.gameSession.remainingSeconds / 60);
      const secs = this.gameSession.remainingSeconds % 60;
      countdownEl.textContent = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    }
    if (scoreEl) {
      scoreEl.textContent = this.gameSession.score;
    }

    // Hero Energy Hearts (Lives)
    const livesEl = document.getElementById('game-hud-lives');
    if (livesEl && this.heroGame) {
      if (this.heroGame.difficulty === 'easy') {
        livesEl.textContent = '🟢 لا نهائي';
      } else {
        const max = this.heroGame.maxLives || 3;
        const cur = Math.max(0, this.heroGame.lives);
        let hearts = '';
        for (let i = 0; i < max; i++) {
          hearts += (i < cur) ? '❤️' : '💔';
        }
        livesEl.textContent = hearts;
      }
    }

    // Dynamic Combo Multiplier
    const comboEl = document.getElementById('game-hud-combo');
    if (comboEl && this.heroGame) {
      const combo = this.heroGame.combo || 1;
      comboEl.textContent = combo >= 4 ? `x${combo} 🔥` : `x${combo}`;
    }

    // Stage Pill
    const stageEl = document.getElementById('game-hud-stage');
    if (stageEl && this.heroGame) {
      const stageLabels = {
        1: '☀️ المرحلة 1',
        2: '🌅 المرحلة 2',
        3: '🌌 المرحلة 3'
      };
      stageEl.textContent = stageLabels[this.heroGame.stage] || `المرحلة ${this.heroGame.stage}`;
    }

    // Active Power-ups Ribbon
    const puBar = document.getElementById('game-powerup-bar');
    const puMagnet = document.getElementById('powerup-magnet');
    const puTurbo = document.getElementById('powerup-turbo');
    const puShield = document.getElementById('powerup-shield');
    const puMagnetTime = document.getElementById('pu-magnet-time');
    const puTurboTime = document.getElementById('pu-turbo-time');

    if (puBar && this.heroGame) {
      const magnetFrames = this.heroGame.powerups?.magnet || 0;
      const turboFrames = this.heroGame.powerups?.turbo || 0;
      const hasShield = Boolean(this.heroGame.powerups?.shield);

      if (puMagnet) {
        puMagnet.style.display = magnetFrames > 0 ? 'inline-flex' : 'none';
        if (puMagnetTime) puMagnetTime.textContent = `${Math.ceil(magnetFrames / 60)}s`;
      }
      if (puTurbo) {
        puTurbo.style.display = turboFrames > 0 ? 'inline-flex' : 'none';
        if (puTurboTime) puTurboTime.textContent = `${Math.ceil(turboFrames / 60)}s`;
      }
      if (puShield) {
        puShield.style.display = hasShield ? 'inline-flex' : 'none';
      }

      puBar.style.display = (magnetFrames > 0 || turboFrames > 0 || hasShield) ? 'flex' : 'none';
    }
  }

  setGameDifficulty(diff) {
    if (!this.settings.gameConfig) {
      this.settings.gameConfig = {};
    }
    this.settings.gameConfig.difficulty = diff;
    this.saveSettings();

    // Toggle active state on chips
    document.querySelectorAll('#game-diff-chips .diff-chip').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.diff === diff);
    });

    // Sync parent settings select
    const parentDiffSelect = document.getElementById('cfg-game-difficulty');
    if (parentDiffSelect) {
      parentDiffSelect.value = diff;
    }

    if (this.heroGame) {
      this.heroGame.setDifficulty(diff);
    }
    this.updateGameHud();

    const diffNames = {
      easy: '🟢 ناشئ (6-8 سنوات - قلوب غير محدودة)',
      medium: '🟡 بطل التحدي (10 سنوات ⭐ - 3 قلوب ونيازك وقوى خارقة)',
      hard: '🔴 أسطورة الفضاء (12+ سنة 🔥 - سرعة فائقة وتحدي حقيقي)'
    };
    this.showToast(`تم تغيير مستوى التحدي: ${diffNames[diff] || diff}`, 'info');
  }

  generateMathChallenge() {
    const a = Math.floor(Math.random() * 5) + 5; // 5 to 9
    const b = Math.floor(Math.random() * 6) + 4; // 4 to 9
    this.gameSession.mathChallenge = {
      q: `${a} × ${b} = ؟`,
      answer: a * b
    };
    const questionEl = document.getElementById('game-math-question');
    if (questionEl) {
      questionEl.textContent = this.gameSession.mathChallenge.q;
    }
  }

  openGamePermissionModal() {
    this.playClickSound();
    this.generateMathChallenge();

    const authType = this.settings.gameConfig?.requireMathOrPin || 'math';
    const mathBox = document.getElementById('game-math-challenge-box');
    const pinBox = document.getElementById('game-pin-challenge-box');
    const mathAnswer = document.getElementById('game-math-answer');
    const pinInput = document.getElementById('game-pin-input');
    const errorEl = document.getElementById('game-perm-error');

    if (errorEl) {
      errorEl.style.display = 'none';
      errorEl.textContent = '';
    }
    if (mathAnswer) mathAnswer.value = '';
    if (pinInput) pinInput.value = '';

    if (mathBox) mathBox.style.display = (authType === 'math' || authType === 'both') ? 'flex' : 'none';
    if (pinBox) pinBox.style.display = (authType === 'pin' || authType === 'both') ? 'flex' : 'none';

    // Check allowed schedule window
    const windowAlert = document.getElementById('game-window-alert');
    const windowAlertText = document.getElementById('game-window-alert-text');
    if (windowAlert && this.settings.gameConfig?.allowedWindowEnabled) {
      const now = new Date();
      const currentMinutes = now.getHours() * 60 + now.getMinutes();
      const startMin = this.timeToMinutes(this.settings.gameConfig.allowedWindowStart || '16:00');
      const endMin = this.timeToMinutes(this.settings.gameConfig.allowedWindowEnd || '20:00');

      if (currentMinutes < startMin || currentMinutes > endMin) {
        windowAlert.style.display = 'flex';
        if (windowAlertText) {
          windowAlertText.textContent = `تنبيه: وقت اللعب المعتاد بين ${this.settings.gameConfig.allowedWindowStart || '16:00'} و ${this.settings.gameConfig.allowedWindowEnd || '20:00'}. بإمكان ولي الأمر الموافقة كاستثناء للبطل الآن.`;
        }
      } else {
        windowAlert.style.display = 'none';
      }
    } else if (windowAlert) {
      windowAlert.style.display = 'none';
    }

    const modal = document.getElementById('game-permission-modal');
    if (modal) modal.style.display = 'flex';

    if (mathAnswer && (authType === 'math' || authType === 'both')) {
      setTimeout(() => mathAnswer.focus(), 150);
    } else if (pinInput) {
      setTimeout(() => pinInput.focus(), 150);
    }
  }

  closeGamePermissionModal() {
    const modal = document.getElementById('game-permission-modal');
    if (modal) modal.style.display = 'none';
  }

  verifyAndGrantGamePermission() {
    const authType = this.settings.gameConfig?.requireMathOrPin || 'math';
    const mathAnswer = document.getElementById('game-math-answer');
    const pinInput = document.getElementById('game-pin-input');
    const errorEl = document.getElementById('game-perm-error');

    let isValid = true;
    if (authType === 'math' || authType === 'both') {
      const val = parseInt(mathAnswer?.value, 10);
      if (val !== this.gameSession.mathChallenge.answer) {
        isValid = false;
      }
    }

    if (authType === 'pin' || authType === 'both') {
      const enteredPin = (pinInput?.value || '').trim();
      const parentPin = (this.settings.parentPin || '1234').trim();
      if (enteredPin !== parentPin) {
        isValid = false;
      }
    }

    if (!isValid) {
      if (errorEl) {
        errorEl.textContent = 'الإجابة أو الرمز غير صحيح! يرجى التأكد والمحاولة مجدداً 🔒';
        errorEl.style.display = 'block';
      }
      this.playGentleTone(220, 'sawtooth', 0.25, 0.1);
      return;
    }

    // Determine selected duration
    const activePill = document.querySelector('#game-duration-presets .duration-pill.active');
    const duration = activePill ? parseInt(activePill.dataset.minutes, 10) : (this.settings.gameConfig?.defaultPlayMinutes || 15);

    this.closeGamePermissionModal();
    this.startGameSession(duration);
    this.showToast(`تم فتح وقت اللعب بنجاح لمدة ${duration} دقيقة! انطلق يا بطل 🚀🎮`, 'success');
  }

  startGameSession(durationMins) {
    if (this.gameSession.timerInterval) {
      clearInterval(this.gameSession.timerInterval);
    }

    this.gameSession.unlocked = true;
    this.gameSession.running = true;
    this.gameSession.paused = false;
    this.gameSession.durationMinutes = durationMins;
    this.gameSession.totalSeconds = durationMins * 60;
    this.gameSession.remainingSeconds = durationMins * 60;
    this.gameSession.score = 0;

    this.renderGameView();
    this.updateGameHud();
    this.playCelebrationSound();

    // Start 1-second interval
    this.gameSession.timerInterval = setInterval(() => {
      if (!this.gameSession.running || this.gameSession.paused) return;

      this.gameSession.remainingSeconds--;
      this.updateGameHud();

      if (this.gameSession.remainingSeconds === 60) {
        this.playGentleTone(659.25, 'triangle', 0.4, 0.2);
        this.showToast('بقي دقيقة واحدة على انتهاء وقت اللعب يا بطل ⏳', 'info');
      }

      if (this.gameSession.remainingSeconds <= 0) {
        this.endGameSession();
      }
    }, 1000);

    // Launch hero canvas loop
    if (this.heroGame) {
      this.heroGame.start();
    }
  }

  toggleGamePause() {
    this.gameSession.paused = !this.gameSession.paused;
    const pauseIcon = document.getElementById('game-pause-icon');
    const pauseText = document.getElementById('game-pause-text');

    if (this.gameSession.paused) {
      if (pauseIcon) pauseIcon.textContent = '▶️';
      if (pauseText) pauseText.textContent = 'استئناف';
      if (this.heroGame) this.heroGame.pause();
      this.showToast('تم إيقاف اللعبة مؤقتاً ⏸️', 'info');
    } else {
      if (pauseIcon) pauseIcon.textContent = '⏸️';
      if (pauseText) pauseText.textContent = 'إيقاف مؤقت';
      if (this.heroGame) this.heroGame.resume();
      this.showToast('تم استئناف اللعب ▶️', 'info');
    }
  }

  lockGameSessionNow() {
    if (this.gameSession.timerInterval) {
      clearInterval(this.gameSession.timerInterval);
      this.gameSession.timerInterval = null;
    }
    this.gameSession.unlocked = false;
    this.gameSession.running = false;
    this.gameSession.paused = false;

    if (this.heroGame) {
      this.heroGame.stop();
    }

    this.renderGameView();
    this.showToast('تم قفل منطقة الألعاب بنجاح 🔒', 'info');
  }

  endGameSession() {
    if (this.gameSession.timerInterval) {
      clearInterval(this.gameSession.timerInterval);
      this.gameSession.timerInterval = null;
    }
    this.gameSession.running = false;
    this.gameSession.paused = false;

    if (this.heroGame) {
      this.heroGame.stop();
    }

    // Convert score to stars (1 star per 60 points, min 1)
    const earnedStars = Math.max(1, Math.floor(this.gameSession.score / 60));
    this.settings.starsEarned = (this.settings.starsEarned || 0) + earnedStars;
    this.saveSettings();
    this.renderHeaderAndBrand();
    this.renderRewardsView();

    const ptsEl = document.getElementById('game-timeout-points');
    const starsEl = document.getElementById('game-timeout-stars');
    if (ptsEl) ptsEl.textContent = this.gameSession.score;
    if (starsEl) starsEl.textContent = `+${earnedStars}`;

    const modal = document.getElementById('game-timeout-modal');
    if (modal) modal.style.display = 'flex';

    this.playCelebrationSound();
    this.triggerCelebrationConfetti();

    this.gameSession.unlocked = false;
    this.renderGameView();
  }

  quickGrantGamePermission(mins = 15) {
    this.startGameSession(mins);
    this.switchTab('game');
    this.showToast(`تم فتح اللعبة مباشرة كإذن من ولي الأمر لمدة ${mins} دقيقة! 🎮⭐`, 'success');
  }

  // ==========================================================================
  // TAB 5: PARENT SETUP & SETTINGS
  // ==========================================================================
  renderParentView() {
    // Card 0: Dual Account & Security
    const activeAccountSelect = document.getElementById('cfg-active-account');
    if (activeAccountSelect) activeAccountSelect.value = this.currentAccount || 'parent';

    const defaultAccountSelect = document.getElementById('cfg-default-account');
    if (defaultAccountSelect) defaultAccountSelect.value = this.settings.defaultAccount || 'child';

    const parentPinInput = document.getElementById('cfg-parent-pin');
    if (parentPinInput) parentPinInput.value = this.settings.parentPin || '1234';

    // Child Profile Inputs
    const childNameInput = document.getElementById('cfg-child-name');
    if (childNameInput) childNameInput.value = this.settings.childName || '';

    const childAgeInput = document.getElementById('cfg-child-age');
    if (childAgeInput) childAgeInput.value = this.settings.childAge || '';

    const appNameInput = document.getElementById('cfg-app-name');
    if (appNameInput) appNameInput.value = this.settings.appName || '';

    // Avatar preview
    const previewImg = document.getElementById('cfg-avatar-preview');
    const avatarSrc = this.settings.avatarDataUrl || this.settings.avatarPreset || 'assets/avatar_son.jpg';
    if (previewImg) previewImg.src = avatarSrc;

    // Routine Hours
    const schoolStart = document.getElementById('cfg-school-start');
    if (schoolStart) schoolStart.value = this.settings.schoolHours?.start || '07:30';

    const schoolEnd = document.getElementById('cfg-school-end');
    if (schoolEnd) schoolEnd.value = this.settings.schoolHours?.end || '13:30';

    const sleepWake = document.getElementById('cfg-sleep-wake');
    if (sleepWake) sleepWake.value = this.settings.sleepHours?.wake || '06:30';

    const sleepBed = document.getElementById('cfg-sleep-bed');
    if (sleepBed) sleepBed.value = this.settings.sleepHours?.bed || '20:30';

    // School Days Checkboxes
    const schoolDaysGroup = document.getElementById('cfg-school-days-group');
    if (schoolDaysGroup) {
      const checkboxes = schoolDaysGroup.querySelectorAll('input[type="checkbox"]');
      checkboxes.forEach(cb => {
        cb.checked = (this.settings.schoolDays || []).includes(parseInt(cb.value, 10));
      });
    }

    // Clubs Manager
    const clubsList = document.getElementById('cfg-clubs-list');
    if (clubsList) {
      clubsList.innerHTML = '';
      (this.settings.clubs || []).forEach(club => {
        const dayNames = club.days.map(d => ARABIC_DAYS.find(ad => ad.index === d)?.name).join('، ');
        const row = document.createElement('div');
        row.className = 'club-item-row';
        row.innerHTML = `
          <div class="club-row-main">
            <span class="club-row-icon">${club.icon || '⚽'}</span>
            <div class="club-row-info">
              <span class="club-row-name">${club.name} (${club.location || 'بدون موقع'})</span>
              <span class="club-row-time">⏰ ${dayNames} • من ${club.start} إلى ${club.end} (تجهيز ${club.prepMinutes} دقيقة)</span>
            </div>
          </div>
          <button type="button" class="btn btn-danger-child btn-remove-club" data-remove-club="${club.id}" style="padding: 6px 14px; font-size: 0.85rem; cursor: pointer;">حذف</button>
        `;

        // Direct button click binding
        const delBtn = row.querySelector('[data-remove-club]');
        if (delBtn) {
          delBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            this.removeClub(club.id);
          });
        }

        clubsList.appendChild(row);
      });
    }

    // Reminders
    const remEnable = document.getElementById('cfg-reminders-enable');
    if (remEnable) remEnable.checked = this.settings.reminders?.enabled ?? true;

    const remLead = document.getElementById('cfg-reminder-lead');
    if (remLead) remLead.value = this.settings.reminders?.leadMinutes || 15;

    const remSound = document.getElementById('cfg-reminder-sound');
    if (remSound) remSound.checked = this.settings.reminders?.soundEnabled ?? true;

    // Card 6: Game & Screen Time Controls
    const gameDuration = document.getElementById('cfg-game-default-duration');
    if (gameDuration) gameDuration.value = this.settings.gameConfig?.defaultPlayMinutes || 15;

    const gameDifficulty = document.getElementById('cfg-game-difficulty');
    if (gameDifficulty) gameDifficulty.value = this.settings.gameConfig?.difficulty || 'medium';

    const gameAuthType = document.getElementById('cfg-game-auth-type');
    if (gameAuthType) gameAuthType.value = this.settings.gameConfig?.requireMathOrPin || 'math';

    const gameWindowToggle = document.getElementById('cfg-game-window-toggle');
    const gameWindowRow = document.getElementById('cfg-game-window-row');
    if (gameWindowToggle) {
      gameWindowToggle.checked = this.settings.gameConfig?.allowedWindowEnabled ?? true;
      if (gameWindowRow) {
        gameWindowRow.style.display = gameWindowToggle.checked ? 'grid' : 'none';
      }
    }

    const gameWindowStart = document.getElementById('cfg-game-window-start');
    if (gameWindowStart) gameWindowStart.value = this.settings.gameConfig?.allowedWindowStart || '16:00';

    const gameWindowEnd = document.getElementById('cfg-game-window-end');
    if (gameWindowEnd) gameWindowEnd.value = this.settings.gameConfig?.allowedWindowEnd || '20:00';
  }

  removeClub(clubId) {
    if (!this.settings.clubs) return;
    const club = this.settings.clubs.find(c => String(c.id) === String(clubId));
    if (!club) return;

    if (confirm(`هل ترغب في حذف نشاط «${club.name}» من قائمة الأنشطة والنوادي؟`)) {
      this.playClickSound();
      this.settings.clubs = this.settings.clubs.filter(c => String(c.id) !== String(clubId));

      // Remove any schedule activities corresponding to this club
      const initialScheduleLen = this.schedule.length;
      this.schedule = this.schedule.filter(item => {
        if (item.category === 'club' && (item.title === club.name || item.clubId === club.id)) {
          return false;
        }
        return true;
      });

      this.saveSettings();
      if (this.schedule.length !== initialScheduleLen) {
        this.saveSchedule();
        this.renderTodayView();
        this.renderWeeklyView();
      }

      this.renderParentView();
      this.showToast(`تم حذف نشاط «${club.name}» بنجاح! 🗑️`, 'info');
    }
  }

  saveParentSettingsFromUI() {
    // Dual Account & Security Settings
    const activeAccountSelect = document.getElementById('cfg-active-account');
    const defaultAccountSelect = document.getElementById('cfg-default-account');
    const parentPinInput = document.getElementById('cfg-parent-pin');

    if (defaultAccountSelect) {
      this.settings.defaultAccount = defaultAccountSelect.value;
    }
    if (parentPinInput && parentPinInput.value.trim()) {
      this.settings.parentPin = parentPinInput.value.trim();
    }

    const childNameInput = document.getElementById('cfg-child-name');
    if (childNameInput && childNameInput.value.trim()) {
      this.settings.childName = childNameInput.value.trim();
    }

    const childAgeInput = document.getElementById('cfg-child-age');
    if (childAgeInput) {
      this.settings.childAge = parseInt(childAgeInput.value, 10) || null;
    }

    const appNameInput = document.getElementById('cfg-app-name');
    if (appNameInput && appNameInput.value.trim()) {
      this.settings.appName = appNameInput.value.trim();
    }

    // Routine Hours
    const schoolStart = document.getElementById('cfg-school-start');
    const schoolEnd = document.getElementById('cfg-school-end');
    if (schoolStart && schoolEnd) {
      this.settings.schoolHours = { start: schoolStart.value, end: schoolEnd.value };
    }

    const sleepWake = document.getElementById('cfg-sleep-wake');
    const sleepBed = document.getElementById('cfg-sleep-bed');
    if (sleepWake && sleepBed) {
      this.settings.sleepHours = { wake: sleepWake.value, bed: sleepBed.value };
    }

    // School days
    const schoolDaysGroup = document.getElementById('cfg-school-days-group');
    if (schoolDaysGroup) {
      const selected = [];
      schoolDaysGroup.querySelectorAll('input[type="checkbox"]:checked').forEach(cb => {
        selected.push(parseInt(cb.value, 10));
      });
      this.settings.schoolDays = selected;
    }

    // Reminders
    const remEnable = document.getElementById('cfg-reminders-enable');
    const remLead = document.getElementById('cfg-reminder-lead');
    const remSound = document.getElementById('cfg-reminder-sound');
    this.settings.reminders = {
      ...this.settings.reminders,
      enabled: remEnable ? remEnable.checked : true,
      leadMinutes: remLead ? parseInt(remLead.value, 10) : 15,
      soundEnabled: remSound ? remSound.checked : true
    };

    // Game Config
    const gameDuration = document.getElementById('cfg-game-default-duration');
    const gameDiff = document.getElementById('cfg-game-difficulty');
    const gameAuthType = document.getElementById('cfg-game-auth-type');
    const gameWindowToggle = document.getElementById('cfg-game-window-toggle');
    const gameWindowStart = document.getElementById('cfg-game-window-start');
    const gameWindowEnd = document.getElementById('cfg-game-window-end');

    const chosenDiff = gameDiff ? gameDiff.value : (this.settings.gameConfig?.difficulty || 'medium');

    this.settings.gameConfig = {
      ...this.settings.gameConfig,
      defaultPlayMinutes: gameDuration ? parseInt(gameDuration.value, 10) : 15,
      difficulty: chosenDiff,
      requireMathOrPin: gameAuthType ? gameAuthType.value : 'math',
      allowedWindowEnabled: gameWindowToggle ? gameWindowToggle.checked : true,
      allowedWindowStart: gameWindowStart ? gameWindowStart.value : '16:00',
      allowedWindowEnd: gameWindowEnd ? gameWindowEnd.value : '20:00'
    };

    // Sync chips in game view
    document.querySelectorAll('#game-diff-chips .diff-chip').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.diff === chosenDiff);
    });

    if (this.heroGame) {
      this.heroGame.setDifficulty(chosenDiff);
    }

    this.saveSettings();
    this.renderHeaderAndBrand();
    this.renderTodayView();
    this.renderWeeklyView();
    this.updateGameHud();
    this.showToast('تم حفظ جميع إعدادات وليّ الأمر بنجاح! 💾✨', 'success');
  }

  // ==========================================================================
  // Schedule Conflict Detection Engine
  // ==========================================================================
  findConflicts(candidate) {
    // candidate: { id, day, startTime, endTime }
    const conflicts = [];
    if (!candidate.startTime || !candidate.endTime) return conflicts;

    const candidateStart = this.timeToMinutes(candidate.startTime);
    const candidateEnd = this.timeToMinutes(candidate.endTime);

    if (candidateEnd <= candidateStart) {
      conflicts.push({
        type: 'invalid_duration',
        message: 'وقت النهاية يجب أن يكون بعد وقت البداية!'
      });
      return conflicts;
    }

    // Check overlaps with existing items on the same day
    this.schedule.forEach(existing => {
      if (existing.id === candidate.id) return;
      if (existing.day !== parseInt(candidate.day, 10)) return;

      const exStart = this.timeToMinutes(existing.startTime);
      const exEnd = this.timeToMinutes(existing.endTime);

      // Overlap condition: start1 < end2 and start2 < end1
      if (candidateStart < exEnd && exStart < candidateEnd) {
        const catDef = CATEGORY_DEFINITIONS[existing.category] || CATEGORY_DEFINITIONS.study;
        conflicts.push({
          type: 'overlap',
          item: existing,
          categoryDef: catDef,
          message: `يتعارض مع «${existing.title}» (${existing.startTime} - ${existing.endTime})`
        });
      }
    });

    return conflicts;
  }

  setupConflictListener() {
    const daySelect = document.getElementById('item-day-select');
    const startInput = document.getElementById('item-start-time');
    const endInput = document.getElementById('item-end-time');
    const alertBox = document.getElementById('modal-conflict-alert');
    const alertMsg = document.getElementById('conflict-message');

    const checkNow = () => {
      if (!alertBox || !alertMsg) return;
      const candidate = {
        id: this.editingItemId,
        day: daySelect.value,
        startTime: startInput.value,
        endTime: endInput.value
      };

      const conflicts = this.findConflicts(candidate);
      if (conflicts.length > 0) {
        alertBox.style.display = 'flex';
        alertMsg.innerHTML = conflicts.map(c => `⚠️ ${c.message}`).join('<br>');
      } else {
        alertBox.style.display = 'none';
      }
    };

    if (daySelect) daySelect.addEventListener('change', checkNow);
    if (startInput) startInput.addEventListener('input', checkNow);
    if (endInput) endInput.addEventListener('input', checkNow);
  }

  // ==========================================================================
  // Schedule Item Modal Management (Add / Edit / Delete)
  // ==========================================================================
  openScheduleModal(itemId = null, prefillDay = null) {
    this.editingItemId = itemId;
    const modal = document.getElementById('schedule-item-modal');
    const modalTitle = document.getElementById('modal-item-title');
    const deleteBtn = document.getElementById('btn-delete-item');
    const form = document.getElementById('schedule-item-form');
    const alertBox = document.getElementById('modal-conflict-alert');
    if (alertBox) alertBox.style.display = 'none';

    if (itemId) {
      const item = this.schedule.find(i => i.id === itemId);
      if (!item) return;

      modalTitle.textContent = 'تعديل نشاط في الجدول';
      deleteBtn.style.display = 'inline-flex';

      document.getElementById('item-form-id').value = item.id;
      document.getElementById('item-day-select').value = item.day;
      document.getElementById('item-category-select').value = item.category;
      document.getElementById('item-title-input').value = item.title;
      document.getElementById('item-subject-select').value = item.subject || '';
      document.getElementById('item-start-time').value = item.startTime;
      document.getElementById('item-end-time').value = item.endTime;
      document.getElementById('item-location-input').value = item.location || '';
      document.getElementById('item-notes-input').value = item.notes || '';
      document.getElementById('item-flexible-select').value = String(item.isFlexible);
    } else {
      modalTitle.textContent = 'إضافة نشاط جديد للجدول';
      deleteBtn.style.display = 'none';
      form.reset();

      document.getElementById('item-form-id').value = '';
      document.getElementById('item-day-select').value = prefillDay !== null ? prefillDay : this.currentDayIndex;
      document.getElementById('item-category-select').value = 'study';
      document.getElementById('item-start-time').value = '16:00';
      document.getElementById('item-end-time').value = '16:45';
      document.getElementById('item-flexible-select').value = 'false';
    }

    modal.style.display = 'flex';
  }

  closeScheduleModal() {
    const modal = document.getElementById('schedule-item-modal');
    if (modal) modal.style.display = 'none';
    this.editingItemId = null;
  }

  saveScheduleItemFromModal() {
    const id = document.getElementById('item-form-id').value || `item-${Date.now()}`;
    const day = parseInt(document.getElementById('item-day-select').value, 10);
    const category = document.getElementById('item-category-select').value;
    const title = document.getElementById('item-title-input').value.trim();
    const subject = document.getElementById('item-subject-select').value || null;
    const startTime = document.getElementById('item-start-time').value;
    const endTime = document.getElementById('item-end-time').value;
    const location = document.getElementById('item-location-input').value.trim() || null;
    const notes = document.getElementById('item-notes-input').value.trim() || null;
    const isFlexible = document.getElementById('item-flexible-select').value === 'true';
    const repeatOption = document.getElementById('item-repeat-select').value;

    if (!title || !startTime || !endTime) {
      this.showToast('يرجى كتابة عنوان النشاط ووقتي البداية والنهاية', 'error');
      return;
    }

    const candidate = { id, day, startTime, endTime };
    const conflicts = this.findConflicts(candidate);
    if (conflicts.length > 0) {
      const confirmSave = confirm(`تنبيه: هناك تعارض في الوقت:\n${conflicts.map(c => c.message).join('\n')}\n\nهل ترغب في الحفظ على أي حال؟`);
      if (!confirmSave) return;
    }

    const newItem = {
      id,
      day,
      category,
      title,
      subject,
      startTime,
      endTime,
      location,
      notes,
      isFlexible,
      completed: false
    };

    // If repeat for all school days
    if (repeatOption === 'school_days') {
      this.settings.schoolDays.forEach(schoolDay => {
        const itemCopy = {
          ...newItem,
          id: `item-${Date.now()}-${schoolDay}`,
          day: schoolDay
        };
        this.schedule.push(itemCopy);
      });
    } else {
      const existingIdx = this.schedule.findIndex(i => i.id === id);
      if (existingIdx >= 0) {
        this.schedule[existingIdx] = { ...this.schedule[existingIdx], ...newItem };
      } else {
        this.schedule.push(newItem);
      }
    }

    this.saveSchedule();
    this.closeScheduleModal();
    this.renderTodayView();
    this.renderWeeklyView();
    this.showToast('تمت إضافة النشاط للجدول بنجاح! 🌟', 'success');
  }

  deleteScheduleItem(itemId) {
    if (!itemId) return;
    this.schedule = this.schedule.filter(i => i.id !== itemId);
    this.saveSchedule();
    this.closeScheduleModal();
    this.renderTodayView();
    this.renderWeeklyView();
    this.showToast('تم حذف النشاط من الجدول', 'info');
  }

  toggleItemCompleted(itemId) {
    const item = this.schedule.find(i => i.id === itemId);
    if (!item) return;

    item.completed = !item.completed;
    if (item.completed) {
      // Award 1 star
      this.settings.starsEarned = (this.settings.starsEarned || 0) + 1;
      this.saveSettings();
      this.renderHeaderAndBrand();
      this.renderRewardsView();

      this.playCelebrationSound();
      this.triggerCelebrationConfetti();
      let title = 'أحسنت يا بطل! 🌟';
      let msg = `لقد أنجزت: «${item.title}» وكسبت نجمة ذكية جديدة!`;
      if (item.category === 'prayer') {
        title = 'تقبل الله طاعتك وصلاتك! 🕌✨';
        msg = `بارك الله فيك يا ${this.settings.childName}! صلاة في وقتها نور وبركة ونجمة مضيئة في برطمانك ⭐`;
      } else if (item.category === 'quran') {
        title = 'هنيئاً لك حفظ وتلاوة كتاب الله! 📖🌸';
        msg = `ما شاء الله تبارك الله! قراءة وترتيل القرآن الكريم رفعة وأجر عظيم ونور في القلب، أحسنت يا بطل 🌟`;
      }
      this.openCelebrationModal(title, msg);
    } else {
      this.playClickSound();
    }

    this.saveSchedule();
    this.renderTodayView();
    this.renderWeeklyView();
  }

  // ==========================================================================
  // Quick Reschedule Modal
  // ==========================================================================
  openQuickReschedule(itemId) {
    const item = this.schedule.find(i => i.id === itemId);
    if (!item) return;

    this.reschedulingItem = item;
    const modal = document.getElementById('quick-reschedule-modal');
    const nameEl = document.getElementById('reschedule-item-name');
    if (nameEl) nameEl.textContent = `${item.title} (${item.startTime} - ${item.endTime})`;
    if (modal) modal.style.display = 'flex';
  }

  applyQuickReschedule(action) {
    if (!this.reschedulingItem) return;
    const item = this.reschedulingItem;

    if (action === 'next_day') {
      item.day = (item.day + 1) % 7;
      this.showToast(`تم نقل النشاط إلى يوم ${ARABIC_DAYS[item.day].name} ⏩`, 'info');
    } else if (action === 'delay_30') {
      item.startTime = this.addMinutesToTime(item.startTime, 30);
      item.endTime = this.addMinutesToTime(item.endTime, 30);
      this.showToast(`تم تأخير الموعد 30 دقيقة (${item.startTime}) ⏱️`, 'info');
    } else if (action === 'delay_60') {
      item.startTime = this.addMinutesToTime(item.startTime, 60);
      item.endTime = this.addMinutesToTime(item.endTime, 60);
      this.showToast(`تم تأخير الموعد ساعة واحدة (${item.startTime}) ⏰`, 'info');
    } else if (action === 'weekend') {
      item.day = 6; // Saturday
      this.showToast('تم نقل النشاط إلى عطلة السبت 🎈', 'info');
    }

    this.saveSchedule();
    const modal = document.getElementById('quick-reschedule-modal');
    if (modal) modal.style.display = 'none';
    this.reschedulingItem = null;
    this.renderTodayView();
    this.renderWeeklyView();
  }

  // ==========================================================================
  // Celebration Dialog
  // ==========================================================================
  openCelebrationModal(title, message) {
    const modal = document.getElementById('celebration-modal');
    const titleEl = document.querySelector('.celebration-title');
    const msgEl = document.getElementById('celebration-message-text');

    if (titleEl) titleEl.textContent = title;
    if (msgEl) msgEl.textContent = message;
    if (modal) modal.style.display = 'flex';
  }

  // ==========================================================================
  // Photo Upload & Parental Consent
  // ==========================================================================
  requestPhotoUpload() {
    const modal = document.getElementById('parent-consent-modal');
    const checkbox = document.getElementById('consent-checkbox');
    const confirmBtn = document.getElementById('btn-confirm-consent');

    if (checkbox) checkbox.checked = false;
    if (confirmBtn) confirmBtn.disabled = true;
    if (modal) modal.style.display = 'flex';
  }

  handlePhotoFileSelected(event) {
    const file = event.target.files && event.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      this.showToast('يرجى اختيار ملف صورة صالح', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target.result;
      this.settings.avatarType = 'uploaded';
      this.settings.avatarDataUrl = dataUrl;
      this.saveSettings();

      this.renderHeaderAndBrand();
      this.renderParentView();
      this.showToast('تم تعيين صورة طفلك اللطيفة محلياً بأمان تام! 📸✨', 'success');
    };
    reader.readAsDataURL(file);
  }

  // ==========================================================================
  // Data Export, Import & Reset
  // ==========================================================================
  exportData() {
    const data = {
      exportVersion: 1,
      exportDate: new Date().toISOString(),
      settings: this.settings,
      schedule: this.schedule
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `my-week-schedule-${this.settings.childName || 'backup'}.json`;
    a.click();
    URL.revokeObjectURL(url);

    this.showToast('تم تصدير الجدول كملف نسخة احتياطية بنجاح 📥', 'success');
  }

  importData(event) {
    const file = event.target.files && event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const imported = JSON.parse(e.target.result);
        if (imported.settings && imported.schedule) {
          this.settings = imported.settings;
          this.schedule = imported.schedule;
          this.saveSettings();
          this.saveSchedule();

          this.init();
          this.showToast('تمت استعادة الجدول بنجاح تام! 📤🌟', 'success');
        } else {
          this.showToast('صيغة الملف غير متوافقة', 'error');
        }
      } catch (err) {
        this.showToast('تعذر قراءة ملف النسخة الاحتياطية', 'error');
      }
    };
    reader.readAsText(file);
  }

  resetToSampleData() {
    const confirmReset = confirm('هل أنت متأكد من رغبتك في استعادة الجدول الافتراضي اللطيف؟ سيتم استبدال التغييرات الحالية.');
    if (!confirmReset) return;

    this.settings = { ...defaultSettings };
    this.schedule = [...defaultSchedule];
    this.saveSettings();
    this.saveSchedule();

    this.init();
    this.showToast('تمت استعادة الجدول الافتراضي بنجاح! 🔄🌸', 'success');
  }

  resetStarsOnly() {
    const confirmReset = confirm('هل أنت متأكد من تصفير رصيد النجوم والبدء من 0 ⭐؟\nستظل جميع مهام الجدول والأنشطة والصلوات والقرآن كما هي تماماً دون أي حذف.');
    if (!confirmReset) return;

    this.settings.starsEarned = 0;
    if (this.settings.rewards) {
      this.settings.rewards.forEach(r => { r.claimed = false; });
    }
    if (this.settings.gameConfig) {
      this.settings.gameConfig.highScore = 0;
      this.settings.gameConfig.playedTodayMinutes = 0;
    }
    if (this.schedule && Array.isArray(this.schedule)) {
      this.schedule.forEach(item => { item.completed = false; });
      this.saveSchedule();
    }
    this.saveSettings();

    this.renderHeaderAndBrand();
    this.renderTodayView();
    this.renderWeeklyView();
    this.renderRewardsView();
    this.showToast('تم تصفير رصيد النجوم بنجاح (0 ⭐) مع بقاء كامل المهام كما هي! 🌟', 'success');
  }

  // ==========================================================================
  // DUAL ACCOUNT SYSTEM (حساب الطفل وحساب وليّ الأمر)
  // ==========================================================================
  initAccountSystem() {
    this.currentAccount = this.settings.activeAccount || this.settings.defaultAccount || 'child';
    this.setAccount(this.currentAccount, true);
  }

  setAccount(role, skipNotification = false) {
    this.currentAccount = role;
    this.settings.activeAccount = role;
    this.saveSettings();

    const body = document.body;
    if (role === 'child') {
      body.classList.add('account-child');
      body.classList.remove('account-parent');
      // If currently on parent tab, immediately switch to today view
      if (this.activeTab === 'parent') {
        this.switchTab('today');
      }
    } else {
      body.classList.add('account-parent');
      body.classList.remove('account-child');
    }

    // Update Header Pill
    const accIcon = document.getElementById('acc-pill-icon');
    const accRole = document.getElementById('acc-pill-role');
    const accAction = document.getElementById('acc-pill-action');
    const cfgAccountSelect = document.getElementById('cfg-active-account');
    if (cfgAccountSelect) cfgAccountSelect.value = role;

    if (role === 'child') {
      if (accIcon) accIcon.textContent = '👦';
      if (accRole) accRole.textContent = `حساب ${this.settings.childName || 'الطفل'}`;
      if (accAction) accAction.textContent = '🔒 دخول وليّ الأمر';
    } else {
      if (accIcon) accIcon.textContent = '👑';
      if (accRole) accRole.textContent = 'حساب وليّ الأمر';
      if (accAction) accAction.textContent = '🔄 تبديل لحساب الطفل';
    }

    if (!skipNotification) {
      if (role === 'child') {
        this.showToast('تم التحويل إلى حساب الطفل وإخفاء تبويب الإعدادات 👦🌸', 'info');
      } else {
        this.showToast('مرحباً بك! تم فتح حساب وليّ الأمر وإظهار كامل الصلاحيات 👑✨', 'success');
      }
    }
  }

  handleAccountSwitchClick() {
    this.playClickSound();
    if (this.currentAccount === 'parent') {
      if (confirm('هل ترغب في قفل الإعدادات والتحويل إلى حساب الطفل الآن؟')) {
        this.setAccount('child');
        this.switchTab('today');
      }
    } else {
      this.openParentLoginModal();
    }
  }

  generateParentLoginMath() {
    const a = Math.floor(Math.random() * 5) + 5; // 5 to 9
    const b = Math.floor(Math.random() * 6) + 4; // 4 to 9
    this.parentLoginMath = {
      q: `${a} × ${b} = ؟`,
      answer: a * b
    };
    const qEl = document.getElementById('parent-login-math-question');
    if (qEl) qEl.textContent = this.parentLoginMath.q;
  }

  openParentLoginModal() {
    this.playClickSound();
    this.generateParentLoginMath();

    const pinInput = document.getElementById('parent-login-pin-input');
    const mathInput = document.getElementById('parent-login-math-input');
    const errorEl = document.getElementById('parent-login-error');

    if (pinInput) pinInput.value = '';
    if (mathInput) mathInput.value = '';
    if (errorEl) {
      errorEl.textContent = '';
      errorEl.style.display = 'none';
    }

    const modal = document.getElementById('parent-login-modal');
    if (modal) modal.style.display = 'flex';

    if (pinInput) {
      setTimeout(() => pinInput.focus(), 150);
    }
  }

  closeParentLoginModal() {
    const modal = document.getElementById('parent-login-modal');
    if (modal) modal.style.display = 'none';
  }

  verifyAndLoginParent() {
    const pinInput = document.getElementById('parent-login-pin-input');
    const mathInput = document.getElementById('parent-login-math-input');
    const errorEl = document.getElementById('parent-login-error');

    const enteredPin = (pinInput?.value || '').trim();
    const correctPin = (this.settings.parentPin || '1234').trim();

    const mathVal = parseInt(mathInput?.value, 10);
    const correctMath = this.parentLoginMath?.answer;

    const isPinCorrect = enteredPin && (enteredPin === correctPin);
    const isMathCorrect = !isNaN(mathVal) && (mathVal === correctMath);

    if (isPinCorrect || isMathCorrect) {
      this.closeParentLoginModal();
      this.playCelebrationSound();
      this.setAccount('parent');
      this.switchTab('parent');
    } else {
      if (errorEl) {
        errorEl.textContent = 'رمز PIN أو إجابة المسألة غير صحيحة! يرجى التأكد والمحاولة مجدداً 🔒';
        errorEl.style.display = 'block';
      }
      this.playGentleTone(220, 'sawtooth', 0.25, 0.1);
    }
  }

  handleParentModeClick() {
    this.handleAccountSwitchClick();
  }

  switchTab(tabId) {
    // Intercept: if in child account and trying to open parent tab, require login!
    if (tabId === 'parent' && this.currentAccount === 'child') {
      this.openParentLoginModal();
      return;
    }

    this.playClickSound();
    this.activeTab = tabId;

    // Top Tabs
    document.querySelectorAll('.nav-tab').forEach(tab => {
      tab.classList.toggle('active', tab.dataset.tab === tabId);
    });

    // Mobile Bottom Tabs
    document.querySelectorAll('.mobile-nav-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.tab === tabId);
    });

    // View Panels
    document.querySelectorAll('.view-panel').forEach(panel => {
      panel.classList.toggle('active', panel.id === `view-${tabId}`);
    });

    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // ==========================================================================
  // Live Clock Check for Reminders
  // ==========================================================================
  startLiveClockCheck() {
    setInterval(() => {
      if (!this.settings.reminders?.enabled) return;

      const now = new Date();
      const currentDay = now.getDay();
      const currentMinutes = now.getHours() * 60 + now.getMinutes();
      const lead = this.settings.reminders.leadMinutes || 15;

      this.schedule.forEach(item => {
        if (item.day !== currentDay || item.completed) return;
        const itemStart = this.timeToMinutes(item.startTime);
        if (itemStart - currentMinutes === lead) {
          this.triggerReminderNotification(item);
        }
      });
    }, 60000);
  }

  triggerReminderNotification(item) {
    const catDef = CATEGORY_DEFINITIONS[item.category] || CATEGORY_DEFINITIONS.study;
    const msg = `تذكير رقيق: بعد قليل موعد «${item.title}» (${item.startTime}) ${catDef.icon}`;
    this.showToast(msg, 'info');
    this.playGentleTone(587.33, 'sine', 0.5, 0.2);

    // Browser Notification if granted
    if ('Notification' in window && Notification.permission === 'granted') {
      try {
        new Notification(this.settings.appName || 'أسبوعي', {
          body: msg,
          icon: 'assets/logo_mascot.jpg',
          dir: 'rtl'
        });
      } catch (e) {
        console.log('Notification API error', e);
      }
    }
  }

  // ==========================================================================
  // Toast Notifications
  // ==========================================================================
  showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = 'gentle-toast';

    let icon = '🌸';
    if (type === 'success') icon = '⭐';
    if (type === 'error') icon = '⚠️';

    toast.innerHTML = `
      <span class="toast-icon">${icon}</span>
      <span>${message}</span>
    `;

    container.appendChild(toast);

    setTimeout(() => {
      toast.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(10px)';
      setTimeout(() => toast.remove(), 400);
    }, 4000);
  }

  // ==========================================================================
  // Helper Utilities
  // ==========================================================================
  timeToMinutes(timeStr) {
    if (!timeStr) return 0;
    const [h, m] = timeStr.split(':').map(n => parseInt(n, 10));
    return h * 60 + m;
  }

  addMinutesToTime(timeStr, addMins) {
    const total = (this.timeToMinutes(timeStr) + addMins) % (24 * 60);
    const h = Math.floor(total / 60);
    const m = total % 60;
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
  }

  formatTimeRange(start, end) {
    return `${start} - ${end}`;
  }

  // ==========================================================================
  // Event Listeners Binding
  // ==========================================================================
  setupEventListeners() {
    // Navigation Tabs
    document.querySelectorAll('.nav-tab').forEach(tab => {
      tab.addEventListener('click', () => this.switchTab(tab.dataset.tab));
    });

    document.querySelectorAll('.mobile-nav-btn').forEach(btn => {
      btn.addEventListener('click', () => this.switchTab(btn.dataset.tab));
    });

    // Theme Toggle
    const themeBtn = document.getElementById('theme-toggle-btn');
    if (themeBtn) {
      themeBtn.addEventListener('click', () => {
        this.playClickSound();
        const nextTheme = this.settings.theme === 'dark' ? 'light' : 'dark';
        this.applyTheme(nextTheme);
        this.saveSettings();
      });
    }

    // Account Switcher Button (in top header)
    const accountSwitchBtn = document.getElementById('account-switch-btn');
    if (accountSwitchBtn) {
      accountSwitchBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.handleAccountSwitchClick();
      });
    }

    // Avatar triggers (respect account permission)
    const childProfileTrigger = document.getElementById('child-profile-trigger');
    if (childProfileTrigger) {
      childProfileTrigger.addEventListener('click', () => {
        if (this.currentAccount === 'parent') {
          this.switchTab('parent');
        } else {
          this.openParentLoginModal();
        }
      });
    }

    const brandLogoBtn = document.getElementById('brand-logo-btn');
    if (brandLogoBtn) {
      brandLogoBtn.addEventListener('click', () => {
        if (this.currentAccount === 'parent') {
          this.switchTab('parent');
        } else {
          this.openParentLoginModal();
        }
      });
    }

    const starsPill = document.getElementById('header-stars-pill');
    if (starsPill) {
      starsPill.addEventListener('click', () => this.switchTab('rewards'));
    }

    // Today Filters
    const filterChips = document.querySelectorAll('#today-filter-chips .chip');
    filterChips.forEach(chip => {
      chip.addEventListener('click', () => {
        this.playClickSound();
        filterChips.forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        this.todayFilter = chip.dataset.filter;
        this.renderTodayView();
      });
    });

    // Add activity buttons
    const btnAddToday = document.getElementById('btn-add-today-activity');
    if (btnAddToday) {
      btnAddToday.addEventListener('click', () => this.openScheduleModal(null, this.currentDayIndex));
    }

    const btnAddWeekly = document.getElementById('btn-add-weekly-item');
    if (btnAddWeekly) {
      btnAddWeekly.addEventListener('click', () => this.openScheduleModal(null, this.selectedWeeklyDay));
    }

    const emptyAddBtn = document.getElementById('empty-add-btn');
    if (emptyAddBtn) {
      emptyAddBtn.addEventListener('click', () => this.openScheduleModal(null, this.currentDayIndex));
    }

    // Schedule Modal Form & Close
    const modalClose = document.getElementById('modal-item-close');
    const modalCancel = document.getElementById('modal-item-cancel');
    if (modalClose) modalClose.addEventListener('click', () => this.closeScheduleModal());
    if (modalCancel) modalCancel.addEventListener('click', () => this.closeScheduleModal());

    const scheduleForm = document.getElementById('schedule-item-form');
    if (scheduleForm) {
      scheduleForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this.saveScheduleItemFromModal();
      });
    }

    const deleteBtn = document.getElementById('btn-delete-item');
    if (deleteBtn) {
      deleteBtn.addEventListener('click', () => {
        if (confirm('هل ترغب حقاً في حذف هذا النشاط من جدول البطل؟')) {
          this.deleteScheduleItem(this.editingItemId);
        }
      });
    }

    // Timeline clicks delegation (Done, edit, timer, reschedule)
    document.addEventListener('click', (e) => {
      // Toggle Done
      const doneBtn = e.target.closest('.btn-done-check');
      if (doneBtn && doneBtn.dataset.id) {
        this.toggleItemCompleted(doneBtn.dataset.id);
        return;
      }

      // Quick Timer Launch from Schedule Card
      const quickTimerBtn = e.target.closest('.btn-quick-timer');
      if (quickTimerBtn && quickTimerBtn.dataset.id) {
        const item = this.schedule.find(i => i.id === quickTimerBtn.dataset.id);
        if (item) {
          this.timer.subject = item.subject || 'math';
          this.timer.taskDescription = item.title;
          const select = document.getElementById('timer-subject-select');
          if (select && item.subject) select.value = item.subject;
          this.switchTab('timer');
          this.renderTimerView();
        }
        return;
      }

      // Edit item
      const moreBtn = e.target.closest('.btn-card-more');
      if (moreBtn && moreBtn.dataset.id) {
        this.openScheduleModal(moreBtn.dataset.id);
        return;
      }

      // Reschedule item
      const reschedBtn = e.target.closest('[data-action="reschedule"]');
      if (reschedBtn && reschedBtn.dataset.id) {
        this.openQuickReschedule(reschedBtn.dataset.id);
        return;
      }

      // Claim reward button
      const claimBtn = e.target.closest('[data-claim-id]');
      if (claimBtn) {
        const rewardId = parseInt(claimBtn.dataset.claimId, 10);
        const reward = (this.settings.rewards || []).find(r => r.id === rewardId);
        if (reward) {
          reward.claimed = true;
          this.saveSettings();
          this.playCelebrationSound();
          this.triggerCelebrationConfetti();
          this.openCelebrationModal('مبارك يا بطل! 🎁', `لقد استلمت مكافأة: «${reward.title}»! استمتع بوقتك مع الأسرة!`);
          this.renderRewardsView();
        }
        return;
      }

      // Remove Club button delegation
      const removeClubBtn = e.target.closest('[data-remove-club]');
      if (removeClubBtn) {
        e.preventDefault();
        e.stopPropagation();
        this.removeClub(removeClubBtn.dataset.removeClub);
        return;
      }
    });

    // Quick Reschedule Modal buttons
    const reschedClose = document.getElementById('reschedule-modal-close');
    if (reschedClose) {
      reschedClose.addEventListener('click', () => {
        document.getElementById('quick-reschedule-modal').style.display = 'none';
      });
    }

    document.querySelectorAll('.quick-action-pill').forEach(pill => {
      pill.addEventListener('click', () => {
        this.applyQuickReschedule(pill.dataset.action);
      });
    });

    // Celebration modal close
    const celebBtn = document.getElementById('celebration-ok-btn');
    if (celebBtn) {
      celebBtn.addEventListener('click', () => {
        document.getElementById('celebration-modal').style.display = 'none';
      });
    }

    // Timer Controls
    const timerStartBtn = document.getElementById('btn-timer-start-pause');
    if (timerStartBtn) {
      timerStartBtn.addEventListener('click', () => this.toggleTimer());
    }

    const timerResetBtn = document.getElementById('btn-timer-reset');
    if (timerResetBtn) {
      timerResetBtn.addEventListener('click', () => this.resetTimer());
    }

    const timerFinishBtn = document.getElementById('btn-timer-early-finish');
    if (timerFinishBtn) {
      timerFinishBtn.addEventListener('click', () => this.completeSessionEarly());
    }

    // Timer Duration Presets
    document.querySelectorAll('#timer-duration-presets .preset-pill').forEach(pill => {
      pill.addEventListener('click', () => {
        this.playClickSound();
        document.querySelectorAll('#timer-duration-presets .preset-pill').forEach(p => p.classList.remove('active'));
        pill.classList.add('active');
        const mins = parseInt(pill.dataset.minutes, 10);
        this.timer.durationMinutes = mins;
        if (!this.timer.running && this.timer.mode === 'study') {
          this.timer.totalSeconds = mins * 60;
          this.timer.remainingSeconds = mins * 60;
          this.updateTimerDisplay();
        }
      });
    });

    // Break presets
    document.querySelectorAll('#timer-break-presets .break-pill').forEach(pill => {
      pill.addEventListener('click', () => {
        this.playClickSound();
        document.querySelectorAll('#timer-break-presets .break-pill').forEach(p => p.classList.remove('active'));
        pill.classList.add('active');
        this.timer.breakMinutes = parseInt(pill.dataset.break, 10);
      });
    });

    // Timer Task & Subject Input
    const taskInput = document.getElementById('timer-task-input');
    if (taskInput) {
      taskInput.addEventListener('input', () => {
        this.timer.taskDescription = taskInput.value.trim() || 'جلسة مذاكرة هادئة';
        this.updateTimerDisplay();
      });
    }

    // Parent View Actions
    const saveParentBtn = document.getElementById('btn-save-parent-settings');
    if (saveParentBtn) {
      saveParentBtn.addEventListener('click', () => this.saveParentSettingsFromUI());
    }

    // Avatar Presets Picker
    document.querySelectorAll('.preset-avatar-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        this.playClickSound();
        document.querySelectorAll('.preset-avatar-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const path = btn.dataset.avatar;
        this.settings.avatarType = 'preset';
        this.settings.avatarPreset = path;
        this.settings.avatarDataUrl = null;
        this.saveSettings();
        this.renderHeaderAndBrand();
        this.renderParentView();
      });
    });

    // Photo Upload Trigger & Parental Consent
    const uploadPhotoBtn = document.getElementById('btn-upload-child-photo');
    const photoFileInput = document.getElementById('child-photo-input');
    if (uploadPhotoBtn) {
      uploadPhotoBtn.addEventListener('click', () => this.requestPhotoUpload());
    }

    const consentCheck = document.getElementById('consent-checkbox');
    const confirmConsentBtn = document.getElementById('btn-confirm-consent');
    const cancelConsentBtn = document.getElementById('btn-cancel-consent');
    const consentClose = document.getElementById('consent-modal-close');

    if (consentCheck && confirmConsentBtn) {
      consentCheck.addEventListener('change', () => {
        confirmConsentBtn.disabled = !consentCheck.checked;
      });
    }

    if (confirmConsentBtn && photoFileInput) {
      confirmConsentBtn.addEventListener('click', () => {
        document.getElementById('parent-consent-modal').style.display = 'none';
        photoFileInput.click();
      });
    }

    if (cancelConsentBtn) {
      cancelConsentBtn.addEventListener('click', () => {
        document.getElementById('parent-consent-modal').style.display = 'none';
      });
    }
    if (consentClose) {
      consentClose.addEventListener('click', () => {
        document.getElementById('parent-consent-modal').style.display = 'none';
      });
    }

    if (photoFileInput) {
      photoFileInput.addEventListener('change', (e) => this.handlePhotoFileSelected(e));
    }

    // Data Export / Import / Reset
    const exportBtn = document.getElementById('btn-export-data');
    if (exportBtn) exportBtn.addEventListener('click', () => this.exportData());

    const importTrigger = document.getElementById('btn-import-data-trigger');
    const importFileInput = document.getElementById('import-file-input');
    if (importTrigger && importFileInput) {
      importTrigger.addEventListener('click', () => importFileInput.click());
      importFileInput.addEventListener('change', (e) => this.importData(e));
    }

    const resetBtn = document.getElementById('btn-reset-sample');
    if (resetBtn) resetBtn.addEventListener('click', () => this.resetToSampleData());

    const resetStarsBtn = document.getElementById('btn-reset-stars-only');
    if (resetStarsBtn) {
      resetStarsBtn.addEventListener('click', () => this.resetStarsOnly());
    }

    // Browser Notification Permission Test
    const notifBtn = document.getElementById('btn-request-browser-notif');
    if (notifBtn) {
      notifBtn.addEventListener('click', () => {
        if ('Notification' in window) {
          Notification.requestPermission().then(permission => {
            if (permission === 'granted') {
              this.showToast('تم تفعيل إشعارات المتصفح بنجاح! 🔔', 'success');
              new Notification(this.settings.appName || 'أسبوعي', {
                body: 'مرحباً بك! سنرسل لك تذكيرات رقيقة ومشجعة بمواعيد أنشطتك 🌸',
                icon: 'assets/logo_mascot.jpg',
                dir: 'rtl'
              });
            } else {
              this.showToast('تم استخدام التنبيهات الداخلية داخل التطبيق', 'info');
            }
          });
        } else {
          this.showToast('التنبيهات تعمل بنجاح داخل التطبيق 🔔', 'info');
        }
      });
    }

    // Add new club button in parent view
    const addClubBtn = document.getElementById('btn-add-new-club');
    if (addClubBtn) {
      addClubBtn.addEventListener('click', () => {
        const clubName = prompt('اسم النادي أو النشاط الجديد (مثال: نادي التايكوندو، نادي الرسم):');
        if (!clubName) return;

        const newClub = {
          id: `club-${Date.now()}`,
          name: clubName,
          days: [1, 3], // default Monday & Wednesday
          start: '17:00',
          end: '18:00',
          location: 'المركز الرياضي',
          prepMinutes: 20,
          icon: '🥋',
          color: '#8B5CF6'
        };

        this.settings.clubs = this.settings.clubs || [];
        this.settings.clubs.push(newClub);
        this.saveSettings();
        this.renderParentView();
        this.showToast(`تمت إضافة نشاط «${clubName}» بنجاح! ⚽`, 'success');
      });
    }

    // Add new reward goal button in rewards view
    const addRewardBtn = document.getElementById('btn-parent-add-reward');
    if (addRewardBtn) {
      addRewardBtn.addEventListener('click', () => {
        const title = prompt('عنوان المكافأة الأسرية الجديدة (مثال: شراء كتاب قصص جديد):');
        if (!title) return;
        const starsStr = prompt('كم عدد النجوم المطلوبة للحصول عليها؟ (مثال: 15):', '15');
        const starsRequired = parseInt(starsStr, 10) || 15;

        this.settings.rewards = this.settings.rewards || [];
        this.settings.rewards.push({
          id: Date.now(),
          title,
          starsRequired,
          icon: '🎁',
          claimed: false
        });

        this.saveSettings();
        this.renderRewardsView();
        this.showToast(`تمت إضافة هدف المكافأة: «${title}»! 🌟`, 'success');
      });
    }

    // ==========================================================================
    // Mini-Game & Parental Screen Time Event Listeners
    // ==========================================================================
    const requestGameBtn = document.getElementById('btn-request-game-access');
    if (requestGameBtn) {
      requestGameBtn.addEventListener('click', () => this.openGamePermissionModal());
    }

    const gamePermClose = document.getElementById('game-perm-close');
    const cancelGamePerm = document.getElementById('btn-cancel-game-perm');
    if (gamePermClose) gamePermClose.addEventListener('click', () => this.closeGamePermissionModal());
    if (cancelGamePerm) cancelGamePerm.addEventListener('click', () => this.closeGamePermissionModal());

    const grantGamePermBtn = document.getElementById('btn-grant-game-perm');
    if (grantGamePermBtn) {
      grantGamePermBtn.addEventListener('click', () => this.verifyAndGrantGamePermission());
    }

    const mathAnswerInput = document.getElementById('game-math-answer');
    if (mathAnswerInput) {
      mathAnswerInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          this.verifyAndGrantGamePermission();
        }
      });
    }

    const pinAnswerInput = document.getElementById('game-pin-input');
    if (pinAnswerInput) {
      pinAnswerInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          this.verifyAndGrantGamePermission();
        }
      });
    }

    // Duration preset pills
    document.querySelectorAll('#game-duration-presets .duration-pill').forEach(pill => {
      pill.addEventListener('click', () => {
        this.playClickSound();
        document.querySelectorAll('#game-duration-presets .duration-pill').forEach(p => p.classList.remove('active'));
        pill.classList.add('active');
      });
    });

    // Pause / Resume
    const pauseGameBtn = document.getElementById('btn-game-pause');
    if (pauseGameBtn) {
      pauseGameBtn.addEventListener('click', () => this.toggleGamePause());
    }

    // Lock Now / Finish Early
    const lockNowBtn = document.getElementById('btn-game-lock-now');
    if (lockNowBtn) {
      lockNowBtn.addEventListener('click', () => {
        if (confirm('هل ترغب في إنهاء جلسة اللعب الآن وإغلاقها؟')) {
          this.endGameSession();
        }
      });
    }

    // Timeout Modal OK Button
    const timeoutOkBtn = document.getElementById('btn-game-timeout-ok');
    if (timeoutOkBtn) {
      timeoutOkBtn.addEventListener('click', () => {
        const modal = document.getElementById('game-timeout-modal');
        if (modal) modal.style.display = 'none';
        this.switchTab('today');
      });
    }

    // Parent Settings: Quick Grant (15 mins) & Quick Lock
    const parentQuickGrant = document.getElementById('btn-parent-quick-grant-game');
    if (parentQuickGrant) {
      parentQuickGrant.addEventListener('click', () => {
        const dur = this.settings.gameConfig?.defaultPlayMinutes || 15;
        this.quickGrantGamePermission(dur);
      });
    }

    const parentQuickLock = document.getElementById('btn-parent-quick-lock-game');
    if (parentQuickLock) {
      parentQuickLock.addEventListener('click', () => this.lockGameSessionNow());
    }

    // Parent Settings: Toggle Window Row
    const windowToggle = document.getElementById('cfg-game-window-toggle');
    const windowRow = document.getElementById('cfg-game-window-row');
    if (windowToggle && windowRow) {
      windowToggle.addEventListener('change', () => {
        windowRow.style.display = windowToggle.checked ? 'grid' : 'none';
      });
    }

    // Mini-Game Difficulty Mode Chips
    document.querySelectorAll('#game-diff-chips .diff-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        this.playClickSound();
        this.setGameDifficulty(chip.dataset.diff);
      });
    });

    // Parent Settings: Game Difficulty Dropdown Select
    const parentDiffSelect = document.getElementById('cfg-game-difficulty');
    if (parentDiffSelect) {
      parentDiffSelect.addEventListener('change', () => {
        this.setGameDifficulty(parentDiffSelect.value);
      });
    }

    // Dual Account: Card 0 Switch to Child Button
    const quickSwitchBtn = document.getElementById('btn-quick-switch-to-child');
    if (quickSwitchBtn) {
      quickSwitchBtn.addEventListener('click', () => {
        this.setAccount('child');
        this.switchTab('today');
      });
    }

    // Dual Account: Card 0 Active Account Select
    const activeAccountSelect = document.getElementById('cfg-active-account');
    if (activeAccountSelect) {
      activeAccountSelect.addEventListener('change', () => {
        this.setAccount(activeAccountSelect.value);
      });
    }

    // Dual Account: Parent Login Modal Event Handlers
    const parentLoginModal = document.getElementById('parent-login-modal');
    if (parentLoginModal) {
      parentLoginModal.addEventListener('click', (e) => {
        if (e.target === parentLoginModal) {
          this.closeParentLoginModal();
        }
      });
    }

    const parentLoginClose = document.getElementById('parent-login-close');
    const cancelParentLogin = document.getElementById('btn-cancel-parent-login');
    if (parentLoginClose) parentLoginClose.addEventListener('click', () => this.closeParentLoginModal());
    if (cancelParentLogin) cancelParentLogin.addEventListener('click', () => this.closeParentLoginModal());

    const confirmParentLoginBtn = document.getElementById('btn-confirm-parent-login');
    if (confirmParentLoginBtn) {
      confirmParentLoginBtn.addEventListener('click', () => this.verifyAndLoginParent());
    }

    const parentPinInput = document.getElementById('parent-login-pin-input');
    if (parentPinInput) {
      parentPinInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          this.verifyAndLoginParent();
        }
      });
    }

    const parentMathInput = document.getElementById('parent-login-math-input');
    if (parentMathInput) {
      parentMathInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          this.verifyAndLoginParent();
        }
      });
    }
  }
}

// Instantiate App safely across any browser execution timing
function initStudyPlannerApp() {
  if (!window.app) {
    window.app = new StudyPlannerApp();
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initStudyPlannerApp);
} else {
  initStudyPlannerApp();
}
