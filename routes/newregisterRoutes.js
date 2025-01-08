const express = require("express");
const router = express.Router();
const Register = require("../models/newregister.models");

// Helper function to get the next wymaNumber
const getNextWymaNumber = async () => {
    const lastMember = await Register.findOne().sort({ wymaNumber: -1 });
    return lastMember ? lastMember.wymaNumber + 1 : 200;
};

// Helper function for pagination
const getPagination = (page, size) => {
    const limit = size ? +size : 10; // Default to 10 per page
    const offset = page ? (page - 1) * limit : 0;
    return { limit, offset };
};

// @route POST /api/members
// @desc Create a new member record
router.post("/", async (req, res) => {
    const { name, age, phone, sex } = req.body;

    if (!name || !age || !sex) {
        return res.status(400).json({ message: "Invalid data provided." });
    }

    try {
        const wymaNumber = await getNextWymaNumber();

        // Create a new member document
        const newMember = new Register({
            wymaNumber,
            name,
            age,
            phone,
            sex,
        });

        // Save the member to the database
        const savedMember = await newMember.save();
        res.status(201).json({
            message: "Member created successfully!",
            wymaNumber, // Return the auto-generated wymaNumber
            data: savedMember,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Failed to create member.", error: error.message });
    }
});

// @route GET /api/members
// @desc Fetch all members with optional filters and pagination
router.get("/", async (req, res) => {
    const { page = 1, size = 50, wymaNumber, sex, name, minAge, maxAge } = req.query; // Default page = 1, size = 10
    const { limit, offset } = getPagination(page, size);

    // Build the query object
    const query = {};
    if (wymaNumber) query.wymaNumber = wymaNumber;
    if (sex) query.sex = sex;
    if (name) query.name = { $regex: name, $options: "i" }; // Case-insensitive

    // Add minAge and maxAge filtration
    if (minAge && maxAge) {
        query.age = { $gte: parseInt(minAge, 10), $lte: parseInt(maxAge, 10) };
    } else if (minAge) {
        query.age = { $gte: parseInt(minAge, 10) };
    } else if (maxAge) {
        query.age = { $lte: parseInt(maxAge, 10) };
    }

    try {
        const data = await Register.find(query).skip(offset).limit(limit);
        const totalItems = await Register.countDocuments(query);

        const totalPages = Math.ceil(totalItems / limit);
        const currentPage = parseInt(page, 10);
        const hasNext = currentPage < totalPages;
        const hasPrev = currentPage > 1;

        res.status(200).json({
            message: "Data fetched successfully!",
            data,
            totalItems,
            totalPages,
            currentPage,
            hasNext,
            hasPrev,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Failed to fetch data.", error: error.message });
    }
});

// @route PUT /api/members/:id
// @desc Update a member record by ID
router.put("/:id", async (req, res) => {
    const { id } = req.params;
    const { name, age, phone, sex } = req.body;

    try {
        const updatedData = await Register.findByIdAndUpdate(
            id,
            { name, age, phone, sex },
            { new: true } // Return the updated document
        );
        if (!updatedData) {
            return res.status(404).json({ message: "Member not found." });
        }
        res.status(200).json({ message: "Member updated successfully!", data: updatedData });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Failed to update member.", error: error.message });
    }
});

// @route DELETE /api/members/:id
// @desc Delete a member record by ID
router.delete("/:id", async (req, res) => {
    const { id } = req.params;

    try {
        const deletedData = await Register.findByIdAndDelete(id);
        if (!deletedData) {
            return res.status(404).json({ message: "Member not found." });
        }
        res.status(200).json({ message: "Member deleted successfully!", data: deletedData });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Failed to delete member.", error: error.message });
    }
});

module.exports = router;
