/**
 * CONTENT-BUILDER.JS
 * 
 * This script reads content.js and automatically builds/updates 
 * the HTML content on page load.
 */

(function() {
  'use strict';

  // Wait for DOM and CONTENT to be ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', buildContent);
  } else {
    buildContent();
  }

  function buildContent() {
    if (typeof CONTENT === 'undefined') {
      console.error('CONTENT not loaded! Make sure content.js is included before content-builder.js');
      return;
    }

    console.log('🔨 Building content from content.js...');

    // Build each section
    buildHero();
    buildChapter1();
    buildChapter2();
    buildChapter11KAnonymity();  // NEW!
    buildCompanyCards();
    buildStudentVotingPanel();
    buildNavigation();
    buildReferences();

    console.log('✅ Content built successfully!');
  }

  // ============================================================================
  // HERO SECTION
  // ============================================================================
  function buildHero() {
    const hero = CONTENT.hero;
    
    // Update hero eyebrow
    const eyebrow = document.querySelector('.hero__eyebrow');
    if (eyebrow && hero.eyebrow) {
      eyebrow.textContent = hero.eyebrow;
    }

    // Update hero title
    const title = document.querySelector('.hero h1');
    if (title && hero.title) {
      title.textContent = hero.title;
    }

    // Optional lede and scroll (if you want to show them)
    if (hero.lede) {
      const lede = document.querySelector('.hero__lede');
      if (lede) {
        lede.textContent = hero.lede;
        lede.style.display = 'block';
      }
    }
  }

  // ============================================================================
  // CHAPTER 1: INTRO
  // ============================================================================
  function buildChapter1() {
    const ch1 = CONTENT.chapter1;

    // Step 1: What is it?
    updateStep('step-1', ch1.step1);

    // Step 1b: Who uses it?
    updateStep('step-1b', ch1.step1b);

    // Step 1c: Why use it?
    updateStep('step-1c', ch1.step1c);
  }

  // ============================================================================
  // CHAPTER 2: PET GERBIL EXAMPLE
  // ============================================================================
  function buildChapter2() {
    const ch2 = CONTENT.chapter2;

    // Example voting
    updateStep('step-example', ch2.stepExample);

    // Everyone likes...
    updateStep('step-example-voting', ch2.stepExampleVoting);

    // The vote
    updateStep('step-example-results', ch2.stepExampleResults);

    // Captain knows (NEW!)
    updateStepWithBody('step-example-captain', ch2.stepExampleCaptain);

    // Privacy confidence
    updateStep('step-example-privacy', ch2.stepExamplePrivacy);
  }

  // ============================================================================
  // CHAPTER 11: K-ANONYMITY
  // ============================================================================
  function buildChapter11KAnonymity() {
    const ch11 = CONTENT.chapter11;
    if (!ch11) return;

    // Step 1: Meet Sarah
    updateStepWithMultiBody('step-kanon-1', ch11.step1);

    // Step 2: Database is open
    updateStepWithMultiBody('step-kanon-2', ch11.step2);

    // Step 3: What is k-anonymity?
    updateStepWithMultiBody('step-kanon-3', ch11.step3);

    // Step 4: How does it work?
    updateStepWithMultiBody('step-kanon-4', ch11.step4);

    // Step 5: Sarah has company
    updateStepWithMultiBody('step-kanon-5', ch11.step5);

    // Step 6: Try it yourself
    updateStepWithInstruction('step-kanon-6', ch11.step6);

    // Step 7: Why does this matter?
    updateStepWithMultiBody('step-kanon-7', ch11.step7);

    // Step 8: The tradeoff
    updateStepWithPoints('step-kanon-8', ch11.step8);

    // Step 9: Real-world impact
    updateStepWithExamples('step-kanon-9', ch11.step9);
  }

  // ============================================================================
  // COMPANY CARDS
  // ============================================================================
  function buildCompanyCards() {
    const companies = CONTENT.chapter1.step1c.companies;
    const panel = document.getElementById('company-cards-panel');
    
    if (!panel || !companies) return;

    // Clear existing cards
    panel.innerHTML = '';

    // Build each company card
    companies.forEach(company => {
      const card = document.createElement('div');
      card.className = company.expanded ? 'company-card company-card--expanded' : 'company-card';
      card.dataset.company = company.id;

      card.innerHTML = `
        <div class="company-card__header">
          <span class="company-card__icon">${company.icon}</span>
          <div class="company-card__title-group">
            <h3 class="company-card__name">${company.name}</h3>
            <p class="company-card__category">${company.category}</p>
          </div>
        </div>
        <div class="company-card__body">
          <p class="company-card__description">${company.description}</p>
        </div>
        <button class="company-card__toggle" type="button" aria-expanded="${company.expanded}">
          <span class="company-card__toggle-text">Click to expand</span>
        </button>
      `;

      panel.appendChild(card);
    });
  }

  // ============================================================================
  // STUDENT VOTING PANEL
  // ============================================================================
  function buildStudentVotingPanel() {
    const captainData = CONTENT.chapter2.stepExampleCaptain;
    const panel = document.getElementById('student-voting-panel');
    
    if (!panel || !captainData) return;

    // Build header
    const header = panel.querySelector('.student-voting-panel__header');
    if (header) {
      header.innerHTML = `
        <span class="student-voting-panel__badge">🎓 Class Captain's List</span>
        <p class="student-voting-panel__subtitle">${captainData.note}</p>
      `;
    }

    // Build student list
    const studentList = panel.querySelector('.student-list');
    if (studentList && captainData.students) {
      studentList.innerHTML = '';

      captainData.students.forEach(student => {
        const item = document.createElement('div');
        item.className = student.isYou ? 'student-item student-item--you' : 'student-item';
        item.dataset.student = student.id;
        item.dataset.vote = student.voteId;

        const voteText = student.isYou && student.secret 
          ? `Voted for: <strong>${student.vote}</strong> ${student.secret}`
          : `Voted for: <strong>${student.vote}</strong>`;

        item.innerHTML = `
          <div class="student-avatar">${student.emoji}</div>
          <div class="student-info">
            <div class="student-name">${student.name}</div>
            <div class="student-vote is-hidden">${voteText}</div>
          </div>
        `;

        studentList.appendChild(item);
      });
    }

    // Build warning box
    const warning = panel.querySelector('.student-voting-panel__warning');
    if (warning) {
      warning.innerHTML = `
        <span class="warning-icon">⚠️</span>
        <p><strong>${captainData.warningTitle}</strong> ${captainData.warningText}</p>
      `;
    }
  }

  // ============================================================================
  // NAVIGATION
  // ============================================================================
  function buildNavigation() {
    const chapters = CONTENT.navigation.chapters;
    const nav = document.querySelector('.story-rail__chapters');
    
    if (!nav || !chapters) return;

    const items = nav.querySelectorAll('.story-rail__item');
    items.forEach((item, index) => {
      if (chapters[index]) {
        const label = item.querySelector('small');
        if (label) {
          label.textContent = chapters[index];
        }
      }
    });
  }

  // ============================================================================
  // REFERENCES
  // ============================================================================
  function buildReferences() {
    const refs = CONTENT.references;
    const section = document.querySelector('.references');
    
    if (!section || !refs) return;

    // Update title
    const title = section.querySelector('h2');
    if (title) {
      title.textContent = refs.title;
    }

    // Build references list
    const list = section.querySelector('.references__list');
    if (list && refs.items) {
      list.innerHTML = '';

      refs.items.forEach((ref, index) => {
        const li = document.createElement('li');
        li.id = `ref-${ref.id}`;
        
        li.innerHTML = `
          <span class="references__number">[${index + 1}]</span>
          <span class="references__text">
            ${ref.authors}. 
            <cite>${ref.title}</cite>. 
            ${ref.year}. 
            <a href="${ref.url}" target="_blank" rel="noopener noreferrer">Link</a>
          </span>
        `;

        list.appendChild(li);
      });
    }
  }

  // ============================================================================
  // HELPER FUNCTIONS
  // ============================================================================

  /**
   * Update a step's content (eyebrow, title, lead)
   */
  function updateStep(stepId, content) {
    const step = document.getElementById(stepId);
    if (!step || !content) return;

    const inner = step.querySelector('.step__inner');
    if (!inner) return;

    // Update eyebrow
    const eyebrow = inner.querySelector('.step__eyebrow');
    if (eyebrow && content.eyebrow) {
      eyebrow.textContent = content.eyebrow;
    }

    // Update title
    const title = inner.querySelector('h2');
    if (title && content.title) {
      title.textContent = content.title;
    }

    // Update lead
    const lead = inner.querySelector('.step__lead');
    if (lead && content.lead) {
      lead.innerHTML = content.lead;
    }

    // Update body (if exists)
    const bodyP = inner.querySelectorAll('p:not(.step__eyebrow):not(.step__lead)');
    if (bodyP.length > 0 && content.body) {
      bodyP[0].innerHTML = content.body;
    }
  }

  /**
   * Update a step with additional body paragraphs and notes
   */
  function updateStepWithBody(stepId, content) {
    const step = document.getElementById(stepId);
    if (!step || !content) return;

    const inner = step.querySelector('.step__inner');
    if (!inner) return;

    // Clear existing content
    inner.innerHTML = '';

    // Add eyebrow
    if (content.eyebrow) {
      const eyebrow = document.createElement('p');
      eyebrow.className = 'step__eyebrow';
      eyebrow.textContent = content.eyebrow;
      inner.appendChild(eyebrow);
    }

    // Add title
    if (content.title) {
      const title = document.createElement('h2');
      title.textContent = content.title;
      inner.appendChild(title);
    }

    // Add lead
    if (content.lead) {
      const lead = document.createElement('p');
      lead.className = 'step__lead';
      lead.innerHTML = content.lead;
      inner.appendChild(lead);
    }

    // Add body1
    if (content.body1) {
      const body = document.createElement('p');
      body.innerHTML = content.body1;
      inner.appendChild(body);
    }

    // Add note
    if (content.note) {
      const note = document.createElement('p');
      note.className = 'step__note';
      note.innerHTML = content.note;
      inner.appendChild(note);
    }
  }

})();

  /**
   * Update a step with multiple body paragraphs
   */
  function updateStepWithMultiBody(stepId, content) {
    const step = document.getElementById(stepId);
    if (!step || !content) return;

    const inner = step.querySelector('.step__inner');
    if (!inner) return;

    inner.innerHTML = '';

    if (content.eyebrow) {
      const eyebrow = document.createElement('p');
      eyebrow.className = 'step__eyebrow';
      eyebrow.textContent = content.eyebrow;
      inner.appendChild(eyebrow);
    }

    if (content.title) {
      const title = document.createElement('h2');
      title.textContent = content.title;
      inner.appendChild(title);
    }

    if (content.lead) {
      const lead = document.createElement('p');
      lead.className = 'step__lead';
      lead.innerHTML = content.lead;
      inner.appendChild(lead);
    }

    if (content.body) {
      const body = document.createElement('p');
      body.innerHTML = content.body;
      inner.appendChild(body);
    }

    if (content.body2) {
      const body2 = document.createElement('p');
      body2.innerHTML = content.body2;
      inner.appendChild(body2);
    }

    if (content.body3) {
      const body3 = document.createElement('p');
      body3.innerHTML = content.body3;
      inner.appendChild(body3);
    }
  }

  /**
   * Update a step with instruction text
   */
  function updateStepWithInstruction(stepId, content) {
    const step = document.getElementById(stepId);
    if (!step || !content) return;

    const inner = step.querySelector('.step__inner');
    if (!inner) return;

    inner.innerHTML = '';

    if (content.eyebrow) {
      const eyebrow = document.createElement('p');
      eyebrow.className = 'step__eyebrow';
      eyebrow.textContent = content.eyebrow;
      inner.appendChild(eyebrow);
    }

    if (content.title) {
      const title = document.createElement('h2');
      title.textContent = content.title;
      inner.appendChild(title);
    }

    if (content.lead) {
      const lead = document.createElement('p');
      lead.className = 'step__lead';
      lead.innerHTML = content.lead;
      inner.appendChild(lead);
    }

    if (content.instruction) {
      const instruction = document.createElement('p');
      instruction.className = 'step__instruction';
      instruction.innerHTML = content.instruction;
      inner.appendChild(instruction);
    }
  }

  /**
   * Update a step with bullet points
   */
  function updateStepWithPoints(stepId, content) {
    const step = document.getElementById(stepId);
    if (!step || !content) return;

    const inner = step.querySelector('.step__inner');
    if (!inner) return;

    inner.innerHTML = '';

    if (content.eyebrow) {
      const eyebrow = document.createElement('p');
      eyebrow.className = 'step__eyebrow';
      eyebrow.textContent = content.eyebrow;
      inner.appendChild(eyebrow);
    }

    if (content.title) {
      const title = document.createElement('h2');
      title.textContent = content.title;
      inner.appendChild(title);
    }

    if (content.lead) {
      const lead = document.createElement('p');
      lead.className = 'step__lead';
      lead.innerHTML = content.lead;
      inner.appendChild(lead);
    }

    // Add points
    if (content.point1Title) {
      const point1 = document.createElement('div');
      point1.className = 'step__point';
      point1.innerHTML = `<strong>${content.point1Title}</strong><br>${content.point1Text}`;
      inner.appendChild(point1);
    }

    if (content.point2Title) {
      const point2 = document.createElement('div');
      point2.className = 'step__point';
      point2.innerHTML = `<strong>${content.point2Title}</strong><br>${content.point2Text}`;
      inner.appendChild(point2);
    }

    if (content.point3Title) {
      const point3 = document.createElement('div');
      point3.className = 'step__point';
      point3.innerHTML = `<strong>${content.point3Title}</strong><br>${content.point3Text}`;
      inner.appendChild(point3);
    }
  }

})();

  /**
   * Update a step with example boxes
   */
  function updateStepWithExamples(stepId, content) {
    const step = document.getElementById(stepId);
    if (!step || !content) return;

    const inner = step.querySelector('.step__inner');
    if (!inner) return;

    inner.innerHTML = '';

    if (content.eyebrow) {
      const eyebrow = document.createElement('p');
      eyebrow.className = 'step__eyebrow';
      eyebrow.textContent = content.eyebrow;
      inner.appendChild(eyebrow);
    }

    if (content.title) {
      const title = document.createElement('h2');
      title.textContent = content.title;
      inner.appendChild(title);
    }

    if (content.lead) {
      const lead = document.createElement('p');
      lead.className = 'step__lead';
      lead.innerHTML = content.lead;
      inner.appendChild(lead);
    }

    // Add examples
    if (content.example1Title) {
      const ex1 = document.createElement('div');
      ex1.className = 'step__example';
      ex1.innerHTML = `<strong>${content.example1Title}</strong><br>${content.example1Text}`;
      inner.appendChild(ex1);
    }

    if (content.example2Title) {
      const ex2 = document.createElement('p');
      ex2.className = 'step__example';
      ex2.innerHTML = `<strong>${content.example2Title}</strong><br>${content.example2Text}`;
      inner.appendChild(ex2);
    }

    if (content.example3Title) {
      const ex3 = document.createElement('div');
      ex3.className = 'step__example';
      ex3.innerHTML = `<strong>${content.example3Title}</strong><br>${content.example3Text}`;
      inner.appendChild(ex3);
    }
  }

})();
