// src/routes/pianoRoutes.js
import express from 'express';
const router = express.Router();

// Exemple de route pour sauvegarder une partition
router.post('/save-melody', (req, res) => {
    const { notes } = req.body;
    // Sauvegarder en BDD...
    res.status(200).json({ message: "Mélodie sauvegardée !" });
});

export default router;