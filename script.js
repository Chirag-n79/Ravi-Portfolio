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
const FILES_PREFIX = 'files-'; // localStorage key prefix

document.addEventListener('DOMContentLoaded', ()=>{
  /* ====== LOGIN HANDLING ====== */
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

  // Always force login on refresh
  showLogin();

  // toggle password visibility
  pwToggle.addEventListener('click',()=>{
    const isPwd = passwordInput.type === 'password';
    passwordInput.type = isPwd ? 'text' : 'password';
    pwToggle.textContent = isPwd ? 'Hide' : 'Show';
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

  // Cancel clears field
  cancelBtn.addEventListener('click',()=>{ passwordInput.value=''; });

  // logout
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

  // Render dynamic menu items and sections (About is already present)
  SECTIONS.forEach((s)=>{
    // menu item
    const a = document.createElement('a');
    a.href='#';
    a.dataset.section = s.key;
    a.textContent = s.label;
    menu.appendChild(a);

    // section
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

  // Navigation handling
  document.querySelectorAll('.menu a').forEach(link=>{
    link.addEventListener('click', e=>{
      e.preventDefault();
      activateSection(link.dataset.section);
      // auto close sidebar on mobile
      document.getElementById('sidebar').classList.remove('open');
    });
  });

  // default to About
  activateSection('about');

  // search filter
  searchInput.addEventListener('input',()=>{
    const term = searchInput.value.toLowerCase();
    document.querySelectorAll('.menu a').forEach(link=>{
      link.style.display = link.textContent.toLowerCase().includes(term) ? 'block':'none';
    });
  });

  /* Profile handling */
  const profileUpload = document.getElementById('profileUpload');
  const profileImage = document.getElementById('profileImage');
  const placeholder = document.getElementById('placeholder');
  const downloadJPG = document.getElementById('downloadJPG');
  const downloadPDF = document.getElementById('downloadPDF');
  const removeProfile = document.getElementById('removeProfile');

  const savedProfile = localStorage.getItem(PROFILE_STORAGE_KEY);
  if(savedProfile){
    profileImage.src = savedProfile;
    profileImage.style.display='block';
    placeholder.style.display='none';
    downloadJPG.disabled=false;
    downloadPDF.disabled=false;
  }

  profileUpload.addEventListener('change',()=>{
    const file = profileUpload.files[0];
    if(!file) return;
    const reader = new FileReader();
    reader.onload = e=>{
      const data = e.target.result;
      localStorage.setItem(PROFILE_STORAGE_KEY, data);
      profileImage.src=data;
      profileImage.style.display='block';
      placeholder.style.display='none';
      downloadJPG.disabled=false;
      downloadPDF.disabled=false;
    };
    reader.readAsDataURL(file);
  });

  downloadJPG.addEventListener('click',()=>{
    if(!profileImage.src) return;
    const a = document.createElement('a');
    a.href=profileImage.src;
    a.download='profile.jpg';
    a.click();
  });

  downloadPDF.addEventListener('click',()=>{
    if(!profileImage.src) return;
    const { jsPDF } = window.jspdf;
    const img = new Image();
    img.src = profileImage.src;
    img.onload = function(){
      const pdf = new jsPDF({orientation: img.width > img.height ? 'l':'p', unit:'px', format:[img.width, img.height]});
      pdf.addImage(img, 'JPEG', 0, 0, img.width, img.height);
      pdf.save('profile.pdf');
    };
  });

  removeProfile.addEventListener('click',()=>{
    if(confirm('Remove profile image?')){
      localStorage.removeItem(PROFILE_STORAGE_KEY);
      profileImage.src='';
      profileImage.style.display='none';
      placeholder.style.display='block';
      downloadJPG.disabled=true;
      downloadPDF.disabled=true;
    }
  });

  /* File manager per section */
  SECTIONS.forEach(s=>{
    const input=document.getElementById(`input-${s.key}`);
    const preview=document.getElementById(`preview-${s.key}`);
    const clearBtn=document.getElementById(`clear-${s.key}`);

    function render(){
      const stored=localStorage.getItem(FILES_PREFIX+s.key);
      let arr=stored?JSON.parse(stored):[];
      preview.innerHTML='';
      if(arr.length===0){
        preview.innerHTML='<div>No files uploaded</div>';
        return;
      }
      arr.forEach((obj,idx)=>{
        const card=document.createElement('div');
        card.className='file-card';

        const thumb=document.createElement('div');
        thumb.className='thumb';
        if(obj.type && obj.type.startsWith('image/')){
          const img=document.createElement('img');
          img.src=obj.data;
          img.alt=obj.name;
          thumb.appendChild(img);
        }else{
          const pill=document.createElement('div');
          pill.className='pdf-pill';
          pill.textContent='PDF';
          thumb.appendChild(pill);
        }

        const name=document.createElement('div');
        name.className='file-name';
        name.textContent=obj.name;

        const actions=document.createElement('div');
        actions.className='actions';

        const viewBtn=document.createElement('button');
        viewBtn.className='btn sm';
        viewBtn.textContent='View';
        viewBtn.addEventListener('click',()=>openViewer(obj));

        const dlBtn=document.createElement('button');
        dlBtn.className='btn sm';
        dlBtn.textContent='Download';
        dlBtn.addEventListener('click',()=>{
          const a=document.createElement('a');
          a.href=obj.data;
          a.download=obj.name;
          a.click();
        });

        const delBtn=document.createElement('button');
        delBtn.className='btn sm';
        delBtn.textContent='Delete';
        delBtn.addEventListener('click',()=>{
          if(confirm('Delete this file?')){
            arr.splice(idx,1);
            localStorage.setItem(FILES_PREFIX+s.key, JSON.stringify(arr));
            render();
          }
        });

        actions.append(viewBtn, dlBtn, delBtn);
        card.append(thumb, name, actions);
        preview.appendChild(card);
      });
    }

    // initial render
    render();

    // uploads
    input.addEventListener('change',()=>{
      const files=[...input.files];
      const stored=localStorage.getItem(FILES_PREFIX+s.key);
      let arr=stored?JSON.parse(stored):[];
      files.forEach(file=>{
        const reader=new FileReader();
        reader.onload=e=>{
          arr.push({name:file.name,type:file.type||'application/octet-stream',data:e.target.result});
          localStorage.setItem(FILES_PREFIX+s.key, JSON.stringify(arr));
          render();
        };
        reader.readAsDataURL(file);
      });
      input.value='';
    });

    // clear
    clearBtn.addEventListener('click',()=>{
      const stored=localStorage.getItem(FILES_PREFIX+s.key);
      const hasAny = stored && JSON.parse(stored).length>0;
      if(!hasAny){ alert('No files to clear in this section.'); return; }
      if(confirm(`Delete all ${s.label} files?`)){
        localStorage.removeItem(FILES_PREFIX+s.key);
        render();
      }
    });
  });

  /* ======= VIEWER ======= */
  const viewer = document.getElementById('viewer');
  const viewerContent = document.getElementById('viewerContent');
  const viewerTitle = document.getElementById('viewerTitle');
  const viewerClose = document.getElementById('viewerClose');
  const viewerDownload = document.getElementById('viewerDownload');

  function openViewer(item){
    viewerContent.innerHTML = '';
    viewerTitle.textContent = item.name;

    if(item.type && item.type.startsWith('image/')){
      const img = document.createElement('img');
      img.src = item.data;
      viewerContent.appendChild(img);
    } else {
      const iframe = document.createElement('iframe');
      iframe.src = item.data;
      viewerContent.appendChild(iframe);
    }
    viewer.classList.add('show');
    viewer.setAttribute('aria-hidden','false');

    viewerDownload.onclick = ()=> {
      const a = document.createElement('a');
      a.href = item.data;
      a.download = item.name;
      a.click();
    };
  }

  // expose to scope
  window.openViewer = openViewer;

  viewerClose.addEventListener('click', ()=> {
    viewer.classList.remove('show');
    viewer.setAttribute('aria-hidden','true');
    viewerContent.innerHTML = '';
  });

  // close viewer on background click
  viewer.addEventListener('click', (e)=>{
    if(e.target === viewer){
      viewer.classList.remove('show');
      viewer.setAttribute('aria-hidden','true');
      viewerContent.innerHTML = '';
    }
  });
}

/* ======= Global: activateSection (as requested) ======= */
function activateSection(key){
  document.querySelectorAll('.menu a').forEach(l=>l.classList.toggle('active', l.dataset.section===key));
  document.querySelectorAll('main section').forEach(sec=>sec.classList.toggle('active', sec.id===key));
  const content = document.querySelector('.content');
  if(content) content.scrollTop = 0;
}
