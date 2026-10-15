const $ = id => document.getElementById(id);
const STORE_KEY = 'loveday.profiles.v2';
const ACTIVE_KEY = 'loveday.active.v2';
const blankProfile = (email='') => ({email, relationships:[], activeId:null, accent:'#ed4d83'});
let profiles = readProfiles();
let activeEmail = localStorage.getItem(ACTIVE_KEY) || Object.keys(profiles)[0] || '';
function readProfiles(){try{return JSON.parse(localStorage.getItem(STORE_KEY)||'{}')}catch{return {}}}
function profile(){return profiles[activeEmail] || null}
function saveAll(){localStorage.setItem(STORE_KEY,JSON.stringify(profiles)); if(activeEmail)localStorage.setItem(ACTIVE_KEY,activeEmail)}
function saveProfile(){if(profile())saveAll()}
function localDateString(d){return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`}
function parseDate(s){if(!s)return null;const [y,m,d]=s.split('-').map(Number);return new Date(y,m-1,d,12)}
function formatDate(d){return d?new Intl.DateTimeFormat('vi-VN',{day:'2-digit',month:'2-digit',year:'numeric'}).format(d):'Chưa thiết lập'}
function daysBetween(a,b){return Math.max(0,Math.floor((b-a)/86400000))}
function dayWord(n){return new Intl.NumberFormat('vi-VN').format(n)}
function escapeHtml(s){return String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
function showToast(msg){const t=$('toast');t.textContent=msg;t.classList.add('show');clearTimeout(showToast.timer);showToast.timer=setTimeout(()=>t.classList.remove('show'),2600)}
function openModal(title,body){$('modalTitle').textContent=title;$('modalBody').innerHTML=body;$('modalBackdrop').hidden=false}
function closeModal(){$('modalBackdrop').hidden=true}
function current(){const p=profile();return p?.relationships.find(r=>r.id===p.activeId)||p?.relationships[0]||null}
function isStopped(r){return !!r?.status && r.status!=='active'}
function countDays(r){if(!r?.startDate)return null;const end=r.status==='paused'&&r.pauseDate?parseDate(r.pauseDate):(r.status==='ended'&&r.endDate?parseDate(r.endDate):parseDate(localDateString(new Date())));return daysBetween(parseDate(r.startDate),end)+1}
function relationshipLabel(r){return r?.type==='custom'?(r.customType||'Mối quan hệ'):({love:'Tình yêu',friend:'Tình bạn',bestfriend:'Bạn thân',family:'Gia đình',crush:'Crush'}[r?.type]||'Mối quan hệ')}
function setToday(){const now=new Date();$('todayDate').textContent=formatDate(now);const r=current();$('daysCount').textContent=countDays(r)===null?'♡':dayWord(countDays(r));$('sinceText').textContent=!r?'Thêm một mối quan hệ':r.status==='paused'?`Đã tạm dừng · ${formatDate(parseDate(r.pauseDate))}`:r.status==='ended'?`Đã kết thúc · ${formatDate(parseDate(r.endDate))}`:r.startDate?`Bắt đầu ${formatDate(parseDate(r.startDate))}`:'Thêm ngày bắt đầu';}
function renderEvents(){const r=current();const list=r?.events||[];const now=parseDate(localDateString(new Date()));const upcoming=list.map((e,i)=>({...e,_i:i,_date:parseDate(e.date)})).filter(e=>e._date).map(e=>{let next=new Date(e._date);if(e.repeat==='yearly'){next.setFullYear(now.getFullYear());if(next<now)next.setFullYear(now.getFullYear()+1)}return {...e,next,days:daysBetween(now,next)}}).filter(e=>e.next>=now).sort((a,b)=>a.next-b.next);$('upcomingList').innerHTML=upcoming.length?upcoming.slice(0,4).map(e=>`<article class="event-card"><div class="event-date"><strong>${String(e.next.getDate()).padStart(2,'0')}</strong><small>THÁNG ${String(e.next.getMonth()+1).padStart(2,'0')}</small></div><div class="event-info"><strong>${escapeHtml(e.title)}</strong><small>${e.days===0?'Hôm nay':`Còn ${e.days} ngày`} · ${formatDate(e.next)}</small></div></article>`).join(''):`<div class="empty-state">Thêm một kỷ niệm đáng nhớ nhé ✨</div>`;const r0=r;$('nextMilestone').textContent=r0?.startDate?'Ngày bắt đầu của '+(r0.name||'mối quan hệ'):'Ngày đặc biệt';if(r0?.startDate){const start=parseDate(r0.startDate),today=new Date();let next=new Date(today.getFullYear(),start.getMonth(),start.getDate(),12);if(next<parseDate(localDateString(today)))next.setFullYear(next.getFullYear()+1);$('milestoneDate').textContent=`${formatDate(next)} · ${dayWord(daysBetween(now,next))} ngày nữa`}else $('milestoneDate').textContent='Thêm ngày bắt đầu trong phần cài đặt'}
function render(){
  const p=profile(),r=current();
  document.documentElement.style.setProperty('--pink',p?.accent||'#ed4d83');
  const myName=p?.nickname||'Tên tôi',partner=r?.partnerNickname||r?.name||'Tên bạn';
  $('boyName').textContent=myName;$('girlName').textContent=partner;
  $('relationshipSymbol').textContent=r?.type==='love'?'♥':'🔥';
  $('friendFlame').hidden=!(r&&r.type!=='love');$('friendFlame').textContent='🔥';$('heartStage')?.classList.toggle('is-friend',!!r&&r.type!=='love');
  $('heroHeading').innerHTML=r?`${escapeHtml(myName)} <span>${r.type==='love'?'♥':'🔥'}</span> ${escapeHtml(partner)}<br><span>${r.type==='love'?'Tình yêu':'Bạn bè'}</span>`:'Mỗi mối quan hệ<br><span>đều có câu chuyện riêng.</span>';
  $('heroSub').textContent=r?(r.status==='active'?'Lưu giữ hành trình của hai bạn.':r.status==='paused'?'Chuỗi ngày đang tạm dừng.':'Chuỗi ngày đã kết thúc.'):'Tạo tài khoản rồi tìm nickname để bắt đầu kết nối.';
  $('dayLabel').textContent=r?.type==='love'?'NGÀY YÊU NHAU':'NGÀY BÊN NHAU';
  $('relationshipStatus').textContent=r?.status==='paused'?'ĐANG TẠM DỪNG':r?.status==='ended'?'ĐÃ KẾT THÚC':'';
  setToday();renderEvents();renderFloat();
}
async function hashPassword(password){
  if(window.crypto?.subtle){
    const bytes=new TextEncoder().encode(password);
    const digest=await crypto.subtle.digest('SHA-256',bytes);
    return Array.from(new Uint8Array(digest)).map(x=>x.toString(16).padStart(2,'0')).join('');
  }
  // Local prototype fallback only. Never use this fallback for production authentication.
  return 'local-demo:'+btoa(unescape(encodeURIComponent(password)));
}
function accountModal(mode='login'){
  const isRegister=mode==='register';
  openModal(isRegister?'Tạo tài khoản':'Đăng nhập',`
    <p class="helper">Bản hiện tại là nguyên mẫu lưu trên thiết bị để kiểm thử luồng giao diện. Tài khoản chưa đồng bộ giữa các máy; không dùng mật khẩu thật. Google/Facebook cần cấu hình xác thực chính thức ở backend.</p>
    <div class="button-row auth-switch"><button class="btn ${isRegister?'btn-secondary':'btn-primary'}" id="showLogin" type="button">Đăng nhập</button><button class="btn ${isRegister?'btn-primary':'btn-secondary'}" id="showRegister" type="button">Tạo tài khoản</button></div>
    <form id="accountForm">
      <div class="field"><label for="accountEmail">Email / Gmail</label><input id="accountEmail" type="email" autocomplete="email" required value="${isRegister?'':escapeHtml(activeEmail)}" placeholder="ban@email.com"></div>
      ${isRegister?`<div class="field"><label for="accountNickname">Nickname (duy nhất)</label><input id="accountNickname" minlength="3" maxlength="24" pattern="[A-Za-z0-9_.]+" required autocomplete="nickname" placeholder="vi_du_123"><small class="helper">3–24 ký tự; chỉ chữ không dấu, số, dấu chấm và gạch dưới.</small></div>`:''}
      <div class="field"><label for="accountPassword">Mật khẩu</label><input id="accountPassword" type="password" minlength="8" required autocomplete="${isRegister?'new-password':'current-password'}" placeholder="Ít nhất 8 ký tự"></div>
      ${isRegister?`<div class="field"><label>Ngày tháng năm sinh</label><div class="dob-grid"><input id="accountDobDay" inputmode="numeric" type="number" min="1" max="31" placeholder="Ngày" aria-label="Ngày sinh" required><input id="accountDobMonth" inputmode="numeric" type="number" min="1" max="12" placeholder="Tháng" aria-label="Tháng sinh" required><input id="accountDobYear" inputmode="numeric" type="number" min="1900" max="${new Date().getFullYear()}" placeholder="Năm" aria-label="Năm sinh" required></div><small class="helper">Nhập trực tiếp ngày / tháng / năm; không cần bấm lùi từng năm.</small></div>`:''}
      <div class="button-row"><button class="btn btn-primary" type="submit">${isRegister?'Tạo tài khoản':'Đăng nhập'}</button></div>
    </form>
    <div class="divider-label">— hoặc —</div>
    <div class="button-row"><button class="btn btn-secondary" type="button" id="googleAuth">Tiếp tục với Google</button><button class="btn btn-secondary" type="button" id="facebookAuth">Facebook</button></div>
    <p class="helper">Đăng nhập Google/Facebook sẽ được bật khi tích hợp OAuth thật. Nút hiện tại không giả lập đăng nhập thành công.</p>`);
  $('showLogin').onclick=()=>accountModal('login');
  $('showRegister').onclick=()=>accountModal('register');
  $('googleAuth').onclick=$('facebookAuth').onclick=()=>showToast('Cần cấu hình OAuth và backend trước khi dùng');
  $('accountForm').addEventListener('submit',async e=>{
    e.preventDefault();
    const email=$('accountEmail').value.trim().toLowerCase();
    const password=$('accountPassword').value;
    if(!email||password.length<8){showToast('Kiểm tra email và mật khẩu nhé');return}
    const passwordHash=await hashPassword(password);
    if(isRegister){
      const nickname=$('accountNickname').value.trim();
      const dd=Number($('accountDobDay').value), mm=Number($('accountDobMonth').value), yyyy=Number($('accountDobYear').value);
      const dob=yyyy&&mm&&dd?`${yyyy}-${String(mm).padStart(2,'0')}-${String(dd).padStart(2,'0')}`:'';
      const dobDate=dob?parseDate(dob):null;
      const validDob=!!dobDate&&dobDate.getFullYear()===yyyy&&dobDate.getMonth()+1===mm&&dobDate.getDate()===dd;
      if(!/^[A-Za-z0-9_.]{3,24}$/.test(nickname)){showToast('Nickname chưa đúng định dạng');return}
      if(!validDob||yyyy<1900||dob>localDateString(new Date())){showToast('Ngày sinh không hợp lệ, hãy kiểm tra ngày/tháng/năm');return}
      if(profiles[email]){showToast('Email này đã có tài khoản trên thiết bị');return}
      if(Object.values(profiles).some(x=>(x.nickname||'').toLowerCase()===nickname.toLowerCase())){showToast('Nickname đã được sử dụng');return}
      profiles[email]={...blankProfile(email),nickname,dob,passwordHash,invitations:[],messages:[],relationships:[],activeId:null,accent:'#ed4d83'};
      activeEmail=email;saveAll();closeModal();render();showToast('Tạo tài khoản trên thiết bị thành công');
    }else{
      const existing=profiles[email];
      if(!existing){showToast('Không tìm thấy tài khoản trên thiết bị này');return}
      if(existing.passwordHash && existing.passwordHash!==passwordHash){showToast('Mật khẩu không đúng');return}
      if(!existing.passwordHash){showToast('Tài khoản cũ chưa có mật khẩu. Hãy tạo tài khoản mới để kiểm thử.');return}
      activeEmail=email;saveAll();closeModal();render();showToast('Đăng nhập thành công');
    }
  });
}
function relationshipModal(){
  const p=profile();if(!p){accountModal('login');return}
  const list=(p.relationships||[]).map(r=>`<div class="event-row"><div><strong>${escapeHtml(p.nickname||'Tôi')} – ${r.type==='love'?'♥':'🔥'} – ${escapeHtml(r.partnerNickname||r.name||'Bạn')}</strong><small>${r.status==='active'?'Đang hoạt động':r.status==='paused'?'Tạm dừng':'Đã kết thúc'}${r.startDate?' · Từ '+formatDate(parseDate(r.startDate)):''}</small></div><button class="remove-event" data-active="${r.id}">${r.id===p.activeId?'Đang xem':'Mở'}</button></div>`).join('');
  openModal('Kết nối',`<p class="helper">Không thể tự tạo streak chỉ bằng cách nhập tên. Hãy tìm nickname, gửi lời mời và chờ người kia chấp nhận.</p><div>${list||'<div class="empty-state">Chưa có streak nào được chấp nhận.</div>'}</div><hr style="border:0;border-top:1px solid #f3e2e9;margin:17px 0">
  <form id="searchUserForm"><div class="field"><label for="searchNickname">Tìm tài khoản theo nickname</label><input id="searchNickname" maxlength="24" required placeholder="Nhập nickname chính xác"></div><div class="field"><label for="inviteType">Chế độ streak</label><select id="inviteType"><option value="love">Tình yêu · trái tim</option><option value="friend">Bạn bè · ngọn lửa</option></select></div><button class="btn btn-primary" type="submit">Tìm người dùng</button></form><div id="searchResults"></div>`);
  $('searchUserForm').onsubmit=e=>{
    e.preventDefault();const q=$('searchNickname').value.trim().toLowerCase();
    const found=Object.values(profiles).find(x=>(x.nickname||'').toLowerCase()===q&&x.email!==activeEmail);
    const area=$('searchResults');
    if(!found){area.innerHTML='<div class="empty-state">Không tìm thấy nickname trên thiết bị này. Bản demo chưa có máy chủ tìm kiếm toàn mạng.</div>';return}
    const already=(p.invitations||[]).some(i=>i.toEmail===found.email&&i.status==='pending')||(p.relationships||[]).some(r=>r.partnerEmail===found.email&&r.status==='active');
    area.innerHTML=`<div class="event-row"><div><strong>@${escapeHtml(found.nickname)}</strong><small>${already?'Đã có lời mời hoặc streak đang hoạt động':'Tài khoản LoveDay'}</small></div><button class="btn btn-primary" id="sendInvite" ${already?'disabled':''}>Gửi lời mời</button></div>`;
    if(!already)$('sendInvite').onclick=()=>{
      const inv={id:(crypto.randomUUID?crypto.randomUUID():String(Date.now())),fromEmail:activeEmail,toEmail:found.email,type:$('inviteType').value,status:'pending',createdAt:new Date().toISOString(),messages:[]};
      p.invitations=p.invitations||[];p.invitations.push(inv);
      found.invitations=found.invitations||[];found.invitations.push({...inv});
      saveAll();showToast('Đã gửi lời mời vào mục Thư');relationshipModal();
    };
  };
  document.querySelectorAll('[data-active]').forEach(b=>b.onclick=()=>{p.activeId=b.dataset.active;saveProfile();closeModal();render()});
}
function getInvitation(id){
  for(const pr of Object.values(profiles)){const found=(pr.invitations||[]).find(i=>i.id===id);if(found)return found}
  return null;
}
function syncInvitation(inv){
  for(const pr of Object.values(profiles)){
    pr.invitations=pr.invitations||[];
    const i=pr.invitations.findIndex(x=>x.id===inv.id);
    if(i>=0)pr.invitations[i]=JSON.parse(JSON.stringify(inv));
  }
  saveAll();
}
function inboxModal(){
  const p=profile();if(!p){accountModal('login');return}
  const incoming=(p.invitations||[]).filter(i=>i.toEmail===activeEmail);
  openModal('Thư',`<p class="helper">Lời mời tạo streak sẽ xuất hiện tại đây. Chỉ khi bạn chấp nhận, chuỗi ngày mới bắt đầu.</p>
  <div>${incoming.length?incoming.map(i=>{const sender=profiles[i.fromEmail];return `<div class="event-row"><div><strong>@${escapeHtml(sender?.nickname||'Tài khoản')} · ${i.type==='love'?'♥ Tình yêu':'🔥 Bạn bè'}</strong><small>${i.status==='pending'?'Đang chờ phản hồi':i.status==='accepted'?'Đã chấp nhận':'Đã từ chối'}</small></div>${i.status==='pending'?`<div class="button-row"><button class="btn btn-primary" data-accept="${i.id}">Chấp nhận</button><button class="remove-event" data-reject="${i.id}">Từ chối</button></div>`:''}</div>`}).join(''):'<div class="empty-state">Hộp thư chưa có lời mời nào.</div>'}</div>`);
  document.querySelectorAll('[data-accept]').forEach(b=>b.onclick=()=>{
    const inv=getInvitation(b.dataset.accept);if(!inv||inv.status!=='pending')return;
    inv.status='accepted';inv.acceptedAt=new Date().toISOString();inv.startDate=localDateString(new Date());inv.messages=inv.messages||[];
    const a=profiles[inv.fromEmail],c=profiles[inv.toEmail];
    const makeRel=(self,other)=>({id:'rel-'+inv.id,invitationId:inv.id,partnerEmail:other.email,partnerNickname:other.nickname||'Bạn',name:other.nickname||'Bạn',type:inv.type,startDate:inv.startDate,status:'active',pauseDate:'',endDate:'',stopReason:'',events:[]});
    for(const [self,other] of [[a,c],[c,a]]){self.relationships=self.relationships||[];if(!self.relationships.some(r=>r.invitationId===inv.id)){self.relationships.push(makeRel(self,other));self.activeId='rel-'+inv.id}}
    syncInvitation(inv);render();inboxModal();showToast('Đã chấp nhận! Streak bắt đầu từ hôm nay ♥');
  });
  document.querySelectorAll('[data-reject]').forEach(b=>b.onclick=()=>{const inv=getInvitation(b.dataset.reject);if(!inv)return;inv.status='rejected';syncInvitation(inv);inboxModal();showToast('Đã từ chối lời mời')});
}
function chatModal(invId){
  const p=profile();if(!p){accountModal('login');return}
  let invitations=(p.invitations||[]).filter(i=>i.fromEmail===activeEmail||i.toEmail===activeEmail);
  if(!invId){
    openModal('Tin nhắn',`<p class="helper">Trước khi lời mời được chấp nhận, mỗi người chỉ có thể gửi tối đa 3 tin nhắn trong cuộc trò chuyện đó.</p><div>${invitations.length?invitations.map(i=>{const other=profiles[i.fromEmail===activeEmail?i.toEmail:i.fromEmail];return `<div class="event-row"><div><strong>@${escapeHtml(other?.nickname||'Tài khoản')}</strong><small>${i.status==='accepted'?'Đã kết nối':i.status==='pending'?'Chờ chấp nhận':i.status==='rejected'?'Đã từ chối':'Lời mời'}</small></div><button class="btn btn-primary" data-open-chat="${i.id}">Mở chat</button></div>`}).join(''):'<div class="empty-state">Chưa có cuộc trò chuyện. Hãy tìm nickname và gửi lời mời trước.</div>'}</div>`);
    document.querySelectorAll('[data-open-chat]').forEach(b=>b.onclick=()=>chatModal(b.dataset.openChat));return;
  }
  const inv=getInvitation(invId);if(!inv)return;
  const otherEmail=inv.fromEmail===activeEmail?inv.toEmail:inv.fromEmail,other=profiles[otherEmail];
  inv.messages=inv.messages||[];
  const sent=inv.messages.filter(m=>m.fromEmail===activeEmail).length;
  const canSend=inv.status==='accepted'||sent<3;
  openModal(`Chat · @${escapeHtml(other?.nickname||'Bạn')}`,`<p class="helper">${inv.status==='accepted'?'Streak đã được chấp nhận · Bạn có thể nhắn tin.':`Chưa chấp nhận streak · Bạn đã gửi ${sent}/3 tin nhắn.`}</p>
  <div class="chat-log" id="chatLog">${inv.messages.length?inv.messages.map(m=>`<div class="chat-bubble ${m.fromEmail===activeEmail?'mine':'theirs'}"><span>${escapeHtml(m.text)}</span><small>${escapeHtml(m.nickname||'')}</small></div>`).join(''):'<div class="empty-state">Bắt đầu cuộc trò chuyện bằng một lời chào nhé.</div>'}</div>
  <form id="chatForm"><div class="field"><label for="chatText">Tin nhắn</label><input id="chatText" maxlength="500" required placeholder="${canSend?'Nhập tin nhắn...':'Đã hết 3 tin nhắn trước khi chấp nhận'}" ${canSend?'':'disabled'}></div><button class="btn btn-primary" type="submit" ${canSend?'':'disabled'}>Gửi tin nhắn</button></form>
  ${inv.status!=='accepted'&&inv.toEmail===activeEmail&&inv.status==='pending'?'<p class="helper">Bạn có thể chấp nhận lời mời trong mục Thư để mở chat không giới hạn.</p>':''}`);
  const log=$('chatLog');if(log)log.scrollTop=log.scrollHeight;
  $('chatForm').onsubmit=e=>{
    e.preventDefault();const text=$('chatText').value.trim();if(!text)return;
    const latest=getInvitation(invId);latest.messages=latest.messages||[];
    if(latest.status!=='accepted'&&latest.messages.filter(m=>m.fromEmail===activeEmail).length>=3){showToast('Bạn đã dùng hết 3 tin nhắn trước khi chấp nhận');chatModal(invId);return}
    latest.messages.push({id:String(Date.now()),fromEmail:activeEmail,nickname:p.nickname||'Tôi',text,createdAt:new Date().toISOString()});
    syncInvitation(latest);chatModal(invId);
  };
}

function stopModal(){const r=current();if(!r){showToast('Hãy thêm mối quan hệ trước');return}openModal('Tạm dừng hoặc kết thúc',`<p class="helper">Hồ sơ và các kỷ niệm vẫn được giữ lại. Bạn có thể tiếp tục đếm ngày nếu chỉ tạm dừng.</p><div class="field"><label for="stopAction">Bạn muốn làm gì?</label><select id="stopAction"><option value="paused">Tạm dừng đếm ngày</option><option value="ended">Kết thúc mối quan hệ</option><option value="active">Tiếp tục đếm ngày</option></select></div><div class="field"><label for="stopDate">Ngày áp dụng</label><input id="stopDate" type="date" value="${localDateString(new Date())}" max="${localDateString(new Date())}"></div><div class="field"><label for="stopReason">Lý do (không bắt buộc)</label><input id="stopReason" maxlength="180" value="${escapeHtml(r.stopReason||'')}" placeholder="Ví dụ: chia tay, cần thời gian riêng..."></div><div class="button-row"><button class="btn btn-primary" id="saveStop" type="button">Lưu thay đổi</button></div>`);$('saveStop').addEventListener('click',()=>{const action=$('stopAction').value,date=$('stopDate').value;if(!date){showToast('Chọn ngày trước nhé');return}if(action==='active'){r.status='active';r.pauseDate='';r.endDate=''}else if(action==='paused'){r.status='paused';r.pauseDate=date;r.endDate=''}else{r.status='ended';r.endDate=date;r.pauseDate=''}r.stopReason=$('stopReason').value.trim();r.history=r.history||[];r.history.push({status:action,date,reason:r.stopReason,recordedAt:new Date().toISOString()});saveProfile();closeModal();render();showToast(action==='active'?'Đã tiếp tục đếm ngày':'Đã lưu trạng thái mối quan hệ')})}
function settingsModal(){const p=profile();if(!p){accountModal();return}openModal('Cài đặt',`<div class="field"><label for="accentInput">Màu chủ đạo</label><select id="accentInput"><option value="#ed4d83">Hồng</option><option value="#9b75d7">Tím</option><option value="#e47b58">Cam</option><option value="#4c9b91">Xanh</option><option value="#d04f65">Đỏ cherry</option></select></div><div class="button-row"><button class="btn btn-primary" id="saveAccent">Lưu màu</button><button class="btn btn-secondary" id="manageRelations">Bạn bè & mối quan hệ</button><button class="btn btn-secondary" id="manageAccount">Tài khoản</button></div><hr style="border:0;border-top:1px solid #f3e2e9;margin:18px 0"><h3 style="margin:0 0 8px">Lưu trữ đám mây</h3><p class="helper">Mỗi tài khoản hiện có dữ liệu riêng trên thiết bị này. Để đồng bộ an toàn giữa điện thoại và máy tính, cần kết nối dịch vụ đám mây và xác thực tài khoản.</p><button class="btn btn-secondary" id="exportData">Xuất bản sao dữ liệu</button><button class="btn btn-secondary" id="importData">Nhập dữ liệu</button><input id="importFile" type="file" accept="application/json" hidden>`);$('accentInput').value=p.accent||'#ed4d83';$('saveAccent').onclick=()=>{p.accent=$('accentInput').value;saveProfile();render();closeModal();showToast('Đã lưu giao diện')};$('manageRelations').onclick=relationshipModal;$('manageAccount').onclick=accountModal;$('exportData').onclick=()=>{const blob=new Blob([JSON.stringify({email:activeEmail,profile:p},null,2)],{type:'application/json'});const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='loveday-backup.json';a.click();URL.revokeObjectURL(url);showToast('Đã xuất bản sao dữ liệu')};$('importData').onclick=()=>$('importFile').click();$('importFile').onchange=async e=>{const f=e.target.files[0];if(!f)return;try{const obj=JSON.parse(await f.text());const imported=obj.profile||obj;if(!Array.isArray(imported.relationships))throw Error();profiles[activeEmail]={...blankProfile(activeEmail),...imported,email:activeEmail};saveAll();closeModal();render();showToast('Đã nhập dữ liệu')}catch{showToast('File dữ liệu không hợp lệ')}}}
function eventsModal(){const r=current();if(!r){showToast('Hãy thêm mối quan hệ trước');return}const list=(r.events||[]).map((e,i)=>`<div class="event-row"><div><strong>${escapeHtml(e.title)}</strong><small>${formatDate(parseDate(e.date))} · ${e.repeat==='yearly'?'Hằng năm':'Một lần'}</small></div><button class="remove-event" data-remove="${i}">Xóa</button></div>`).join('');openModal('Lịch kỷ niệm',`<div>${list||'<div class="empty-state">Chưa có kỷ niệm nào.</div>'}</div><hr style="border:0;border-top:1px solid #f3e2e9;margin:17px 0"><form id="eventForm"><div class="field"><label for="eventTitle">Tên kỷ niệm</label><input id="eventTitle" required maxlength="60" placeholder="Ngày đầu gặp nhau"></div><div class="form-grid"><div class="field"><label for="eventDate">Ngày</label><input id="eventDate" type="date" required></div><div class="field"><label for="eventRepeat">Lặp lại</label><select id="eventRepeat"><option value="once">Một lần</option><option value="yearly">Hằng năm</option></select></div></div><div class="button-row"><button class="btn btn-primary" type="submit">+ Thêm kỷ niệm</button></div></form>`);$('eventForm').onsubmit=e=>{e.preventDefault();r.events.push({title:$('eventTitle').value.trim(),date:$('eventDate').value,repeat:$('eventRepeat').value});saveProfile();render();eventsModal();showToast('Đã thêm kỷ niệm ♥')};document.querySelectorAll('[data-remove]').forEach(b=>b.onclick=()=>{r.events.splice(Number(b.dataset.remove),1);saveProfile();render();eventsModal()})}
function renderFloat(){
  const r=current(),p=profile();
  const symbol=r?.type==='love'?'♥':'🔥';
  const name=r?`${p?.nickname||'Tôi'} ${symbol} ${r.partnerNickname||r.name||'Bạn'}`:'Streak Day';
  const days=`${countDays(r)===null?'0':dayWord(countDays(r))} ngày`;
  if(window.LoveDayNative?.updateHomeWidget){
    try{window.LoveDayNative.updateHomeWidget(name,days,p?.accent||'#ed4d83',symbol,r?.startDate||'',r?.status||'active',r?.status==='paused'?(r.pauseDate||''):r?.status==='ended'?(r.endDate||''):'')}catch(e){}
  }
}
function floatingModal(){openModal('Widget màn hình chính',`<p class="helper">Streak Day không chạy nổi trên ứng dụng khác và không cần quyền đặc biệt. Hãy thêm widget 2×2 như widget bình thường: đóng app → giữ vào chỗ trống trên màn hình chính → Tiện ích/Widgets → Streak Day → kéo widget ra màn hình. Muốn gỡ, giữ widget rồi chọn Xóa.</p><div class="widget-preview"><span id="widgetPreviewIcon">♥</span><div><strong id="widgetPreviewName">Tên tôi ♥ Tên bạn</strong><small id="widgetPreviewDays">0 ngày</small></div></div><div class="button-row"><button class="btn btn-primary" id="widgetRefresh">Cập nhật widget</button></div>`);const r=current(),p=profile(),symbol=r?.type==='love'?'♥':'🔥';$('widgetPreviewIcon').textContent=symbol;$('widgetPreviewName').textContent=r?`${p?.nickname||'Tôi'} ${symbol} ${r.partnerNickname||r.name||'Bạn'}`:'Streak Day';$('widgetPreviewDays').textContent=`${countDays(r)===null?'0':dayWord(countDays(r))} ngày`;$('widgetPreviewIcon').style.color=p?.accent||'#ed4d83';$('widgetPreviewDays').style.color=p?.accent||'#ed4d83';$('widgetRefresh').onclick=()=>{renderFloat();closeModal();showToast('Đã cập nhật dữ liệu widget. Nếu chưa có, hãy thêm widget từ màn hình chính.')};}
$('settingsBtn').addEventListener('click',settingsModal);$('calendarBtn').addEventListener('click',eventsModal);$('viewCalendarBtn').addEventListener('click',eventsModal);$('closeModal').addEventListener('click',closeModal);$('modalBackdrop').addEventListener('click',e=>{if(e.target===$('modalBackdrop'))closeModal()});document.addEventListener('keydown',e=>{if(e.key==='Escape')closeModal()});$('accountBtn').addEventListener('click',()=>accountModal('login'));$('friendsBtn').addEventListener('click',relationshipModal);$('inboxBtn').addEventListener('click',inboxModal);$('chatBtn').addEventListener('click',()=>chatModal());$('stopDayBtn').addEventListener('click',stopModal);$('floatBtn').addEventListener('click',floatingModal);
// Migrate the original single-couple data into the first local profile.
if(!Object.keys(profiles).length){try{const old=JSON.parse(localStorage.getItem('loveday.v1')||'null');if(old){const email=(old.userEmail||'local@loveday.app').toLowerCase();const r={id:'migrated-love',name:[old.boy,old.girl].filter(Boolean).join(' & ')||'Mối quan hệ của mình',type:'love',startDate:old.startDate||'',status:'active',pauseDate:'',endDate:'',stopReason:'',events:old.events||[],history:[]};profiles[email]={...blankProfile(email),accent:old.accent||'#ed4d83',relationships:[r],activeId:r.id};activeEmail=email;saveAll()}}catch{}}
if(!profile()){activeEmail='';profiles={};}
if(!activeEmail){$('heroHeading').innerHTML='Mỗi mối quan hệ<br><span>đều có câu chuyện riêng.</span>';setTimeout(()=>accountModal(Object.keys(profiles).length?'login':'register'),250)}
render();if('serviceWorker'in navigator&&location.protocol!=='file:')window.addEventListener('load',()=>navigator.serviceWorker.register('./sw.js').catch(()=>{}));
