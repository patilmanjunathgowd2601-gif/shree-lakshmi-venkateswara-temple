const express = require('express');
const crypto = require('crypto');
const Razorpay = require('razorpay');
const asyncHandler = require('express-async-handler');
const Donation = require('../models/Donation');
const { requireAdmin } = require('../middleware/auth');
const { donationsTotal, donationsAmountTotalInr } = require('../metrics');

const router = express.Router();

function getRazorpayInstance() {
  if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
    return null;
  }
  return new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });
}

// POST /api/donations/order - create a donation record + a Razorpay order.
// The frontend uses the returned order to open Razorpay Checkout.
router.post(
  '/order',
  asyncHandler(async (req, res) => {
    const { donorName, email, phone, amount, purpose } = req.body;

    if (!donorName || !amount || Number(amount) <= 0) {
      res.status(400);
      throw new Error('Donor name and a positive amount are required.');
    }

    const razorpay = getRazorpayInstance();
    if (!razorpay) {
      res.status(503);
      throw new Error(
        'Online donations are not configured yet. Set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET on the server.'
      );
    }

    const donation = await Donation.create({
      donorName,
      email,
      phone,
      amount,
      purpose,
      status: 'created',
    });

    const order = await razorpay.orders.create({
      amount: Math.round(Number(amount) * 100), // Razorpay expects paise
      currency: 'INR',
      receipt: donation._id.toString(),
    });

    donation.razorpayOrderId = order.id;
    await donation.save();

    res.status(201).json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: process.env.RAZORPAY_KEY_ID,
      donationId: donation._id,
    });
  })
);

// POST /api/donations/verify - verify the payment signature Razorpay Checkout
// returns after a successful payment, and mark the donation as paid.
router.post(
  '/verify',
  asyncHandler(async (req, res) => {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      res.status(400);
      throw new Error('Missing Razorpay verification fields.');
    }

    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    const isValid = expectedSignature === razorpay_signature;

    const donation = await Donation.findOne({ razorpayOrderId: razorpay_order_id });
    if (!donation) {
      res.status(404);
      throw new Error('Donation record not found for this order.');
    }

    donation.status = isValid ? 'paid' : 'failed';
    donation.razorpayPaymentId = razorpay_payment_id;
    await donation.save();

    if (!isValid) {
      res.status(400);
      throw new Error('Payment signature verification failed.');
    }

    donationsTotal.inc();
    donationsAmountTotalInr.inc(donation.amount);

    res.json({ message: 'Payment verified successfully', donation });
  })
);

// GET /api/donations - admin only, for the dashboard
router.get(
  '/',
  requireAdmin,
  asyncHandler(async (req, res) => {
    const donations = await Donation.find().sort({ createdAt: -1 });
    res.json(donations);
  })
);

module.exports = router;
