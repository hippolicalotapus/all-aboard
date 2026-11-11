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
 return Object.freeze({build, summarize});
})();
if (typeof module !== 'undefined' && module.exports) module.exports = WorkflowModel;
