/* Editable starter lists. Keep IDs stable when changing wording. No client data. */
(function (root) {
  'use strict';
  const templates = [
    { id: 'story', name: 'Story / interview', shots: [
      ['permission', 'Before rolling', 'Permission + purpose', 'Confirm consent, intended use, names and anything off limits.'],
      ['sound', 'Before rolling', 'Sound + exposure', 'Monitor a test recording. Check focus, exposure, white balance and background.'],
      ['wide', 'Context', 'Establish the place', 'A steady wide shot that explains where this story happens.'],
      ['interview', 'Main interview', 'The main conversation', 'Frame at eye level. Keep the eyeline and background consistent.'],
      ['hands', 'B-roll', 'Hands at work', 'Get a complete action: start, middle and finish. Hold before cutting.'],
      ['detail', 'B-roll', 'A meaningful detail', 'Close view of a tool, object or texture mentioned in the conversation.'],
      ['sequence', 'B-roll', 'Wide, medium, tight', 'Cover the same activity at three sizes for edit options.'],
      ['reaction', 'B-roll', 'Listen + react', 'Capture a natural pause, smile or reaction without directing the emotion.'],
      ['portrait', 'Portrait', 'The person in place', 'Make a clean environmental portrait and a tighter alternative.'],
      ['tone', 'Wrap', 'Room tone', 'Record 30 seconds of the space with everyone quiet and the same audio setup.'],
      ['pickup', 'Wrap', 'Last pickups', 'Check missing coverage. Confirm names, credits and follow-up permission.']
    ], prompts: [
      ['intro', 'Open', 'How would you introduce yourself and what you do?'],
      ['beginning', 'Origin', 'How did you first get started?'],
      ['specific', 'Specifics', 'Can you walk me through one moment that changed things?'],
      ['process', 'Demonstrate', 'Can you show me how that works, step by step?'],
      ['stakes', 'Meaning', 'Why does this matter to you?'],
      ['surprise', 'Reflect', 'What do people usually misunderstand about this?'],
      ['future', 'Close', 'What would you like to happen next?'],
      ['anything', 'Close', 'What should I have asked that I did not?']
    ] },
    { id: 'collector', name: 'Collector interview', shots: [
      ['permission', 'Before rolling', 'Permission + handling', 'Confirm filming consent and how the owner wants the object handled.'],
      ['sound', 'Before rolling', 'Sound + light', 'Test audio. Use soft light and a stable surface without distracting reflections.'],
      ['intro', 'Context', 'Collector in the space', 'Wide view of the collector and setting. Keep identifying details private if requested.'],
      ['talk', 'Interview', 'Record the story', 'Keep the object visible when practical. Separate documented facts from recollection.'],
      ['front', 'Object coverage', 'Front + back', 'Record clear, steady views of both sides without changing the object.'],
      ['profile', 'Object coverage', 'Edges + profile', 'Get side views, thickness and construction details with safe support.'],
      ['detail', 'Object coverage', 'Distinguishing details', 'Show marks, surface features, wear and any repairs the owner identifies.'],
      ['scale', 'Object coverage', 'Give a sense of scale', 'Use a ruler or owner-approved reference without placing stress on the object.'],
      ['records', 'Provenance', 'Supporting records', 'With permission, film relevant labels or documents. Hide private contact details.'],
      ['hands', 'B-roll', 'Owner with the object', 'Capture natural handling only if the owner considers it safe.'],
      ['wrap', 'Wrap', 'Room tone + credits', 'Get quiet room tone. Verify names, wording and permission for follow-up.']
    ], prompts: [
      ['start', 'Open', 'What first drew you to collecting?'],
      ['object', 'The object', 'What can you tell me about this piece in your own words?'],
      ['acquired', 'History', 'When and how did it come into your care?'],
      ['documented', 'Provenance', 'Which parts of its history are documented, and which are recollections?'],
      ['features', 'Details', 'Which details would you like us to look at closely?'],
      ['repairs', 'Condition', 'Are there known repairs, alterations or open questions?'],
      ['meaning', 'Meaning', 'Why is this piece meaningful to you?'],
      ['care', 'Stewardship', 'What have you learned about caring for it?'],
      ['close', 'Close', 'What would you want the next owner or viewer to understand?']
    ] },
    { id: 'portrait', name: 'Portrait session', shots: [
      ['brief', 'Before shooting', 'Purpose + comfort', 'Confirm image use, preferred name, comfort level and anything to avoid.'],
      ['test', 'Before shooting', 'Test frame', 'Check focus on the eye, exposure, white balance and background edges.'],
      ['wide', 'Environmental', 'Person + place', 'Include enough of the setting to tell part of their story.'],
      ['standing', 'Core portraits', 'Standing portrait', 'Give one simple direction. Check hands, posture and clothing.'],
      ['seated', 'Core portraits', 'Seated alternative', 'Try a comfortable position with a clean eyeline and relaxed shoulders.'],
      ['tight', 'Core portraits', 'Tight portrait', 'Move closer for expression. Keep enough framing for the intended crop.'],
      ['candid', 'Variety', 'Movement + candid', 'Invite a small action or conversation instead of forcing an expression.'],
      ['formats', 'Delivery coverage', 'Vertical + horizontal', 'Leave space where a client may need text or a different crop.'],
      ['review', 'Wrap', 'Review + last request', 'Check focus and missing variations. Ask whether they want one more setup.']
    ], prompts: [
      ['purpose', 'Connect', 'What would you like these photographs to say about you?'],
      ['comfort', 'Comfort', 'What helps you feel relaxed in front of a camera?'],
      ['place', 'Context', 'Is there a place or object here that feels especially like you?'],
      ['story', 'Expression', 'Tell me about something you are looking forward to.'],
      ['review', 'Review', 'Which setup felt most natural to you?']
    ] }
  ];
  const fresh = () => ({ version: 1, template: 'story', mode: 'shots', sessions: Object.fromEntries(templates.map(t => [t.id, { shot: 0, prompt: 0, done: [], asked: [] }])) });
  function validate(value) {
    if (!value || value.version !== 1 || !templates.some(t => t.id === value.template) || !['shots', 'prompts'].includes(value.mode) || !value.sessions) throw new Error('Unsupported saved session');
    const clean = fresh(); clean.template = value.template; clean.mode = value.mode;
    for (const t of templates) {
      const s = value.sessions[t.id];
      if (!s || !Number.isInteger(s.shot) || s.shot < 0 || s.shot >= t.shots.length || !Number.isInteger(s.prompt) || s.prompt < 0 || s.prompt >= t.prompts.length || !Array.isArray(s.done) || !Array.isArray(s.asked)) throw new Error('Invalid saved session');
      if (s.done.some(id => !t.shots.some(r => r[0] === id)) || s.asked.some(id => !t.prompts.some(r => r[0] === id))) throw new Error('Unknown saved item');
      clean.sessions[t.id] = { shot: s.shot, prompt: s.prompt, done: [...new Set(s.done)], asked: [...new Set(s.asked)] };
    }
    return clean;
  }
  function current(state) {
    const template = templates.find(t => t.id === state.template), session = state.sessions[state.template], shots = state.mode === 'shots';
    const list = shots ? template.shots : template.prompts, index = session[shots ? 'shot' : 'prompt'], marked = session[shots ? 'done' : 'asked'];
    return { template, session, list, index, item: list[index], marked, complete: marked.includes(list[index][0]) };
  }
  function move(state, delta) { const c = current(state); c.session[state.mode === 'shots' ? 'shot' : 'prompt'] = Math.max(0, Math.min(c.list.length - 1, c.index + delta)); }
  function toggle(state) { const c = current(state), key = state.mode === 'shots' ? 'done' : 'asked'; c.session[key] = c.complete ? c.marked.filter(id => id !== c.item[0]) : [...c.marked, c.item[0]]; }
  function reset(state) { state.sessions[state.template] = fresh().sessions[state.template]; state.mode = 'shots'; }
  const api = { templates, fresh, validate, current, move, toggle, reset };
  if (typeof module !== 'undefined' && module.exports) module.exports = api; else root.ShootCore = api;
})(globalThis);
