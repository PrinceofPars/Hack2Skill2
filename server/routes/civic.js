const express = require('express');
const router = express.Router();
const axios = require('axios');

const CIVIC_API_KEY = process.env.GOOGLE_CIVIC_API_KEY || '';
const CIVIC_BASE = 'https://www.googleapis.com/civicinfo/v2';

// GET /api/civic/ballot?address=123+Main+St+Austin+TX+78701
router.get('/ballot', async (req, res) => {
  const { address } = req.query;
  if (!address) return res.status(400).json({ error: 'address query param required' });

  // If no API key, return mock ballot data for demo purposes
  if (!CIVIC_API_KEY) {
    return res.json(getMockBallot(address));
  }

  try {
    const electionRes = await axios.get(`${CIVIC_BASE}/elections`, {
      params: { key: CIVIC_API_KEY }
    });
    const elections = electionRes.data.elections || [];
    const upcomingElection = elections.find(e => new Date(e.electionDay) >= new Date()) || elections[0];

    if (!upcomingElection) return res.json(getMockBallot(address));

    const voterRes = await axios.get(`${CIVIC_BASE}/voterinfo`, {
      params: {
        key: CIVIC_API_KEY,
        address,
        electionId: upcomingElection.id
      }
    });

    const data = voterRes.data;
    res.json({
      election: upcomingElection,
      pollingLocations: data.pollingLocations || [],
      earlyVoteSites: data.earlyVoteSites || [],
      dropOffLocations: data.dropOffLocations || [],
      contests: (data.contests || []).map(c => ({
        office: c.office,
        level: c.level,
        roles: c.roles,
        district: c.district?.name,
        candidates: (c.candidates || []).map(cand => ({
          name: cand.name,
          party: cand.party,
          phone: cand.phone,
          photoUrl: cand.photoUrl,
          candidateUrl: cand.candidateUrl,
          channels: cand.channels
        }))
      })),
      state: data.state || []
    });
  } catch (err) {
    console.error('Civic API error:', err.response?.data || err.message);
    res.json(getMockBallot(address));
  }
});

// GET /api/civic/polling?address=...
router.get('/polling', async (req, res) => {
  const { address } = req.query;
  if (!address) return res.status(400).json({ error: 'address required' });

  if (!CIVIC_API_KEY) {
    return res.json({ pollingLocations: getMockPolling() });
  }

  try {
    const electionRes = await axios.get(`${CIVIC_BASE}/elections`, { params: { key: CIVIC_API_KEY } });
    const elections = electionRes.data.elections || [];
    const upcoming = elections.find(e => new Date(e.electionDay) >= new Date()) || elections[0];

    const voterRes = await axios.get(`${CIVIC_BASE}/voterinfo`, {
      params: { key: CIVIC_API_KEY, address, electionId: upcoming?.id || '2000' }
    });
    res.json({ pollingLocations: voterRes.data.pollingLocations || [] });
  } catch (err) {
    res.json({ pollingLocations: getMockPolling() });
  }
});

function getMockBallot(address) {
  return {
    election: {
      id: 'demo-2026',
      name: 'General Election 2026 (Demo)',
      electionDay: '2026-11-03',
      ocdDivisionId: 'ocd-division/country:us'
    },
    pollingLocations: getMockPolling(),
    contests: [
      {
        office: 'U.S. Senator',
        level: ['country'],
        roles: ['legislatorUpperBody'],
        district: 'United States Senate',
        candidates: [
          { name: 'Jane Smith', party: 'Democratic', candidateUrl: 'https://example.gov', photoUrl: '' },
          { name: 'John Doe', party: 'Republican', candidateUrl: 'https://example.gov', photoUrl: '' },
          { name: 'Alex Rivera', party: 'Independent', candidateUrl: 'https://example.gov', photoUrl: '' }
        ]
      },
      {
        office: 'U.S. Representative – District 5',
        level: ['country'],
        roles: ['legislatorLowerBody'],
        district: '5th Congressional District',
        candidates: [
          { name: 'Maria Lopez', party: 'Democratic', candidateUrl: 'https://example.gov', photoUrl: '' },
          { name: 'Chris Brown', party: 'Republican', candidateUrl: 'https://example.gov', photoUrl: '' }
        ]
      },
      {
        office: 'State Governor',
        level: ['administrativeArea1'],
        roles: ['headOfGovernment'],
        district: 'Statewide',
        candidates: [
          { name: 'Sarah Chen', party: 'Democratic', candidateUrl: 'https://example.gov', photoUrl: '' },
          { name: 'Robert Lee', party: 'Republican', candidateUrl: 'https://example.gov', photoUrl: '' }
        ]
      },
      {
        office: 'Proposition 47 – School Funding Measure',
        level: ['administrativeArea1'],
        roles: ['referendumMeasure'],
        district: 'Statewide',
        candidates: [
          { name: 'YES', party: '', candidateUrl: '' },
          { name: 'NO', party: '', candidateUrl: '' }
        ]
      }
    ],
    _demo: true,
    _note: 'Configure GOOGLE_CIVIC_API_KEY in .env to show real ballot data for ' + address
  };
}

function getMockPolling() {
  return [
    {
      address: { locationName: 'City Hall Annex', line1: '100 Main St', city: 'Springfield', state: 'IL', zip: '62701' },
      hours: '7:00 AM – 7:00 PM',
      notes: 'Accessible entrance on Oak Street side'
    },
    {
      address: { locationName: 'Community Center', line1: '200 Oak Ave', city: 'Springfield', state: 'IL', zip: '62702' },
      hours: '7:00 AM – 7:00 PM',
      notes: 'Parking available on site'
    }
  ];
}

module.exports = router;
