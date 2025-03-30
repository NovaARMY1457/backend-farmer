const express = require("express");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");

dotenv.config();
const app = express();
app.use(express.json());
app.use(cors());

const users = []; 
const storages = [
    { id: 1, type: "Dry Storage", location: "Delhi", capacity: 50, availableSlots: 10 },
    { id: 2, type: "Cold Storage", location: "Mumbai", capacity: 30, availableSlots: 5 }
];
const bookings = []; 

const SECRET_KEY = "secret123"; 

app.post("/register", async (req, res) => {
    const { name, email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    users.push({ id: users.length + 1, name, email, password: hashedPassword });
    res.json({ message: "User registered successfully" });
});

app.post("/login", async (req, res) => {
    const { email, password } = req.body;
    const user = users.find(u => u.email === email);
    if (!user || !(await bcrypt.compare(password, user.password))) {
        return res.status(400).json({ error: "Invalid credentials" });
    }
    const token = jwt.sign({ userId: user.id }, SECRET_KEY, { expiresIn: "1h" });
    res.json({ token });
});

app.get("/storages", (req, res) => {
    res.json(storages);
});

app.post("/book", (req, res) => {
    const { userId, storageId, paymentMethod } = req.body;
    const storage = storages.find(s => s.id === storageId);
    
    if (!storage || storage.availableSlots <= 0) {
        return res.status(400).json({ error: "No available slots" });
    }

    bookings.push({ id: bookings.length + 1, userId, storageId, paymentMethod });
    storage.availableSlots -= 1;
    
    res.json({ message: "Booking successful", bookingId: bookings.length });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
