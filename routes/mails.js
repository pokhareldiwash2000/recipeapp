// routes/mailRoute.js

const express = require('express');
const nodemailer = require('nodemailer');
const router = express.Router();
const verify=require('../verifyToken');
const admin=require('../verifyAdmin');
const Mail = require('../model/Mail');
const { mailValidation} = require('../validation');

// Create a new mail
router.post('/',async (req, res) => {
  try {
    const validation=mailValidation(req.body);
    if(validation.error){ return res.status(400).send({ message: validation.error.details[0].message });}
    const { name, email, message } = req.body;
    
    const newMail = new Mail({ name, email, message });
    await newMail.save();

    res.status(201).json(newMail);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create mail' });
  }
});

// Get all mails sent by the current user (admin can get all mails)
router.get('/',verify,admin ,async (req, res) => {
  try {
   
    const mails = await Mail.find().sort({ createdAt: -1 });
    res.json(mails);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch mails' });
  }
});

// Get a specific mail by ID
router.get('/:id',verify,admin, async (req, res) => {
  try {
    const mail = await Mail.findById(req.params.id);

    if (!mail) {
      return res.status(404).json({ error: 'Mail not found' });
    }

    res.json(mail);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch mail' });
  }
});

// Delete a mail by ID
router.delete('/:id',verify,admin, async (req, res) => {
  try {
    const mail = await Mail.findByIdAndDelete(req.params.id);

    if (!mail) {
      return res.status(404).json({ error: 'Mail not found' });
    }

    res.json({ message: 'Mail deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete mail' });
  }
});





module.exports = router;
