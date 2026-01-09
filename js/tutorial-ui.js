/**
 * Tutorial UI Module
 * Handles displaying tutorial phases and navigation with interactive demos
 */

import * as ui from './ui.js';
import * as state from './state.js';
import * as shop from './shop.js';
import { getItemIconSvg } from './items.js';

let practiceCorrect = 0;
let practiceTarget = 0;
let currentPracticeProblem = null;

export function displayTutorialPhase(phase, phaseIndex, totalPhases) {
  const contentEl = document.getElementById("tutorial-phase-content");
  const progressEl = document.getElementById("tutorial-progress");
  const prevBtn = document.getElementById("tutorial-prev-btn");
  const nextBtn = document.getElementById("tutorial-next-btn");
  
  if (!phase || !contentEl) return;
  
  // Reset practice tracker for new practice phases
  if (phase.type === 'practice') {
    practiceCorrect = 0;
    practiceTarget = phase.targetCorrect || 3;
  }
  
  // Render based on phase type
  let content = `
    <h2 style="color: #4ecdc4; margin-top: 0;">${phase.title}</h2>
    <p style="font-size: 1.1rem; margin: 1rem 0;">${phase.description}</p>
    <div style="background: #1a1a2e; border-left: 4px solid #4ecdc4; padding: 1rem; margin: 1.5rem 0; border-radius: 4px;">
      <p style="margin: 0; color: #4ecdc4; font-weight: 600;">${phase.callout}</p>
    </div>
  `;
  
  // Add interactive elements based on phase type
  if (phase.type === 'practice') {
    content += renderPracticeDemo(phase);
  } else if (phase.type === 'mode-demo') {
    content += renderModeDemo(phase);
  } else if (phase.type === 'shop-demo') {
    content += renderShopDemo();
  } else if (phase.type === 'achievements-demo') {
    content += renderAchievementsDemo();
  }
  
  contentEl.innerHTML = content;
  
  // Attach event listeners for interactive elements
  if (phase.type === 'practice') {
    attachPracticeListeners();
  } else if (phase.type === 'shop-demo') {
    attachShopDemoListeners();
  } else if (phase.type === 'achievements-demo') {
    attachAchievementsDemoListeners();
  }
  
  // Update progress
  progressEl.textContent = `Step ${phaseIndex + 1} of ${totalPhases}`;
  
  // Update button states
  prevBtn.classList.toggle('hidden', phaseIndex === 0);
  nextBtn.textContent = phaseIndex === totalPhases - 1 ? 'Start Playing!' : 'Next';
  
  // Disable next button for practice phases until target met
  if (phase.type === 'practice') {
    nextBtn.disabled = true;
    nextBtn.style.opacity = '0.5';
    nextBtn.style.cursor = 'not-allowed';
  } else {
    nextBtn.disabled = false;
    nextBtn.style.opacity = '1';
    nextBtn.style.cursor = 'pointer';
  }

  // Move focus to heading for screen readers
  const heading = contentEl.querySelector('h2');
  if (heading && typeof heading.focus === 'function') {
    heading.setAttribute('tabindex', '-1');
    heading.focus();
  }
}

function renderPracticeDemo(phase) {
  currentPracticeProblem = generateSimpleProblem();
  return `
    <div style="background: #0f3460; padding: 2rem; border-radius: 8px; margin: 1.5rem 0;">
          <p id="tutorial-practice-progress" style="text-align: center; color: #999; margin-bottom: 1rem;">Progress: ${practiceCorrect}/${practiceTarget} complete</p>
      <div id="tutorial-practice-problem" style="font-size: 2rem; text-align: center; margin: 1rem 0; color: #fff;">
        ${currentPracticeProblem.text}
      </div>
      <div style="display: flex; gap: 1rem; justify-content: center; align-items: center;">
        <input type="number" id="tutorial-practice-input" 
          style="padding: 0.75rem; font-size: 1.2rem; width: 150px; text-align: center; border: 2px solid #4ecdc4; border-radius: 4px; background: #16213e; color: #fff;"
          placeholder="Answer"
          autocomplete="off">
        <button id="tutorial-practice-submit" 
          style="padding: 0.75rem 1.5rem; font-size: 1.1rem; background: #4ecdc4; color: #0f3460; border: none; border-radius: 4px; cursor: pointer; font-weight: 600;">
          Check
        </button>
      </div>
      <div id="tutorial-practice-feedback" style="text-align: center; margin-top: 1rem; font-size: 1.1rem; min-height: 30px;"></div>
    </div>
  `;
}

function renderModeDemo(phase) {
  const modeIcons = {
    'sprint': 'Sprint',
    'endless': 'Endless',
    'survival': 'Survival',
    'daily-challenge': 'Daily'
  };
  
  const modeDetails = {
    'sprint': { time: '60 seconds', goal: 'Answer as many as possible', penalty: '10s for 3 mistakes' },
    'endless': { time: 'No timer', goal: 'Survive with 3 lives', penalty: 'Lose 1 life per 3 mistakes' },
    'survival': { time: 'Dynamic timer', goal: 'Keep adding time', penalty: 'Lose time for mistakes' },
    'daily-challenge': { time: '90 seconds', goal: 'Everyone gets same problems', penalty: 'Standard penalties' }
  };
  
  const details = modeDetails[phase.mode] || {};
  
  return `
    <div style="background: #0f3460; padding: 2rem; border-radius: 8px; margin: 1.5rem 0; border: 3px solid #4ecdc4;">
      <div style="text-align: center; font-size: 1.6rem; margin-bottom: 1rem; font-weight: 700; letter-spacing: 0.5px;">${modeIcons[phase.mode] || ''}</div>
      <div style="display: grid; grid-template-columns: 1fr; gap: 1rem; margin: 1.5rem 0;">
        <div style="background: #16213e; padding: 1rem; border-radius: 4px;">
          <strong style="color: #4ecdc4;">Timer:</strong> ${details.time}
        </div>
        <div style="background: #16213e; padding: 1rem; border-radius: 4px;">
          <strong style="color: #4ecdc4;">Goal:</strong> ${details.goal}
        </div>
        <div style="background: #16213e; padding: 1rem; border-radius: 4px;">
          <strong style="color: #4ecdc4;">Penalty:</strong> ${details.penalty}
        </div>
      </div>
      <p style="text-align: center; color: #999; margin-top: 1.5rem;">You can try this mode from the main menu!</p>
    </div>
  `;
}

let tutorialOriginalSparks = 0;
let tutorialPurchasedItems = [];

function renderShopDemo() {
  return `
    <div style="background: #0f3460; padding: 2rem; border-radius: 8px; margin: 1.5rem 0;">
      <div style="background: #4ecdc4; color: #0f3460; padding: 1rem; border-radius: 6px; margin-bottom: 1.5rem; text-align: center;">
        <p style="margin: 0; font-weight: 600;">Tutorial Bonus: <strong>+150 Sparks</strong> to try the shop!</p>
      </div>
      <p style="text-align: center; color: #4ecdc4; font-size: 1.3rem; margin-bottom: 1.5rem;">
        Sparks Available: <strong id="tutorial-sparks-display">${state.sparksWallet}</strong>
      </p>
      <p style="text-align: center; color: #999; margin-bottom: 1.5rem;">
        Try purchasing an item to see how the shop works! Your purchase will be kept.
      </p>
      <button id="tutorial-visit-shop-btn" 
        style="width: 100%; margin-top: 1rem; padding: 1.25rem; background: #4ecdc4; color: #0f3460; border: none; border-radius: 6px; font-size: 1.2rem; font-weight: 600; cursor: pointer;">
        Open Shop & Try Buying Something
      </button>
    </div>
  `;
}

function renderAchievementsDemo() {
  const trophySvg = `
    <svg viewBox="0 0 24 24" role="presentation" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" style="width: 28px; height: 28px;">
      <path d="M8 21h8" />
      <path d="M12 17a4 4 0 0 1-4-4V5h8v8a4 4 0 0 1-4 4Z" />
      <path d="M12 17v4" />
      <path d="M7 5H5a2 2 0 0 0-2 2v1a4 4 0 0 0 4 4" />
      <path d="M17 5h2a2 2 0 0 1 2 2v1a4 4 0 0 1-4 4" />
    </svg>
  `;
  const sampleAchievements = [
    { title: 'Tutorial Master', desc: 'Complete the tutorial', unlocked: false },
    { title: 'First Strike', desc: 'Answer your first problem correctly', unlocked: true },
    { title: 'Century', desc: 'Score 100 points in a single game', unlocked: false },
    { title: 'Speed Demon', desc: 'Answer 3 questions in under 5 seconds', unlocked: false }
  ];
  
  return `
    <div style="background: #0f3460; padding: 2rem; border-radius: 8px; margin: 1.5rem 0;">
      <div style="display: grid; grid-template-columns: 1fr; gap: 1rem;">
        ${sampleAchievements.map(ach => `
          <div style="background: #16213e; padding: 1.5rem; border-radius: 6px; border: 2px solid ${ach.unlocked ? '#4ecdc4' : '#1a1a2e'}; opacity: ${ach.unlocked ? '1' : '0.6'};">
            <div style="display: flex; align-items: center; gap: 1rem;">
              <span style="display: inline-flex; align-items: center; justify-content: center; width: 56px; height: 56px; border: 1px solid rgba(78, 205, 196, 0.4); border-radius: 12px; background: radial-gradient(circle at 30% 30%, rgba(78, 205, 196, 0.15), rgba(0, 0, 0, 0.25)); box-shadow: 0 10px 25px rgba(0, 0, 0, 0.25); color: #4ecdc4;">${trophySvg}</span>
              <div style="flex: 1;">
                <strong style="font-size: 1.1rem; color: ${ach.unlocked ? '#4ecdc4' : '#fff'};">${ach.title}</strong>
                <p style="color: #999; margin: 0.25rem 0 0 0; font-size: 0.9rem;">${ach.desc}</p>
              </div>
              ${ach.unlocked ? '<span style="color: #4ecdc4; font-weight: 700;">Unlocked</span>' : '<span style="color: #666; font-weight: 700;">Locked</span>'}
            </div>
          </div>
        `).join('')}
      </div>
      <button id="tutorial-view-achievements-btn" 
        style="width: 100%; margin-top: 1.5rem; padding: 1rem; background: #4ecdc4; color: #0f3460; border: none; border-radius: 6px; font-size: 1.1rem; font-weight: 600; cursor: pointer;">
        View All Achievements
      </button>
      <p style="text-align: center; color: #999; margin-top: 1rem; font-size: 0.95rem;">30+ achievements to unlock! Some are hidden secrets.</p>
    </div>
  `;
}

function generateSimpleProblem() {
  const a = Math.floor(Math.random() * 10) + 1;
  const b = Math.floor(Math.random() * 10) + 1;
  return {
    text: `${a} + ${b} = ?`,
    answer: a + b
  };
}

function attachPracticeListeners() {
  const input = document.getElementById('tutorial-practice-input');
  const submitBtn = document.getElementById('tutorial-practice-submit');
  const problemEl = document.getElementById('tutorial-practice-problem');
  const feedbackEl = document.getElementById('tutorial-practice-feedback');
  
  if (!input || !submitBtn || !problemEl || !feedbackEl) return;
  
  const checkAnswer = () => {
    const userAnswer = parseInt(input.value);
    if (isNaN(userAnswer)) return;
    
    if (userAnswer === currentPracticeProblem.answer) {
      practiceCorrect++;
      feedbackEl.innerHTML = '<span style="color: #4ecdc4; font-weight: 600;">Correct!</span>';
      
      if (practiceCorrect >= practiceTarget) {
        feedbackEl.innerHTML = '<span style="color: #4ecdc4; font-weight: 600;">Great job! Click Next to continue.</span>';
        const nextBtn = document.getElementById('tutorial-next-btn');
        if (nextBtn) {
          nextBtn.disabled = false;
          nextBtn.style.opacity = '1';
          nextBtn.style.cursor = 'pointer';
        }
        submitBtn.disabled = true;
        input.disabled = true;
      } else {
        setTimeout(() => {
          currentPracticeProblem = generateSimpleProblem();
          problemEl.textContent = currentPracticeProblem.text;
          input.value = '';
          input.focus();
          feedbackEl.innerHTML = '';
          // Update progress display
          const progressEl = document.getElementById('tutorial-practice-progress');
          if (progressEl) {
            progressEl.textContent = `Progress: ${practiceCorrect}/${practiceTarget} complete`;
          }
        }, 1000);
      }
    } else {
      feedbackEl.innerHTML = '<span style="color: #ff6b6b; font-weight: 600;">Try again!</span>';
      input.value = '';
      input.focus();
    }
  };
  
  submitBtn.addEventListener('click', checkAnswer);
  input.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') checkAnswer();
  });
  input.focus();
}

function attachShopDemoListeners() {
  const visitShopBtn = document.getElementById('tutorial-visit-shop-btn');
  if (visitShopBtn) {
    visitShopBtn.addEventListener('click', () => {
      // Save original sparks and give tutorial bonus
      tutorialOriginalSparks = state.sparksWallet;
      const bonusSparks = 150;
      state.addSparks(bonusSparks);
      
      // Track purchased items by comparing inventory before/after
      tutorialPurchasedItems = [];
      
      // Show notification about bonus sparks
      const toast = document.createElement('div');
      toast.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #4ecdc4;
        color: #0f3460;
        padding: 1rem 1.5rem;
        border-radius: 6px;
        font-weight: 600;
        z-index: 10000;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
      `;
      toast.textContent = `+${bonusSparks} Sparks added! Try buying something.`;
      document.body.appendChild(toast);
      setTimeout(() => toast.remove(), 3000);
      
      hideTutorialScreen();
      ui.showScreen('shop-screen');
      shop.initializeShop();
      
      // Replace the back button with a tutorial-specific one
      const backBtn = document.getElementById('back-to-menu-shop-btn');
      if (backBtn) {
        // Store the original button for later restoration
        const originalBackBtn = backBtn.cloneNode(true);
        
        // Create and configure the tutorial back button
        const tutorialBackBtn = document.createElement('button');
        tutorialBackBtn.id = 'tutorial-back-from-shop-btn';
        tutorialBackBtn.textContent = 'Back to Tutorial';
        tutorialBackBtn.style.cssText = backBtn.style.cssText; // Keep same styling
        tutorialBackBtn.className = backBtn.className;
        
        // Replace the button in the DOM
        backBtn.replaceWith(tutorialBackBtn);
        
        const returnToTutorial = () => {
          const sparksSpent = tutorialOriginalSparks + bonusSparks - state.sparksWallet;
          
          if (sparksSpent > 0) {
            // User made a purchase! Show congratulations and item practice prompt
            const congrats = document.createElement('div');
            congrats.style.cssText = `
              position: fixed;
              top: 20px;
              right: 20px;
              background: #4ecdc4;
              color: #0f3460;
              padding: 1rem 1.5rem;
              border-radius: 6px;
              font-weight: 600;
              z-index: 10000;
              box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            `;
            congrats.textContent = `Great! You spent ${sparksSpent} Sparks. Now let's try using your item!`;
            document.body.appendChild(congrats);
            setTimeout(() => congrats.remove(), 4000);
            
            // Advance to next tutorial step
            window.tutorialModule.nextPhase();
          } else {
            // Didn't buy anything, just advance to next tutorial step
            window.tutorialModule.nextPhase();
          }
          
          // Make sure tutorial screen is visible and not hidden
          const tutorialScreen = document.getElementById('tutorial-screen');
          if (tutorialScreen) {
            tutorialScreen.classList.remove('hidden');
          }
          
          // Re-display the tutorial screen with the new phase
          ui.showScreen('tutorial-screen');
          const phase = window.tutorialModule.getCurrentPhase();
          const phaseIndex = window.tutorialModule.getPhaseIndex();
          const totalPhases = window.tutorialModule.tutorialPhases.length;
          displayTutorialPhase(phase, phaseIndex, totalPhases);
        };
        tutorialBackBtn.addEventListener('click', returnToTutorial);
      }
    });
  }
}

function showItemPracticePhase() {
  const contentEl = document.getElementById("tutorial-phase-content");
  const progressEl = document.getElementById("tutorial-progress");
  const nextBtn = document.getElementById("tutorial-next-btn");
  
  if (!contentEl) return;
  
  // Disable next button until they use the item
  nextBtn.disabled = true;
  nextBtn.style.opacity = '0.5';
  nextBtn.style.cursor = 'not-allowed';
  
  contentEl.innerHTML = `
    <h2 style="color: #4ecdc4; margin-top: 0;">Try Your New Item!</h2>
    <p style="font-size: 1.1rem; margin: 1rem 0;">Let's practice using the item you just bought</p>
    <div style="background: #1a1a2e; border-left: 4px solid #4ecdc4; padding: 1rem; margin: 1.5rem 0; border-radius: 4px;">
      <p style="margin: 0; color: #4ecdc4; font-weight: 600;">Your items appear at the bottom during gameplay. Click them to activate.</p>
    </div>
    
    <div style="background: #0f3460; padding: 2rem; border-radius: 8px; margin: 1.5rem 0;">
      <div id="tutorial-item-inventory" style="display: flex; gap: 1rem; justify-content: center; margin-bottom: 1.5rem; flex-wrap: wrap;">
        <!-- Items will be rendered here -->
      </div>
      
      <div id="tutorial-item-problem" style="font-size: 2rem; text-align: center; margin: 1.5rem 0; color: #fff;">
        5 + 3 = ?
      </div>
      
      <div style="display: flex; gap: 1rem; justify-content: center; align-items: center;">
        <input type="number" id="tutorial-item-input" 
          style="padding: 0.75rem; font-size: 1.2rem; width: 150px; text-align: center; border: 2px solid #4ecdc4; border-radius: 4px; background: #16213e; color: #fff;"
          placeholder="Answer"
          autocomplete="off">
        <button id="tutorial-item-submit" 
          style="padding: 0.75rem 1.5rem; font-size: 1.1rem; background: #4ecdc4; color: #0f3460; border: none; border-radius: 4px; cursor: pointer; font-weight: 600;">
          Submit
        </button>
      </div>
      
      <div id="tutorial-item-feedback" style="text-align: center; margin-top: 1.5rem; font-size: 1.1rem; min-height: 30px; color: #4ecdc4;"></div>
      
      <div id="tutorial-item-prompt" style="background: #4ecdc4; color: #0f3460; padding: 1rem; border-radius: 6px; margin-top: 1.5rem; text-align: center; font-weight: 600;">
          Click your item above to activate it and see what it does!
      </div>
    </div>
  `;
  
  progressEl.textContent = 'Bonus: Item Practice';
  
  // Render user's items
  renderTutorialItemInventory();
  
  // Attach listeners
  attachItemPracticeListeners();
}

function renderTutorialItemInventory() {
  const inventoryEl = document.getElementById('tutorial-item-inventory');
  if (!inventoryEl) return;
  
  const { getItemsList } = require('./items.js');
  const inventory = require('./inventory.js');
  
  const items = getItemsList();
  inventoryEl.innerHTML = '';
  
  items.forEach(item => {
    const count = inventory.getItemCount(item.id);
    if (count > 0) {
      const btn = document.createElement('button');
      btn.style.cssText = `
        background: #16213e;
        border: 2px solid #4ecdc4;
        padding: 1rem;
        border-radius: 6px;
        cursor: pointer;
        min-width: 120px;
        transition: transform 0.2s;
      `;
      btn.innerHTML = `
        <div class="item-badge" style="margin: 0 auto 0.5rem auto;">${getItemIconSvg(item)}</div>
        <div style="font-size: 0.9rem; color: #fff; font-weight: 600;">${item.name}</div>
        <div style="font-size: 0.8rem; color: #4ecdc4; margin-top: 0.25rem;">x${count}</div>
      `;
      
      btn.addEventListener('mouseenter', () => {
        btn.style.transform = 'scale(1.05)';
      });
      btn.addEventListener('mouseleave', () => {
        btn.style.transform = 'scale(1)';
      });
      
      btn.addEventListener('click', () => {
        const itemEffects = require('./item-effects.js');
        const result = itemEffects.activateItem(item.id);
        
        const feedbackEl = document.getElementById('tutorial-item-feedback');
        const promptEl = document.getElementById('tutorial-item-prompt');
        
        if (result.success) {
          if (feedbackEl) {
            feedbackEl.innerHTML = `<span style="color: #4ecdc4;">${result.message}</span>`;
          }
          if (promptEl) {
            promptEl.innerHTML = `Great! Now answer a few problems to see the effect in action!`;
          }
          
          // Update count
          renderTutorialItemInventory();
          
          // Enable completion after using item
          setTimeout(() => {
            const nextBtn = document.getElementById('tutorial-next-btn');
            if (nextBtn) {
              nextBtn.disabled = false;
              nextBtn.style.opacity = '1';
              nextBtn.style.cursor = 'pointer';
            }
          }, 2000);
        } else {
          if (feedbackEl) {
            feedbackEl.innerHTML = `<span style="color: #ff6b6b;">${result.message}</span>`;
          }
        }
      });
      
      inventoryEl.appendChild(btn);
    }
  });
}

function attachItemPracticeListeners() {
  const input = document.getElementById('tutorial-item-input');
  const submitBtn = document.getElementById('tutorial-item-submit');
  const problemEl = document.getElementById('tutorial-item-problem');
  const feedbackEl = document.getElementById('tutorial-item-feedback');
  
  if (!input || !submitBtn || !problemEl || !feedbackEl) return;
  
  let currentProblem = generateSimpleProblem();
  problemEl.textContent = currentProblem.text;
  
  const checkAnswer = () => {
    const userAnswer = parseInt(input.value);
    if (isNaN(userAnswer)) return;
    
    if (userAnswer === currentProblem.answer) {
      feedbackEl.innerHTML = '<span style="color: #4ecdc4; font-weight: 600;">Correct!</span>';
      
      setTimeout(() => {
        currentProblem = generateSimpleProblem();
        problemEl.textContent = currentProblem.text;
        input.value = '';
        input.focus();
        feedbackEl.innerHTML = '';
      }, 1000);
    } else {
      feedbackEl.innerHTML = '<span style="color: #ff6b6b; font-weight: 600;">Try again!</span>';
      input.value = '';
      input.focus();
    }
  };
  
  submitBtn.addEventListener('click', checkAnswer);
  input.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') checkAnswer();
  });
  input.focus();
}

function attachAchievementsDemoListeners() {
  const viewBtn = document.getElementById('tutorial-view-achievements-btn');
  if (viewBtn) {
    viewBtn.addEventListener('click', () => {
      if (typeof window.achievementsModule !== 'undefined') {
        hideTutorialScreen();
        const { renderAchievementsScreen } = require('./achievements-ui.js');
        renderAchievementsScreen();
        ui.showScreen('achievements-screen');
        
        // Replace the back button with a tutorial-specific one
        const backBtn = document.getElementById('back-to-menu-achievements-btn');
        if (backBtn) {
          // Create and configure the tutorial back button
          const tutorialBackBtn = document.createElement('button');
          tutorialBackBtn.id = 'tutorial-back-from-achievements-btn';
          tutorialBackBtn.textContent = 'Back to Tutorial';
          tutorialBackBtn.style.cssText = backBtn.style.cssText;
          tutorialBackBtn.className = backBtn.className;
          
          // Replace the button in the DOM
          backBtn.replaceWith(tutorialBackBtn);
          
          const returnToTutorial = () => {
            // Make sure tutorial screen is visible and not hidden
            const tutorialScreen = document.getElementById('tutorial-screen');
            if (tutorialScreen) {
              tutorialScreen.classList.remove('hidden');
            }
            
            // Re-display the tutorial screen with the current phase
            ui.showScreen('tutorial-screen');
            const phase = window.tutorialModule.getCurrentPhase();
            const phaseIndex = window.tutorialModule.getPhaseIndex();
            const totalPhases = window.tutorialModule.tutorialPhases.length;
            displayTutorialPhase(phase, phaseIndex, totalPhases);
          };
          tutorialBackBtn.addEventListener('click', returnToTutorial);
        }
      }
    });
  }
}

export function showTutorialScreen() {
  ui.showScreen("tutorial-screen");
}

export function hideTutorialScreen() {
  const tutorialScreen = document.getElementById("tutorial-screen");
  if (tutorialScreen) {
    tutorialScreen.classList.add("hidden");
  }
}
