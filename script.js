// Data containers persisted in localStorage
const STORAGE_KEYS = {
    meds: 'ziyo_medications',
    appts: 'ziyo_appointments',
    deliveries: 'ziyo_deliveries',
    volunteers: 'ziyo_volunteers',
    reminders: 'ziyo_reminders'
};

let state = {
    meds: [],
    appts: [],
    deliveries: [],
    volunteers: [],
    reminders: []
};

function loadState(){
    Object.keys(STORAGE_KEYS).forEach(k=>{
        try{
            const raw = localStorage.getItem(STORAGE_KEYS[k]);
            state[k] = raw?JSON.parse(raw):[];
        }catch(e){ state[k]=[] }
    });
}

function saveState(){
    Object.keys(STORAGE_KEYS).forEach(k=>{
        localStorage.setItem(STORAGE_KEYS[k], JSON.stringify(state[k]||[]));
    });
}

// Utilities
function uid(){return Date.now().toString(36)+Math.random().toString(36).slice(2,6)}

// Medication functions
function addMedication(){
    const name = (document.getElementById('medName')||{}).value;
    const time = (document.getElementById('medTime')||{}).value;
    if(!name || !time){ alert('Please enter medication and time'); return }
    state.meds.unshift({id:uid(),name,time,taken:false});
    saveState(); displayMedications();
    (document.getElementById('medForm')||{}).reset();
}

function toggleMedTaken(id){
    const item = state.meds.find(m=>m.id===id); if(!item) return;
    item.taken = !item.taken; saveState(); displayMedications();
}

function removeMed(id){ state.meds = state.meds.filter(m=>m.id!==id); saveState(); displayMedications(); }

function displayMedications(){
    const el = document.getElementById('medList'); if(!el) return;
    el.innerHTML = '';
    state.meds.forEach(m=>{
        const li = document.createElement('li');
        const left = document.createElement('div');
        left.style.display='flex'; left.style.gap='10px'; left.style.alignItems='center';
        const cb = document.createElement('input'); cb.type='checkbox'; cb.checked = !!m.taken;
        cb.onchange = ()=>toggleMedTaken(m.id);
        const name = document.createElement('div'); name.innerHTML = `<strong>${m.name}</strong><div class="meta">At ${m.time}</div>`;
        left.appendChild(cb); left.appendChild(name);
        const right = document.createElement('div');
        const del = document.createElement('button'); del.textContent='Remove'; del.onclick=()=>removeMed(m.id);
        right.appendChild(del);
        li.appendChild(left); li.appendChild(right);
        el.appendChild(li);
    });
}

// Appointments
function addAppointment(){
    const title = (document.getElementById('apptTitle')||{}).value; const time = (document.getElementById('apptTime')||{}).value;
    if(!title||!time){ alert('Please enter appointment and time'); return }
    state.appts.unshift({id:uid(),title,time}); saveState(); displayAppointments(); (document.getElementById('apptForm')||{}).reset();
}
function removeAppt(id){ state.appts = state.appts.filter(a=>a.id!==id); saveState(); displayAppointments(); }
function displayAppointments(){ const el=document.getElementById('apptList'); if(!el) return; el.innerHTML=''; state.appts.forEach(a=>{ const li=document.createElement('li'); li.innerHTML=`<div><strong>${a.title}</strong><div class="meta">${new Date(a.time).toLocaleString()}</div></div><div><button onclick="removeAppt('${a.id}')">Remove</button></div>`; el.appendChild(li); }); }

// Deliveries (used by food/pill pages too)
function addDelivery(item){
    // item should be an object {type,details,time,address}
    if(!item || !item.type) return;
    const entry = Object.assign({id:uid(),created:Date.now()},item);
    state.deliveries.unshift(entry); saveState(); displayDeliveries();
}
function removeDelivery(id){ state.deliveries=state.deliveries.filter(d=>d.id!==id); saveState(); displayDeliveries(); }
function displayDeliveries(){ const el=document.getElementById('deliveryList'); if(!el) return; el.innerHTML=''; state.deliveries.forEach(d=>{ const li=document.createElement('li'); li.innerHTML=`<div><strong>${d.type}</strong><div class="meta">${d.details||''} ${d.address?'- '+d.address:''}<div>${d.time?('At '+d.time):''}</div></div></div><div><button onclick="removeDelivery('${d.id}')">Remove</button></div>`; el.appendChild(li); }); }

// Volunteer visits
function addVolunteerVisit(){ const name=(document.getElementById('volName')||{}).value; const date=(document.getElementById('volDate')||{}).value; if(!name||!date){alert('Please enter name and date');return} state.volunteers.unshift({id:uid(),name,date}); saveState(); displayVolunteers(); (document.getElementById('volForm')||{}).reset(); }
function removeVolunteer(id){ state.volunteers=state.volunteers.filter(v=>v.id!==id); saveState(); displayVolunteers(); }
function displayVolunteers(){ const el=document.getElementById('volList'); if(!el) return; el.innerHTML=''; state.volunteers.forEach(v=>{ const li=document.createElement('li'); li.innerHTML=`<div><strong>${v.name}</strong><div class="meta">${v.date}</div></div><div><button onclick="removeVolunteer('${v.id}')">Remove</button></div>`; el.appendChild(li); }); }

// Personal reminders
function addReminder(){ const title=(document.getElementById('remTitle')||{}).value; const time=(document.getElementById('remTime')||{}).value; if(!title||!time){alert('Please enter title and time');return} state.reminders.unshift({id:uid(),title,time,done:false}); saveState(); displayReminders(); (document.getElementById('remForm')||{}).reset(); }
function toggleReminderDone(id){ const it = state.reminders.find(r=>r.id===id); if(!it) return; it.done=!it.done; saveState(); displayReminders(); }
function removeReminder(id){ state.reminders = state.reminders.filter(r=>r.id!==id); saveState(); displayReminders(); }
function displayReminders(){ const el=document.getElementById('remList'); if(!el) return; el.innerHTML=''; state.reminders.forEach(r=>{ const li=document.createElement('li'); const left=document.createElement('div'); left.style.display='flex'; left.style.alignItems='center'; left.style.gap='10px'; const cb=document.createElement('input'); cb.type='checkbox'; cb.checked=!!r.done; cb.onchange=()=>toggleReminderDone(r.id); const txt=document.createElement('div'); txt.innerHTML=`<strong>${r.title}</strong><div class="meta">At ${r.time}</div>`; left.appendChild(cb); left.appendChild(txt); const right=document.createElement('div'); const del=document.createElement('button'); del.textContent='Remove'; del.onclick=()=>removeReminder(r.id); right.appendChild(del); li.appendChild(left); li.appendChild(right); el.appendChild(li); }); }

// Quick fake analysis for uploaded report
function analyzeReport(){ const fileIn=document.getElementById('fileInput'); const result=document.getElementById('analysisResult'); if(!result) return; result.innerHTML=''; if(!fileIn || !fileIn.files || !fileIn.files.length){ result.innerHTML=`<p class="muted">No file selected — showing sample analysis.</p>`; }
    result.innerHTML += `\n        <h4>Analysis Result</h4>\n        <table>\n            <tr><th>Test</th><th>Value</th><th>Status</th></tr>\n            <tr><td>Hemoglobin</td><td>10 g/dL</td><td style="color:red;">Low</td></tr>\n            <tr><td>Blood Sugar</td><td>180 mg/dL</td><td style="color:orange;">High</td></tr>\n        </table>\n        <p style="color:red;"><strong>Please consult a doctor</strong></p>\n    `;
}

// Emergency
function sendEmergency(){ alert('Emergency request sent to caregiver and volunteers.'); }

// Initialization
document.addEventListener('DOMContentLoaded', ()=>{
    loadState();
    displayMedications(); displayAppointments(); displayDeliveries(); displayVolunteers(); displayReminders();

    // Expose addDelivery for other pages/forms
    window.addDelivery = addDelivery;
    window.sendEmergency = sendEmergency;
    window.analyzeReport = analyzeReport;
    window.removeDelivery = removeDelivery;
});

