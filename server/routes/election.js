const express = require('express');
const router = express.Router();
const statesData = require('../data/states.json');

// Helper: find state by ZIP prefix
function findStateByZip(zip) {
  const prefix3 = zip.substring(0, 3);
  const prefix2 = zip.substring(0, 2);
  let state = statesData.find(s => s.zips.includes(prefix3));
  if (!state) state = statesData.find(s => s.zips.some(z => z.startsWith(prefix2)));
  if (!state) state = statesData.find(s => s.abbr === 'US'); // Default fallback
  return state;
}

// Helper: calculate days from now
function daysFromNow(daysStr, electionDate) {
  const today = new Date();
  const election = new Date(electionDate || '2026-11-03');
  const diffMs = election - today;
  const daysToElection = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  return daysToElection;
}

// GET /api/election/timeline/:zip
router.get('/timeline/:zip', (req, res) => {
  const { zip } = req.params;
  const electionDate = req.query.electionDate || '2026-11-03';

  if (!zip || zip.length < 3) {
    return res.status(400).json({ error: 'Invalid ZIP code' });
  }

  const state = findStateByZip(zip);
  const election = new Date(electionDate);
  const today = new Date();
  const daysToElection = Math.ceil((election - today) / (1000 * 60 * 60 * 24));

  // Build milestones
  const milestones = [
    {
      id: 'register',
      label: 'Voter Registration Deadline',
      description: state.registrationDeadline,
      icon: 'UserCheck',
      urgent: daysToElection <= 30,
      completed: false,
      link: state.officialUrl
    },
    {
      id: 'absentee',
      label: 'Absentee / Mail-In Request Deadline',
      description: state.absenteeDeadline,
      icon: 'Mail',
      urgent: daysToElection <= 14,
      completed: false,
      link: state.officialUrl
    },
    {
      id: 'early',
      label: 'Early Voting Period',
      description: `${state.earlyVotingStart} through ${state.earlyVotingEnd}`,
      icon: 'Calendar',
      urgent: false,
      completed: false,
      link: state.officialUrl
    },
    {
      id: 'election',
      label: 'Election Day',
      description: `${electionDate} | Polls open: ${state.pollHours}`,
      icon: 'Vote',
      urgent: daysToElection <= 7,
      completed: false,
      link: state.officialUrl
    }
  ];

  res.json({
    state: state.state,
    stateAbbr: state.abbr,
    zip,
    electionDate,
    daysToElection,
    sameDay: state.sameDay,
    onlineRegistration: state.onlineRegistration,
    idRequired: state.idRequired,
    idNotes: state.idNotes,
    officialUrl: state.officialUrl,
    pollHours: state.pollHours,
    milestones,
    readinessScore: Math.max(0, Math.min(100, Math.round((1 - daysToElection / 365) * 100)))
  });
});

// GET /api/election/states
router.get('/states', (req, res) => {
  const summary = statesData.map(s => ({
    state: s.state,
    abbr: s.abbr,
    officialUrl: s.officialUrl,
    idRequired: s.idRequired,
    sameDay: s.sameDay
  }));
  res.json(summary);
});

module.exports = router;
