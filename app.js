// ══════════════════════════════
// 상태
// ══════════════════════════════
let currentRole = null;
let currentUser = {};
let currentJobFilter = 'all';
let selectedJobId = null;
const ADMIN_PW = 'samil2025';

// ══════════════════════════════
// 페이지 이동
// ══════════════════════════════
function showPage(name) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
  const pageMap = { home:'pageHome', jobs:'pageJobs', stats:'pageStats', mypage:'pageMypage', admin:'pageAdmin', homeroom:'pageHomeroom', homeroomMypage:'pageHomeroomMypage' };
  const navMap = { home:'nav-home', jobs:'nav-jobs', stats:'nav-stats', mypage:'nav-mypage', admin:'nav-admin', homeroom:'nav-homeroom', homeroomMypage:'nav-mypage' };
  const page = document.getElementById(pageMap[name]);
  const nav = document.getElementById(navMap[name]);
  if (page) page.classList.add('active');
  if (nav) nav.classList.add('active');
  window.scrollTo(0, 0);
  if (name === 'home') renderHomeJobs();
  if (name === 'jobs') renderAllJobs();
  if (name === 'stats') renderStats();
  if (name === 'admin') { renderAdminBanners(); renderAdminJobTable(); renderAdminDeptList(); }
  if (name === 'mypage' && currentRole === 'homeroom') { showPage('homeroomMypage'); return; }
  if (name === 'homeroomMypage') renderHomeroomMypage();
}

// ══════════════════════════════
// 카드 렌더
// ══════════════════════════════
function renderJobCard(job) {
  const today = new Date().toISOString().split('T')[0];
  const urgent = job.deadline && job.deadline <= new Date(Date.now() + 7*86400000).toISOString().split('T')[0] && job.status === 'open';
  const statusLabel = job.status === 'closed' ? '마감' : job.recommendation ? '학교장추천' : '진행중';
  const statusClass = job.status === 'closed' ? 'status-closed' : job.recommendation ? 'status-rec' : 'status-open';
  return `
    <div class="job-card" onclick="openJobModal('${job.id}')">
      <div class="job-card-header">
        <div>
          <div class="job-company">${job.company}</div>
          <div class="job-title">${job.title}</div>
        </div>
        <span class="job-status ${statusClass}">${statusLabel}</span>
      </div>
      <div class="job-info">
        <span class="job-info-item">📍 ${job.location}</span>
        <span class="job-info-item">💰 ${job.salary}</span>
        <span class="job-info-item">👥 ${job.headcount}명</span>
      </div>
      <div class="job-tags">
        ${job.tags.map(t => `<span class="tag tag-primary">${t}</span>`).join('')}
      </div>
      <div class="job-card-footer">
        <span class="job-deadline ${urgent ? 'urgent' : ''}">
          ${job.status === 'closed' ? '마감됨' : '📅 ' + job.deadline + (urgent ? ' (마감임박!)' : '')}
        </span>
        <div class="job-counts">
          <span class="count-item">👁 ${job.views}</span>
          <span class="count-item">📨 ${job.applyCount}</span>
          <span class="count-item">🔖 ${job.interestCount}</span>
        </div>
      </div>
    </div>`;
}

function renderHomeJobs() {
  const grid = document.getElementById('homeJobsGrid');
  const open = SAMPLE_JOBS.filter(j => j.status === 'open').slice(0, 6);
  grid.innerHTML = open.map(renderJobCard).join('') || '<div class="empty-state"><div class="empty-icon">📋</div><div class="empty-text">진행중인 공고가 없습니다</div></div>';
}

function renderAllJobs() {
  let jobs = [...SAMPLE_JOBS];
  if (currentJobFilter === 'open') jobs = jobs.filter(j => j.status === 'open' && !j.recommendation);
  if (currentJobFilter === 'rec') jobs = jobs.filter(j => j.recommendation);
  if (currentJobFilter === 'closed') jobs = jobs.filter(j => j.status === 'closed');
  // 연도 필터
  const year = document.getElementById('yearFilter')?.value;
  if (year) jobs = jobs.filter(j => j.createdAt && j.createdAt.startsWith(year));
  const q = document.getElementById('jobSearch')?.value.trim().toLowerCase();
  if (q) jobs = jobs.filter(j => j.company.toLowerCase().includes(q) || j.title.toLowerCase().includes(q));
  document.getElementById('jobCount').textContent = `총 ${jobs.length}건`;
  document.getElementById('allJobsGrid').innerHTML = jobs.map(renderJobCard).join('') || '<div class="empty-state"><div class="empty-icon">🔍</div><div class="empty-text">검색 결과가 없습니다</div></div>';
}

function filterJobs(type, btn) {
  currentJobFilter = type;
  document.querySelectorAll('#statusFilters .filter-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  renderAllJobs();
}

function searchJobs() { renderAllJobs(); }

// ══════════════════════════════
// 취업현황 렌더
// ══════════════════════════════
function renderStats() {
  buildStatsYearDropdown();
  const isStaff = currentRole === 'admin' || currentRole === 'homeroom';

  const modeTab = document.getElementById('statsModeTab');
  if (modeTab) modeTab.style.display = isStaff ? 'flex' : 'none';

  if (isStaff && statsMode === 1) {
    renderManageSection(); return;
  }
  switchStatsMode(0);

  // 통계박스 동적 렌더링
  renderStatsBoxes();

  // 홈 미리보기 테이블
  const homeTable = document.getElementById('homeStatsTable');
  if (homeTable) {
    homeTable.innerHTML = SAMPLE_STATS.map(s=>`
      <tr>
        <td>${s.dept}</td>
        <td>${s.graduates}명</td>
        <td>${s.employed}명</td>
        <td><div class="rate-bar"><div class="rate-track"><div class="rate-fill" style="width:${s.rate}%"></div></div><span class="rate-text">${s.rate}%</span></div></td>
      </tr>`).join('');
  }

  // 학과별 요약 테이블
  const fullTable = document.getElementById('fullStatsTable');
  if (fullTable) {
    // 상세보기 열 헤더 표시 여부
    const thDetail = document.getElementById('thDeptDetail');
    if (thDetail) thDetail.style.display = isStaff ? '' : 'none';

    fullTable.innerHTML = SAMPLE_STATS.map(s=>`
      <tr>
        <td><strong>${s.dept}</strong></td>
        <td>${s.graduates}명</td>
        <td>${s.hope}명</td>
        <td>${s.employed}명</td>
        <td><div class="rate-bar"><div class="rate-track"><div class="rate-fill" style="width:${s.rate}%"></div></div><span class="rate-text">${s.rate}%</span></div></td>
        ${isStaff ? `<td style="text-align:center">
          <button onclick="openDeptDetail('${s.dept}')"
            style="background:var(--primary);color:#fff;border:none;border-radius:6px;padding:4px 12px;font-size:12px;cursor:pointer;font-family:'Noto Sans KR',sans-serif">
            상세보기
          </button>
        </td>` : '<td style="text-align:center;color:var(--gray-400);font-size:12px">로그인 필요</td>'}
      </tr>`).join('');
  }

  // 학과별 상세 카드 섹션 (관리자/담임교사만)
  const deptSection = document.getElementById('deptDetailSection');
  if (deptSection) {
    deptSection.style.display = isStaff ? 'block' : 'none';
    if (isStaff) renderDeptCards();
  }

  // 업체 테이블
  const compTable = document.getElementById('companyTable');
  if (compTable) {
    compTable.innerHTML = SAMPLE_COMPANIES.map((c,idx)=>`
      <tr>
        <td><strong>${c.company}</strong></td>
        <td><strong>${c.count}명</strong></td>
        <td>${c.year}년</td>
        <td style="text-align:center">
          <button onclick="openCompanyDetail(${idx})"
            style="background:var(--primary);color:#fff;border:none;border-radius:6px;padding:5px 12px;font-size:12px;cursor:pointer;font-family:'Noto Sans KR',sans-serif;">
            상세보기
          </button>
        </td>
      </tr>`).join('');
  }
}

// ══════════════════════════════
// 학과별 카드 그리드 렌더
// ══════════════════════════════
function renderDeptCards(filterDept) {
  // 필터 탭
  const tabs = document.getElementById('deptFilterTabs');
  if (tabs && tabs.children.length === 0) {
    const allDepts = ['전체', ...DEPT_DETAIL.map(d=>d.dept)];
    tabs.innerHTML = allDepts.map((d,i)=>`
      <button class="filter-btn ${i===0?'active':''}" onclick="filterDeptCards('${d}', this)"
        style="font-size:12px;padding:5px 12px">
        ${d}
      </button>`).join('');
  }

  const grid = document.getElementById('deptCardsGrid');
  const data = filterDept && filterDept !== '전체'
    ? DEPT_DETAIL.filter(d=>d.dept===filterDept)
    : DEPT_DETAIL;

  grid.innerHTML = `
    <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(320px,1fr));gap:14px">
      ${data.map(d => {
        const empRate = Math.round(d.employed/d.graduates*100);
        const topCompanies = [...new Set(d.students.map(s=>s.company))].slice(0,3);
        const publicCount = d.students.filter(s=>s.type==='공무원'||s.type==='공기업').length;
        return `
        <div style="background:var(--white);border:1px solid var(--gray-200);border-radius:var(--radius);padding:18px;cursor:pointer;transition:all 0.2s"
          onmouseover="this.style.boxShadow='var(--shadow-md)';this.style.borderColor='var(--primary-light)'"
          onmouseout="this.style.boxShadow='none';this.style.borderColor='var(--gray-200)'"
          onclick="openDeptDetail('${d.dept}')">
          <div style="display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:14px">
            <div>
              <div style="font-size:15px;font-weight:700;color:var(--text);margin-bottom:3px">${d.dept}</div>
              <div style="font-size:12px;color:var(--gray-400)">${d.year}학년도 · 졸업생 ${d.graduates}명</div>
            </div>
            <span style="background:${empRate>=90?'#dcfce7':empRate>=80?'#dbeafe':'#fee2e2'};color:${empRate>=90?'var(--success)':empRate>=80?'#1d4ed8':'var(--danger)'};padding:4px 10px;border-radius:20px;font-size:13px;font-weight:700">
              ${empRate}%
            </span>
          </div>
          <!-- 취업/진학 현황 바 -->
          <div style="margin-bottom:14px">
            <div style="display:flex;justify-content:space-between;font-size:11px;color:var(--gray-400);margin-bottom:4px">
              <span>취업 ${d.employed}명</span>
              <span>진학 ${d.college}명</span>
              <span>기타 ${d.graduates-d.employed-d.college}명</span>
            </div>
            <div style="display:flex;height:8px;border-radius:4px;overflow:hidden;background:var(--gray-200)">
              <div style="width:${Math.round(d.employed/d.graduates*100)}%;background:var(--primary);transition:width 0.5s"></div>
              <div style="width:${Math.round(d.college/d.graduates*100)}%;background:#7c3aed"></div>
            </div>
            <div style="display:flex;gap:12px;margin-top:5px;font-size:11px">
              <span style="display:flex;align-items:center;gap:4px"><span style="width:8px;height:8px;background:var(--primary);border-radius:2px;display:inline-block"></span>취업</span>
              <span style="display:flex;align-items:center;gap:4px"><span style="width:8px;height:8px;background:#7c3aed;border-radius:2px;display:inline-block"></span>진학</span>
            </div>
          </div>
          <!-- 주요 취업처 -->
          <div style="margin-bottom:10px">
            <div style="font-size:11px;color:var(--gray-400);margin-bottom:5px">주요 취업처</div>
            <div style="display:flex;flex-wrap:wrap;gap:4px">
              ${topCompanies.map(c=>`<span style="background:var(--gray-100);color:var(--gray-600);padding:2px 8px;border-radius:12px;font-size:11px">${c}</span>`).join('')}
              ${publicCount>0?`<span style="background:#fef3c7;color:#b45309;padding:2px 8px;border-radius:12px;font-size:11px">공무원/공기업 ${publicCount}명</span>`:''}
            </div>
          </div>
          <div style="font-size:12px;color:var(--primary);font-weight:500;text-align:right">상세보기 →</div>
        </div>`;
      }).join('')}
    </div>`;
}

function filterDeptCards(dept, btn) {
  document.querySelectorAll('#deptFilterTabs .filter-btn').forEach(b=>b.classList.remove('active'));
  btn.classList.add('active');
  renderDeptCards(dept === '전체' ? null : dept);
}

// ══════════════════════════════
// 학과별 상세 모달
// ══════════════════════════════
function openDeptDetail(deptName) {
  const d = DEPT_DETAIL.find(x=>x.dept===deptName);
  if (!d) { showToast('⚠️ 상세 데이터가 없습니다'); return; }
  _currentDept = d;

  document.getElementById('deptModalName').textContent = deptName;
  document.getElementById('deptModalMeta').textContent =
    `${d.year}학년도 · 졸업생 ${d.graduates}명 · 취업 ${d.employed}명 · 진학 ${d.college}명`;

  renderDeptStudents();
  renderDeptCollege();
  renderDeptTrend();
  switchDeptTab(0);
  openModal('deptDetailModal');
}

function switchDeptTab(idx) {
  [0,1,2].forEach(i=>{
    const t=document.getElementById('dtab'+i);
    const p=document.getElementById('dtabPanel'+i);
    if(!t||!p) return;
    if(i===idx){t.style.borderBottomColor='var(--primary)';t.style.color='var(--primary)';t.style.fontWeight='600';p.style.display='block';}
    else{t.style.borderBottomColor='transparent';t.style.color='var(--gray-400)';t.style.fontWeight='500';p.style.display='none';}
  });
}

function renderDeptStudents() {
  const d = _currentDept; if (!d) return;
  const q  = (document.getElementById('deptStudentSearch')?.value||'').toLowerCase();
  const jf = document.getElementById('deptJobFilter')?.value||'';
  let students = d.students;
  if (q)  students = students.filter(s=>s.name.includes(q)||s.company.toLowerCase().includes(q));
  if (jf) students = students.filter(s=>s.job.includes(jf));

  const typeColor = t => t==='공무원'?'#1d4ed8':t==='공기업'?'var(--success)':'var(--primary)';
  const typeBg   = t => t==='공무원'?'#dbeafe':t==='공기업'?'#dcfce7':'#e8eef7';

  document.getElementById('deptStudentTable').innerHTML = students.length
    ? students.map(s=>`
      <tr>
        <td style="padding:10px 12px;border-bottom:1px solid var(--gray-100);font-weight:600">${maskName(s.name)}</td>
        <td style="padding:10px 12px;border-bottom:1px solid var(--gray-100)">${s.company}</td>
        <td style="padding:10px 12px;border-bottom:1px solid var(--gray-100);font-size:12px;color:var(--text-light)">${s.job}</td>
        <td style="padding:10px 12px;border-bottom:1px solid var(--gray-100);text-align:center;font-size:12px">${s.salary}</td>
        <td style="padding:10px 12px;border-bottom:1px solid var(--gray-100);text-align:center">${s.year}년</td>
        <td style="padding:10px 12px;border-bottom:1px solid var(--gray-100);text-align:center">
          <span style="background:${typeBg(s.type)};color:${typeColor(s.type)};padding:2px 8px;border-radius:12px;font-size:11px;font-weight:600">${s.type}</span>
        </td>
      </tr>`).join('')
    : `<tr><td colspan="6" style="padding:24px;text-align:center;color:var(--gray-400)">검색 결과가 없습니다</td></tr>`;
}

function renderDeptCollege() {
  const d = _currentDept; if (!d) return;
  document.getElementById('deptCollegeTable').innerHTML = d.college.length
    ? d.college.map(c=>`
      <tr>
        <td style="padding:10px 12px;border-bottom:1px solid var(--gray-100);font-weight:600">${maskName(c.name)}</td>
        <td style="padding:10px 12px;border-bottom:1px solid var(--gray-100)">${c.univ}</td>
        <td style="padding:10px 12px;border-bottom:1px solid var(--gray-100)">${c.major}</td>
        <td style="padding:10px 12px;border-bottom:1px solid var(--gray-100);text-align:center">
          <span style="background:#e8eef7;color:var(--primary);padding:2px 8px;border-radius:12px;font-size:11px;font-weight:600">${c.type}</span>
        </td>
        <td style="padding:10px 12px;border-bottom:1px solid var(--gray-100);text-align:center">${c.year}년</td>
      </tr>`).join('')
    : `<tr><td colspan="5" style="padding:24px;text-align:center;color:var(--gray-400)">진학자 없음</td></tr>`;
}

function renderDeptTrend() {
  const d = _currentDept; if (!d) return;
  const canvas = document.getElementById('deptTrendChart');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const W=canvas.width, H=canvas.height;
  ctx.clearRect(0,0,W,H);

  const trend = d.trend;
  const padL=60, padR=20, padT=20, padB=40;
  const cW=W-padL-padR, cH=H-padT-padB;
  const maxRate=100;

  // 그리드
  ctx.strokeStyle='#e2e6ef'; ctx.lineWidth=1;
  [0,25,50,75,100].forEach(v=>{
    const y=padT+cH*(1-v/maxRate);
    ctx.beginPath(); ctx.moveTo(padL,y); ctx.lineTo(padL+cW,y); ctx.stroke();
    ctx.fillStyle='#9aa3b8'; ctx.font='11px sans-serif'; ctx.textAlign='right';
    ctx.fillText(v+'%', padL-6, y+4);
  });

  const xStep = cW/(trend.length-1);

  // 취업률 선
  ctx.strokeStyle='var(--primary)'; ctx.lineWidth=2.5;
  ctx.beginPath();
  trend.forEach((t,i)=>{
    const x=padL+i*xStep, y=padT+cH*(1-t.rate/maxRate);
    i===0?ctx.moveTo(x,y):ctx.lineTo(x,y);
  });
  ctx.stroke();

  // 점 + 라벨
  trend.forEach((t,i)=>{
    const x=padL+i*xStep, y=padT+cH*(1-t.rate/maxRate);
    ctx.fillStyle='#1a3a6b'; ctx.beginPath(); ctx.arc(x,y,5,0,Math.PI*2); ctx.fill();
    ctx.fillStyle='#1a3a6b'; ctx.font='bold 12px sans-serif'; ctx.textAlign='center';
    ctx.fillText(t.rate+'%', x, y-12);
    ctx.fillStyle='#5a6480'; ctx.font='12px sans-serif';
    ctx.fillText(t.year+'년', x, padT+cH+22);
  });

  // 요약 테이블
  document.getElementById('deptTrendTable').innerHTML = `
    <table style="width:100%;border-collapse:collapse;font-size:13px">
      <thead><tr>
        <th style="padding:8px 12px;background:var(--gray-50);border-bottom:1px solid var(--gray-200);text-align:center">학년도</th>
        <th style="padding:8px 12px;background:var(--gray-50);border-bottom:1px solid var(--gray-200);text-align:center">취업자</th>
        <th style="padding:8px 12px;background:var(--gray-50);border-bottom:1px solid var(--gray-200);text-align:center">취업률</th>
        <th style="padding:8px 12px;background:var(--gray-50);border-bottom:1px solid var(--gray-200);text-align:center">전년 대비</th>
      </tr></thead>
      <tbody>
        ${trend.map((t,i)=>{
          const prev = i>0?trend[i-1].rate:null;
          const diff = prev!==null ? t.rate-prev : null;
          const color = diff>0?'var(--success)':diff<0?'var(--danger)':'var(--gray-400)';
          return `<tr>
            <td style="padding:9px 12px;border-bottom:1px solid var(--gray-100);text-align:center;font-weight:600">${t.year}년</td>
            <td style="padding:9px 12px;border-bottom:1px solid var(--gray-100);text-align:center">${t.employed}명</td>
            <td style="padding:9px 12px;border-bottom:1px solid var(--gray-100);text-align:center;font-weight:700;color:var(--primary)">${t.rate}%</td>
            <td style="padding:9px 12px;border-bottom:1px solid var(--gray-100);text-align:center;font-weight:600;color:${color}">
              ${diff!==null?(diff>0?'▲+'+diff+'%':diff<0?'▼'+diff+'%':'━'):'-'}
            </td>
          </tr>`;
        }).join('')}
      </tbody>
    </table>`;
}

// ══════════════════════════════
// 공고 상세 모달
// ══════════════════════════════
function openJobModal(jobId) {
  const job = SAMPLE_JOBS.find(j => j.id === jobId);
  if (!job) return;
  selectedJobId = jobId;
  document.getElementById('modalCompany').textContent  = job.company;
  document.getElementById('modalPosition').textContent = job.title;
  document.getElementById('modalLocation').textContent  = job.location;
  document.getElementById('modalSalary').textContent   = job.salary;
  document.getElementById('modalHeadcount').textContent = job.headcount + '명';
  document.getElementById('modalDeadline').textContent  = job.status === 'closed' ? '마감됨' : job.deadline;
  document.getElementById('modalDetail').textContent    = job.detail;
  document.getElementById('modalTags').innerHTML = job.tags.map(t=>`<span class="tag tag-primary">${t}</span>`).join('');

  // 첨부파일 표시
  const tagsWrap = document.getElementById('modalTagsWrap');
  let fileHtml = '';
  if (job.fileData) {
    const files = job.fileData.split('||').map(f => {
      const parts = f.split('::');
      return { name: parts[0], url: parts[1] };
    }).filter(f => f.name && f.url);
    if (files.length) {
      fileHtml = `<div class="detail-section" id="modalFilesWrap">
        <div class="detail-label">📎 첨부파일</div>
        <div style="display:flex;flex-direction:column;gap:6px;margin-top:4px">
          ${files.map(f=>`
            <a href="${f.url}" target="_blank"
              style="display:flex;align-items:center;gap:8px;padding:8px 12px;background:var(--gray-50);border:1px solid var(--gray-200);border-radius:8px;text-decoration:none;font-size:13px;color:var(--primary);transition:background 0.2s"
              onmouseover="this.style.background='#e8eef7'" onmouseout="this.style.background='var(--gray-50)'">
              📄 <span style="flex:1">${f.name}</span>
              <span style="font-size:11px;color:var(--gray-400)">열기 →</span>
            </a>`).join('')}
        </div>
      </div>`;
    }
  }
  // 기존 첨부파일 영역 제거 후 재삽입
  const existingFiles = document.getElementById('modalFilesWrap');
  if (existingFiles) existingFiles.remove();
  if (fileHtml) tagsWrap.insertAdjacentHTML('afterend', fileHtml);

  // 역할별 하단 버튼 렌더링
  const footer = document.getElementById('jobModalFooter');
  if (currentRole === 'admin') {
    const jobIdx = getAdminJobs().findIndex(j=>j.id===jobId);
    footer.innerHTML = `
      <button class="btn-interest" onclick="closeModal('jobModal');openJobForm(${jobIdx})" style="background:var(--gray-100);color:var(--primary);border:1px solid var(--gray-200)">✏️ 공고 수정</button>
      <button class="btn-interest" onclick="openApplicantsModal('${jobId}','관심')">🔖 관심 (${job.interestCount||0})</button>
      <button class="btn-apply" onclick="openApplicantsModal('${jobId}','지원')">📨 지원자 (${job.applyCount||0})</button>`;
  } else if (currentRole === 'homeroom') {
    footer.innerHTML = `
      <button class="btn-interest" onclick="doInterest()">🔖 관심등록</button>
      <button class="btn-apply" onclick="openClassApplyModal('${jobId}')">우리 반 학생 지원 처리 →</button>`;
  } else {
    footer.innerHTML = `
      <button class="btn-interest" onclick="doInterest()">🔖 관심등록</button>
      <button class="btn-apply" onclick="doApply()">지원하기 →</button>`;
  }
  document.getElementById('jobModal').classList.add('open');
}

function closeJobModal(e) {
  if (e.target === document.getElementById('jobModal')) closeModal('jobModal');
}

function closeLoginModal(e) {
  if (e.target === document.getElementById('loginModal')) closeModal('loginModal');
}

function closeModal(id) {
  document.getElementById(id).classList.remove('open');
}

function doApply() {
  if (!currentRole) { closeModal('jobModal'); openLoginModal(); showToast('로그인 후 지원하실 수 있습니다'); return; }
  showToast('✅ 지원이 완료되었습니다! (Google Sheets 연결 후 실제 저장)');
  closeModal('jobModal');
}

function doInterest() {
  if (!currentRole) { closeModal('jobModal'); openLoginModal(); showToast('로그인 후 관심등록 하실 수 있습니다'); return; }
  showToast('🔖 관심공고에 등록되었습니다!');
}

// ══════════════════════════════
// 로그인
// ══════════════════════════════
let loginRole = 'student';

function openLoginModal() {
  selectLoginRole('student');
  document.getElementById('loginModal').classList.add('open');
}

function selectLoginRole(role) {
  loginRole = role;
  ['student','homeroom','admin'].forEach(r => {
    const tab = document.getElementById('tab' + r.charAt(0).toUpperCase() + r.slice(1));
    const form = document.getElementById('form' + r.charAt(0).toUpperCase() + r.slice(1));
    if (tab) { tab.classList.toggle('active', r === role); tab.style.display = r === 'admin' && role !== 'admin' ? 'none' : ''; }
    if (form) form.style.display = r === role ? 'block' : 'none';
  });
  if (role === 'admin') {
    document.getElementById('tabAdmin').style.display = 'block';
    document.getElementById('tabAdmin').classList.add('active');
    document.getElementById('tabStudent').classList.remove('active');
    document.getElementById('tabHomeroom').classList.remove('active');
  }
  document.querySelectorAll('.login-error').forEach(e => e.style.display = 'none');
}

function doLogin() {
  const showErr = id => document.getElementById(id).style.display = 'block';

  if (loginRole === 'student') {
    const dept  = document.getElementById('inputStudentDept').value;
    const sid   = document.getElementById('inputStudentId').value.trim();
    const sname = document.getElementById('inputStudentName').value.trim();
    const pw    = document.getElementById('inputStudentPw').value;
    if (!dept || !sid || sid.length !== 4 || !/^\d{4}$/.test(sid) || !sname || !pw) { showErr('errorStudent'); return; }
    const pwKey   = 'spw_' + dept + '_' + sid;
    const savedPw = localStorage.getItem(pwKey);
    if (savedPw && pw !== savedPw) {
      document.getElementById('errorStudent').textContent = '비밀번호가 올바르지 않습니다';
      showErr('errorStudent'); return;
    }
    if (!savedPw && !/^\d{6}$/.test(pw)) {
      document.getElementById('errorStudent').textContent = '최초 로그인은 생년월일 6자리(YYMMDD)를 입력하세요';
      showErr('errorStudent'); return;
    }
    // ⑪ Sheets 검증 (비동기, Sheets 미연결 시 통과)
    verifyStudentLogin(dept, sid, sname).then(valid => {
      if (!valid) {
        document.getElementById('errorStudent').textContent = '학생 정보를 찾을 수 없습니다. 담임선생님께 문의하세요';
        document.getElementById('errorStudent').style.display = 'block'; return;
      }
      currentRole = 'student';
      currentUser = { role:'student', name: sname, icon:'🎒', id: sid, dept, pwKey, initPw: !savedPw };
      if (!savedPw) {
        closeModal('loginModal'); updateHeader();
        showToast('✅ ' + sname + '님, 비밀번호를 변경해 주세요');
        setTimeout(() => { document.getElementById('changePwDesc').textContent='최초 로그인입니다. 새 비밀번호를 설정해 주세요.'; currentUser.classCode=pw; openModal('changePwModal'); }, 800);
        return;
      }
      closeModal('loginModal'); updateHeader();
      showToast('✅ ' + sname + '님, 환영합니다!');
      showPage('mypage');
    });
    return; // 비동기 처리이므로 여기서 return

  } else if (loginRole === 'homeroom') {
    const dept = document.getElementById('inputHomeroomDept').value;
    const code = document.getElementById('inputClassCode').value.trim();
    const pw   = document.getElementById('inputHomeroomPw').value;
    if (!dept || !code || !pw || !/^\d-\d+$/.test(code)) { showErr('errorHomeroom'); return; }
    // 저장된 비밀번호 확인 (최초: 학급코드)
    const key = 'pw_' + dept + '_' + code;
    const savedPw = localStorage.getItem(key) || code; // 최초엔 학급코드가 비번
    if (pw !== savedPw) { showErr('errorHomeroom'); document.getElementById('errorHomeroom').textContent = '비밀번호가 올바르지 않습니다'; return; }
    currentRole = 'homeroom';
    currentUser = { role:'homeroom', name: dept + ' ' + code + ' 담임', icon:'👩‍🏫', classCode: code, dept: dept, pwKey: key };
    // 최초 로그인(비번=학급코드) 이면 변경 유도
    if (pw === code) {
      closeModal('loginModal');
      updateHeader();
      showToast('✅ 로그인 성공! 보안을 위해 비밀번호를 변경해 주세요');
      setTimeout(() => { document.getElementById('changePwDesc').textContent = '최초 로그인입니다. 비밀번호를 변경해 주세요.'; openModal('changePwModal'); }, 800);
      return;
    }

  } else if (loginRole === 'admin') {
    const pw = document.getElementById('inputAdminPw').value;
    if (pw !== ADMIN_PW) { showErr('errorAdmin'); return; }
    currentRole = 'admin';
    currentUser = { role:'admin', name:'관리자', icon:'⚙️' };
  }

  closeModal('loginModal');
  updateHeader();
  showToast('✅ ' + currentUser.name + '님, 환영합니다!');
}

function doLogout() {
  currentRole = null; currentUser = {};
  updateHeader();
  showPage('home');
  renderStats(); // ★ 로그아웃 시 취업현황 접근권한 갱신
  showToast('로그아웃 되었습니다');
}

function updateHeader() {
  const btnLogin = document.getElementById('btnLogin');
  const userChip = document.getElementById('userChip');
  const navMypage = document.getElementById('nav-mypage');
  const navAdmin = document.getElementById('nav-admin');
  const navHomeroom = document.getElementById('nav-homeroom');

  if (currentRole) {
    btnLogin.style.display = 'none';
    userChip.style.display = 'flex';
    document.getElementById('userAvatar').textContent = currentUser.icon;
    document.getElementById('userName').textContent = currentUser.name;
    navMypage.style.display = (currentRole === 'student' || currentRole === 'homeroom') ? 'block' : 'none';
    navAdmin.style.display = currentRole === 'admin' ? 'block' : 'none';
    navHomeroom.style.display = currentRole === 'homeroom' ? 'block' : 'none';
    // 비번변경 버튼: 담임교사 + 학생 모두
    document.getElementById('btnChangePw').style.display = (currentRole === 'homeroom' || currentRole === 'student') ? 'inline' : 'none';
    // 학생 로그인 시 마이페이지 데이터 로드
    if (currentRole === 'student') loadStudentData();
  } else {
    btnLogin.style.display = 'block';
    userChip.style.display = 'none';
    navMypage.style.display = 'none';
    navAdmin.style.display = 'none';
    navHomeroom.style.display = 'none';
  }
}

// ══════════════════════════════
// 모달 열기
// ══════════════════════════════
function openModal(id) { document.getElementById(id).classList.add('open'); }

// ══════════════════════════════
// 비밀번호 변경 (담임교사)
// ══════════════════════════════
function openChangePw() {
  document.getElementById('changePwDesc').textContent = '현재 비밀번호를 변경하세요';
  document.getElementById('inputCurPw').value = '';
  document.getElementById('inputNewPw').value = '';
  document.getElementById('inputNewPw2').value = '';
  document.getElementById('errorChangePw').style.display = 'none';
  openModal('changePwModal');
}

function doChangePw() {
  const cur   = document.getElementById('inputCurPw').value;
  const nw    = document.getElementById('inputNewPw').value;
  const nw2   = document.getElementById('inputNewPw2').value;
  const errEl = document.getElementById('errorChangePw');
  errEl.style.display = 'none';

  const key     = currentUser.pwKey;
  const savedPw = localStorage.getItem(key) || currentUser.classCode; // homeroom: classCode, student: initPw(생년월일)

  if (cur !== savedPw) { errEl.textContent = '현재 비밀번호가 올바르지 않습니다'; errEl.style.display = 'block'; return; }
  if (nw.length < 4)   { errEl.textContent = '새 비밀번호는 4자 이상이어야 합니다'; errEl.style.display = 'block'; return; }
  if (nw !== nw2)      { errEl.textContent = '새 비밀번호가 일치하지 않습니다'; errEl.style.display = 'block'; return; }

  localStorage.setItem(key, nw);
  closeModal('changePwModal');
  showToast('✅ 비밀번호가 변경되었습니다');
}

// ══════════════════════════════
// 비밀번호 초기화 (관리자)
// ══════════════════════════════
function doResetPw() {
  const dept = document.getElementById('resetDept').value;
  const code = document.getElementById('resetClassCode').value.trim();
  const errEl = document.getElementById('errorResetPw');
  errEl.style.display = 'none';

  if (!dept || !code || !/^\d-\d+$/.test(code)) {
    errEl.textContent = '학과와 학급코드를 올바르게 입력해주세요';
    errEl.style.display = 'block'; return;
  }
  const key = 'pw_' + dept + '_' + code;
  localStorage.removeItem(key); // 삭제하면 학급코드가 기본값으로 동작
  closeModal('resetPwModal');
  showToast('✅ ' + dept + ' ' + code + ' 비밀번호가 초기화되었습니다 (초기값: ' + code + ')');
}

// ══════════════════════════════
// 학급현황 샘플 데이터 테스트
// ══════════════════════════════
function loadSampleClassData() {
  classStudents = SAMPLE_COMPANIES[0].employees.map(e => ({
    name: e.name,
    attend: e.attend || [{grade:'1학년',days:190,absent:0,late:0,early:0,miss:0},{grade:'2학년',days:190,absent:0,late:1,early:0,miss:0},{grade:'3학년',days:95,absent:0,late:0,early:0,miss:0}],
    grades: e.grades || [],
    certs: e.certs || [],
    clubs: e.clubs || [],
    leader: e.leader || [],
  }));
  showToast('✅ 샘플 데이터 ' + classStudents.length + '명 로드됨 (테스트용)');
  document.getElementById('dropZone').style.display = 'none';
  renderClassData();
}

// ══════════════════════════════
// 취업현황 모드 전환 (현황보기/올해관리)
// ══════════════════════════════
let statsMode = 0;

function switchStatsMode(idx) {
  statsMode = idx;
  const v = document.getElementById('statsModeView');
  const m = document.getElementById('statsModeManage');
  const t0 = document.getElementById('smtab0');
  const t1 = document.getElementById('smtab1');
  if (!v||!m) return;

  if (idx === 0) {
    v.style.display='block'; m.style.display='none';
    t0.style.background='var(--white)'; t0.style.color='var(--primary)'; t0.style.fontWeight='600'; t0.style.boxShadow='var(--shadow-sm)';
    t1.style.background='transparent'; t1.style.color='var(--gray-600)'; t1.style.fontWeight='500'; t1.style.boxShadow='none';
  } else {
    v.style.display='none'; m.style.display='block';
    t1.style.background='var(--white)'; t1.style.color='var(--primary)'; t1.style.fontWeight='600'; t1.style.boxShadow='var(--shadow-sm)';
    t0.style.background='transparent'; t0.style.color='var(--gray-600)'; t0.style.fontWeight='500'; t0.style.boxShadow='none';
    renderManageSection();
  }
}

// ══════════════════════════════
// 올해 관리 - 학과탭→반탭→학생목록 인라인 수정
// ══════════════════════════════
let mgCurrentDept = '';
let mgCurrentClass = '';
let mgRecords = [];

function renderManageSection() {
  const isAdmin = currentRole === 'admin';
  const descEl  = document.getElementById('manageRoleDesc');
  if (!descEl) return;

  // 로컬스토리지에서 데이터 로드
  try {
    const saved = localStorage.getItem('mgRecords_' + new Date().getFullYear());
    if (saved) mgRecords = JSON.parse(saved);
  } catch(e) {}

  if (isAdmin) {
    descEl.innerHTML = '⚙️ <strong>관리자</strong> — 전체 학과 취업·진로 현황을 관리합니다';
    const depts = getActiveDeptNames();
    document.getElementById('manageDeptTabs').innerHTML = depts.map((d,i)=>`
      <button class="filter-btn ${i===0?'active':''}" onclick="selectMgDept('${d}',this)"
        style="font-size:12px;padding:5px 12px">${d}</button>`).join('');
    mgCurrentDept = depts[0] || '';
  } else {
    const dept = currentUser.dept || '';
    const code = currentUser.classCode || '';
    descEl.innerHTML = `👩‍🏫 <strong>담임교사</strong> — ${dept} ${code}반`;
    document.getElementById('manageDeptTabs').innerHTML =
      `<span style="background:#e8eef7;color:var(--primary);padding:5px 12px;border-radius:20px;font-size:12px;font-weight:600">${dept}</span>`;
    mgCurrentDept = dept;
  }
  renderMgClassTabs();
}

function selectMgDept(dept, btn) {
  document.querySelectorAll('#manageDeptTabs .filter-btn').forEach(b=>b.classList.remove('active'));
  btn.classList.add('active');
  mgCurrentDept = dept;
  mgCurrentClass = '';
  renderMgClassTabs();
}

function renderMgClassTabs() {
  const tabsEl = document.getElementById('manageClassTabs');
  const panel  = document.getElementById('manageStudentPanel');
  const hint   = document.getElementById('manageSelectHint');
  // 반 탭: 1~5반 (학생데이터 기준으로 실제 있는 반만)
  const classes = ['1반','2반','3반'];
  tabsEl.innerHTML = classes.map((c,i)=>`
    <button class="filter-btn ${mgCurrentClass===c?'active':''}" onclick="selectMgClass('${c}',this)"
      style="font-size:12px;padding:5px 12px">${c}</button>`).join('');
  if (!mgCurrentClass) {
    panel.style.display = 'none';
    hint.style.display = 'block';
  } else {
    renderMgStudentTable();
  }
}

function selectMgClass(cls, btn) {
  document.querySelectorAll('#manageClassTabs .filter-btn').forEach(b=>b.classList.remove('active'));
  btn.classList.add('active');
  mgCurrentClass = cls;
  document.getElementById('manageStudentPanel').style.display = 'block';
  document.getElementById('manageSelectHint').style.display = 'none';
  const classNum = cls.replace('반','');
  document.getElementById('mgTableTitle').textContent = `${mgCurrentDept} ${cls} 취업·진로 현황`;
  renderMgStudentTable();
}

function renderMgStudentTable() {
  const tbody = document.getElementById('mgRecordTable');
  if (!tbody) return;
  const classNum = mgCurrentClass.replace('반','');

  // 학생 목록: mgRecords에서 해당 학과+반 필터 (없으면 더미 행 표시)
  let students = mgRecords.filter(r => r.dept === mgCurrentDept && String(r.classNum) === String(classNum));

  // 학생 없으면 신규 행 추가 가능하도록 빈 행 하나 표시
  const typeOpts = ['취업','진학','미취업','군입대','기타'].map(t=>`<option>${t}</option>`).join('');

  const rowHtml = (r, idx, isNew) => {
    const iid = isNew ? 'new' : idx;
    return `<tr id="mgRow_${iid}" style="border-bottom:1px solid var(--gray-100)">
      <td style="padding:8px 10px"><input id="mgR_name_${iid}" value="${r.name||''}" placeholder="이름"
        style="width:60px;border:1px solid var(--gray-200);border-radius:6px;padding:5px 7px;font-size:12px;font-family:'Noto Sans KR',sans-serif"></td>
      <td style="padding:8px 10px;text-align:center"><input id="mgR_sid_${iid}" value="${r.sid||''}" placeholder="학번" maxlength="4"
        style="width:52px;border:1px solid var(--gray-200);border-radius:6px;padding:5px 7px;font-size:12px;font-family:'Noto Sans KR',sans-serif;text-align:center"></td>
      <td style="padding:8px 10px;text-align:center">
        <select id="mgR_type_${iid}" style="border:1px solid var(--gray-200);border-radius:6px;padding:5px 6px;font-size:12px;font-family:'Noto Sans KR',sans-serif">
          ${['취업','진학','미취업','군입대','기타'].map(t=>`<option ${r.type===t?'selected':''}>${t}</option>`).join('')}
        </select></td>
      <td style="padding:8px 10px"><input id="mgR_company_${iid}" value="${r.company||''}" placeholder="업체/대학"
        style="width:110px;border:1px solid var(--gray-200);border-radius:6px;padding:5px 7px;font-size:12px;font-family:'Noto Sans KR',sans-serif"></td>
      <td style="padding:8px 10px"><input id="mgR_job_${iid}" value="${r.job||''}" placeholder="직종/학과"
        style="width:100px;border:1px solid var(--gray-200);border-radius:6px;padding:5px 7px;font-size:12px;font-family:'Noto Sans KR',sans-serif"></td>
      <td style="padding:8px 10px"><input id="mgR_salary_${iid}" value="${r.salary||''}" placeholder="급여/전형"
        style="width:90px;border:1px solid var(--gray-200);border-radius:6px;padding:5px 7px;font-size:12px;font-family:'Noto Sans KR',sans-serif"></td>
      <td style="padding:8px 10px;text-align:center;white-space:nowrap">
        <button onclick="saveMgRow('${iid}',${isNew})" style="background:var(--primary);color:#fff;border:none;border-radius:6px;padding:4px 10px;font-size:11px;cursor:pointer;font-family:'Noto Sans KR',sans-serif">💾</button>
        ${!isNew?`<button onclick="deleteMgRow(${idx})" style="background:none;border:1px solid var(--gray-200);border-radius:6px;padding:4px 8px;font-size:11px;color:var(--danger);cursor:pointer;margin-left:4px">🗑️</button>`:''}
      </td>
    </tr>`;
  };

  const existingRows = students.map((r,i) => rowHtml(r, mgRecords.indexOf(r), false)).join('');
  const newRow = rowHtml({dept:mgCurrentDept, classNum}, 'new', true);

  tbody.innerHTML = existingRows + `
    <tr><td colspan="7" style="padding:6px 10px;background:var(--gray-50)">
      <span style="font-size:11px;color:var(--gray-400)">➕ 신규 입력</span>
    </td></tr>` + newRow;
}

function saveMgRow(iid, isNew) {
  const get = id => { const el = document.getElementById(id); return el ? el.value.trim() : ''; };
  const classNum = mgCurrentClass.replace('반','');
  const record = {
    name:     get(`mgR_name_${iid}`),
    sid:      get(`mgR_sid_${iid}`),
    type:     get(`mgR_type_${iid}`),
    company:  get(`mgR_company_${iid}`),
    job:      get(`mgR_job_${iid}`),
    salary:   get(`mgR_salary_${iid}`),
    dept:     mgCurrentDept,
    classNum: classNum,
    year:     new Date().getFullYear(),
  };
  if (!record.name) { showToast('⚠️ 이름을 입력해주세요'); return; }

  if (isNew) {
    mgRecords.push(record);
  } else {
    mgRecords[parseInt(iid)] = record;
  }
  try { localStorage.setItem('mgRecords_' + new Date().getFullYear(), JSON.stringify(mgRecords)); } catch(e) {}
  showToast('✅ ' + record.name + ' 저장됐습니다');
  renderMgStudentTable();
}

function deleteMgRow(idx) {
  if (!confirm('삭제하시겠습니까?')) return;
  mgRecords.splice(idx, 1);
  try { localStorage.setItem('mgRecords_' + new Date().getFullYear(), JSON.stringify(mgRecords)); } catch(e) {}
  renderMgStudentTable();
  showToast('🗑️ 삭제됐습니다');
}

// ══════════════════════════════
// 담임교사 마이페이지
// ══════════════════════════════
function renderHomeroomMypage() {
  const dept = currentUser.dept || '-';
  const code = currentUser.classCode || '-';
  const el = document.getElementById('hrDept');
  if (el) el.textContent = dept;
  const cl = document.getElementById('hrClass');
  if (cl) cl.textContent = code + '반';
  const idEl = document.getElementById('hrId');
  if (idEl) idEl.textContent = dept.substring(0,2) + '_' + code;
}

function doHrChangePw() {
  const cur  = document.getElementById('hrCurPw').value;
  const nw   = document.getElementById('hrNewPw').value;
  const nw2  = document.getElementById('hrNewPw2').value;
  const errEl = document.getElementById('hrPwError');
  errEl.style.display = 'none';

  const key = 'hrPw_' + (currentUser.dept||'') + '_' + (currentUser.classCode||'');
  const stored = localStorage.getItem(key) || currentUser.classCode || '';

  if (cur !== stored) { errEl.textContent = '현재 비밀번호가 올바르지 않습니다'; errEl.style.display='block'; return; }
  if (nw.length < 4)  { errEl.textContent = '새 비밀번호는 4자 이상이어야 합니다'; errEl.style.display='block'; return; }
  if (nw !== nw2)     { errEl.textContent = '새 비밀번호가 일치하지 않습니다'; errEl.style.display='block'; return; }

  localStorage.setItem(key, nw);
  ['hrCurPw','hrNewPw','hrNewPw2'].forEach(id=>{ const el=document.getElementById(id); if(el) el.value=''; });
  showToast('✅ 비밀번호가 변경됐습니다');
}

function renderMgTable() {
  const tbody = document.getElementById('mgRecordTable');
  if (!tbody) return;
  // localStorage에서 불러오기
  try {
    const saved = localStorage.getItem('mgRecords_' + new Date().getFullYear());
    if (saved && mgRecords.length === 0) mgRecords = JSON.parse(saved);
  } catch(e) {}

  const filtered = mgCurrentDept
    ? mgRecords.filter(r=>r.dept===mgCurrentDept)
    : mgRecords;

  const typeColor = t => t==='취업'?'var(--primary)':t==='진학'?'#7c3aed':t==='공무원'?'#1d4ed8':'var(--gray-400)';
  const typeBg   = t => t==='취업'?'#e8eef7':t==='진학'?'#f3e8ff':t==='공무원'?'#dbeafe':'var(--gray-100)';

  tbody.innerHTML = filtered.length
    ? filtered.map((r, i) => {
        const realIdx = mgRecords.indexOf(r);
        return `
        <tr style="${mgEditIdx===realIdx?'background:#fef9ec;':''}" >
          <td style="padding:10px 12px;border-bottom:1px solid var(--gray-100);font-weight:600">${r.name}</td>
          <td style="padding:10px 12px;border-bottom:1px solid var(--gray-100);font-size:12px;color:var(--gray-400)">${r.sid}</td>
          <td style="padding:10px 12px;border-bottom:1px solid var(--gray-100);text-align:center">
            <span style="background:${typeBg(r.type)};color:${typeColor(r.type)};padding:2px 8px;border-radius:12px;font-size:11px;font-weight:600">${r.type}</span>
          </td>
          <td style="padding:10px 12px;border-bottom:1px solid var(--gray-100)">${r.company||'-'}</td>
          <td style="padding:10px 12px;border-bottom:1px solid var(--gray-100);font-size:12px;color:var(--text-light)">${r.job||'-'}</td>
          <td style="padding:10px 12px;border-bottom:1px solid var(--gray-100);text-align:center">
            <button onclick="editMgRecord(${realIdx})"
              style="background:none;border:1px solid var(--primary);border-radius:6px;padding:3px 10px;font-size:12px;color:var(--primary);cursor:pointer;font-weight:500">
              ✏️ 수정
            </button>
          </td>
          <td style="padding:10px 12px;border-bottom:1px solid var(--gray-100);text-align:center">
            <button onclick="deleteMgRecord(${realIdx})"
              style="background:none;border:1px solid var(--gray-200);border-radius:6px;padding:3px 10px;font-size:12px;color:var(--danger);cursor:pointer">
              🗑️ 삭제
            </button>
          </td>
        </tr>`;
      }).join('')
    : `<tr><td colspan="7" style="padding:24px;text-align:center;color:var(--gray-400)">입력된 데이터가 없습니다</td></tr>`;
}

// ══════════════════════════════
// 취업현황 연도 드롭다운 (stats 페이지용)
// ══════════════════════════════

// ══════════════════════════════
// 통계박스 동적 렌더링 (선택연도 vs 전년도 비교)
// ══════════════════════════════
function renderStatsBoxes() {
  const container = document.getElementById('statsBoxContainer');
  if (!container) return;

  const sel = document.getElementById('statsYearFilter');
  const selectedYear = sel ? parseInt(sel.value) || new Date().getFullYear() : new Date().getFullYear();
  const prevYear = selectedYear - 1;

  // 연도별 통계 집계 (SAMPLE_STATS 기반, 향후 Sheets 데이터로 교체)
  function getYearStats(year) {
    // 현재는 샘플데이터 사용 (year 무관). Sheets 연동 시 year별 필터링
    const s = SAMPLE_STATS;
    const totalGrad = s.reduce((a,x)=>a+x.graduates,0);
    const totalEmp  = s.reduce((a,x)=>a+x.employed,0);
    const totalHope = s.reduce((a,x)=>a+x.hope,0);
    const rate      = totalHope > 0 ? Math.round(totalEmp/totalHope*100) : 0;
    const companies = [...new Set(SAMPLE_COMPANIES.map(c=>c.company))].length;
    return { year, graduates: totalGrad, employed: totalEmp, hope: totalHope, rate, companies };
  }

  const cur  = getYearStats(selectedYear);
  const prev = getYearStats(prevYear);

  function diff(a, b) {
    const d = a - b;
    if (d === 0) return '';
    const color = d > 0 ? 'var(--success)' : 'var(--danger)';
    return `<span style="font-size:10px;color:${color};font-weight:600">${d>0?'▲':'▼'}${Math.abs(d)}</span>`;
  }

  const boxes = [
    { label:'졸업생',    curVal: cur.graduates+'명',  prevVal: prev.graduates+'명',  cls:'gray',  diffVal: diff(cur.graduates, prev.graduates) },
    { label:'취업자',    curVal: cur.employed+'명',   prevVal: prev.employed+'명',   cls:'blue',  diffVal: diff(cur.employed, prev.employed) },
    { label:'취업률',    curVal: cur.rate+'%',        prevVal: prev.rate+'%',        cls:'gold',  diffVal: diff(cur.rate, prev.rate) },
    { label:'취업희망',  curVal: cur.hope+'명',       prevVal: prev.hope+'명',       cls:'',      diffVal: diff(cur.hope, prev.hope) },
    { label:'협력업체',  curVal: cur.companies+'개',  prevVal: prev.companies+'개',  cls:'green', diffVal: diff(cur.companies, prev.companies) },
  ];

  container.innerHTML = `
    <div style="display:flex;gap:8px;align-items:center;margin-bottom:10px">
      <span style="font-size:13px;font-weight:700;color:var(--text)">${selectedYear}년 현황</span>
      <span style="font-size:12px;color:var(--gray-400)">vs ${prevYear}년 비교</span>
    </div>
    <div style="display:flex;gap:12px;flex-wrap:wrap">
      ${boxes.map(b=>`
        <div class="stat-box ${b.cls}" style="flex:1;min-width:130px">
          <div class="stat-box-num">${b.curVal}</div>
          <div class="stat-box-label">${b.label}</div>
          <div class="stat-box-sub" style="display:flex;align-items:center;justify-content:center;gap:4px">
            전년 ${b.prevVal} ${b.diffVal}
          </div>
        </div>`).join('')}
    </div>`;
}

function buildStatsYearDropdown() {
  const sel = document.getElementById('statsYearFilter');
  if (!sel || sel.options.length > 1) return;
  const start = 2023, now = new Date().getFullYear();
  sel.innerHTML = '<option value="">전체 연도</option>';
  for (let y = now; y >= start; y--) {
    const opt = document.createElement('option');
    opt.value = y; opt.textContent = y + '년';
    sel.appendChild(opt);
  }
}

// 현재 열린 학과 데이터
let _currentDept = null;
let myStudentData = null;

function loadStudentData() {
  const name = currentUser.name;
  const dept = currentUser.dept;
  let found = null;
  // 담임교사 업로드 데이터(localStorage)에서 이름 매칭
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (!key || !key.startsWith('classData_')) continue;
    try {
      const data = JSON.parse(localStorage.getItem(key));
      if (Array.isArray(data)) {
        const match = data.find(s => s.name === name || s.name.includes(name));
        if (match) { found = { ...match }; break; }
      }
    } catch(e) {}
  }
  // 샘플 데이터에서 같은 학과 학생으로 매칭 (테스트용)
  if (!found) {
    for (const c of SAMPLE_COMPANIES) {
      const match = c.employees.find(e => e.dept === dept);
      if (match) { found = { ...match, name }; break; }
    }
  }
  myStudentData = found;
  renderMypage();
}

function renderMypage() {
  document.getElementById('mypageTitle').textContent = currentUser.name + '님의 마이페이지';
  if (!myStudentData) {
    document.getElementById('myDataEmpty').style.display = 'block';
    document.getElementById('myDataSection').style.display = 'none';
    return;
  }
  document.getElementById('myDataEmpty').style.display = 'none';
  document.getElementById('myDataSection').style.display = 'block';
  const s = myStudentData;
  const totalAbsent = (s.attend||[]).reduce((a,x)=>a+x.absent+x.late,0);
  const certCount   = (s.certs||[]).length;
  const leaderCount = (s.leader||[]).length;
  const clubCount   = (s.clubs||[]).filter(c=>c.name&&c.name!=='-').length;
  document.getElementById('mySpecCards').innerHTML = `
    <div style="background:var(--white);border:1px solid var(--gray-200);border-radius:var(--radius);padding:16px;text-align:center;border-bottom:3px solid var(--primary)">
      <div style="font-size:24px;font-weight:800;font-family:'Montserrat',sans-serif;color:${totalAbsent>0?'var(--danger)':'var(--success)'}">${totalAbsent>0?totalAbsent+'회':'개근'}</div>
      <div style="font-size:12px;color:var(--text-light);margin-top:3px">출결 이상</div>
    </div>
    <div style="background:var(--white);border:1px solid var(--gray-200);border-radius:var(--radius);padding:16px;text-align:center;border-bottom:3px solid var(--accent)">
      <div style="font-size:24px;font-weight:800;font-family:'Montserrat',sans-serif;color:var(--accent)">${certCount}개</div>
      <div style="font-size:12px;color:var(--text-light);margin-top:3px">자격증</div>
    </div>
    <div style="background:var(--white);border:1px solid var(--gray-200);border-radius:var(--radius);padding:16px;text-align:center;border-bottom:3px solid var(--success)">
      <div style="font-size:24px;font-weight:800;font-family:'Montserrat',sans-serif;color:var(--success)">${clubCount}개</div>
      <div style="font-size:12px;color:var(--text-light);margin-top:3px">동아리 활동</div>
    </div>
    <div style="background:var(--white);border:1px solid var(--gray-200);border-radius:var(--radius);padding:16px;text-align:center;border-bottom:3px solid #7c3aed">
      <div style="font-size:24px;font-weight:800;font-family:'Montserrat',sans-serif;color:#7c3aed">${leaderCount}회</div>
      <div style="font-size:12px;color:var(--text-light);margin-top:3px">임원 경험</div>
    </div>`;
  document.getElementById('myAttendTable').innerHTML = (s.attend||[]).map(a=>`
    <tr>
      <td style="padding:7px 10px;border-bottom:1px solid var(--gray-100);font-weight:500">${a.grade}</td>
      <td style="padding:7px 10px;border-bottom:1px solid var(--gray-100);text-align:center;color:${a.absent>0?'var(--danger)':'var(--text)'}">${a.absent}</td>
      <td style="padding:7px 10px;border-bottom:1px solid var(--gray-100);text-align:center;color:${a.late>0?'var(--danger)':'var(--text)'}">${a.late}</td>
      <td style="padding:7px 10px;border-bottom:1px solid var(--gray-100);text-align:center">${a.early}</td>
    </tr>`).join('') || '<tr><td colspan="4" style="padding:12px;text-align:center;color:var(--gray-400)">데이터 없음</td></tr>';
  document.getElementById('myCertList').innerHTML = (s.certs||[]).length
    ? s.certs.map(c=>`<span style="background:#e8eef7;color:var(--primary);padding:4px 10px;border-radius:20px;font-size:12px;font-weight:600">🏅 ${c}</span>`).join('')
    : '<span style="font-size:12px;color:var(--gray-400)">없음</span>';
  document.getElementById('myClubList').innerHTML = (s.clubs||[]).length
    ? s.clubs.map(cl=>`<div style="margin-bottom:4px"><span style="font-weight:600;color:var(--primary)">${cl.grade}</span> · ${cl.name} — ${cl.activity}</div>`).join('')
    : '<span style="color:var(--gray-400)">없음</span>';
  document.getElementById('myLeaderList').innerHTML = (s.leader||[]).length
    ? s.leader.map(l=>`<span style="background:#f3e8ff;color:#7c3aed;padding:3px 10px;border-radius:12px;font-size:12px;font-weight:600;margin:2px;display:inline-block">${l.grade} ${l.semester} ${l.role}</span>`).join('')
    : '<span style="font-size:12px;color:var(--gray-400)">없음</span>';
  const sel = document.getElementById('compareCompanySelect');
  if (sel) {
    sel.innerHTML = '<option value="">-- 업체 선택 --</option>';
    SAMPLE_COMPANIES.forEach((c,i) => {
      const opt = document.createElement('option');
      opt.value = i; opt.textContent = c.company + ' (' + c.year + ')';
      sel.appendChild(opt);
    });
  }
  renderRecommend();
  switchMyTab(0);
}

function switchMyTab(idx) {
  [0,1,2,3].forEach(i => {
    const t = document.getElementById('mytab'+i);
    const p = document.getElementById('mytabPanel'+i);
    if (!t||!p) return;
    if (i===idx) { t.style.borderBottomColor='var(--primary)';t.style.color='var(--primary)';t.style.fontWeight='600';p.style.display='block'; }
    else { t.style.borderBottomColor='transparent';t.style.color='var(--gray-400)';t.style.fontWeight='500';p.style.display='none'; }
  });
  if (idx===1) setTimeout(renderRadarChart, 50);
}

function calcSpec(student) {
  if (!student) return [0,0,0,0,0];
  const totalAbsent = (student.attend||[]).reduce((a,x)=>a+(x.absent||0)+(x.late||0),0);
  const attendScore = Math.max(0, 100 - totalAbsent*10);
  const certScore   = Math.min(100, (student.certs||[]).length*25);
  const clubScore   = Math.min(100, (student.clubs||[]).filter(c=>c.name&&c.name!=='-').length*33);
  const leaderScore = Math.min(100, (student.leader||[]).length*30);
  const gradeScore  = (student.grades||[]).length && student.grades[0].rank>0 ? Math.max(0,100-(student.grades[0].rank-1)*12) : 60;
  return [attendScore, certScore, clubScore, leaderScore, gradeScore];
}

function renderRadarChart() {
  const idx = document.getElementById('compareCompanySelect')?.value;
  const canvas = document.getElementById('radarChart');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const W=canvas.width, H=canvas.height;
  ctx.clearRect(0,0,W,H);
  const labels = ['출결','자격증','동아리','임원','성적'];
  const mySpec = calcSpec(myStudentData);
  let seniorSpec = [80,50,66,30,60];
  if (idx!=='') {
    const comp = SAMPLE_COMPANIES[parseInt(idx)];
    if (comp&&comp.employees.length) {
      const specs = comp.employees.map(e=>calcSpec(e));
      seniorSpec = [0,1,2,3,4].map(i=>Math.round(specs.reduce((a,s)=>a+s[i],0)/specs.length));
    }
  }
  drawRadar(ctx,W,H,labels,seniorSpec,mySpec);
  const tbody = document.getElementById('compareTableBody');
  const advice = document.getElementById('compareAdvice');
  if (!tbody) return;
  const lacks = [];
  tbody.innerHTML = labels.map((l,i)=>{
    const diff = mySpec[i]-seniorSpec[i];
    const color = diff>=0?'var(--success)':'var(--danger)';
    if (diff<-15) lacks.push(l);
    return `<tr>
      <td style="padding:8px 10px;border-bottom:1px solid var(--gray-100);font-weight:500">${l}</td>
      <td style="padding:8px 10px;border-bottom:1px solid var(--gray-100);text-align:center">${seniorSpec[i]}</td>
      <td style="padding:8px 10px;border-bottom:1px solid var(--gray-100);text-align:center;font-weight:600">${mySpec[i]}</td>
      <td style="padding:8px 10px;border-bottom:1px solid var(--gray-100);text-align:center;font-weight:700;color:${color}">${diff>=0?'+':''}${diff}</td>
    </tr>`;
  }).join('');
  if (lacks.length>0 && idx!=='') {
    advice.style.display='block';
    const cn = SAMPLE_COMPANIES[parseInt(idx)]?.company||'해당 업체';
    const tips={출결:'결석·지각을 줄이세요',자격증:'관련 자격증 취득을 준비하세요',동아리:'동아리 활동을 이어가세요',임원:'임원 활동에 참여해 보세요',성적:'교과 성적을 높여보세요'};
    advice.innerHTML=`💡 <strong>${cn}</strong> 선배 대비 부족한 항목:<br>`+lacks.map(l=>`· ${l}: ${tips[l]}`).join('<br>');
  } else { if(advice) advice.style.display='none'; }
}

function drawRadar(ctx,W,H,labels,d1,d2) {
  const cx=W/2, cy=H/2, r=Math.min(W,H)/2-44, n=labels.length;
  const ang=i=>(Math.PI*2*i/n)-Math.PI/2;
  ctx.strokeStyle='#e2e6ef'; ctx.lineWidth=1;
  [20,40,60,80,100].forEach(p=>{
    ctx.beginPath();
    for(let i=0;i<n;i++){
      const x=cx+r*(p/100)*Math.cos(ang(i)), y=cy+r*(p/100)*Math.sin(ang(i));
      i===0?ctx.moveTo(x,y):ctx.lineTo(x,y);
    }
    ctx.closePath(); ctx.stroke();
  });
  for(let i=0;i<n;i++){
    ctx.beginPath();ctx.moveTo(cx,cy);
    ctx.lineTo(cx+r*Math.cos(ang(i)),cy+r*Math.sin(ang(i)));
    ctx.strokeStyle='#e2e6ef';ctx.stroke();
  }
  ctx.fillStyle='#5a6480';ctx.font='11px Noto Sans KR,sans-serif';ctx.textAlign='center';
  for(let i=0;i<n;i++){
    const x=cx+(r+20)*Math.cos(ang(i)), y=cy+(r+20)*Math.sin(ang(i));
    ctx.fillText(labels[i],x,y+4);
  }
  const area=(data,color,fill)=>{
    ctx.beginPath();
    for(let i=0;i<n;i++){
      const v=data[i]/100, x=cx+r*v*Math.cos(ang(i)), y=cy+r*v*Math.sin(ang(i));
      i===0?ctx.moveTo(x,y):ctx.lineTo(x,y);
    }
    ctx.closePath();ctx.fillStyle=fill;ctx.fill();
    ctx.strokeStyle=color;ctx.lineWidth=2;ctx.stroke();
  };
  area(d1,'rgba(26,58,107,0.8)','rgba(26,58,107,0.12)');
  area(d2,'rgba(232,160,32,0.9)','rgba(232,160,32,0.18)');
}

function renderRecommend() {
  const list=document.getElementById('recommendList');
  if(!list||!myStudentData) return;
  const mySpec=calcSpec(myStudentData);
  const scored=SAMPLE_COMPANIES.map((c,i)=>{
    const specs=c.employees.map(e=>calcSpec(e));
    const avg=[0,1,2,3,4].map(j=>specs.reduce((a,s)=>a+s[j],0)/specs.length);
    const diff=avg.reduce((a,v,j)=>a+Math.abs(v-mySpec[j]),0)/5;
    return {idx:i,company:c.company,year:c.year,count:c.count,score:Math.round(Math.max(0,100-diff))};
  }).sort((a,b)=>b.score-a.score);
  list.innerHTML=scored.map((item,rank)=>{
    const color=rank===0?'var(--accent)':rank===1?'var(--primary)':rank===2?'var(--success)':'var(--gray-400)';
    const medal=rank===0?'🥇':rank===1?'🥈':rank===2?'🥉':`${rank+1}위`;
    return `<div style="background:var(--gray-50);border:1px solid var(--gray-200);border-radius:10px;padding:14px;margin-bottom:10px;display:flex;align-items:center;gap:14px">
      <div style="font-size:20px;flex-shrink:0">${medal}</div>
      <div style="flex:1;min-width:0">
        <div style="display:flex;align-items:center;gap:8px;margin-bottom:5px">
          <span style="font-size:14px;font-weight:700">${item.company}</span>
          <span style="font-size:11px;color:var(--gray-400)">${item.year}년·${item.count}명</span>
        </div>
        <div style="background:var(--gray-200);border-radius:4px;height:5px;overflow:hidden">
          <div style="height:100%;background:${color};border-radius:4px;width:${item.score}%"></div>
        </div>
      </div>
      <div style="text-align:right;flex-shrink:0">
        <div style="font-size:18px;font-weight:800;font-family:'Montserrat',sans-serif;color:${color}">${item.score}점</div>
        <div style="font-size:11px;color:var(--gray-400)">적합도</div>
      </div>
      <button onclick="document.getElementById('compareCompanySelect').value=${item.idx};switchMyTab(1)"
        style="background:var(--primary);color:#fff;border:none;border-radius:6px;padding:6px 12px;font-size:12px;cursor:pointer;font-family:'Noto Sans KR',sans-serif;flex-shrink:0">비교</button>
    </div>`;
  }).join('');
}

// ══════════════════════════════
// PDF.js 워커 설정
// ══════════════════════════════
if (typeof pdfjsLib !== 'undefined') {
  pdfjsLib.GlobalWorkerOptions.workerSrc =
    'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
}

// 학급 데이터 저장소
let classStudents = [];

// ══════════════════════════════
// 폴더 업로드 처리
// ══════════════════════════════
function handleDrop(e) {
  e.preventDefault();
  document.getElementById('dropZone').style.borderColor = 'var(--gray-200)';
  const files = [...e.dataTransfer.files].filter(f => f.name.toLowerCase().endsWith('.pdf'));
  if (files.length > 0) processFiles(files);
  else showToast('⚠️ PDF 파일이 없습니다');
}

function handleFolderUpload(e) {
  const files = [...e.target.files].filter(f => f.name.toLowerCase().endsWith('.pdf'));
  if (files.length > 0) processFiles(files);
  else showToast('⚠️ PDF 파일이 없습니다');
}

async function processFiles(files) {
  classStudents = [];
  document.getElementById('dropZone').style.display = 'none';
  document.getElementById('progressArea').style.display = 'block';
  document.getElementById('classSummary').style.display = 'none';
  document.getElementById('classTabBar').style.display = 'none';
  document.getElementById('classTabContent').style.display = 'none';
  document.getElementById('btnExcelExport').style.display = 'none';

  const total = files.length;
  const log = document.getElementById('progressLog');
  log.innerHTML = '';

  for (let i = 0; i < files.length; i++) {
    const f = files[i];
    document.getElementById('progressText').textContent = `파싱 중: ${f.name}`;
    document.getElementById('progressCount').textContent = `${i+1}/${total}`;
    document.getElementById('progressBar').style.width = ((i+1)/total*100) + '%';

    try {
      const text = await extractPdfText(f);
      const student = parseNEIS(text, f.name);
      classStudents.push(student);
      log.innerHTML += `<span style="color:var(--success)">✅ ${student.name}</span> — 출결·성적·자격증·동아리·임원 파싱 완료<br>`;
    } catch(err) {
      log.innerHTML += `<span style="color:var(--danger)">❌ ${f.name}</span> — 파싱 실패<br>`;
    }
    log.scrollTop = log.scrollHeight;
    await new Promise(r => setTimeout(r, 10));
  }

  document.getElementById('progressText').textContent = `✅ 파싱 완료 (${classStudents.length}명)`;
  setTimeout(() => {
    document.getElementById('progressArea').style.display = 'none';
    renderClassData();
  }, 800);
}

// ══════════════════════════════
// PDF 텍스트 추출
// ══════════════════════════════
async function extractPdfText(file) {
  const buf = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: buf }).promise;
  let text = '';
  for (let p = 1; p <= pdf.numPages; p++) {
    const page = await pdf.getPage(p);
    const content = await page.getTextContent();
    text += content.items.map(i => i.str).join(' ') + '\n';
  }
  return text;
}

// ══════════════════════════════
// NEIS 생활기록부 파싱
// ══════════════════════════════
function parseNEIS(text, filename) {
  // 파일명에서 이름 추출 (학번_이름.pdf 또는 이름.pdf)
  let name = filename.replace(/\.pdf$/i, '');
  const m = name.match(/[_\-\s](.+)$/) || name.match(/\d+(.+)$/);
  if (m) name = m[1].trim();
  if (!name || name.length < 2) name = filename.replace(/\.pdf$/i, '');

  return {
    name,
    attend:    parseAttend(text),
    grades:    parseGrades(text),
    certs:     parseCerts(text),
    clubs:     parseClubs(text),
    leader:    parseLeader(text),
  };
}

// 출결 파싱
function parseAttend(text) {
  const result = [];
  const gradeLabels = ['1학년','2학년','3학년'];
  // NEIS 출결: "수업일수" 패턴 앞뒤 숫자 추출
  const daysPat = /(\d+)\s*수업일수/g;
  const absPat  = /결석\s*일수.*?(\d+)/g;
  // 학년별 섹션 분리 시도
  for (let g = 0; g < 3; g++) {
    const label = gradeLabels[g];
    // 학년 구간 텍스트 찾기
    const gIdx = text.indexOf(label);
    const nextIdx = g < 2 ? text.indexOf(gradeLabels[g+1], gIdx+1) : text.length;
    const chunk = gIdx >= 0 ? text.slice(gIdx, nextIdx > 0 ? nextIdx : gIdx + 2000) : '';

    const days   = parseInt(chunk.match(/(\d{2,3})\s*(?:수업일수|일수)/)?.[1] || '190');
    const absent = parseInt(chunk.match(/결석[^0-9]*(\d+)/)?.[1] || '0');
    const late   = parseInt(chunk.match(/지각[^0-9]*(\d+)/)?.[1] || '0');
    const early  = parseInt(chunk.match(/조퇴[^0-9]*(\d+)/)?.[1] || '0');
    const miss   = parseInt(chunk.match(/결과[^0-9]*(\d+)/)?.[1] || '0');
    result.push({ grade: label, days: days||190, absent, late, early, miss });
  }
  return result;
}

// 교과 성적 파싱
function parseGrades(text) {
  const grades = [];
  // 등급 패턴: 1~9 단독 등장
  const pat = /([가-힣\s]+과목|[가-힣]+)\s+(\d)\s+(\d{2,3})\s+[\d.]+\s+[\d.]+\s+([A-E])\s+\d+\s+(\d)/g;
  let m;
  while ((m = pat.exec(text)) !== null) {
    grades.push({
      category: '교과',
      subject: m[1].trim().slice(0,10),
      unit: parseInt(m[2]),
      score: parseInt(m[3]),
      achieve: m[4],
      rank: parseInt(m[5]),
    });
    if (grades.length >= 20) break;
  }
  // 파싱 실패 시 샘플 반환
  if (grades.length === 0) {
    grades.push({ category:'교과', subject:'파싱 대기', unit:0, score:0, achieve:'-', rank:0 });
  }
  return grades;
}

// 자격증 파싱
function parseCerts(text) {
  const certs = [];
  // "자격증 및 인증 취득상황" 섹션
  const idx = text.search(/자격증.*취득/);
  if (idx < 0) return certs;
  const chunk = text.slice(idx, idx + 800);
  // 기능사, 산업기사, 기사 등 패턴
  const pat = /([가-힣\s]+(?:기사|산업기사|기능사|자격증|면허|인증))/g;
  let m;
  while ((m = pat.exec(chunk)) !== null) {
    const cert = m[1].trim();
    if (cert.length > 2 && cert.length < 20 && !certs.includes(cert)) certs.push(cert);
    if (certs.length >= 6) break;
  }
  return certs;
}

// 동아리 파싱
function parseClubs(text) {
  const clubs = [];
  const gradeLabels = ['1학년','2학년','3학년'];
  const idx = text.search(/동아리/);
  if (idx < 0) return clubs;
  const chunk = text.slice(idx, idx + 2000);

  for (let g = 0; g < 3; g++) {
    // 동아리명 패턴 (괄호 포함 또는 단어)
    const namePat = /([가-힣a-zA-Z]+(?:반|부|클럽|동아리|팀|Club))/;
    const gChunk = chunk.slice(chunk.search(gradeLabels[g]) + 3, chunk.search(gradeLabels[g+1] || '임원') + 1 || 600);
    const nameM = gChunk.match(namePat);
    const name  = nameM ? nameM[1] : '-';
    // 활동 내용 (첫 문장)
    const actM  = gChunk.match(/[가-힣\s]{10,50}(?:실습|제작|활동|연구|참가|설계|구현|학습)/);
    const activity = actM ? actM[0].trim().slice(0,30) : '활동 내용 파싱 중';
    clubs.push({ grade: gradeLabels[g], name, activity });
  }
  return clubs;
}

// 학급임원 파싱
function parseLeader(text) {
  const leaders = [];
  const gradeLabels = ['1학년','2학년','3학년'];
  // "반장" "부반장" 패턴
  const pat = /([1-3])학년\s*([1-2])학기[^반부]*([반부]반장)/g;
  let m;
  while ((m = pat.exec(text)) !== null) {
    leaders.push({
      grade: m[1] + '학년',
      semester: m[2] + '학기',
      role: m[3],
    });
  }
  return leaders;
}

// ══════════════════════════════
// 학급 데이터 렌더링
// ══════════════════════════════
function renderClassData() {
  if (!classStudents.length) return;
  // ★ 학생 데이터 localStorage에 저장 (마이페이지 매칭용)
  const key = 'classData_' + (currentUser.dept||'') + '_' + (currentUser.classCode||'');
  try { localStorage.setItem(key, JSON.stringify(classStudents)); } catch(e) {}

  // 요약 카드
  document.getElementById('classSummary').style.display = 'block';
  document.getElementById('classTabBar').style.display = 'block';
  document.getElementById('classTabContent').style.display = 'block';
  document.getElementById('btnExcelExport').style.display = 'flex';

  const total = classStudents.length;
  const perfect = classStudents.filter(s => s.attend.every(a => a.absent===0 && a.late===0)).length;
  const avgCerts = total ? (classStudents.reduce((s,st)=>s+st.certs.length,0)/total).toFixed(1) : 0;
  const leaders = classStudents.filter(s => s.leader.length > 0).length;
  const absents = classStudents.filter(s => s.attend.some(a => a.absent > 0)).length;

  document.getElementById('sumTotal').textContent   = total;
  document.getElementById('sumPerfect').textContent = perfect;
  document.getElementById('sumCerts').textContent   = avgCerts;
  document.getElementById('sumLeader').textContent  = leaders;
  document.getElementById('sumAbsent').textContent  = absents;

  // 탭 렌더
  renderClassList();
  renderClassAttend();
  renderClassCerts();
  renderClassClubs();
  renderClassLeaders();
  switchClassTab(0);
}

function tdN(v, warn) {
  return `<td style="padding:9px 12px;border-bottom:1px solid var(--gray-100);text-align:center;color:${warn&&v>0?'var(--danger)':'var(--text)'};font-weight:${warn&&v>0?600:400}">${v}</td>`;
}

function renderClassList() {
  document.getElementById('classListTable').innerHTML = classStudents.map((s,i) => {
    const totalAbsent = s.attend.reduce((a,x)=>a+x.absent+x.late,0);
    const hasAbsent = totalAbsent > 0;
    return `<tr>
      <td style="padding:10px 12px;border-bottom:1px solid var(--gray-100);font-weight:600">${s.name}</td>
      <td style="padding:10px 12px;border-bottom:1px solid var(--gray-100);text-align:center">
        ${hasAbsent ? `<span style="color:var(--danger);font-weight:600">⚠ ${totalAbsent}회</span>` : '<span style="color:var(--success)">✅ 없음</span>'}
      </td>
      <td style="padding:10px 12px;border-bottom:1px solid var(--gray-100);text-align:center">
        ${s.certs.length > 0 ? `<span style="font-weight:600;color:var(--accent)">${s.certs.length}개</span>` : '<span style="color:var(--gray-400)">0개</span>'}
      </td>
      <td style="padding:10px 12px;border-bottom:1px solid var(--gray-100);text-align:center;font-size:12px;color:var(--text-light)">
        ${s.clubs.map(c=>c.name).filter(n=>n!=='-').join(' / ') || '-'}
      </td>
      <td style="padding:10px 12px;border-bottom:1px solid var(--gray-100);text-align:center">
        ${s.leader.length > 0 ? `<span style="background:#f3e8ff;color:#7c3aed;padding:2px 8px;border-radius:12px;font-size:11px;font-weight:600">${s.leader.length}회</span>` : '<span style="color:var(--gray-400)">-</span>'}
      </td>
      <td style="padding:10px 12px;border-bottom:1px solid var(--gray-100);text-align:center">
        <button onclick="openClassStudent(${i})"
          style="background:var(--primary);color:#fff;border:none;border-radius:6px;padding:4px 12px;font-size:12px;cursor:pointer;font-family:'Noto Sans KR',sans-serif">
          상세보기
        </button>
      </td>
    </tr>`;
  }).join('');
}

function renderClassAttend() {
  document.getElementById('classAttendTable').innerHTML = classStudents.map(s => {
    const g = [0,1,2].map(i => s.attend[i] || {absent:0,late:0,early:0,miss:0});
    const total = g.reduce((a,x)=>a+x.absent+x.late,0);
    return `<tr>
      <td style="padding:9px 12px;border-bottom:1px solid var(--gray-100);font-weight:600">${s.name}</td>
      ${tdN(g[0].absent,true)}${tdN(g[0].late,true)}
      ${tdN(g[1].absent,true)}${tdN(g[1].late,true)}
      ${tdN(g[2].absent,true)}${tdN(g[2].late,true)}
      <td style="padding:9px 12px;border-bottom:1px solid var(--gray-100);text-align:center;font-weight:700;color:${total>0?'var(--danger)':'var(--success)'}">${total}</td>
    </tr>`;
  }).join('');
}

function renderClassCerts() {
  document.getElementById('classCertTable').innerHTML = classStudents
    .sort((a,b)=>b.certs.length-a.certs.length)
    .map(s => `<tr>
      <td style="padding:9px 12px;border-bottom:1px solid var(--gray-100);font-weight:600">${s.name}</td>
      <td style="padding:9px 12px;border-bottom:1px solid var(--gray-100);text-align:center;font-weight:700;color:${s.certs.length>0?'var(--accent)':'var(--gray-400)'}">${s.certs.length}개</td>
      <td style="padding:9px 12px;border-bottom:1px solid var(--gray-100);font-size:12px">
        ${s.certs.length > 0
          ? s.certs.map(c=>`<span style="background:#e8eef7;color:var(--primary);padding:2px 8px;border-radius:12px;margin:2px;display:inline-block">🏅 ${c}</span>`).join('')
          : '<span style="color:var(--gray-400)">없음</span>'}
      </td>
    </tr>`).join('');
}

function renderClassClubs() {
  document.getElementById('classClubTable').innerHTML = classStudents.map(s => {
    const c = [0,1,2].map(i => s.clubs[i]?.name || '-');
    return `<tr>
      <td style="padding:9px 12px;border-bottom:1px solid var(--gray-100);font-weight:600">${s.name}</td>
      <td style="padding:9px 12px;border-bottom:1px solid var(--gray-100);text-align:center;font-size:12px">${c[0]}</td>
      <td style="padding:9px 12px;border-bottom:1px solid var(--gray-100);text-align:center;font-size:12px">${c[1]}</td>
      <td style="padding:9px 12px;border-bottom:1px solid var(--gray-100);text-align:center;font-size:12px">${c[2]}</td>
    </tr>`;
  }).join('');
}

function renderClassLeaders() {
  document.getElementById('classLeaderTable').innerHTML = classStudents
    .sort((a,b)=>b.leader.length-a.leader.length)
    .map(s => `<tr>
      <td style="padding:9px 12px;border-bottom:1px solid var(--gray-100);font-weight:600">${s.name}</td>
      <td style="padding:9px 12px;border-bottom:1px solid var(--gray-100);text-align:center;font-weight:700;color:${s.leader.length>0?'#7c3aed':'var(--gray-400)'}">${s.leader.length}회</td>
      <td style="padding:9px 12px;border-bottom:1px solid var(--gray-100);font-size:12px">
        ${s.leader.length > 0
          ? s.leader.map(l=>`<span style="background:#f3e8ff;color:#7c3aed;padding:2px 8px;border-radius:12px;margin:2px;display:inline-block">${l.grade} ${l.semester} ${l.role}</span>`).join('')
          : '<span style="color:var(--gray-400)">없음</span>'}
      </td>
    </tr>`).join('');
}

// ══════════════════════════════
// 학급탭 전환
// ══════════════════════════════
function switchClassTab(idx) {
  [0,1,2,3,4].forEach(i => {
    const tab   = document.getElementById('ctab' + i);
    const panel = document.getElementById('ctabPanel' + i);
    if (i === idx) {
      tab.style.borderBottomColor = 'var(--primary)';
      tab.style.color = 'var(--primary)';
      tab.style.fontWeight = '600';
      panel.style.display = 'block';
    } else {
      tab.style.borderBottomColor = 'transparent';
      tab.style.color = 'var(--gray-400)';
      tab.style.fontWeight = '500';
      panel.style.display = 'none';
    }
  });
}

// ══════════════════════════════
// 학급 학생 상세 모달 탭 전환
// ══════════════════════════════
function switchCsTab(idx) {
  [0,1,2].forEach(i => {
    const t = document.getElementById('cstab'+i);
    const p = document.getElementById('cstabPanel'+i);
    if (!t||!p) return;
    if (i===idx) {
      t.style.borderBottomColor='var(--primary)'; t.style.color='var(--primary)'; t.style.fontWeight='600';
      p.style.display='block';
    } else {
      t.style.borderBottomColor='transparent'; t.style.color='var(--gray-400)'; t.style.fontWeight='500';
      p.style.display='none';
    }
  });
  if (idx===1) setTimeout(renderCsRadar, 50);
}

// ── 현재 열린 학생 데이터 저장
let _csStudent = null;

function openClassStudent(idx) {
  const s = classStudents[idx];
  if (!s) return;
  _csStudent = s;

  document.getElementById('csName').textContent = s.name;
  document.getElementById('csMeta').textContent = (currentUser.dept||'') + ' ' + (currentUser.classCode||'');

  // 출결
  document.getElementById('csAttend').innerHTML = s.attend.map(a => `
    <tr>
      <td style="padding:9px 12px;border-bottom:1px solid var(--gray-100);font-weight:600">${a.grade}</td>
      <td style="padding:9px 12px;border-bottom:1px solid var(--gray-100);text-align:center">${a.days}일</td>
      ${tdN(a.absent,true)}${tdN(a.late,true)}${tdN(a.early,true)}${tdN(a.miss,true)}
    </tr>`).join('');

  // 성적
  document.getElementById('csGrades').innerHTML = s.grades.length && s.grades[0].subject !== '파싱 대기'
    ? s.grades.map(g => `
      <tr>
        <td style="padding:9px 12px;border-bottom:1px solid var(--gray-100);font-size:12px;color:var(--gray-600)">${g.category}</td>
        <td style="padding:9px 12px;border-bottom:1px solid var(--gray-100);font-weight:500">${g.subject}</td>
        <td style="padding:9px 12px;border-bottom:1px solid var(--gray-100);text-align:center">${g.unit||'-'}</td>
        <td style="padding:9px 12px;border-bottom:1px solid var(--gray-100);text-align:center">${g.score||'-'}</td>
        <td style="padding:9px 12px;border-bottom:1px solid var(--gray-100);text-align:center">
          <span style="background:${g.achieve==='A'?'#dcfce7':g.achieve==='B'?'#dbeafe':'var(--gray-100)'};color:${g.achieve==='A'?'var(--success)':g.achieve==='B'?'#1d4ed8':'var(--gray-600)'};padding:2px 8px;border-radius:12px;font-size:12px;font-weight:600">${g.achieve}</span>
        </td>
        <td style="padding:9px 12px;border-bottom:1px solid var(--gray-100);text-align:center;font-weight:700;color:var(--primary)">${g.rank||'-'}등급</td>
      </tr>`).join('')
    : `<tr><td colspan="6" style="padding:14px;text-align:center;color:var(--gray-400);font-size:13px">성적 데이터를 파싱 중입니다</td></tr>`;

  // 자격증
  document.getElementById('csCerts').innerHTML = s.certs.length
    ? s.certs.map(c=>`<span style="background:#e8eef7;color:var(--primary);padding:4px 10px;border-radius:20px;font-size:12px;font-weight:600">🏅 ${c}</span>`).join('')
    : '<span style="font-size:12px;color:var(--gray-400)">없음</span>';

  // 동아리 간략
  document.getElementById('csClubSimple').innerHTML = s.clubs.length
    ? s.clubs.map(cl=>`<span style="font-weight:600;color:var(--primary)">${cl.grade}</span> · ${cl.name}<br>`).join('')
    : '<span style="color:var(--gray-400)">없음</span>';

  // 동아리 상세
  document.getElementById('csClub').innerHTML = s.clubs.length
    ? s.clubs.map(cl=>`
      <tr>
        <td style="padding:9px 12px;border-bottom:1px solid var(--gray-100);text-align:center;font-weight:600;color:var(--primary)">${cl.grade}</td>
        <td style="padding:9px 12px;border-bottom:1px solid var(--gray-100);font-weight:600">${cl.name}</td>
        <td style="padding:9px 12px;border-bottom:1px solid var(--gray-100);font-size:13px;color:var(--text-light)">${cl.activity}</td>
      </tr>`).join('')
    : `<tr><td colspan="3" style="padding:14px;text-align:center;color:var(--gray-400)">없음</td></tr>`;

  // 임원
  document.getElementById('csLeader').innerHTML = s.leader.length
    ? s.leader.map(l=>`
      <tr>
        <td style="padding:9px 12px;border-bottom:1px solid var(--gray-100);text-align:center;font-weight:500">${l.grade}</td>
        <td style="padding:9px 12px;border-bottom:1px solid var(--gray-100);text-align:center">${l.semester}</td>
        <td style="padding:9px 12px;border-bottom:1px solid var(--gray-100)">
          <span style="background:#f3e8ff;color:#7c3aed;padding:3px 10px;border-radius:12px;font-size:12px;font-weight:600">${l.role}</span>
        </td>
      </tr>`).join('')
    : `<tr><td colspan="3" style="padding:14px;text-align:center;color:var(--gray-400)">없음</td></tr>`;

  // 스펙비교 업체 드롭다운
  const sel = document.getElementById('csCompareSelect');
  if (sel) {
    sel.innerHTML = '<option value="">-- 업체 선택 --</option>';
    SAMPLE_COMPANIES.forEach((c,i) => {
      const opt = document.createElement('option');
      opt.value=i; opt.textContent=c.company+' ('+c.year+')';
      sel.appendChild(opt);
    });
  }

  // 추천 업체
  renderCsRecommend(s);

  switchCsTab(0);
  document.getElementById('classStudentModal').classList.add('open');
}

// ── 학생 레이더 차트
function renderCsRadar() {
  if (!_csStudent) return;
  const idx = document.getElementById('csCompareSelect')?.value;
  const canvas = document.getElementById('csRadarChart');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const W=canvas.width, H=canvas.height;
  ctx.clearRect(0,0,W,H);
  const labels=['출결','자격증','동아리','임원','성적'];
  const sSpec = calcSpec(_csStudent);
  let seniorSpec=[80,50,66,30,60];
  if (idx!=='') {
    const comp=SAMPLE_COMPANIES[parseInt(idx)];
    if (comp&&comp.employees.length) {
      const specs=comp.employees.map(e=>calcSpec(e));
      seniorSpec=[0,1,2,3,4].map(i=>Math.round(specs.reduce((a,s)=>a+s[i],0)/specs.length));
    }
  }
  drawRadar(ctx,W,H,labels,seniorSpec,sSpec);

  // 비교표
  const tbody=document.getElementById('csCompareBody');
  const advice=document.getElementById('csCompareAdvice');
  if (!tbody) return;
  const lacks=[];
  tbody.innerHTML=labels.map((l,i)=>{
    const diff=sSpec[i]-seniorSpec[i];
    const color=diff>=0?'var(--success)':'var(--danger)';
    if(diff<-15) lacks.push(l);
    return `<tr>
      <td style="padding:8px 10px;border-bottom:1px solid var(--gray-100);font-weight:500">${l}</td>
      <td style="padding:8px 10px;border-bottom:1px solid var(--gray-100);text-align:center">${seniorSpec[i]}</td>
      <td style="padding:8px 10px;border-bottom:1px solid var(--gray-100);text-align:center;font-weight:600">${sSpec[i]}</td>
      <td style="padding:8px 10px;border-bottom:1px solid var(--gray-100);text-align:center;font-weight:700;color:${color}">${diff>=0?'+':''}${diff}</td>
    </tr>`;
  }).join('');

  if (lacks.length>0&&idx!=='') {
    advice.style.display='block';
    const cn=SAMPLE_COMPANIES[parseInt(idx)]?.company||'해당 업체';
    const tips={출결:'결석·지각을 줄여야 합니다',자격증:'관련 자격증 취득이 필요합니다',동아리:'동아리 활동을 늘려야 합니다',임원:'임원 활동 경험이 부족합니다',성적:'교과 성적 향상이 필요합니다'};
    advice.innerHTML=`💡 <strong>${cn}</strong> 진출을 위해 보완 필요:<br>`+lacks.map(l=>`· ${l}: ${tips[l]}`).join('<br>');
  } else { if(advice) advice.style.display='none'; }
}

// ── 학생 추천 업체
function renderCsRecommend(s) {
  const list=document.getElementById('csRecommendList');
  if(!list) return;
  const sSpec=calcSpec(s);
  const scored=SAMPLE_COMPANIES.map((c,i)=>{
    const specs=c.employees.map(e=>calcSpec(e));
    const avg=[0,1,2,3,4].map(j=>specs.reduce((a,sp)=>a+sp[j],0)/specs.length);
    const diff=avg.reduce((a,v,j)=>a+Math.abs(v-sSpec[j]),0)/5;
    return {idx:i,company:c.company,year:c.year,count:c.count,score:Math.round(Math.max(0,100-diff))};
  }).sort((a,b)=>b.score-a.score);

  list.innerHTML=scored.map((item,rank)=>{
    const color=rank===0?'var(--accent)':rank===1?'var(--primary)':rank===2?'var(--success)':'var(--gray-400)';
    const medal=rank===0?'🥇':rank===1?'🥈':rank===2?'🥉':`${rank+1}위`;
    return `<div style="background:var(--gray-50);border:1px solid var(--gray-200);border-radius:10px;padding:14px;margin-bottom:10px;display:flex;align-items:center;gap:14px">
      <div style="font-size:20px;flex-shrink:0">${medal}</div>
      <div style="flex:1;min-width:0">
        <div style="display:flex;align-items:center;gap:8px;margin-bottom:5px">
          <span style="font-size:14px;font-weight:700">${item.company}</span>
          <span style="font-size:11px;color:var(--gray-400)">${item.year}년·${item.count}명</span>
        </div>
        <div style="background:var(--gray-200);border-radius:4px;height:5px;overflow:hidden">
          <div style="height:100%;background:${color};border-radius:4px;width:${item.score}%"></div>
        </div>
      </div>
      <div style="text-align:right;flex-shrink:0">
        <div style="font-size:18px;font-weight:800;font-family:'Montserrat',sans-serif;color:${color}">${item.score}점</div>
        <div style="font-size:11px;color:var(--gray-400)">적합도</div>
      </div>
      <button onclick="document.getElementById('csCompareSelect').value=${item.idx};switchCsTab(1)"
        style="background:var(--primary);color:#fff;border:none;border-radius:6px;padding:6px 12px;font-size:12px;cursor:pointer;font-family:'Noto Sans KR',sans-serif;flex-shrink:0">비교</button>
    </div>`;
  }).join('');
}

// ══════════════════════════════
// 엑셀 다운로드 (CSV)
// ══════════════════════════════
function exportClassExcel() {
  if (!classStudents.length) { showToast('⚠️ 데이터가 없습니다'); return; }
  let csv = '\uFEFF이름,1학년결석,1학년지각,2학년결석,2학년지각,3학년결석,3학년지각,자격증수,자격증목록,동아리(1),동아리(2),동아리(3),임원횟수,임원이력\n';
  classStudents.forEach(s => {
    const g = [0,1,2].map(i => s.attend[i] || {absent:0,late:0});
    csv += [
      s.name,
      g[0].absent, g[0].late,
      g[1].absent, g[1].late,
      g[2].absent, g[2].late,
      s.certs.length,
      '"' + s.certs.join(', ') + '"',
      s.clubs[0]?.name||'-',
      s.clubs[1]?.name||'-',
      s.clubs[2]?.name||'-',
      s.leader.length,
      '"' + s.leader.map(l=>l.grade+' '+l.semester+' '+l.role).join(', ') + '"'
    ].join(',') + '\n';
  });
  const blob = new Blob([csv], { type:'text/csv;charset=utf-8' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href = url;
  a.download = (currentUser.dept||'학급') + '_' + (currentUser.classCode||'') + '_학생현황.csv';
  a.click();
  URL.revokeObjectURL(url);
  showToast('✅ 엑셀 파일을 다운로드했습니다');
}
function openCompanyDetail(idx) {
  const c = SAMPLE_COMPANIES[idx];
  if (!c) return;
  document.getElementById('compDetailCompany').textContent = c.company;
  document.getElementById('compDetailYear').textContent = c.year + '년 취업자 ' + c.count + '명';

  const tbody  = document.getElementById('compDetailTable');
  const notice = document.getElementById('compDetailNotice');
  const isStaff = currentRole === 'admin' || currentRole === 'homeroom';

  if (!currentRole) {
    tbody.innerHTML = `<tr><td colspan="4" style="padding:28px;text-align:center;color:var(--gray-400)">🔒 로그인 후 열람 가능합니다</td></tr>`;
    notice.style.display = 'none';
  } else {
    notice.style.display = 'block';
    notice.innerHTML = '🔒 개인정보 보호를 위해 이름 일부가 가려집니다'
      + (isStaff ? ' &nbsp;|&nbsp; 상세보기 클릭 시 출결·성적·동아리·임원 정보 확인 가능' : '');
    tbody.innerHTML = c.employees.map((e, i) => `
      <tr>
        <td style="padding:10px 12px;border-bottom:1px solid var(--gray-100)">${maskName(e.name)}</td>
        <td style="padding:10px 12px;border-bottom:1px solid var(--gray-100)">${e.dept}</td>
        <td style="padding:10px 12px;border-bottom:1px solid var(--gray-100);text-align:center">${c.year}년</td>
        <td style="padding:10px 12px;border-bottom:1px solid var(--gray-100);text-align:center">
          ${isStaff
            ? `<button onclick="openStudentProfile(${idx},${i})"
                style="background:var(--primary);color:#fff;border:none;border-radius:6px;padding:4px 12px;font-size:12px;cursor:pointer;font-family:'Noto Sans KR',sans-serif;">
                상세보기
               </button>`
            : '<span style="font-size:12px;color:var(--gray-400)">-</span>'}
        </td>
      </tr>`).join('');
  }
  document.getElementById('companyDetailModal').classList.add('open');
}

// ══════════════════════════════
// 학생 통합 프로필 모달
// ══════════════════════════════
function openStudentProfile(compIdx, empIdx) {
  const c = SAMPLE_COMPANIES[compIdx];
  const e = c.employees[empIdx];
  if (!e) return;

  document.getElementById('profName').textContent = maskName(e.name) + ' (' + e.dept + ')';
  document.getElementById('profMeta').textContent = c.company + ' · ' + c.year + '년 취업';

  // 출결
  const td = (v, warn) => `<td style="padding:9px 12px;border-bottom:1px solid var(--gray-100);text-align:center;color:${warn&&v>0?'var(--danger)':'var(--text)'};font-weight:${warn&&v>0?600:400}">${v}</td>`;
  document.getElementById('profAttend').innerHTML = e.attend.map(a => `
    <tr>
      <td style="padding:9px 12px;border-bottom:1px solid var(--gray-100);font-weight:600">${a.grade}</td>
      <td style="padding:9px 12px;border-bottom:1px solid var(--gray-100);text-align:center">${a.days}일</td>
      ${td(a.absent,true)}${td(a.late,true)}${td(a.early,true)}${td(a.miss,true)}
    </tr>`).join('');

  // 성적
  document.getElementById('profGrades').innerHTML = e.grades.length
    ? e.grades.map(g => `
      <tr>
        <td style="padding:9px 12px;border-bottom:1px solid var(--gray-100);font-size:12px;color:var(--gray-600)">${g.category}</td>
        <td style="padding:9px 12px;border-bottom:1px solid var(--gray-100);font-weight:500">${g.subject}</td>
        <td style="padding:9px 12px;border-bottom:1px solid var(--gray-100);text-align:center">${g.unit}</td>
        <td style="padding:9px 12px;border-bottom:1px solid var(--gray-100);text-align:center">${g.score}</td>
        <td style="padding:9px 12px;border-bottom:1px solid var(--gray-100);text-align:center">
          <span style="background:${g.achieve==='A'?'#dcfce7':g.achieve==='B'?'#dbeafe':'var(--gray-100)'};color:${g.achieve==='A'?'var(--success)':g.achieve==='B'?'#1d4ed8':'var(--gray-600)'};padding:2px 8px;border-radius:12px;font-size:12px;font-weight:600">${g.achieve}</span>
        </td>
        <td style="padding:9px 12px;border-bottom:1px solid var(--gray-100);text-align:center;font-weight:700;color:var(--primary)">${g.rank}등급</td>
      </tr>`).join('')
    : `<tr><td colspan="6" style="padding:14px;text-align:center;color:var(--gray-400);font-size:13px">생활기록부 연계 후 표시됩니다</td></tr>`;

  // 자격증
  document.getElementById('profCerts').innerHTML = e.certs.length
    ? e.certs.map(cert => `<span style="background:#e8eef7;color:var(--primary);padding:5px 12px;border-radius:20px;font-size:12px;font-weight:600;border:1px solid rgba(26,58,107,0.15)">🏅 ${cert}</span>`).join('')
    : '<span style="font-size:13px;color:var(--gray-400)">취득 자격증 없음</span>';

  // 동아리
  document.getElementById('profClub').innerHTML = e.clubs.length
    ? e.clubs.map(cl => `
      <tr>
        <td style="padding:9px 12px;border-bottom:1px solid var(--gray-100);text-align:center;font-weight:600;color:var(--primary)">${cl.grade}</td>
        <td style="padding:9px 12px;border-bottom:1px solid var(--gray-100);font-weight:600">${cl.name}</td>
        <td style="padding:9px 12px;border-bottom:1px solid var(--gray-100);font-size:13px;color:var(--text-light)">${cl.activity}</td>
      </tr>`).join('')
    : `<tr><td colspan="3" style="padding:14px;text-align:center;color:var(--gray-400);font-size:13px">동아리 활동 내역 없음</td></tr>`;

  // 학급임원
  document.getElementById('profLeaderTable').innerHTML = e.leader.length
    ? e.leader.map(l => `
      <tr>
        <td style="padding:9px 12px;border-bottom:1px solid var(--gray-100);text-align:center;font-weight:500">${l.grade}</td>
        <td style="padding:9px 12px;border-bottom:1px solid var(--gray-100);text-align:center">${l.semester}</td>
        <td style="padding:9px 12px;border-bottom:1px solid var(--gray-100)">
          <span style="background:#f3e8ff;color:#7c3aed;padding:3px 10px;border-radius:12px;font-size:12px;font-weight:600">${l.role}</span>
        </td>
      </tr>`).join('')
    : `<tr><td colspan="3" style="padding:14px;text-align:center;color:var(--gray-400);font-size:13px">학급임원 이력 없음</td></tr>`;

  document.getElementById('studentProfileModal').classList.add('open');
}
// 이름 마스킹: 홍길동 → 홍○동
// ★ 전역 학과 목록 (DEPT_LIST 중앙관리)

// ① 관리자 실명 공개
function maskName(name) {
  if (!name) return name;
  if (currentRole === 'admin') return name; // 관리자는 실명
  if (name.length < 2) return name;
  if (name.length === 2) return name[0] + '○';
  return name[0] + '○'.repeat(name.length - 2) + name[name.length - 1];
}
// ══════════════════════════════
let _tt;
// ══════════════════════════════
// ③ 채용공고 CRUD
// ══════════════════════════════
let adminJobs = null; // null이면 SAMPLE_JOBS 사용

function getAdminJobs() {
  if (adminJobs) return adminJobs;
  try {
    const s = localStorage.getItem('adminJobs');
    if (s) { adminJobs = JSON.parse(s); return adminJobs; }
  } catch(e) {}
  adminJobs = JSON.parse(JSON.stringify(SAMPLE_JOBS));
  return adminJobs;
}

function saveAdminJobs() {
  try { localStorage.setItem('adminJobs', JSON.stringify(adminJobs)); } catch(e) {}
  // SAMPLE_JOBS 뷰도 갱신
  SAMPLE_JOBS.length = 0;
  adminJobs.forEach(j => SAMPLE_JOBS.push(j));
  renderHomeJobs(); renderAllJobs && renderAllJobs();
}

function renderAdminJobTable() {
  const jobs = getAdminJobs();
  const tbody = document.getElementById('adminJobTable');
  if (!tbody) return;
  tbody.innerHTML = jobs.map((j,i) => `
    <tr>
      <td style="padding:9px 12px;border-bottom:1px solid var(--gray-100);font-weight:600">${j.company}</td>
      <td style="padding:9px 12px;border-bottom:1px solid var(--gray-100)">${j.title}</td>
      <td style="padding:9px 12px;border-bottom:1px solid var(--gray-100);text-align:center;font-size:12px">${j.deadline||'-'}</td>
      <td style="padding:9px 12px;border-bottom:1px solid var(--gray-100);text-align:center">
        <span style="background:${j.status==='open'?'#dcfce7':'#fee2e2'};color:${j.status==='open'?'var(--success)':'var(--danger)'};padding:2px 8px;border-radius:12px;font-size:11px;font-weight:600">
          ${j.status==='open'?'진행중':'마감'}
        </span>
      </td>
      <td style="padding:9px 12px;border-bottom:1px solid var(--gray-100);text-align:center">
        <button onclick="openApplicantsModal('${j.id}','지원')"
          style="background:#e8eef7;color:var(--primary);border:none;border-radius:6px;padding:3px 8px;font-size:11px;cursor:pointer;font-weight:600">
          📨${j.applyCount||0}
        </button>
      </td>
      <td style="padding:9px 12px;border-bottom:1px solid var(--gray-100);text-align:center">
        <button onclick="openApplicantsModal('${j.id}','관심')"
          style="background:#fef3c7;color:#b45309;border:none;border-radius:6px;padding:3px 8px;font-size:11px;cursor:pointer;font-weight:600">
          🔖${j.interestCount||0}
        </button>
      </td>
      <td style="padding:9px 12px;border-bottom:1px solid var(--gray-100);text-align:center">
        <button onclick="openJobForm(${i})"
          style="background:none;border:1px solid var(--primary);border-radius:6px;padding:3px 10px;font-size:12px;color:var(--primary);cursor:pointer">✏️</button>
      </td>
      <td style="padding:9px 12px;border-bottom:1px solid var(--gray-100);text-align:center">
        <button onclick="deleteAdminJob(${i})"
          style="background:none;border:1px solid var(--gray-200);border-radius:6px;padding:3px 10px;font-size:12px;color:var(--danger);cursor:pointer">🗑️</button>
      </td>
    </tr>`).join('');
}

let _editJobIdx = -1;

function openJobForm(idx) {
  _editJobIdx = (idx !== undefined) ? idx : -1;
  const jobs = getAdminJobs();
  const j = _editJobIdx >= 0 ? jobs[_editJobIdx] : null;
  document.getElementById('jobFormTitle').textContent = j ? '채용공고 수정' : '채용공고 등록';
  document.getElementById('jfId').value        = j ? j.id : '';
  document.getElementById('jfCompany').value   = j ? j.company : '';
  document.getElementById('jfTitle').value     = j ? j.title : '';
  document.getElementById('jfLocation').value  = j ? j.location : '';
  document.getElementById('jfSalary').value    = j ? j.salary : '';
  document.getElementById('jfHeadcount').value = j ? j.headcount : '';
  document.getElementById('jfDeadline').value  = j ? j.deadline : '';
  document.getElementById('jfTags').value      = j ? (j.tags||[]).join(',') : '';
  document.getElementById('jfRec').checked     = j ? j.recommendation : false;
  document.getElementById('jfRecCount').value  = j ? j.recCount : '';
  document.getElementById('jfDetail').value    = j ? j.detail : '';
  openModal('jobFormModal');
}

function saveJobForm() {
  const company = document.getElementById('jfCompany').value.trim();
  const title   = document.getElementById('jfTitle').value.trim();
  if (!company || !title) { showToast('⚠️ 업체명과 직무는 필수입니다'); return; }
  const jobs = getAdminJobs();
  const record = {
    id:             _editJobIdx >= 0 ? jobs[_editJobIdx].id : 'j' + Date.now(),
    company, title,
    location:       document.getElementById('jfLocation').value.trim(),
    salary:         document.getElementById('jfSalary').value.trim(),
    headcount:      parseInt(document.getElementById('jfHeadcount').value) || 0,
    deadline:       document.getElementById('jfDeadline').value,
    tags:           document.getElementById('jfTags').value.split(',').map(t=>t.trim()).filter(Boolean),
    recommendation: document.getElementById('jfRec').checked,
    recCount:       parseInt(document.getElementById('jfRecCount').value) || 0,
    detail:         document.getElementById('jfDetail').value.trim(),
    status:         'open',
    views:          _editJobIdx >= 0 ? (jobs[_editJobIdx].views||0) : 0,
    applyCount:     _editJobIdx >= 0 ? (jobs[_editJobIdx].applyCount||0) : 0,
    interestCount:  _editJobIdx >= 0 ? (jobs[_editJobIdx].interestCount||0) : 0,
    createdAt:      _editJobIdx >= 0 ? jobs[_editJobIdx].createdAt : new Date().toISOString().split('T')[0],
  };
  if (_editJobIdx >= 0) jobs[_editJobIdx] = record;
  else jobs.unshift(record);
  saveAdminJobs();
  renderAdminJobTable();
  closeModal('jobFormModal');
  showToast('✅ 공고가 ' + (_editJobIdx >= 0 ? '수정' : '등록') + '됐습니다');
}

function deleteAdminJob(idx) {
  if (!confirm('공고를 삭제하시겠습니까?')) return;
  const jobs = getAdminJobs();
  jobs.splice(idx, 1);
  saveAdminJobs();
  renderAdminJobTable();
  showToast('🗑️ 삭제됐습니다');
}

// ══════════════════════════════
// ⑧ 지원자/관심자 확인 (관리자)
// ══════════════════════════════
// 지원 데이터 저장소 (localStorage)
function getApplications() {
  try { return JSON.parse(localStorage.getItem('applications') || '[]'); } catch(e) { return []; }
}
function saveApplications(apps) {
  try { localStorage.setItem('applications', JSON.stringify(apps)); } catch(e) {}
}

function openApplicantsModal(jobId, type) {
  const job = getAdminJobs().find(j=>j.id===jobId);
  document.getElementById('applicantsJobTitle').textContent = job ? job.company + ' — ' + job.title : jobId;
  document.getElementById('applicantsType').textContent = type + '자 목록';
  const apps = getApplications().filter(a=>a.jobId===jobId && a.type===type);
  const tbody = document.getElementById('applicantsTable');
  tbody.innerHTML = apps.length
    ? apps.map(a=>`
      <tr>
        <td style="padding:9px 12px;border-bottom:1px solid var(--gray-100);font-weight:600">${a.name}</td>
        <td style="padding:9px 12px;border-bottom:1px solid var(--gray-100)">${a.dept||'-'}</td>
        <td style="padding:9px 12px;border-bottom:1px solid var(--gray-100);text-align:center">${a.sid||'-'}</td>
        <td style="padding:9px 12px;border-bottom:1px solid var(--gray-100);text-align:center;font-size:12px">${a.createdAt||'-'}</td>
      </tr>`).join('')
    : `<tr><td colspan="4" style="padding:24px;text-align:center;color:var(--gray-400)">${type}자가 없습니다</td></tr>`;
  openModal('applicantsModal');
}

// ⑧ 담임교사 대리지원
let _classApplyJobId = '';

function openClassApplyModal(jobId) {
  _classApplyJobId = jobId;
  const job = SAMPLE_JOBS.find(j=>j.id===jobId);
  document.getElementById('classApplyJobTitle').textContent = job ? job.company + ' — ' + job.title : jobId;
  // 우리 반 학생 목록 (classStudents 또는 샘플)
  const students = classStudents.length ? classStudents : SAMPLE_COMPANIES[0]?.employees || [];
  const list = document.getElementById('classApplyStudentList');
  list.innerHTML = students.map((s,i)=>`
    <label style="display:flex;align-items:center;gap:10px;padding:10px 12px;background:var(--gray-50);border-radius:8px;cursor:pointer">
      <input type="checkbox" value="${i}" style="width:16px;height:16px">
      <span style="font-weight:600">${s.name}</span>
    </label>`).join('');
  openModal('classApplyModal');
}

function submitClassApply() {
  const checks = document.querySelectorAll('#classApplyStudentList input:checked');
  if (!checks.length) { showToast('⚠️ 학생을 선택해주세요'); return; }
  const students = classStudents.length ? classStudents : SAMPLE_COMPANIES[0]?.employees || [];
  const apps = getApplications();
  checks.forEach(cb => {
    const s = students[parseInt(cb.value)];
    if (!s) return;
    apps.push({
      jobId: _classApplyJobId, type: '지원',
      name: s.name, dept: currentUser.dept||'', sid: s.sid||'',
      createdAt: new Date().toISOString().split('T')[0],
    });
  });
  saveApplications(apps);
  // 공고 지원자 수 업데이트
  const jobs = getAdminJobs();
  const job = jobs.find(j=>j.id===_classApplyJobId);
  if (job) { job.applyCount = (job.applyCount||0) + checks.length; saveAdminJobs(); }
  closeModal('classApplyModal');
  showToast('✅ ' + checks.length + '명 지원 처리 완료');
}

// ④ 학생 데이터 엑셀(CSV) 다운로드
function exportStudentData(scope) {
  if (scope === 'class' && currentRole === 'admin') {
    // 관리자: 학과+반 선택 모달 표시
    openClassSelectModal();
    return;
  }
  _doExportStudentData(scope, currentRole === 'homeroom' ? currentUser.dept : '', currentRole === 'homeroom' ? currentUser.classCode : '');
}

function openClassSelectModal() {
  const existing = document.getElementById('classSelectModal');
  if (existing) existing.remove();
  const modal = document.createElement('div');
  modal.id = 'classSelectModal';
  modal.className = 'modal-overlay open';
  modal.onclick = e => { if(e.target===modal) modal.remove(); };
  modal.innerHTML = `
    <div class="modal" style="max-width:380px">
      <div class="modal-header">
        <button class="modal-close" onclick="document.getElementById('classSelectModal').remove()">✕</button>
        <div class="modal-company">학급별 다운로드</div>
        <div class="modal-position">학과와 반을 선택하세요</div>
      </div>
      <div style="padding:20px;display:grid;gap:12px">
        <div>
          <label class="form-label" style="font-size:11px">학과</label>
          <select class="form-input" id="exportDeptSelect" style="font-size:13px;padding:9px 12px">
            <option value="">-- 학과 선택 --</option>
            ${DEPT_LIST.map(d=>`<option value="${d}">${d}</option>`).join('')}
          </select>
        </div>
        <div>
          <label class="form-label" style="font-size:11px">반</label>
          <select class="form-input" id="exportClassSelect" style="font-size:13px;padding:9px 12px">
            <option value="">-- 반 선택 --</option>
            ${[1,2,3,4,5].map(n=>`<option value="${n}">${n}반</option>`).join('')}
          </select>
        </div>
        <button onclick="_confirmClassExport()"
          style="background:var(--primary);color:#fff;border:none;border-radius:var(--radius-sm);padding:12px;font-size:14px;font-weight:600;cursor:pointer;font-family:'Noto Sans KR',sans-serif">
          📥 다운로드
        </button>
      </div>
    </div>`;
  document.body.appendChild(modal);
}

function _confirmClassExport() {
  const dept = document.getElementById('exportDeptSelect').value;
  const cls  = document.getElementById('exportClassSelect').value;
  if (!dept || !cls) { showToast('⚠️ 학과와 반을 선택해주세요'); return; }
  document.getElementById('classSelectModal').remove();
  _doExportStudentData('class', dept, cls);
}

function _doExportStudentData(scope, dept, cls) {
  let students = classStudents;
  if (!students.length) students = SAMPLE_COMPANIES.flatMap(c=>c.employees);
  if (dept) students = students.filter(s=>(s.dept||'')===dept);
  const BOM = '\uFEFF';
  let csv = BOM + '이름,학과,자격증수,자격증목록,1학년결석,1학년지각,2학년결석,2학년지각,3학년결석,3학년지각,동아리(1학년),동아리(2학년),동아리(3학년),임원횟수,임원이력\n';
  students.forEach(s=>{
    const g = [0,1,2].map(i=>s.attend?.[i]||{absent:0,late:0});
    csv += [
      s.name, s.dept||dept||'',
      (s.certs||[]).length,
      '"' + (s.certs||[]).join(', ') + '"',
      g[0].absent, g[0].late,
      g[1].absent, g[1].late,
      g[2].absent, g[2].late,
      s.clubs?.[0]?.name||'-',
      s.clubs?.[1]?.name||'-',
      s.clubs?.[2]?.name||'-',
      (s.leader||[]).length,
      '"' + (s.leader||[]).map(l=>l.grade+' '+l.semester+' '+l.role).join(', ') + '"'
    ].join(',') + '\n';
  });
  const blob = new Blob([csv], {type:'text/csv;charset=utf-8'});
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href = url;
  const filename = scope==='all' ? '전체' : (dept + (cls ? '_'+cls+'반' : ''));
  a.download = filename + '_학생현황_' + new Date().toISOString().split('T')[0] + '.csv';
  a.click();
  URL.revokeObjectURL(url);
  showToast('✅ 엑셀 파일 다운로드 완료');
}

// ══════════════════════════════
// ⑭ 모바일 햄버거 메뉴
// ══════════════════════════════
function toggleMobileNav() {
  const nav = document.querySelector('nav');
  nav.classList.toggle('open');
}
// 페이지 이동 시 모바일 메뉴 닫기
document.addEventListener('click', e => {
  if (!e.target.closest('nav') && !e.target.closest('.hamburger')) {
    document.querySelector('nav')?.classList.remove('open');
  }
});

// ══════════════════════════════
// ⑤⑨ Google Sheets 연동 설정
// ══════════════════════════════
const SHEETS_CONFIG = {
  get id()  { return localStorage.getItem('ss_id')  || '16lcacHI7Q04kufwbWTtQiR5rWZnOpBcZYoZRyNV9PzI'; },
  get key() { return localStorage.getItem('api_key') || 'AIzaSyAMyDMQqHg2R0E4tQ0jeIwgjeaRSUMqG0s'; },
  get connected() { return !!this.key; },
};

// Sheets에서 데이터 읽기
async function sheetsGet(range) {
  if (!SHEETS_CONFIG.connected) return null;
  try {
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${SHEETS_CONFIG.id}/values/${encodeURIComponent(range)}?key=${SHEETS_CONFIG.key}`;
    const res  = await fetch(url);
    const data = await res.json();
    if (data.error) { console.warn('Sheets API 오류:', data.error.message); return null; }
    return data.values || [];
  } catch(e) { return null; }
}

// Sheets에서 채용공고 로드
// 열 순서: A=ID B=회사명 C=공고제목 D=근무지 E=모집인원 F=급여 G=마감일 H=학교장추천 I=추천인원 J=첨부파일 K=태그 L=등록일 M=상태 N=조회수
async function loadJobsFromSheets() {
  const rows = await sheetsGet('채용공고!A2:N');
  if (!rows || !rows.length) return;
  const today = new Date().toISOString().split('T')[0];
  const jobs = rows.map((r,i) => ({
    id:             r[0] || 'sj'+i,
    company:        r[1] || '',
    title:          r[2] || '',
    location:       r[3] || '',
    headcount:      r[4] || '',
    salary:         r[5] || '',
    deadline:       r[6] || '',
    recommendation: r[7] === '예',
    recCount:       parseInt(r[8])||0,
    fileData:       r[9] || '',
    tags:           r[10] ? r[10].split(',').map(t=>t.trim()) : [],
    createdAt:      r[11] || '',
    status:         r[12] || (r[6] && r[6] < today ? 'closed' : 'open'),
    views:          parseInt(r[13])||0,
    applyCount:     0, interestCount: 0,
    detail:         r[2] || '',
  })).filter(j=>j.company);
  if (jobs.length) {
    SAMPLE_JOBS.length = 0;
    jobs.forEach(j=>SAMPLE_JOBS.push(j));
    adminJobs = jobs;
    renderHomeJobs(); renderAllJobs();
    showToast('✅ 채용공고 ' + jobs.length + '건 로드됨 (Sheets)');
  }
}

// Sheets에서 지원현황 로드
async function loadApplicationsFromSheets() {
  const rows = await sheetsGet('지원현황!A2:L');
  if (!rows || !rows.length) return;
  const apps = rows.map(r=>({
    id:       r[0]||'',
    jobId:    r[1]||'',
    jobTitle: r[2]||'',
    name:     r[3]||'',
    dept:     r[4]||'',
    grade:    r[5]||'',
    classNum: r[6]||'',
    phone:    r[7]||'',
    reason:   r[8]||'',
    type:     r[9]==='관심'?'관심':'지원',
    createdAt:r[10]||'',
    memo:     r[11]||'',
  })).filter(a=>a.jobId);
  // localStorage에 병합 저장
  try { localStorage.setItem('applications', JSON.stringify(apps)); } catch(e) {}
  // 공고별 카운트 업데이트
  const jobs = getAdminJobs();
  jobs.forEach(j=>{
    j.applyCount    = apps.filter(a=>a.jobId===j.id && a.type==='지원').length;
    j.interestCount = apps.filter(a=>a.jobId===j.id && a.type==='관심').length;
  });
  saveAdminJobs();
}

// Sheets에서 학생 정보 로드 (⑪)
async function loadStudentsFromSheets() {
  const rows = await sheetsGet('학생정보!A2:H');
  if (!rows) return null;
  return rows.map(r=>({
    dept: r[0]||'', grade: r[1]||'', classNum: r[2]||'',
    sid:  r[3]||'', name:  r[4]||'', teacher: r[5]||'',
    birth:r[6]||'', nationality: r[7]||'내국인',
  }));
}

// ⑪ 학생 로그인 Sheets 검증
async function verifyStudentLogin(dept, sid, name) {
  const students = await loadStudentsFromSheets();
  if (!students) return true; // Sheets 미연결 시 통과 (개발모드)
  const match = students.find(s =>
    s.dept === dept && s.sid === sid &&
    (s.name === name || s.name.toLowerCase() === name.toLowerCase())
  );
  return !!match;
}

// 연결 테스트 + 데이터 로드
async function connectAndLoad() {
  if (!SHEETS_CONFIG.connected) return;
  await loadJobsFromSheets();
  await loadApplicationsFromSheets();
}

function showToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg; t.classList.add('show');
  clearTimeout(_tt);
  _tt = setTimeout(() => t.classList.remove('show'), 3000);
}

// ══════════════════════════════
// 초기화
// ══════════════════════════════
window.onload = () => {
  buildDeptSelects();
  buildYearDropdown();
  buildStatsYearDropdown();
  renderHomeJobs();
  renderStats();
  loadBanners();
  connectAndLoad(); // ⑤⑨ Sheets 연결 시 자동 로드
};

// ② 모든 학과 드롭다운 자동생성
function buildDeptSelects() {
  const selects = {
    inputStudentDept:  '-- 학과를 선택하세요 --',
    inputHomeroomDept: '-- 학과를 선택하세요 --',
    resetDept:         '-- 학과 선택 --',
  };
  Object.entries(selects).forEach(([id, placeholder]) => {
    const sel = document.getElementById(id);
    if (!sel) return;
    sel.innerHTML = `<option value="">${placeholder}</option>`;
    DEPT_LIST.forEach(d => {
      const opt = document.createElement('option');
      opt.value = d; opt.textContent = d;
      sel.appendChild(opt);
    });
  });
}

// ⑬ 배너 관리 (관리자)
function getBanners() {
  try { return JSON.parse(localStorage.getItem('banners') || '[]'); } catch(e) { return []; }
}


// ══════════════════════════════
// 학과 관리 CRUD
// ══════════════════════════════
function renderAdminDeptList() {
  const el = document.getElementById('adminDeptList');
  if (!el) return;
  const list = getDeptList();
  const now = new Date().getFullYear();
  if (!list.length) {
    el.innerHTML = '<div style="text-align:center;color:var(--gray-400);font-size:13px;padding:16px">등록된 학과가 없습니다</div>';
    return;
  }
  el.innerHTML = `<table style="width:100%;border-collapse:collapse;font-size:13px">
    <thead><tr>
      <th style="padding:8px 12px;background:var(--gray-50);border-bottom:1px solid var(--gray-200);text-align:left">학과명</th>
      <th style="padding:8px 12px;background:var(--gray-50);border-bottom:1px solid var(--gray-200);text-align:center">운영기간</th>
      <th style="padding:8px 12px;background:var(--gray-50);border-bottom:1px solid var(--gray-200);text-align:left">합과(구학과)</th>
      <th style="padding:8px 12px;background:var(--gray-50);border-bottom:1px solid var(--gray-200);text-align:center">상태</th>
      <th style="padding:8px 12px;background:var(--gray-50);border-bottom:1px solid var(--gray-200);text-align:center">수정</th>
      <th style="padding:8px 12px;background:var(--gray-50);border-bottom:1px solid var(--gray-200);text-align:center">삭제</th>
    </tr></thead>
    <tbody>${list.map((d,i)=>{
      const active = d.startYear<=now && (d.endYear===null||d.endYear>=now);
      const aliasHtml = d.alias&&d.alias.length ? '<span style="font-size:11px;color:var(--gray-400);margin-left:6px">('+d.alias.join(' / ')+')</span>' : '';
      const mergedHtml = d.mergedFrom&&d.mergedFrom.length ? d.mergedFrom.join(' + ') : '-';
      return `<tr>
        <td style="padding:9px 12px;border-bottom:1px solid var(--gray-100);font-weight:600">${d.name}${aliasHtml}</td>
        <td style="padding:9px 12px;border-bottom:1px solid var(--gray-100);text-align:center;font-size:12px">${d.startYear}~${d.endYear||'현재'}</td>
        <td style="padding:9px 12px;border-bottom:1px solid var(--gray-100);font-size:12px;color:var(--gray-600)">${mergedHtml}</td>
        <td style="padding:9px 12px;border-bottom:1px solid var(--gray-100);text-align:center">
          <span style="background:${active?'var(--success)':'var(--gray-200)'};color:${active?'#fff':'var(--gray-600)'};border-radius:12px;padding:2px 10px;font-size:11px">${active?'운영중':'폐과'}</span>
        </td>
        <td style="padding:9px 12px;border-bottom:1px solid var(--gray-100);text-align:center">
          <button onclick="openDeptForm(${i})" style="background:none;border:1px solid var(--primary);border-radius:6px;padding:3px 10px;font-size:12px;color:var(--primary);cursor:pointer">✏️ 수정</button>
        </td>
        <td style="padding:9px 12px;border-bottom:1px solid var(--gray-100);text-align:center">
          <button onclick="deleteDept(${i})" style="background:none;border:1px solid var(--gray-200);border-radius:6px;padding:3px 10px;font-size:12px;color:var(--danger);cursor:pointer">삭제</button>
        </td>
      </tr>`;
    }).join('')}
    </tbody>
  </table>`;
}

function openDeptForm(idx) {
  document.getElementById('dfIdx').value = idx !== undefined ? idx : -1;
  const list = getDeptList();
  const d = idx !== undefined ? list[idx] : null;
  document.getElementById('deptFormTitle').textContent = d ? '학과 수정' : '학과 추가';
  document.getElementById('dfName').value      = d ? d.name : '';
  document.getElementById('dfStartYear').value = d ? d.startYear : new Date().getFullYear();
  document.getElementById('dfEndYear').value   = d ? (d.endYear || '') : '';
  document.getElementById('dfAlias').value     = d ? (d.alias||[]).join(', ') : '';
  // 합과 체크박스 렌더링 (자기 자신 제외)
  const cb = document.getElementById('dfMergeCheckboxes');
  const others = list.filter((_,i)=>i!==idx);
  cb.innerHTML = others.length ? others.map(x=>`
    <label style="display:flex;align-items:center;gap:4px;font-size:12px;cursor:pointer;padding:3px 8px;background:var(--white);border:1px solid var(--gray-200);border-radius:6px">
      <input type="checkbox" value="${x.name}" ${d&&d.mergedFrom&&d.mergedFrom.includes(x.name)?'checked':''}> ${x.name}
    </label>`).join('') : '<span style="font-size:12px;color:var(--gray-400)">다른 학과 없음</span>';
  openModal('deptFormModal');
}

function saveDeptForm() {
  const idx = parseInt(document.getElementById('dfIdx').value);
  const name = document.getElementById('dfName').value.trim();
  const startYear = parseInt(document.getElementById('dfStartYear').value);
  const endYear = document.getElementById('dfEndYear').value ? parseInt(document.getElementById('dfEndYear').value) : null;
  const alias = document.getElementById('dfAlias').value.split(',').map(s=>s.trim()).filter(Boolean);
  const mergedFrom = [...document.querySelectorAll('#dfMergeCheckboxes input:checked')].map(cb=>cb.value);

  if (!name || !startYear) { showToast('⚠️ 학과명과 시작연도를 입력해주세요'); return; }

  const list = getDeptList();
  const record = { name, startYear, endYear, mergedFrom, alias };

  if (idx >= 0) {
    list[idx] = record;
    showToast('✅ 학과 정보가 수정되었습니다');
  } else {
    list.push(record);
    showToast('✅ 학과가 추가되었습니다');
  }
  saveDeptListData(list);
  // DEPT_LIST 동기화
  DEPT_LIST.length = 0;
  getActiveDeptNames().forEach(n => DEPT_LIST.push ? DEPT_LIST.push(n) : null);
  closeModal('deptFormModal');
  renderAdminDeptList();
  renderStats(); // 홈·취업현황 연동 갱신
}

function deleteDept(idx) {
  const list = getDeptList();
  if (!confirm(`'${list[idx].name}' 학과를 삭제하시겠습니까?
관련 데이터는 유지됩니다.`)) return;
  list.splice(idx, 1);
  saveDeptListData(list);
  renderAdminDeptList();
  renderStats();
  showToast('🗑️ 삭제됐습니다');
}

let _bannerEditIdx = -1;

function addBanner() {
  const title    = document.getElementById('bannerTitle').value.trim();
  const link     = document.getElementById('bannerLink').value.trim();
  const deadline = document.getElementById('bannerDeadline').value;
  const color    = document.getElementById('bannerColor').value;
  if (!title) { showToast('⚠️ 배너 제목을 입력해주세요'); return; }
  const banners = getBanners();
  const record = { title, link, deadline, color, visible: true, createdAt: new Date().toISOString().split('T')[0] };
  if (_bannerEditIdx >= 0) {
    record.visible = banners[_bannerEditIdx].visible;
    record.createdAt = banners[_bannerEditIdx].createdAt;
    banners[_bannerEditIdx] = record;
    _bannerEditIdx = -1;
    document.querySelector('[onclick="addBanner()"]').textContent = '➕ 배너 추가';
    showToast('✅ 배너가 수정되었습니다');
  } else {
    banners.push(record);
    showToast('✅ 배너가 추가되었습니다');
  }
  saveBanners(banners);
  renderAdminBanners();
  document.getElementById('bannerTitle').value = '';
  document.getElementById('bannerLink').value = '';
  document.getElementById('bannerDeadline').value = '';
  document.getElementById('bannerColor').value = 'blue';
}

function editBanner(idx) {
  const banners = getBanners();
  const b = banners[idx];
  if (!b) return;
  _bannerEditIdx = idx;
  document.getElementById('bannerTitle').value    = b.title || '';
  document.getElementById('bannerLink').value     = b.link || '';
  document.getElementById('bannerDeadline').value = b.deadline || '';
  document.getElementById('bannerColor').value    = b.color || 'blue';
  document.querySelector('[onclick="addBanner()"]').textContent = '💾 배너 수정 저장';
  showToast('✏️ 수정 모드 — 내용 변경 후 저장하세요');
}

function deleteBanner(idx) {
  if (!confirm('배너를 삭제하시겠습니까?')) return;
  const banners = getBanners();
  banners.splice(idx, 1);
  saveBanners(banners);
  renderAdminBanners();
  showToast('🗑️ 삭제됐습니다');
}

function toggleBanner(idx) {
  const banners = getBanners();
  banners[idx].visible = !banners[idx].visible;
  saveBanners(banners);
  renderAdminBanners();
}

function renderAdminBanners() {
  const list = document.getElementById('adminBannerList');
  if (!list) return;
  const banners = getBanners();
  if (!banners.length) {
    list.innerHTML = '<div style="text-align:center;color:var(--gray-400);font-size:13px;padding:16px">등록된 배너가 없습니다</div>';
    return;
  }
  const colorMap = { blue:'#1a3a6b', gold:'#b45309', green:'#16a34a', red:'#dc2626', purple:'#7c3aed' };
  list.innerHTML = `<table style="width:100%;border-collapse:collapse;font-size:13px">
    <thead><tr>
      <th style="padding:8px 12px;background:var(--gray-50);border-bottom:1px solid var(--gray-200);text-align:left">제목</th>
      <th style="padding:8px 12px;background:var(--gray-50);border-bottom:1px solid var(--gray-200);text-align:center">색상</th>
      <th style="padding:8px 12px;background:var(--gray-50);border-bottom:1px solid var(--gray-200);text-align:center">마감일</th>
      <th style="padding:8px 12px;background:var(--gray-50);border-bottom:1px solid var(--gray-200);text-align:center">표시</th>
      <th style="padding:8px 12px;background:var(--gray-50);border-bottom:1px solid var(--gray-200);text-align:center">수정</th>
      <th style="padding:8px 12px;background:var(--gray-50);border-bottom:1px solid var(--gray-200);text-align:center">삭제</th>
    </tr></thead>
    <tbody>${banners.map((b,i)=>`
      <tr>
        <td style="padding:9px 12px;border-bottom:1px solid var(--gray-100);font-weight:600">${b.title}</td>
        <td style="padding:9px 12px;border-bottom:1px solid var(--gray-100);text-align:center">
          <span style="display:inline-block;width:16px;height:16px;border-radius:4px;background:${colorMap[b.color]||'#1a3a6b'};vertical-align:middle"></span>
        </td>
        <td style="padding:9px 12px;border-bottom:1px solid var(--gray-100);text-align:center">${b.deadline||'-'}</td>
        <td style="padding:9px 12px;border-bottom:1px solid var(--gray-100);text-align:center">
          <button onclick="toggleBanner(${i})"
            style="background:${b.visible?'var(--success)':'var(--gray-200)'};color:${b.visible?'#fff':'var(--gray-600)'};border:none;border-radius:12px;padding:3px 10px;font-size:11px;cursor:pointer;font-family:'Noto Sans KR',sans-serif">
            ${b.visible?'표시중':'숨김'}
          </button>
        </td>
        <td style="padding:9px 12px;border-bottom:1px solid var(--gray-100);text-align:center">
          <button onclick="editBanner(${i})"
            style="background:none;border:1px solid var(--primary);border-radius:6px;padding:3px 10px;font-size:12px;color:var(--primary);cursor:pointer">✏️ 수정</button>
        </td>
        <td style="padding:9px 12px;border-bottom:1px solid var(--gray-100);text-align:center">
          <button onclick="deleteBanner(${i})"
            style="background:none;border:1px solid var(--gray-200);border-radius:6px;padding:3px 10px;font-size:12px;color:var(--danger);cursor:pointer">삭제</button>
        </td>
      </tr>`).join('')}
    </tbody>
  </table>`;
}
const SAMPLE_BANNERS = [
  // 관리자가 추가한 배너가 없으면 빈 배열 → 섹션 숨김
];

function loadBanners() {
  // localStorage 저장된 배너 우선, 없으면 SAMPLE_BANNERS
  let banners = SAMPLE_BANNERS;
  try {
    const saved = localStorage.getItem('banners');
    if (saved) banners = JSON.parse(saved);
  } catch(e) {}

  const section = document.getElementById('homeBannerSection');
  const list    = document.getElementById('homeBannerList');
  if (!section || !list) return;

  // 활성 배너만 필터
  const today = new Date().toISOString().split('T')[0];
  const active = banners.filter(b => b.visible && (!b.deadline || b.deadline >= today));

  if (!active.length) { section.style.display = 'none'; return; }

  section.style.display = 'block';
  const colors = {
    blue:   { bg:'#e8eef7', border:'#1a3a6b', text:'#1a3a6b' },
    gold:   { bg:'#fef3c7', border:'#b45309', text:'#b45309' },
    green:  { bg:'#dcfce7', border:'#16a34a', text:'#16a34a' },
    red:    { bg:'#fee2e2', border:'#dc2626', text:'#dc2626' },
  };
  list.innerHTML = active.map(b => {
    const c = colors[b.color] || colors.blue;
    return `
    <a href="${b.link||'#'}" target="${b.link?'_blank':'_self'}"
      style="display:flex;align-items:center;justify-content:space-between;
             background:${c.bg};border:1.5px solid ${c.border};border-radius:10px;
             padding:12px 18px;text-decoration:none;transition:opacity 0.2s"
      onmouseover="this.style.opacity=0.85" onmouseout="this.style.opacity=1">
      <div style="display:flex;align-items:center;gap:10px">
        <span style="font-size:18px">📢</span>
        <span style="font-size:14px;font-weight:600;color:${c.text}">${b.title}</span>
      </div>
      <div style="display:flex;align-items:center;gap:12px">
        ${b.deadline?`<span style="font-size:12px;color:${c.text};opacity:0.7">~${b.deadline}</span>`:''}
        ${b.link?`<span style="font-size:12px;color:${c.text};font-weight:600">바로가기 →</span>`:''}
      </div>
    </a>`;
  }).join('');
}

// 관리자 배너 저장 헬퍼 (관리자 페이지에서 사용)
function saveBanners(banners) {
  try { localStorage.setItem('banners', JSON.stringify(banners)); } catch(e) {}
  loadBanners();
}

// ══════════════════════════════
// 연도 드롭다운 자동 생성
// 시작연도(2023)부터 현재연도까지 자동으로 추가
// 매년 1월 1일이 되면 새 연도가 자동으로 추가됨
// ══════════════════════════════
function buildYearDropdown() {
  const sel = document.getElementById('yearFilter');
  if (!sel) return;
  const START_YEAR = 2023;           // 시스템 시작 연도
  const thisYear = new Date().getFullYear(); // 올해 자동 인식
  // 최신연도부터 내림차순으로 생성
  for (let y = thisYear; y >= START_YEAR; y--) {
    const opt = document.createElement('option');
    opt.value = y;
    opt.textContent = y + '년';
    sel.appendChild(opt);
  }
}
