const express = require("express");
const router = express.Router();
const Member = require("../models/member.models");

// Helper function for pagination
const getPagination = (page, size) => {
    const limit = size ? +size : 10; // Default to 10 per page
    const offset = page ? (page - 1) * limit : 0;
    return { limit, offset };
};

// @route POST /api/members
// @desc Create new member records (one by one)
router.post("/", async (req, res) => {
    const { wymaNumber, members } = req.body;

    if (!wymaNumber || !members || !Array.isArray(members) || members.length === 0) {
        return res.status(400).json({ message: "Invalid data provided." });
    }

    try {
        // Prepare documents to insert
        const memberDocuments = members.map((member) => ({
            wymaNumber,
            memberCount: members.length,
            ...member,
        }));

        // Insert documents into the database
        const savedMembers = await Member.insertMany(memberDocuments);
        res.status(201).json({
            message: "Members created successfully!",
            data: savedMembers,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Failed to create members.", error: error.message });
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
        const data = await Member.find(query).skip(offset).limit(limit);
        const totalItems = await Member.countDocuments(query);

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
    const { name, age, sex } = req.body;

    try {
        const updatedData = await Member.findByIdAndUpdate(
            id,
            { name, age, sex },
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
        const deletedData = await Member.findByIdAndDelete(id);
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
