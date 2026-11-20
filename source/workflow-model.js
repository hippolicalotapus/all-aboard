'use strict';

// Fictional-data prototype. Completing a checklist never authorizes real work.
const WorkflowModel = (() => {
 const roles = ['office', 'field'];
 const sites = ['office', 'remote', 'jobsite'];
 const templates = {
  onboarding: [['start', 'Confirm start arrangements', 'Manager'], ['forms', 'Review start paperwork', 'HR'], ['policies', 'Review company policies', 'Worker']],
  reboarding: [['changes', 'Review changes since last assignment', 'Manager'], ['policies', 'Review updated policies', 'Worker']],
  transfer: [['handover', 'Complete previous assignment handover', 'Previous manager'], ['new-role', 'Review new role requirements', 'New manager']],
  offboarding: [['handover', 'Complete work handover', 'Manager'], ['equipment-return', 'Record equipment return', 'IT / Facilities'], ['access-close', 'Confirm company access removal', 'IT'], ['final-review', 'Complete departure review', 'HR']]
 };
 function build(kind, role, site) {
  if (!Object.hasOwn(templates, kind) || !roles.includes(role) || !sites.includes(site)) throw Error('Unknown workflow, role or site');
  const rows = templates[kind].map(([id, label, owner]) => ({id, label, owner}));
  if (kind !== 'offboarding') {
   rows.push({id:'equipment', label:'Confirm equipment and account setup', owner:'IT / Facilities'});
   rows.push({id:'orientation', label:site === 'remote' ? 'Complete remote work orientation' : 'Complete location orientation', owner:'Manager'});
   if (role === 'field') rows.push({id:'training', label:'Review required training evidence', owner:'Supervisor'});
   if (site === 'jobsite') rows.push({id:'site-induction', label:'Complete site-specific induction', owner:'Site supervisor'});
   rows.push({id:'approval', label:'Record final supervisor review', owner:'Supervisor'});
  }
  return rows;
 }
 function summarize(tasks, completed) {
  if (!Array.isArray(tasks) || !tasks.length || !completed || typeof completed !== 'object') throw Error('Invalid workflow');
  const missing = tasks.filter(task => completed[task.id] !== true);
  return {total:tasks.length, done:tasks.length-missing.length, missing, complete:missing.length === 0};
 }
 function isDate(value) {
  if(typeof value!=='string'||!/^\d{4}-\d{2}-\d{2}$/.test(value))return false;
  const [y,m,d]=value.split('-').map(Number),date=new Date(Date.UTC(y,m-1,d));
  return y>=1900&&y<=2200&&date.getUTCFullYear()===y&&date.getUTCMonth()===m-1&&date.getUTCDate()===d;
 }
 function localToday(now=new Date()) {
  return String(now.getFullYear()).padStart(4,'0')+'-'+String(now.getMonth()+1).padStart(2,'0')+'-'+String(now.getDate()).padStart(2,'0');
 }
 function taskStatus(id, completed, dueDates, today=localToday()) {
  if(!isDate(today))throw Error('Invalid current date');
  const due=dueDates[id]||'';
  if(due&&!isDate(due))throw Error('Invalid task deadline');
  if(completed.includes(id))return 'complete';
  return !due?'unscheduled':due<today?'overdue':due===today?'today':'upcoming';
 }
 function attention(plans,today=localToday()) {
  const rows=[];
  for(const plan of plans)for(const task of build(plan.kind,plan.role,plan.site)){
   const status=taskStatus(task.id,plan.completed,plan.dueDates||{},today);
   if(status==='overdue'||status==='today')rows.push({...task,kind:plan.kind,role:plan.role,site:plan.site,due:plan.dueDates[task.id],status});
  }
  return rows.sort((a,b)=>a.due.localeCompare(b.due)||a.label.localeCompare(b.label));
 }
 return Object.freeze({build,summarize,isDate,localToday,taskStatus,attention});
})();
if (typeof module !== 'undefined' && module.exports) module.exports = WorkflowModel;
