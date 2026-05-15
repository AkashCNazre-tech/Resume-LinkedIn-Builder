
function switchTab(name, el) {
  document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
  el.classList.add('active');
  document.getElementById('tab-' + name).classList.add('active');
}

function val(id) { return document.getElementById(id).value.trim(); }

function getData() {
  return {
    name: val('name'), email: val('email'), phone: val('phone'),
    location: val('location'), linkedin: val('linkedin'),
    headline: val('headline'), summary: val('summary'),
    skills: val('skills'), experience: val('experience'),
    education: val('education'), projects: val('projects'), certs: val('certs')
  };
}

function escapeHtml(s) {
  return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

function formatExperience(text) {
  if (!text) return '';
  const blocks = text.split(/\n\s*\n/).map(b => b.trim()).filter(Boolean);
  return blocks.map(block => {
    const lines = block.split('\n').map(l => l.trim()).filter(Boolean);
    if (!lines.length) return '';
    const title = escapeHtml(lines[0]);
    const bullets = lines.slice(1).map(line => escapeHtml(line.replace(/^[-*]\s*/, ''))).filter(Boolean);
    const content = bullets.length
      ? `<ul class='exp-bullets'>${bullets.map(b => `<li>${b}</li>`).join('')}</ul>`
      : lines.slice(1).map(line => `<p>${escapeHtml(line)}</p>`).join('');
    return `<div class='exp-entry'><p class='exp-title'>${title}</p>${content}</div>`;
  }).join('');
}

function localGenerate(d) {
  const skills = d.skills ? d.skills.split(/,|\n/).map(s => s.trim()).filter(Boolean) : [];
  const headline = d.headline || [d.jobTitle, skills.slice(0, 3).join(' · ')].filter(Boolean).join(' | ') || `${d.name} | Professional`;
  const summary = d.summary || `Experienced ${headline.toLowerCase()} with a strong mix of ${skills.slice(0, 5).join(', ')}. Proven ability to deliver results through practical problem solving, collaboration, and continuous learning.`;
  const expHtml = formatExperience(d.experience);
  const scoreFactors = [d.headline, d.summary, d.experience, d.skills, d.linkedin, d.education, d.projects, d.certs].reduce((sum, field) => sum + (field ? 12 : 0), 0);
  const score = Math.min(100, Math.max(20, scoreFactors));
  const scoreLabel = score >= 70 ? 'Strong' : score >= 50 ? 'Good' : 'Needs Work';

  const statusFor = field => field ? (field === d.linkedin ? 'good' : 'improve') : 'missing';

  const sections = [
    { title: 'Profile Photo', icon: '📸', status: 'missing', tips: ['Add a professional headshot with a clean background.', 'Make sure your face fills most of the frame and you appear approachable.'] },
    { title: 'Headline', icon: '✏️', status: d.headline ? 'good' : 'missing', tips: d.headline ? ['Keep your headline concise and keyword-rich for your target role.', 'Use role-specific skills to improve search visibility.'] : ['Write a clear professional headline that includes your role and key strengths.', 'Include your primary specialization and one top skill.'] },
    { title: 'About / Summary', icon: '📝', status: d.summary ? 'good' : 'missing', tips: d.summary ? ['Keep your summary results-focused and reader-friendly.', 'Highlight your strongest achievements and the value you deliver.'] : ['Write a short summary that highlights your experience, strengths, and career goals.', 'Include quantifiable outcomes or impact when possible.'] },
    { title: 'Experience', icon: '💼', status: d.experience ? 'good' : 'missing', tips: d.experience ? ['Use achievement-focused bullet points for each role.', 'Include metrics to show the impact of your work.'] : ['Add your most recent role and key responsibilities.', 'Describe the results you delivered in each position.'] },
    { title: 'Skills & Endorsements', icon: '⭐', status: d.skills ? 'improve' : 'missing', tips: d.skills ? ['List 5-10 core skills that match your target job.', 'Keep your skills section focused on strengths and in-demand tools.'] : ['Add key technical and professional skills to your profile.', 'Include skills that align with your desired role and industry.'] },
    { title: 'Recommendations', icon: '🤝', status: 'missing', tips: ['Ask a former manager or teammate for a recommendation.', 'Request a recommendation that highlights your collaboration and impact.'] },
    { title: 'Featured Section', icon: '🌟', status: 'missing', tips: ['Add a project, article, or accomplishment to your Featured section.', 'Choose items that demonstrate your best work and results.'] },
    { title: 'Custom LinkedIn URL', icon: '🔗', status: d.linkedin ? 'good' : 'missing', tips: d.linkedin ? ['Your LinkedIn URL looks good.', 'Use the custom URL on your resume and LinkedIn profile.'] : ['Create a custom LinkedIn URL for a polished profile.', 'Use your name or professional brand in the URL.'] }
  ];

  return {
    resume: {
      headline,
      summary,
      skills,
      experienceHtml: expHtml,
      educationText: d.education || '',
      projectsText: d.projects || '',
      certsText: d.certs || ''
    },
    linkedin: {
      score,
      scoreLabel,
      sections
    }
  };
}

async function generate() {
  const d = getData();
  if (!d.name || !d.email) {
    alert('Please enter at least your Full Name and Email.');
    return;
  }

  const btn = document.getElementById('generateBtn');
  btn.disabled = true;
  btn.classList.add('loading');
  btn.querySelector('.btn-text').textContent = 'Generating…';

  document.getElementById('resume-empty').style.display = 'none';
  document.getElementById('linkedin-empty').style.display = 'none';
  document.getElementById('resume-output').style.display = 'block';
  document.getElementById('linkedin-output').style.display = 'block';

  document.getElementById('resume-output').innerHTML = `
    <div class="resume-card">
      <div style="text-align:center; padding: 2rem; color: var(--slate);">
        <div class="pulse" style="font-size: 2rem; margin-bottom: 1rem;">✦</div>
        <p>Building your resume…</p>
      </div>
    </div>`;
  document.getElementById('linkedin-output').innerHTML = `
    <div class="li-section">
      <div style="text-align:center; padding: 2rem; color: var(--slate);">
        <div class="pulse" style="font-size: 2rem; margin-bottom: 1rem;">💼</div>
        <p>Analysing LinkedIn profile…</p>
      </div>
    </div>`;

  try {
    const parsed = localGenerate(d);
    renderResume(d, parsed.resume);
    renderLinkedIn(parsed.linkedin);
  } catch (err) {
    document.getElementById('resume-output').innerHTML = `<div class="resume-card"><p style="color:red">Error: ${escapeHtml(err.message || 'Something went wrong')}</p></div>`;
  } finally {
    btn.disabled = false;
    btn.classList.remove('loading');
    btn.querySelector('.btn-text').textContent = '✦ Generate Resume & LinkedIn Tips';
  }
}

function renderResume(d, r) {
  const skills = r.skills || (d.skills ? d.skills.split(',').map(s=>s.trim()) : []);
  const html = `
    <div class="resume-card" id="resume-card">
      <button class="copy-btn" onclick="copyResume()">Copy Text</button>
      <p class="resume-header-name">${escapeHtml(d.name)}</p>
      <p class="resume-header-headline">${escapeHtml(r.headline)}</p>
      <div class="resume-contact-row">
        ${d.email ? `<span>✉ ${escapeHtml(d.email)}</span>` : ''}
        ${d.phone ? `<span>📞 ${escapeHtml(d.phone)}</span>` : ''}
        ${d.location ? `<span>📍 ${escapeHtml(d.location)}</span>` : ''}
        ${d.linkedin ? `<span>🔗 ${escapeHtml(d.linkedin)}</span>` : ''}
      </div>
      ${r.summary ? `<div class="resume-section">
        <p class="resume-section-title">Professional Summary</p>
        <p>${escapeHtml(r.summary)}</p>
      </div>` : ''}
      ${skills.length ? `<div class="resume-section">
        <p class="resume-section-title">Skills</p>
        <div class="skill-pills">${skills.map(s=>`<span class="skill-pill">${escapeHtml(s)}</span>`).join('')}</div>
      </div>` : ''}
      ${r.experienceHtml || d.experience ? `<div class="resume-section">
        <p class="resume-section-title">Experience</p>
        ${r.experienceHtml || `<p>${escapeHtml(d.experience)}</p>`}
      </div>` : ''}
      ${r.educationText || d.education ? `<div class="resume-section">
        <p class="resume-section-title">Education</p>
        <p>${escapeHtml(r.educationText || d.education)}</p>
      </div>` : ''}
      ${r.projectsText || d.projects ? `<div class="resume-section">
        <p class="resume-section-title">Projects</p>
        <p>${escapeHtml(r.projectsText || d.projects)}</p>
      </div>` : ''}
      ${r.certsText || d.certs ? `<div class="resume-section">
        <p class="resume-section-title">Certifications & Awards</p>
        <p>${escapeHtml(r.certsText || d.certs)}</p>
      </div>` : ''}
    </div>`;
  document.getElementById('resume-output').innerHTML = html;
}

function renderLinkedIn(li) {
  const score = li.score || 50;
  const circumference = 2 * Math.PI * 26;
  const offset = circumference - (score / 100) * circumference;
  const color = score >= 70 ? '#10b981' : score >= 40 ? '#f97316' : '#ef4444';

  let html = `
    <div class="score-ring-wrap">
      <div class="score-ring">
        <svg width="64" height="64" viewBox="0 0 64 64">
          <circle cx="32" cy="32" r="26" fill="none" stroke="rgba(255,255,255,0.15)" stroke-width="6"/>
          <circle cx="32" cy="32" r="26" fill="none" stroke="${color}" stroke-width="6"
            stroke-dasharray="${circumference}" stroke-dashoffset="${offset}" stroke-linecap="round"/>
        </svg>
        <div class="score-number">${score}</div>
      </div>
      <div>
        <div class="score-label">LinkedIn Strength: ${li.scoreLabel || 'Needs Work'}</div>
        <div class="score-sub">Based on profile completeness and optimisation</div>
      </div>
    </div>`;

  for (const s of (li.sections || [])) {
    const statusClass = s.status === 'missing' ? 'status-missing' : s.status === 'improve' ? 'status-improve' : 'status-good';
    const statusText = s.status === 'missing' ? '⚠ Missing' : s.status === 'improve' ? '↑ Can Improve' : '✓ Good';
    html += `
      <div class="li-section">
        <div class="li-section-header">
          <div class="li-icon" style="font-size:1.3rem">${s.icon}</div>
          <div style="flex:1">
            <h3>${escapeHtml(s.title)}</h3>
            <span class="li-status ${statusClass}">${statusText}</span>
          </div>
        </div>
        <ul class="li-tips">
          ${(s.tips||[]).map(t=>`<li class="li-tip"><div class="tip-dot"></div><span>${escapeHtml(t)}</span></li>`).join('')}
        </ul>
      </div>`;
  }

  document.getElementById('linkedin-output').innerHTML = html;
}

function copyResume() {
  const card = document.getElementById('resume-card');
  if (!card) return;
  const text = card.innerText;
  navigator.clipboard.writeText(text).then(() => {
    const btn = card.querySelector('.copy-btn');
    btn.textContent = 'Copied!';
    setTimeout(() => btn.textContent = 'Copy Text', 2000);
  });
}

