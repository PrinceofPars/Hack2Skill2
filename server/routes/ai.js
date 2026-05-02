const express = require('express');
const router = express.Router();
const statesData = require('../data/states.json');

// RAG knowledge base - curated FAQ pairs grounded in state election law data
const RAG_KB = [
  {
    keywords: ['register', 'registration', 'sign up', 'enroll'],
    answer: (state) => `To register in ${state?.state || 'your state'}, the deadline is typically ${state?.registrationDeadline || 'varies — check your state site'}. ${state?.onlineRegistration ? 'You can register online at ' + state?.officialUrl : 'Online registration may not be available; visit ' + (state?.officialUrl || 'usa.gov') + ' to register by mail or in person'}. Visit <a href="${state?.officialUrl || 'https://vote.gov'}" target="_blank">${state?.officialUrl || 'vote.gov'}</a> for official forms.`,
    source: 'State Election Laws (verified)'
  },
  {
    keywords: ['absentee', 'mail', 'mail-in', 'vote by mail', 'ballot by mail'],
    answer: (state) => `In ${state?.state || 'your state'}, you can request an absentee/mail-in ballot by the deadline: <strong>${state?.absenteeDeadline || 'check your state site'}</strong>. Apply at <a href="${state?.officialUrl || 'https://vote.gov'}" target="_blank">${state?.officialUrl || 'vote.gov'}</a>. Return your ballot by Election Day to your county clerk's office or an official drop box.`,
    source: 'State Absentee Voting Laws'
  },
  {
    keywords: ['id', 'identification', 'photo id', 'license', 'driver'],
    answer: (state) => state?.idRequired
      ? `${state.state} requires photo ID to vote. Accepted forms: ${state.idNotes}. See <a href="${state.officialUrl}" target="_blank">${state.officialUrl}</a> for the complete list.`
      : `${state?.state || 'Your state'} does not require photo ID at the polls. ${state?.idNotes || ''}. See <a href="${state?.officialUrl || 'https://vote.gov'}" target="_blank">official site</a>.`,
    source: 'State Voter ID Laws'
  },
  {
    keywords: ['early voting', 'early vote', 'vote early', 'before election day'],
    answer: (state) => `Early voting in ${state?.state || 'your state'} runs from ${state?.earlyVotingStart || 'varies'} through ${state?.earlyVotingEnd || 'varies'}. Find your early voting location at <a href="${state?.officialUrl || 'https://vote.gov'}" target="_blank">${state?.officialUrl || 'vote.gov'}</a>.`,
    source: 'State Early Voting Rules'
  },
  {
    keywords: ['same day', 'same-day', 'election day registration', 'register on election day'],
    answer: (state) => state?.sameDay
      ? `${state.state} allows same-day voter registration at the polls! Bring valid ID with your current address. See <a href="${state.officialUrl}" target="_blank">${state.officialUrl}</a>.`
      : `${state?.state || 'Your state'} does not offer same-day registration. You must register by the deadline: ${state?.registrationDeadline || 'check your state site'}. See <a href="${state?.officialUrl || 'https://vote.gov'}" target="_blank">official site</a>.`,
    source: 'State Registration Laws'
  },
  {
    keywords: ['poll hours', 'polls open', 'polls close', 'what time', 'hours'],
    answer: (state) => `Polls in ${state?.state || 'your state'} are open ${state?.pollHours || 'check your local elections office'}. Arrive before closing time — if you are in line, you have the right to vote. Source: <a href="${state?.officialUrl || 'https://vote.gov'}" target="_blank">${state?.officialUrl || 'vote.gov'}</a>.`,
    source: 'State Poll Hours'
  },
  {
    keywords: ['signature', 'changed signature', 'different signature', 'signature mismatch'],
    answer: (state) => `If your signature has changed, update it with your local elections office before Election Day. If there's a mismatch on your mail-in ballot, you typically have a "cure" period — contact your county clerk immediately. Source: <a href="${state?.officialUrl || 'https://vote.gov'}" target="_blank">${state?.officialUrl || 'vote.gov'}</a>.`,
    source: 'NVRA & State Curing Procedures'
  },
  {
    keywords: ['felony', 'conviction', 'criminal', 'record', 'prison', 'incarcerated'],
    answer: (_state) => `Voting rights for people with felony convictions vary by state. Many states restore rights after completing a sentence; some restore them automatically. Visit <a href="https://www.aclu.org/voting-rights" target="_blank">ACLU Voting Rights</a> or your state's official election site for details specific to your situation.`,
    source: 'State Felony Disenfranchisement Laws'
  },
  {
    keywords: ['disability', 'disabled', 'wheelchair', 'accessible', 'assistance', 'help voting'],
    answer: (_state) => `Under the Americans with Disabilities Act, polling places must be accessible. You have the right to request assistance from a person of your choice (except your employer or union rep). Curbside voting is also available. Contact your county clerk or visit <a href="https://www.ada.gov/resources/voting/" target="_blank">ADA Voting Resources</a>.`,
    source: 'ADA & HAVA Accessibility Requirements'
  },
  {
    keywords: ['candidate', 'who is running', 'platform', 'policy', 'party'],
    answer: (_state) => `For neutral, objective candidate information, I recommend <a href="https://www.vote411.org" target="_blank">VOTE411.org</a> (League of Women Voters), <a href="https://ballotpedia.org" target="_blank">Ballotpedia.org</a>, or your state's official voter guide. I'm designed to remain non-partisan and do not rank or recommend candidates.`,
    source: 'Non-Partisan Redirect Policy'
  },
  {
    keywords: ['deadline', 'when', 'date', 'last day'],
    answer: (state) => `Key deadlines in ${state?.state || 'your state'}: Registration deadline — ${state?.registrationDeadline || 'varies'}; Absentee request deadline — ${state?.absenteeDeadline || 'varies'}; Early voting — ${state?.earlyVotingStart || 'varies'} to ${state?.earlyVotingEnd || 'varies'}. Always verify at <a href="${state?.officialUrl || 'https://vote.gov'}" target="_blank">${state?.officialUrl || 'vote.gov'}</a>.`,
    source: 'State Election Calendar'
  }
];

const FALLBACK_ANSWER = `I'm here to help with voting procedures and election information. Please ask about topics like voter registration, ID requirements, absentee ballots, early voting, polling hours, or voter eligibility. For official information, visit <a href="https://vote.gov" target="_blank">vote.gov</a>.`;

// POST /api/ai/chat
router.post('/chat', (req, res) => {
  const { message, zip, stateAbbr } = req.body;

  if (!message || message.trim().length === 0) {
    return res.status(400).json({ error: 'Message is required' });
  }

  const lowerMsg = message.toLowerCase();

  // Detect political opinion requests and redirect
  const politicalKeywords = ['better', 'worse', 'support', 'vote for', 'should i vote', 'recommend', 'endorse', 'prefer', 'like', 'dislike', 'hate'];
  const hasPoliticalIntent = politicalKeywords.some(kw => lowerMsg.includes(kw));

  if (hasPoliticalIntent && (lowerMsg.includes('candidate') || lowerMsg.includes('party') || lowerMsg.includes('democrat') || lowerMsg.includes('republican'))) {
    return res.json({
      answer: `As a neutral Election Guide, I don't make candidate recommendations or political endorsements. I'm here to help you navigate the <em>process</em> of voting. For objective, balanced candidate information, visit <a href="https://ballotpedia.org" target="_blank">Ballotpedia</a> or <a href="https://www.vote411.org" target="_blank">VOTE411.org</a>.`,
      source: 'Non-Partisan Policy',
      confidence: 'high'
    });
  }

  // RAG: find matching knowledge
  let state = null;
  if (zip) {
    const prefix = zip.substring(0, 3);
    state = statesData.find(s => s.zips.includes(prefix)) || statesData.find(s => s.abbr === 'US');
  } else if (stateAbbr) {
    state = statesData.find(s => s.abbr === stateAbbr);
  }

  let bestMatch = null;
  let highestScore = 0;

  for (const entry of RAG_KB) {
    const score = entry.keywords.filter(kw => lowerMsg.includes(kw)).length;
    if (score > highestScore) {
      highestScore = score;
      bestMatch = entry;
    }
  }

  if (bestMatch && highestScore > 0) {
    return res.json({
      answer: bestMatch.answer(state),
      source: bestMatch.source,
      stateContext: state?.state || 'General (enter ZIP for localized info)',
      confidence: highestScore >= 2 ? 'high' : 'medium'
    });
  }

  res.json({
    answer: FALLBACK_ANSWER,
    source: 'General FAQ',
    confidence: 'low'
  });
});

module.exports = router;
