const mongoose = require('mongoose');

// ── Product Schema ──────────────────────────────────────────────
const productSchema = new mongoose.Schema({
  name:           { type: String, required: true },
  sku:            { type: String, required: true, unique: true },
  brand:          { type: String, required: true },
  category:       { type: String, required: true },
  price:          { type: Number, required: true },
  original_price: { type: Number },
  cost:           { type: Number, required: true },
  stock:          { type: Number, default: 0 },
  sold:           { type: Number, default: 0 },
  rating:         { type: Number, default: 4.5 },
  reviews:        { type: Number, default: 0 },
  badge:          { type: String, default: null },
  image:          { type: String, default: '📦' },
  description:    { type: String },
  tags:           { type: [String], default: [] },
  status:         { type: String, default: 'active' }
}, { timestamps: true });

// ── Customer Schema ─────────────────────────────────────────────
const customerSchema = new mongoose.Schema({
  name:         { type: String, required: true },
  email:        { type: String, required: true, unique: true },
  phone:        { type: String, default: '' },
  avatar_color: { type: String, default: '#4f46e5' },
  status:       { type: String, default: 'active' }
}, { timestamps: true });

// ── Order Schema ────────────────────────────────────────────────
const orderSchema = new mongoose.Schema({
  id:               { type: String, required: true, unique: true },
  customer_id:      { type: String },
  customer_name:    { type: String, required: true },
  customer_email:   { type: String, required: true },
  subtotal:         { type: Number, required: true },
  tax:              { type: Number, required: true },
  shipping_cost:    { type: Number, default: 0 },
  total:            { type: Number, required: true },
  status:           { type: String, default: 'processing' },
  payment_method:   { type: String, default: 'Credit Card' },
  payment_status:   { type: String, default: 'paid' },
  shipping_method:  { type: String, default: 'standard' },
  shipping_address: { type: String },
  tracking_number:  { type: String },
  items:            { type: Array, default: [] }
}, { timestamps: true });

// ── Registered User Schema ──────────────────────────────────────
const registeredUserSchema = new mongoose.Schema({
  name:         { type: String, required: true },
  email:        { type: String, required: true, unique: true },
  password:     { type: String, required: true },
  phone:        { type: String, default: '' },
  avatar_color: { type: String, default: '#4f46e5' },
  status:       { type: String, default: 'active' }
}, { timestamps: true });

// ── Admin Schema ────────────────────────────────────────────────
const adminSchema = new mongoose.Schema({
  name:     { type: String, required: true },
  email:    { type: String, required: true, unique: true },
  password: { type: String, required: true }
}, { timestamps: true });

const Product        = mongoose.model('Product', productSchema);
const Customer       = mongoose.model('Customer', customerSchema);
const Order          = mongoose.model('Order', orderSchema);
const RegisteredUser = mongoose.model('RegisteredUser', registeredUserSchema);
const Admin          = mongoose.model('Admin', adminSchema);

module.exports = { Product, Customer, Order, RegisteredUser, Admin };
