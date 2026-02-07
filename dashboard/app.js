/* ======= إعدادات وتهيئة API ======= */
const defaults = {
  API_BASE: localStorage.getItem('API_BASE') || 'http://localhost:3000',
  theme: localStorage.getItem('theme') || 'dark',
  logoText: localStorage.getItem('logoText') || 'A',
  partners: JSON.parse(localStorage.getItem('partners')||'[]'),
};
let API_BASE = defaults.API_BASE;
function buildAPI() {
  return {
    appointment: API_BASE + '/api/Appointment',
    post: API_BASE + '/api/Post',
    project: API_BASE + '/api/Project',
    tech: API_BASE + '/api/Technology',
    testimonial: API_BASE + '/api/Testimonial',
    login: API_BASE + '/api/auth/login'
  };
}
let API = buildAPI();

document.getElementById('apiBaseShow').textContent = 'API: ' + API_BASE;
document.getElementById('brandLogo').textContent = defaults.logoText;

/* ======= Toast helper ======= */
const toastBox = document.getElementById('toastBox');
function pushToast(text, type='info', timeout=3000){
  const div = document.createElement('div');
  div.className = 'toast-item toast-'+(type==='success'?'success':type==='error'?'error':'info');
  div.textContent = text;
  toastBox.appendChild(div);
  setTimeout(()=> div.style.opacity = '0', timeout-500);
  setTimeout(()=> div.remove(), timeout);
}

/* ======= URL helper for uploaded files ======= */
function urlFor(p){
  if(!p) return '';
  if(p.startsWith('http://') || p.startsWith('https://')) return p;
  const base = API_BASE.replace(/\/+$/,'');
  const path = p.replace(/^\/+/,'');
  return base + '/' + path;
}

/* ======= sidebar & navigation ======= */
const sidebar = document.getElementById('sidebar');
document.getElementById('toggleSidebar').onclick = ()=> sidebar.classList.toggle('open');
const navLinks = Array.from(document.querySelectorAll('.nav-link'));
const views = {
  home: document.getElementById('view-home'),
  projects: document.getElementById('view-projects'),
  posts: document.getElementById('view-posts'),
  appointments: document.getElementById('view-appointments'),
  technologies: document.getElementById('view-technologies'),
  testimonials: document.getElementById('view-testimonials'),
  users: document.getElementById('view-users'),
  settings: document.getElementById('view-settings'),
};
navLinks.forEach(link=>{
  link.addEventListener('click', ()=>{
    navLinks.forEach(l=>l.classList.remove('active'));
    link.classList.add('active');
    const target = link.dataset.target;
    Object.values(views).forEach(v=>v.classList.add('d-none'));
    if(views[target]) views[target].classList.remove('d-none');
    if(window.innerWidth < 992) sidebar.classList.remove('open');
  });
});

/* ======= Stats (home) ======= */
let chart = null;
async function loadStats(){
  API = buildAPI();
  document.getElementById('apiBaseShow').textContent = 'API: ' + API_BASE;
  try{
    const [projectsRes, postsRes, apptsRes] = await Promise.all([
      fetch(API.project).catch(()=>({ok:false})),
      fetch(API.post).catch(()=>({ok:false})),
      fetch(API.appointment).catch(()=>({ok:false}))
    ]);
    const projects = projectsRes.ok ? await projectsRes.json() : [];
    const posts = postsRes.ok ? await postsRes.json() : [];
    const appts = apptsRes.ok ? await apptsRes.json() : [];

    document.getElementById('statProjects').textContent = (projects||[]).length;
    document.getElementById('statPosts').textContent = (posts||[]).length;
    document.getElementById('statAppointments').textContent = (appts||[]).length;

    // last appointments
    const tb = document.getElementById('homeLastAppointments');
    tb.innerHTML = '';
    (appts||[]).slice(-6).reverse().forEach(a=>{
      const tr = document.createElement('tr');
      tr.innerHTML = `<td>${a.FullName||'-'}</td><td>${a.Email||'-'}</td><td>${a.Date||'-'}</td><td>${a.file?`<a href="${urlFor(a.file)}" target="_blank">تحميل</a>`:'-'}</td>`;
      tb.appendChild(tr);
    });

    // chart
    const labels = ['مشاريع','منشورات','مواعيد'];
    const data = [ (projects||[]).length, (posts||[]).length, (appts||[]).length ];
    const ctx = document.getElementById('homeChart');
    if(chart){ chart.destroy(); chart = null; }
    chart = new Chart(ctx, { type: 'bar', data: { labels, datasets:[{ label:'إجمالي العناصر', data }] }, options:{ responsive:true, plugins:{ legend:{ display:false } } } });

  }catch(err){ console.warn(err); pushToast('تعذر جلب الإحصاءات', 'error'); }
}
document.getElementById('refreshHome').onclick = loadStats;

/* ======= Projects (FIX: edit now uses GET all then find by id) ======= */
let projTags = [];
const tagWrap = document.getElementById('p_techTags');
function renderProjTags(){ tagWrap.innerHTML = projTags.map(t=>`<span class="badge rounded-pill text-bg-info me-1">${t}</span>`).join(' '); }

document.getElementById('p_addTech').onclick = ()=>{
  const v = document.getElementById('p_techInput').value.trim();
  if(v && !projTags.includes(v)){ projTags.push(v); renderProjTags(); }
  document.getElementById('p_techInput').value = '';
};
document.getElementById('p_reset').onclick = ()=>{ document.getElementById('projectForm').reset(); projTags=[]; renderProjTags(); document.getElementById('p_id').value=''; };
document.getElementById('reloadProjects').onclick = loadProjects;
document.getElementById('openProjectForm').onclick = ()=> { document.getElementById('projectEditorCard').style.display='block'; window.scrollTo({top:0,behavior:'smooth'}); };
document.getElementById('closeProjectEditor').onclick = ()=> document.getElementById('projectEditorCard').style.display='none';

async function loadProjects(){
  try{
    const res = await fetch(API.project);
    const list = res.ok ? await res.json() : [];
    const q = (document.getElementById('projSearch').value || '').toLowerCase();
    const ft = document.getElementById('projFilter').value;
    const grid = document.getElementById('projectsGrid'); grid.innerHTML='';

    (list||[]).filter(p=>{
      if(ft !== 'all' && ((p.ProjectType||'web').toLowerCase() !== ft)) return false;
      if(!q) return true;
      const inName = (p.Name||'').toLowerCase().includes(q);
      const inTech = Array.isArray(p.UsedTechnology) && p.UsedTechnology.some(t => (t||'').toLowerCase().includes(q));
      return inName || inTech;
    }).forEach(p=>{
      const col = document.createElement('div'); col.className='col-md-6 col-lg-4';
      const img = urlFor(p.Image) || 'https://via.placeholder.com/600x400?text=No+Image';
      col.innerHTML = `
        <div class="card h-100">
          <img src="${img}" class="img-thumb" alt="">
          <div class="p-3">
            <div class="d-flex justify-content-between">
              <h6 class="fw-bold mb-1">${p.Name||''}</h6>
              <span class="badge badge-soft">${p.ProjectType||'web'}</span>
            </div>
            <div class="small muted mb-2">${p.Description||''}</div>
            <div class="mb-2">${(p.UsedTechnology||[]).map(t=>`<span class="badge text-bg-secondary me-1">${t}</span>`).join('')}</div>
            <div class="d-flex justify-content-between">
              <div class="d-flex gap-2">
                <a class="btn btn-sm btn-outline-info" target="_blank" href="${p.ProjectLink||'#'}">فتح</a>
                <a class="btn btn-sm btn-outline-secondary" target="_blank" href="${urlFor(p.Image)}">صورة</a>
              </div>
              <div>
                <button class="btn btn-sm btn-warning me-1 btn-edit-project" data-id="${p.id}"><i class="fa-solid fa-pen"></i></button>
                <button class="btn btn-sm btn-danger btn-del-project" data-id="${p.id}"><i class="fa-solid fa-trash"></i></button>
              </div>
            </div>
          </div>
        </div>`;
      grid.appendChild(col);
    });

  }catch(err){ console.error(err); pushToast('تعذر جلب المشاريع', 'error'); }
}

/* Edit project: since backend doesn't have GET /api/Project/:id, we GET all and find by id */
document.getElementById('projectsGrid').addEventListener('click', async (e)=>{
  const editBtn = e.target.closest('.btn-edit-project');
  const delBtn = e.target.closest('.btn-del-project');
  if(editBtn){
    const id = editBtn.dataset.id;
    try{
      // fetch all projects then find
      const res = await fetch(API.project);
      if(!res.ok) return pushToast('تعذر الوصول للمشاريع', 'error');
      const projects = await res.json();
      const p = projects.find(x => String(x.id) === String(id));
      if(!p) { pushToast('لم يتم العثور على المشروع', 'error'); return; }
      // fill form
      document.getElementById('p_id').value = p.id;
      document.getElementById('p_name').value = p.Name || '';
      document.getElementById('p_link').value = p.ProjectLink || '';
      document.getElementById('p_desc').value = p.Description || '';
      document.getElementById('p_type').value = p.ProjectType || 'web';
      projTags = Array.isArray(p.UsedTechnology) ? [...p.UsedTechnology] : [];
      renderProjTags();
      document.getElementById('projectEditorCard').style.display = 'block';
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }catch(err){ console.error(err); pushToast('خطأ أثناء التحضير للتعديل', 'error'); }
  }
  if(delBtn){
    const id = delBtn.dataset.id;
    if(!confirm('تأكيد حذف المشروع؟')) return;
    try{
      const res = await fetch(API.project + '/' + id, { method: 'DELETE' });
      if(res.ok){ pushToast('تم الحذف', 'success'); loadProjects(); loadStats(); } else pushToast('فشل الحذف', 'error');
    }catch(err){ console.error(err); pushToast('خطأ أثناء الحذف', 'error'); }
  }
});

/* Save project (POST or PUT) — FormData to allow image upload */
document.getElementById('projectForm').addEventListener('submit', async (e)=>{
  e.preventDefault();
  const saveBtn = document.getElementById('p_saveBtn');
  saveBtn.disabled = true;
  const id = document.getElementById('p_id').value;
  const fd = new FormData();
  fd.append('Name', document.getElementById('p_name').value);
  fd.append('Description', document.getElementById('p_desc').value);
  fd.append('ProjectLink', document.getElementById('p_link').value || '');
  fd.append('ProjectType', document.getElementById('p_type').value || 'web');
  fd.append('UsedTechnology', JSON.stringify(projTags));
  const file = document.getElementById('p_image').files[0]; if(file) fd.append('Image', file);
  const alertEl = document.getElementById('p_alert');
  try{
    // ensure API variable refreshed
    API = buildAPI();
    const url = API.project + (id ? '/' + id : '');
    const method = id ? 'PUT' : 'POST';
    const res = await fetch(url, { method, body: fd });
    if(!res.ok) throw new Error('فشل الحفظ');
    showShort('تم الحفظ بنجاح', 'success');
    e.target.reset(); projTags = []; renderProjTags(); document.getElementById('p_id').value='';
    loadProjects(); loadStats();
  }catch(err){ console.error(err); showShort('خطأ أثناء الحفظ', 'error'); }
  saveBtn.disabled = false;
});

/* ======= Posts ======= */
document.getElementById('openPostForm').onclick = ()=> { document.getElementById('postEditorCard').style.display='block'; window.scrollTo({top:0,behavior:'smooth'}); };
document.getElementById('closePostEditor').onclick = ()=> document.getElementById('postEditorCard').style.display='none';
document.getElementById('reloadPosts').onclick = loadPosts;

async function loadPosts(){
  try{
    const res = await fetch(API.post);
    const list = res.ok ? await res.json() : [];
    const grid = document.getElementById('postsGrid'); grid.innerHTML='';
    (list||[]).slice().reverse().forEach(p=>{
      const col = document.createElement('div'); col.className='col-md-6 col-lg-4';
      const firstImg = (p.Photos && p.Photos[0]) ? urlFor(p.Photos[0]) : 'https://via.placeholder.com/600x400?text=No+Image';
      col.innerHTML = `
        <div class="card h-100">
          <img src="${firstImg}" class="img-thumb" alt="">
          <div class="p-3">
            <div class="d-flex justify-content-between align-items-center mb-1">
              <h6 class="fw-bold mb-0">#${p.id}</h6>
              <div>
                <button class="btn btn-sm btn-warning me-1 btn-edit-post" data-id="${p.id}"><i class="fa-solid fa-pen"></i></button>
                <button class="btn btn-sm btn-danger btn-del-post" data-id="${p.id}"><i class="fa-solid fa-trash"></i></button>
              </div>
            </div>
            <div class="small mb-2">${p.Text||''}</div>
            <div class="d-flex flex-wrap gap-1">
              ${(p.Photos||[]).map(ph=>`<a target="_blank" href="${urlFor(ph)}" class="badge text-bg-secondary">صورة</a>`).join('')}
            </div>
          </div>
        </div>`;
      grid.appendChild(col);
    });
  }catch(err){ console.error(err); pushToast('تعذر جلب المنشورات', 'error'); }
}

document.getElementById('postForm').addEventListener('submit', async (e)=>{
  e.preventDefault();
  const fd = new FormData();
  fd.append('Text', document.getElementById('post_text').value);
  const files = document.getElementById('post_photos').files;
  for(const f of files) fd.append('Photos', f);
  try{
    const res = await fetch(API.post, { method:'POST', body: fd });
    if(!res.ok) throw new Error('فشل الرفع');
    pushToast('تم نشر المنشور', 'success'); e.target.reset(); loadPosts(); loadStats();
  }catch(err){ console.error(err); pushToast('تعذر النشر', 'error'); }
});

document.getElementById('postsGrid').addEventListener('click', async (e)=>{
  const edit = e.target.closest('.btn-edit-post');
  const del = e.target.closest('.btn-del-post');
  if(edit){
    const id = edit.dataset.id;
    const newText = prompt('تعديل نص المنشور:');
    if(newText === null) return;
    try{
      const res = await fetch(API.post + '/' + id, { method:'PUT', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ Text:newText }) });
      if(res.ok){ pushToast('تم التعديل', 'success'); loadPosts(); } else pushToast('فشل التعديل', 'error');
    }catch(err){ console.error(err); pushToast('خطأ', 'error'); }
  }
  if(del){
    const id = del.dataset.id;
    if(!confirm('حذف المنشور؟')) return;
    try{
      const res = await fetch(API.post + '/' + id, { method:'DELETE' });
      if(res.ok){ pushToast('تم الحذف', 'success'); loadPosts(); loadStats(); } else pushToast('فشل الحذف', 'error');
    }catch(err){ console.error(err); pushToast('خطأ', 'error'); }
  }
});

/* ======= Appointments ======= */
document.getElementById('reloadAppointments').onclick = loadAppointments;

async function loadAppointments(){
  try{
    const res = await fetch(API.appointment);
    const arr = res.ok ? await res.json() : [];
    const tb = document.getElementById('appointmentsTable'); tb.innerHTML='';
    (arr||[]).slice().reverse().forEach(a=>{
      const tr = document.createElement('tr');
      tr.innerHTML = `<td>${a.id||''}</td><td>${a.FullName||''}</td><td>${a.Email||''}</td><td>${a.Phone||''}</td><td>${a.Date||''}</td><td>${a.Time||''}</td><td>${a.file?`<a href="${urlFor(a.file)}" target="_blank">📎</a>`:''}</td>`;
      tb.appendChild(tr);
    });
  }catch(err){ console.error(err); pushToast('تعذر جلب المواعيد', 'error'); }
}

document.getElementById('appointmentForm').addEventListener('submit', async (e)=>{
  e.preventDefault();
  const fd = new FormData(e.target);
  try{
    const res = await fetch(API.appointment, { method:'POST', body: fd });
    if(!res.ok) throw new Error('فشل الحفظ');
    pushToast('تم الحفظ', 'success'); e.target.reset(); loadAppointments(); loadStats();
  }catch(err){ console.error(err); pushToast('تعذر الحفظ', 'error'); }
});

/* ======= Technologies ======= */
document.getElementById('reloadTech').onclick = loadTech;
document.getElementById('closeTechEditor').onclick = ()=> document.getElementById('techEditorCard').style.display='none';
document.getElementById('t_reset').onclick = ()=>{ document.getElementById('techForm').reset(); document.getElementById('t_id').value=''; };

async function loadTech(){
  try{
    const res = await fetch(API.tech); const list = res.ok ? await res.json() : [];
    const grid = document.getElementById('techGrid'); grid.innerHTML='';
    (list||[]).forEach(t=>{
      const col = document.createElement('div'); col.className='col-md-6 col-lg-4';
      const img = urlFor(t.Image) || 'https://via.placeholder.com/400x220?text=No+Image';
      col.innerHTML = `
        <div class="card h-100 p-3 d-flex">
          <div class="d-flex align-items-center gap-3 mb-2">
            <img src="${img}" style="width:60px;height:60px;border-radius:12px;object-fit:cover">
            <div class="flex-grow-1">
              <h6 class="mb-0">${t.TechnologyName||''}</h6>
              <div class="small muted">#${t.id}</div>
            </div>
            <div>
              <button class="btn btn-sm btn-warning me-1 btn-edit-tech" data-id="${t.id}"><i class="fa-solid fa-pen"></i></button>
              <button class="btn btn-sm btn-danger btn-del-tech" data-id="${t.id}"><i class="fa-solid fa-trash"></i></button>
            </div>
          </div>
        </div>`;
      grid.appendChild(col);
    });
  }catch(err){ console.error(err); pushToast('تعذر جلب التقنيات', 'error'); }
}

document.getElementById('techGrid').addEventListener('click', async (e)=>{
  const ed = e.target.closest('.btn-edit-tech');
  const del = e.target.closest('.btn-del-tech');
  if(ed){
    const id = ed.dataset.id;
    try{
      const res = await fetch(API.tech + '/' + id);
      if(!res.ok) return pushToast('لم يتم العثور على التقنية', 'error');
      const t = await res.json();
      document.getElementById('t_id').value = t.id;
      document.getElementById('t_name').value = t.TechnologyName || '';
      document.getElementById('techEditorCard').style.display = 'block';
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }catch(err){ console.error(err); pushToast('خطأ', 'error'); }
  }
  if(del){
    const id = del.dataset.id;
    if(!confirm('حذف التقنية؟')) return;
    try{
      const res = await fetch(API.tech + '/' + id, { method: 'DELETE' });
      if(res.ok) { pushToast('تم الحذف', 'success'); loadTech(); } else pushToast('فشل الحذف', 'error');
    }catch(err){ console.error(err); pushToast('خطأ', 'error'); }
  }
});

document.getElementById('techForm').addEventListener('submit', async (e)=>{
  e.preventDefault();
  const id = document.getElementById('t_id').value;
  const fd = new FormData();
  fd.append('TechnologyName', document.getElementById('t_name').value);
  const file = document.getElementById('t_image').files[0]; if(file) fd.append('Image', file);
  try{
    const res = await fetch(API.tech + (id ? '/' + id : ''), { method: id ? 'PUT' : 'POST', body: fd });
    if(!res.ok) throw new Error('فشل الحفظ');
    pushToast('تم الحفظ', 'success'); e.target.reset(); document.getElementById('t_id').value=''; loadTech();
  }catch(err){ console.error(err); pushToast('تعذر الحفظ', 'error'); }
});

/* ======= Testimonials ======= */
document.getElementById('reloadTestimonials').onclick = loadTestimonials;
document.getElementById('openTestimonialForm').onclick = ()=> { document.getElementById('testimonialEditorCard').style.display='block'; window.scrollTo({top:0,behavior:'smooth'}); };
document.getElementById('closeTestimonialEditor').onclick = ()=> document.getElementById('testimonialEditorCard').style.display='none';
document.getElementById('tt_reset').onclick = ()=> { document.getElementById('testimonialForm').reset(); document.getElementById('tt_id').value=''; };

async function loadTestimonials(){
  try{
    const res = await fetch(API.testimonial);
    const list = res.ok ? await res.json() : [];
    const grid = document.getElementById('testimonialGrid'); grid.innerHTML='';
    (list||[]).forEach(t=>{
      const col = document.createElement('div'); col.className='col-md-6 col-lg-4';
      const img = urlFor(t.Image) || 'https://via.placeholder.com/400x220?text=No+Image';
      col.innerHTML = `
        <div class="card h-100 p-3">
          <div class="d-flex gap-3 mb-2 align-items-center">
            <img src="${img}" style="width:60px;height:60px;border-radius:12px;object-fit:cover">
            <div class="flex-grow-1">
              <h6 class="mb-0">${t.Name||''}</h6>
              <div class="small muted">${t.JobOrCompany||''}</div>
            </div>
            <div>
              <button class="btn btn-sm btn-warning me-1 btn-edit-test" data-id="${t.id}"><i class="fa-solid fa-pen"></i></button>
              <button class="btn btn-sm btn-danger btn-del-test" data-id="${t.id}"><i class="fa-solid fa-trash"></i></button>
            </div>
          </div>
          <p class="small">${t.Opinion||''}</p>
        </div>`;
      grid.appendChild(col);
    });
  }catch(err){ console.error(err); pushToast('تعذر جلب الآراء', 'error'); }
}

document.getElementById('testimonialGrid').addEventListener('click', async (e)=>{
  const ed = e.target.closest('.btn-edit-test');
  const del = e.target.closest('.btn-del-test');
  if(ed){
    const id = ed.dataset.id;
    try{
      const res = await fetch(API.testimonial + '/' + id);
      if(!res.ok) return pushToast('لم يتم العثور على الرأي', 'error');
      const t = await res.json();
      document.getElementById('tt_id').value = t.id;
      document.getElementById('tt_name').value = t.Name || '';
      document.getElementById('tt_job').value = t.JobOrCompany || '';
      document.getElementById('tt_opinion').value = t.Opinion || '';
      document.getElementById('testimonialEditorCard').style.display = 'block';
      window.scrollTo({ top: 0, behavior:'smooth' });
    }catch(err){ console.error(err); pushToast('خطأ', 'error'); }
  }
  if(del){
    const id = del.dataset.id;
    if(!confirm('حذف؟')) return;
    try{
      const res = await fetch(API.testimonial + '/' + id, { method: 'DELETE' });
      if(res.ok) { pushToast('تم الحذف', 'success'); loadTestimonials(); } else pushToast('فشل الحذف', 'error');
    }catch(err){ console.error(err); pushToast('خطأ', 'error'); }
  }
});

document.getElementById('testimonialForm').addEventListener('submit', async (e)=>{
  e.preventDefault();
  const id = document.getElementById('tt_id').value;
  const fd = new FormData();
  fd.append('Name', document.getElementById('tt_name').value);
  fd.append('JobOrCompany', document.getElementById('tt_job').value || '');
  fd.append('Opinion', document.getElementById('tt_opinion').value);
  const file = document.getElementById('tt_image').files[0]; if(file) fd.append('Image', file);
  try{
    const res = await fetch(API.testimonial + (id ? '/' + id : ''), { method: id ? 'PUT' : 'POST', body: fd });
    if(!res.ok) throw new Error('فشل حفظ');
    pushToast('تم الحفظ', 'success'); e.target.reset(); document.getElementById('tt_id').value=''; loadTestimonials();
  }catch(err){ console.error(err); pushToast('تعذر الحفظ', 'error'); }
});

/* ======= Login (simple) ======= */
document.getElementById('loginForm').addEventListener('submit', async (e)=>{
  e.preventDefault();
  const f = new FormData(e.target);
  const payload = { username: f.get('username'), password: f.get('password') };
  try{
    const res = await fetch(API.login, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(payload) });
    if(!res.ok) throw new Error('Invalid');
    const data = await res.json();
    const username = data.username || data.user || 'user';
    localStorage.setItem('whoami', username);
    document.getElementById('whoami').textContent = username;
    document.getElementById('btnLogin').style.display='none';
    document.getElementById('btnLogout').style.display='inline-block';
    pushToast('تم تسجيل الدخول', 'success');
  }catch(err){ pushToast('بيانات غير صحيحة', 'error'); }
});
document.getElementById('btnLogin').onclick = ()=> { navLinks.forEach(l=>l.classList.remove('active')); document.querySelector('[data-target="users"]').classList.add('active'); Object.values(views).forEach(v=>v.classList.add('d-none')); views.users.classList.remove('d-none'); };
document.getElementById('btnLogout').onclick = ()=> { localStorage.removeItem('whoami'); document.getElementById('whoami').textContent='زائر'; document.getElementById('btnLogin').style.display='inline-block'; document.getElementById('btnLogout').style.display='none'; };

/* ======= Settings & partners ======= */
const setForm = document.getElementById('settingsForm');
document.getElementById('set_api').value = API_BASE;
document.getElementById('set_logoText').value = defaults.logoText;
document.getElementById('set_theme').value = defaults.theme;

setForm.addEventListener('submit', (e)=>{
  e.preventDefault();
  API_BASE = document.getElementById('set_api').value.trim() || API_BASE;
  localStorage.setItem('API_BASE', API_BASE);
  localStorage.setItem('logoText', document.getElementById('set_logoText').value.trim()||'A');
  localStorage.setItem('theme', document.getElementById('set_theme').value);
  pushToast('تم حفظ الإعدادات — سيتم إعادة تحميل الصفحة', 'info', 1500);
  setTimeout(()=> location.reload(), 900);
});
document.getElementById('settingsReset').onclick = ()=>{
  localStorage.removeItem('API_BASE'); localStorage.removeItem('logoText'); localStorage.removeItem('theme'); localStorage.removeItem('partners'); location.reload();
};

function renderPartners(){
  const box = document.getElementById('partner_list'); box.innerHTML='';
  const side = document.getElementById('partners'); side.innerHTML='';
  const arr = JSON.parse(localStorage.getItem('partners')||'[]');
  arr.forEach((src,i)=>{
    const chip = document.createElement('div'); chip.className='d-flex align-items-center gap-2 badge text-bg-secondary';
    chip.innerHTML = `<img src="${src}" style="width:34px;height:18px;object-fit:cover;border-radius:4px"><span>شريك ${i+1}</span><button class="btn-close btn-close-white btn-sm ms-1" data-i="${i}"></button>`;
    chip.querySelector('button').onclick = ()=>{ arr.splice(i,1); localStorage.setItem('partners',JSON.stringify(arr)); renderPartners(); }
    box.appendChild(chip);
    const img = document.createElement('img'); img.src=src; img.className='rounded'; img.style.width='60px'; img.style.height='28px'; img.style.objectFit='cover';
    side.appendChild(img);
  });
}
document.getElementById('partner_add_btn').onclick = ()=>{
  const v = document.getElementById('partner_add').value.trim(); if(!v){ pushToast('أدخل رابط صورة الشريك', 'error'); return; }
  const arr = JSON.parse(localStorage.getItem('partners')||'[]'); arr.push(v); localStorage.setItem('partners', JSON.stringify(arr)); document.getElementById('partner_add').value=''; renderPartners(); pushToast('تمت الإضافة', 'success');
};
renderPartners();

/* ======= Boot ======= */
function boot(){
  const me = localStorage.getItem('whoami');
  if(me){ document.getElementById('whoami').textContent = me; document.getElementById('btnLogin').style.display='none'; document.getElementById('btnLogout').style.display='inline-block'; }
  loadStats(); loadProjects(); loadPosts(); loadAppointments(); loadTech(); loadTestimonials();
}
boot();

/* ======= small helper for inline messages ======= */
function showShort(msg, type='success'){ pushToast(msg, type); }

 // live search/filter
document.getElementById('projSearch').addEventListener('input', loadProjects);
document.getElementById('projFilter').addEventListener('change', loadProjects);

