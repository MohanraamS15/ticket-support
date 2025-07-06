const Ticket = require("../models/ticketModel");
const jwt = require("jsonwebtoken"); // Add this import

// @desc    Create new ticket
// @route   POST /api/tickets
// @access  Private
const createTicket = async (req, res) => {
  try {
    const { title, description } = req.body;

    if (!title || !description) {
      return res.status(400).json({ message: "Please fill all fields" });
    }

    // 🔍 DEBUG: Log what we're receiving
    console.log("🔍 ========== CREATE TICKET DEBUG ==========");
    console.log("🔍 req.user:", req.user);
    console.log("🔍 req.user._id:", req.user._id);
    console.log("🔍 req.user.email:", req.user.email);
    console.log("🔍 JWT token from header:", req.headers.authorization);
    
    // 🔍 Decode the JWT to see what user ID it contains
    if (req.headers.authorization) {
      const token = req.headers.authorization.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log("🔍 Decoded JWT payload:", decoded);
      console.log("🔍 User ID from token:", decoded.id);
    }
    
    const ticket = await Ticket.create({
      title,
      description,
      user: req.user._id,
    });

    // 🔍 DEBUG: Log the created ticket
    console.log("🔍 Created ticket:", ticket);
    console.log("🔍 Ticket user field:", ticket.user);
    console.log("🔍 =========================================");

    res.status(201).json(ticket);
  } catch (err) {
    console.error("❌ Error creating ticket:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Get all tickets for logged-in user
// @route   GET /api/tickets
// @access  Private
const getTickets = async (req, res) => {
  try {
    // ✅ Only show tickets created by logged-in user
    const tickets = await Ticket.find({ user: req.user._id });
    console.log("🔐 Authenticated User ID:", req.user._id);
    console.log("🔐 User Email:", req.user.email);
    res.json(tickets);
  } catch (err) {
    console.error("❌ Failed to fetch tickets", err);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Get single ticket by ID
// @route   GET /api/tickets/:id
// @access  Private
const getTicketById = async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id);

    if (!ticket) {
      return res.status(404).json({ message: "Ticket not found" });
    }

    if (ticket.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: "Not authorized" });
    }

    res.status(200).json(ticket);
  } catch (err) {
    console.error("❌ Error fetching ticket:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Update a ticket
// @route   PUT /api/tickets/:id
// @access  Private
const updateTicket = async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id);

    if (!ticket) {
      return res.status(404).json({ message: "Ticket not found" });
    }

    if (ticket.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: "Not authorized" });
    }

    ticket.title = req.body.title || ticket.title;
    ticket.description = req.body.description || ticket.description;
    ticket.status = req.body.status || ticket.status;

    const updatedTicket = await ticket.save();
    res.status(200).json(updatedTicket);
  } catch (err) {
    console.error("❌ Error updating ticket:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Delete a ticket
// @route   DELETE /api/tickets/:id
// @access  Private
const deleteTicket = async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id);

    if (!ticket) {
      return res.status(404).json({ message: "Ticket not found" });
    }

    if (ticket.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: "Not authorized to delete this ticket" });
    }

    await ticket.deleteOne();
    res.status(200).json({ message: "Ticket deleted successfully" });
  } catch (err) {
    console.error("❌ Error deleting ticket:", err);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  createTicket,
  getTickets,
  getTicketById,
  updateTicket,
  deleteTicket,
};