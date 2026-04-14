import { Router } from 'express';
import {
  getEscrow,
  getMilestone,
  getApprovalTimeout,
  createEscrow,
  addMilestone,
  fundEscrow,
  completeMilestone,
  approveMilestone,
  raiseDispute,
  resolveDispute,
} from '../services/web3.js';
import { uploadToIPFS } from '../services/ipfs.js';

const router = Router();

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

// POST /escrow - Create new escrow
router.post('/', async (req, res) => {
  try {
    const { freelancer, arbitrator } = req.body;
    if (!freelancer) {
      return res.status(400).json({ error: 'freelancer address required' });
    }
    const escrowId = await createEscrow(freelancer, arbitrator);
    res.status(201).json({ escrowId });
  } catch (error: any) {
    console.error('Error creating escrow:', error);
    res.status(500).json({ error: error.message });
  }
});

// POST /escrow/:id/milestone - Add milestone
router.post('/:id/milestone', async (req, res) => {
  try {
    const escrowId = parseInt(req.params.id as string);
    if (isNaN(escrowId)) {
      return res.status(400).json({ error: 'Invalid escrow ID' });
    }
    const { description, amount } = req.body;
    if (!description || !amount) {
      return res.status(400).json({ error: 'description and amount required' });
    }
    await addMilestone(escrowId, description, amount);
    res.status(201).json({ success: true });
  } catch (error: any) {
    console.error('Error adding milestone:', error);
    res.status(500).json({ error: error.message });
  }
});

// POST /escrow/:id/fund - Fund escrow
router.post('/:id/fund', async (req, res) => {
  try {
    const escrowId = parseInt(req.params.id as string);
    if (isNaN(escrowId)) {
      return res.status(400).json({ error: 'Invalid escrow ID' });
    }
    const { amount } = req.body;
    if (!amount) {
      return res.status(400).json({ error: 'amount required' });
    }
    await fundEscrow(escrowId, amount);
    res.status(200).json({ success: true });
  } catch (error: any) {
    console.error('Error funding escrow:', error);
    res.status(500).json({ error: error.message });
  }
});

// POST /escrow/:id/complete - Complete milestone
router.post('/:id/complete', async (req, res) => {
  try {
    const escrowId = parseInt(req.params.id as string);
    if (isNaN(escrowId)) {
      return res.status(400).json({ error: 'Invalid escrow ID' });
    }
    await completeMilestone(escrowId);
    res.status(200).json({ success: true });
  } catch (error: any) {
    console.error('Error completing milestone:', error);
    res.status(500).json({ error: error.message });
  }
});

// POST /escrow/:id/approve - Approve milestone
router.post('/:id/approve', async (req, res) => {
  try {
    const escrowId = parseInt(req.params.id as string);
    if (isNaN(escrowId)) {
      return res.status(400).json({ error: 'Invalid escrow ID' });
    }
    await approveMilestone(escrowId);
    res.status(200).json({ success: true });
  } catch (error: any) {
    console.error('Error approving milestone:', error);
    res.status(500).json({ error: error.message });
  }
});

// POST /escrow/:id/dispute - Raise dispute
router.post('/:id/dispute', async (req, res) => {
  try {
    const escrowId = parseInt(req.params.id as string);
    if (isNaN(escrowId)) {
      return res.status(400).json({ error: 'Invalid escrow ID' });
    }
    await raiseDispute(escrowId);
    res.status(200).json({ success: true });
  } catch (error: any) {
    console.error('Error raising dispute:', error);
    res.status(500).json({ error: error.message });
  }
});

// POST /escrow/:id/resolve - Resolve dispute
router.post('/:id/resolve', async (req, res) => {
  try {
    const escrowId = parseInt(req.params.id as string);
    if (isNaN(escrowId)) {
      return res.status(400).json({ error: 'Invalid escrow ID' });
    }
    const { clientPercent } = req.body;
    if (clientPercent === undefined) {
      return res.status(400).json({ error: 'clientPercent required' });
    }
    await resolveDispute(escrowId, clientPercent);
    res.status(200).json({ success: true });
  } catch (error: any) {
    console.error('Error resolving dispute:', error);
    res.status(500).json({ error: error.message });
  }
});

// POST /escrow/:id/evidence - Upload milestone evidence to IPFS
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
    const buffer = Buffer.from(file.data, 'base64');
    const cid = await uploadToIPFS(buffer);
    res.json({ cid });
  } catch (error: any) {
    console.error('Error uploading to IPFS:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
