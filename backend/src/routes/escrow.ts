import { Router } from 'express';
import {
  getEscrow,
  getMilestone,
  getApprovalTimeout,
  getAllEscrows,
  getAllMilestones,
} from '../services/web3.js';

const router = Router();

// ── Read endpoints (active) ──────────────────────────────────────────

// GET /escrow - List all escrows (optional ?address= filter)
router.get('/', async (req, res) => {
  try {
    const address = req.query.address as string | undefined;
    const escrows = await getAllEscrows(address);
    res.json(escrows);
  } catch (error: any) {
    console.error('Error listing escrows:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET /escrow/:id - Get escrow details
router.get('/:id', async (req, res) => {
  try {
    const escrowId = parseInt(req.params.id as string);
    if (isNaN(escrowId)) {
      return res.status(400).json({ error: 'Invalid escrow ID' });
    }
    const escrow = await getEscrow(escrowId);
    res.json(escrow);
  } catch (error: any) {
    console.error('Error fetching escrow:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET /escrow/:id/milestone/:milestoneId - Get milestone details
router.get('/:id/milestone/:milestoneId', async (req, res) => {
  try {
    const escrowId = parseInt(req.params.id as string);
    const milestoneId = parseInt(req.params.milestoneId as string);
    if (isNaN(escrowId) || isNaN(milestoneId)) {
      return res.status(400).json({ error: 'Invalid ID' });
    }
    const milestone = await getMilestone(escrowId, milestoneId);
    res.json(milestone);
  } catch (error: any) {
    console.error('Error fetching milestone:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET /escrow/:id/timeout - Get remaining approval timeout
router.get('/:id/timeout', async (req, res) => {
  try {
    const escrowId = parseInt(req.params.id as string);
    if (isNaN(escrowId)) {
      return res.status(400).json({ error: 'Invalid escrow ID' });
    }
    const timeout = await getApprovalTimeout(escrowId);
    res.json({ remainingSeconds: timeout });
  } catch (error: any) {
    console.error('Error fetching timeout:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET /escrow/:id/milestones - Get all milestones for an escrow
router.get('/:id/milestones', async (req, res) => {
  try {
    const escrowId = parseInt(req.params.id as string);
    if (isNaN(escrowId)) {
      return res.status(400).json({ error: 'Invalid escrow ID' });
    }
    const milestones = await getAllMilestones(escrowId);
    res.json(milestones);
  } catch (error: any) {
    console.error('Error fetching milestones:', error);
    res.status(500).json({ error: error.message });
  }
});

// ── Write endpoints (DEPRECATED — frontend uses MetaMask directly) ───
// Backend signing undermines contract access control. These return 410 Gone.

const DEPRECATION_MSG = 'Deprecated: use MetaMask to send transactions directly from the frontend. Backend write endpoints are disabled because server-side signing undermines contract access control.';

router.post('/', (req, res) => res.status(410).json({ error: DEPRECATION_MSG }));
router.post('/:id/milestone', (req, res) => res.status(410).json({ error: DEPRECATION_MSG }));
router.post('/:id/fund', (req, res) => res.status(410).json({ error: DEPRECATION_MSG }));
router.post('/:id/complete', (req, res) => res.status(410).json({ error: DEPRECATION_MSG }));
router.post('/:id/approve', (req, res) => res.status(410).json({ error: DEPRECATION_MSG }));
router.post('/:id/dispute', (req, res) => res.status(410).json({ error: DEPRECATION_MSG }));
// NOTE: If re-enabling resolve, validate clientPercent is a number in [0, 100]
router.post('/:id/resolve', (req, res) => res.status(410).json({ error: DEPRECATION_MSG }));
router.post('/:id/cancel', (req, res) => res.status(410).json({ error: DEPRECATION_MSG }));
router.post('/:id/claim', (req, res) => res.status(410).json({ error: DEPRECATION_MSG }));

// POST /escrow/:id/evidence - Upload milestone evidence to IPFS
// NOTE: This is the only write endpoint kept active (IPFS upload is off-chain).
// If you have a Pinata/Web3.Storage key, replace the IPFS provider in services/ipfs.ts.
router.post('/:id/evidence', async (req, res) => {
  try {
    const escrowId = parseInt(req.params.id as string);
    if (isNaN(escrowId)) {
      return res.status(400).json({ error: 'Invalid escrow ID' });
    }
    const { file } = req.body;
    if (!file) {
      return res.status(400).json({ error: 'No file provided' });
    }
    const { uploadToIPFS } = await import('../services/ipfs.js');
    const buffer = Buffer.from(file.data, 'base64');
    const cid = await uploadToIPFS(buffer);
    res.json({ cid });
  } catch (error: any) {
    console.error('Error uploading to IPFS:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
