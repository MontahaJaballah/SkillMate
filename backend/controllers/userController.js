const User = require('../models/User');

async function add(req, res) {
    try {
      const user = new User(req.body);
      await user.save();
      res.status(200).send("User added successfully");
    } catch (error) {
      res.status(400).send({ error: error.toString() });
    }
}


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


async function remove(req, res) {
    try {
        const deletedUser = await User.findByIdAndDelete(req.params.id);
        if (!deletedUser) {
            return res.status(404).send({ error: "User not found" });
        }
        res.status(200).send({ message: "User deleted successfully" });
    } catch (error) {
        res.status(500).send({ error: error.toString() });
    }
}


module.exports = {add,remove,update};

