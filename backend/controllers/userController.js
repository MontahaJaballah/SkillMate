const User = require('../models/User');

// Your controller functions will go here











async function update(req, res) {
    try {
        const updatedUser = await User.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!updatedUser) {
            return res.status(404).send({ error: "User not found" });
        }
        res.status(200).send(updatedUser);
    } catch (error) {
        res.status(500).send({ error: error.toString() });
    }
}


module.exports = {update};
