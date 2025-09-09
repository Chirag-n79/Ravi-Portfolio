/* ======= Configuration ======= */
const GENERAL_PASSWORD = 'Jeevanraviygr@3';

const SECTIONS = [
  { key:'pan', label:'PAN Card' },
  { key:'adhar', label:'ADHAR CARD' },
  { key:'voter', label:'VOTER ID' },
  { key:'birth', label:'BIRTH CERTIFICATE' },
  { key:'rc', label:'RC CARD' },
  { key:'insurance', label:'INSURANCE' },
  { key:'working', label:'WORKING CERTIFICATE' },
  { key:'noc', label:'NOC' },
  { key:'itreturns', label:'IT RETURNS' },
  { key:'marks', label:'MARKS CARD' },
  { key:'bank', label:'BANK PASSBOOK' },
  { key:'deeds', label:'DEEDS' },
  { key:'deptforms', label:'DEPARTMENT FORMS' },
  { key:'officeletters', label:'OFFICE LETTERS' },
  { key:'paanis', label:'PAANIS (layout sketch)' },
  { key:'healthtips', label:'HEALTH TIPS' },
  { key:'bills', label:'BILLS' },
  { key:'warranty', label:'WARRANTY CARD' },
  { key:'photos', label:'PHOTOS' },
  { key:'activities', label:'ACTIVITIES' },
  { key:'others', label:'OTHERS' },
  { key:'pension', label:'PENSION' },
  { key:'gas', label:'GAS PASSBOOK' },
  { key:'ration', label:'RATION CARD' },
  { key:'vehicle', label:'Vehicle' },
  { key:'abha', label:'ABHA Health' },
  { key:'canteen', label:'Canteen' },
  { key:'dl', label:'Driving License' },
  { key:'dep', label:'Dependent Card' },
  { key:'police', label:'Police Card' }
];

const PROFILE_STORAGE_KEY = 'profileData';
const FILES_PREFIX = 'files-'; 

document.addEventListener('DOMContentLoaded',()=>{
  const loginOverlay = document.getElementById('loginOverlay');
  const appRoot = document.getElementById('appRoot');
  const passwordInput = document.getElementById('passwordInput');
  const pwToggle = document.getElementById('pwToggle');
  const loginBtn = document.getElementById('loginBtn');
  const cancelBtn = document.getElementById('cancelBtn');
  const logoutBtn = document.getElementById('logoutBtn');
  const sidebar = document.getElementById('sidebar');
  const hamburger = document.getElementById('hamburger');

  function showApp(){ loginOverlay.style.display='none'; appRoot.style.display='flex'; appRoot.setAttribute('aria-hidden','false'); }
  function showLogin(){ loginOverlay.style.display='flex'; appRoot.style.display='none'; appRoot.setAttribute('aria-hidden','true'); }

  // always force login on refresh
  localStorage.removeItem('docmgr_logged');
  showLogin();

  // toggle password visibility
  pwToggle.addEventListener('click',()=>{
    if(passwordInput.type === 'password'){ passwordInput.type='text'; pwToggle.textContent='Hide'; }
    else { passwordInput.type='password'; pwToggle.textContent='Show'; }
  });

  // login
  loginBtn.addEventListener('click',()=>{
    const val = passwordInput.value || '';
    if(val === GENERAL_PASSWORD){
      passwordInput.value='';
      showApp();
      initializeApp();
    } else {
      alert('Incorrect password');
    }
  });

  cancelBtn.addEventListener('click',()=>{ passwordInput.value=''; });

  logoutBtn.addEventListener('click',()=>{
    if(confirm('Logout from this session?')) {
      showLogin();
    }
  });

  // hamburger for mobile
  hamburger.addEventListener('click', ()=>{
    sidebar.classList.toggle('open');
  });
});

/* ========== MAIN APP INITIALIZATION ========== */
function initializeApp(){
  const menu = document.getElementById('menu');
  const dynamic = document.getElementById('dynamicSections');
  const searchInput = document.getElementById('searchInput');

  // Render menu and sections
  SECTIONS.forEach((s)=>{
    const a = document.createElement('a');
    a.href='#';
    a.dataset.section = s.key;
    a.textContent = s.label;
    menu.appendChild(a);

    const sec = document.createElement('section');
    sec.id = s.key;

    sec.innerHTML = `
      <div style="display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap">
        <h2 style="margin:0">${s.label}</h2>
        <div style="display:flex;gap:8px;align-items:center">
          <label class="btn" for="input-${s.key}">Upload Files</label>
          <input id="input-${s.key}" type="file" multiple accept="image/*,application/pdf" style="display:none;">
          <button class="btn" id="clear-${s.key}">Clear Section</button>
        </div>
      </div>
      <div class="preview" id="preview-${s.key}"><div>No files uploaded</div></div>
      <div class="muted" style="font-size:13px">Files are stored locally (in your browser). Use the Delete button on each item to remove it.</div>
    `;
    dynamic.appendChild(sec);
  });

  /* Navigation handling */
  function activateSection(key){
    document.querySelectorAll('.menu a').forEach(l=>l.classList.toggle('active', l.dataset.section===key));
    document.querySelectorAll('main section').forEach(sec=>sec.classList.toggle('active', sec.id===key));
    document.querySelector('.content').scrollTop = 0;
  }
  document.querySelectorAll('.menu a').forEach(link=>{
    link.addEventListener('click', e=>{
      e.preventDefault();
      activateSection(link.dataset.section);
      document.getElementById('sidebar').classList.remove('open'); // auto close on mobile
    });
  });

  // default open "about"
  activateSection('about');

  /* Search filter */
  searchInput.addEventListener('input',()=>{
    const q = searchInput.value.toLowerCase();
    document.querySelectorAll('.menu a').forEach(l=>{
      if(l.textContent.toLowerCase().includes(q)) l.style.display='';
      else l.style.display='none';
    });
  });

  /* Profile image handling */
  const profileUpload = document.getElementById('profileUpload');
  const profileImage = document.getElementById('profileImage');
  const placeholder = document.getElementById('placeholder');
  const downloadJPG = document.getElementById('downloadJPG');
  const downloadPDF = document.getElementById('downloadPDF');
  const removeProfile = document.getElementById('removeProfile');

  const profileData = localStorage.getItem(PROFILE_STORAGE_KEY);
  if(profileData){ profileImage.src=profileData; profileImage.style.display='block'; placeholder.style.display='none'; downloadJPG.disabled=false; downloadPDF.disabled=false; }

  profileUpload.addEventListener('change',()=>{
    const f = profileUpload.files[0]; if(!f) return;
    const reader = new FileReader();
    reader.onload = (e)=>{
      profileImage.src=e.target.result; profileImage.style.display='block'; placeholder.style.display='none';
      localStorage.setItem(PROFILE_STORAGE_KEY, e.target.result);
      downloadJPG.disabled=false; downloadPDF.disabled=false;
    };
    reader.readAsDataURL(f);
  });

  downloadJPG.addEventListener('click',()=>{
    const link=document.createElement('a'); link.href=profileImage.src; link.download='profile.jpg'; link.click();
  });
  downloadPDF.addEventListener('click',()=>{
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    doc.addImage(profileImage.src, 'JPEG', 15,15,180,160);
    doc.save('profile.pdf');
  });
  removeProfile.addEventListener('click',()=>{
    if(confirm('Delete profile image?')){
      localStorage.removeItem(PROFILE_STORAGE_KEY);
      profileImage.style.display='none'; placeholder.style.display='flex';
      downloadJPG.disabled=true; downloadPDF.disabled=true;
    }
  });

  /* File sections handling */
  SECTIONS.forEach((s)=>{
    const input=document.getElementById(`input-${s.key}`);
    const preview=document.getElementById(`preview-${s.key}`);
    const clearBtn=document.getElementById(`clear-${s.key}`);
    function render(){
      const arr=JSON.parse(localStorage.getItem(FILES_PREFIX+s.key)||'[]');
      preview.innerHTML='';
      if(arr.length===0){ preview.innerHTML='<div>No files uploaded</div>'; return; }
      arr.forEach((f,i)=>{
        const card=document.createElement('div'); card.className='file-card';
        const thumb=document.createElement('div'); thumb.className='thumb';
        if(f.type.startsWith('image/')){ const img=new Image(); img.src=f.data; thumb.appendChild(img); }
        else{ const pill=document.createElement('div'); pill.className='pdf-pill'; pill.textContent='PDF'; thumb.appendChild(pill); }
        card.appendChild(thumb);
        const fname=document.createElement('div'); fname.className='file-name'; fname.textContent=f.name; card.appendChild(fname);
        const actions=document.createElement('div'); actions.className='actions';
        const viewBtn=document.createElement('button'); viewBtn.textContent='View'; viewBtn.className='btn sm';
        viewBtn.onclick=()=>openViewer(f);
        const delBtn=document.createElement('button'); delBtn.textContent='Delete'; delBtn.className='btn sm';
        delBtn.onclick=()=>{ if(confirm('Delete file?')){ arr.splice(i,1); localStorage.setItem(FILES_PREFIX+s.key, JSON.stringify(arr)); render(); } };
        actions.appendChild(viewBtn); actions.appendChild(delBtn);
        card.appendChild(actions);
        preview.appendChild(card);
      });
    }
    render();
    input.addEventListener('change',()=>{
      const files=Array.from(input.files); if(!files.length) return;
      const arr=JSON.parse(localStorage.getItem(FILES_PREFIX+s.key)||'[]');
      files.forEach(f=>{
        const reader=new FileReader();
        reader.onload=(e)=>{ arr.push({name:f.name, type:f.type, data:e.target.result}); localStorage.setItem(FILES_PREFIX+s.key, JSON.stringify(arr)); render(); };
        reader.readAsDataURL(f);
      });
      input.value='';
    });
    clearBtn.addEventListener('click',()=>{ if(confirm('Clear all files in this section?')){ localStorage.removeItem(FILES_PREFIX+s.key); render(); } });
  });

  /* Viewer */
  const viewer=document.getElementById('viewer');
  const viewerTitle=document.getElementById('viewerTitle');
  const viewerContent=document.getElementById('viewerContent');
  const viewerClose=document.getElementById('viewerClose');
  const viewerDownload=document.getElementById('viewerDownload');
  function openViewer(file){
    viewerTitle.textContent=file.name;
    viewerContent.innerHTML='';
    if(file.type.startsWith('image/')){ const img=new Image(); img.src=file.data; viewerContent.appendChild(img); }
    else { const iframe=document.createElement('iframe'); iframe.src=file.data; viewerContent.appendChild(iframe); }
    viewer.classList.add('show'); viewer.setAttribute('aria-hidden','false');
    viewerDownload.onclick=()=>{ const link=document.createElement('a'); link.href=file.data; link.download=file.name; link.click(); };
  }
  viewerClose.addEventListener('click',()=>{ viewer.classList.remove('show'); viewer.setAttribute('aria-hidden','true'); });
}
