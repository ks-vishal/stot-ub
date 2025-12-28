const blockchain = require('../utils/blockchain');

exports.registerOrgan = async (req, res) => {
  try {
    const result = await blockchain.registerOrgan(req.body);
    res.json({ result });
  } catch (err) {
    console.error('Register organ error:', err, { body: req.body, stack: err.stack });
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.startTransport = async (req, res) => {
  try {
    const result = await blockchain.startTransport(req.body);
    res.json({ result });
  } catch (err) {
    console.error('Start transport error:', err, { body: req.body, stack: err.stack });
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.updateTransport = async (req, res) => {
  try {
    const result = await blockchain.updateTransport(req.body);
    res.json({ result });
  } catch (err) {
    console.error('Update transport error:', err, { body: req.body, stack: err.stack });
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.completeTransport = async (req, res) => {
  try {
    const result = await blockchain.completeTransport(req.body);
    res.json({ result });
  } catch (err) {
    console.error('Complete transport error:', err, { body: req.body, stack: err.stack });
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.getOrgan = async (req, res) => {
  try {
    const result = await blockchain.getOrgan(req.params.organId);
    res.json({ result });
  } catch (err) {
    console.error('Get organ error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.getTransport = async (req, res) => {
  try {
    const result = await blockchain.getTransport(req.params.transportId);
    res.json({ result });
  } catch (err) {
    console.error('Get transport error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}; 