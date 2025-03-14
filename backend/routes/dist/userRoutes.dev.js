"use strict";

var express = require('express');

var router = express.Router();

var userController = require('../controllers/userController');

var User = require('../models/User');

var upload = require('../middleware/upload');

var path = require('path');

var chatController = require("../controllers/chatController");

var jwt = require("jsonwebtoken");

var nodemailer = require("nodemailer");

var crypto = require("crypto");

var bcrypt = require("bcrypt"); // Create uploads directory if it doesn't exist


var fs = require('fs');

var uploadDir = path.join(__dirname, '../uploads/certifications');

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, {
    recursive: true
  });
} // Check if email exists


router.get("/check-email/:email", function _callee(req, res) {
  var user;
  return regeneratorRuntime.async(function _callee$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          _context.prev = 0;
          _context.next = 3;
          return regeneratorRuntime.awrap(User.findOne({
            email: req.params.email
          }));

        case 3:
          user = _context.sent;
          res.json({
            exists: !!user
          });
          _context.next = 10;
          break;

        case 7:
          _context.prev = 7;
          _context.t0 = _context["catch"](0);
          res.status(500).json({
            error: "Server error"
          });

        case 10:
        case "end":
          return _context.stop();
      }
    }
  }, null, null, [[0, 7]]);
}); // All routes

router.post("/adduser", upload.fields([{
  name: 'photo',
  maxCount: 1
}, {
  name: 'certificationFile',
  maxCount: 1
}]), userController.add);
router.post("/login", userController.login);
router["delete"]('/deleteuser/:id', userController.remove);
router.post('/updateuser/:id', upload.fields([{
  name: 'photo',
  maxCount: 1
}, {
  name: 'certificationFile',
  maxCount: 1
}]), userController.update);
router.get("/allusers", userController.getAll);
router.get("/user/:id", userController.getById);
router.post('/deactivate', userController.deactivate);
router.post('/reactivate/send-code', userController.reactivateWithPhone);
router.post('/reactivate/verify', userController.verifyAndReactivate); // Sub-admin and user blocking routes

router.post("/addsubadmin", userController.addSubAdmin);
router.put("/blockuser/:id", userController.blockUser);
router.put("/unblockuser/:id", userController.unblockUser);
router.get("/searchuser/:username", userController.searchByUsername); // Chat route

router.post("/chat", chatController.chat); // Serve uploaded files

router.get('/uploads/photos/:filename', function (req, res) {
  var filePath = path.join(__dirname, '../uploads/photos', req.params.filename);
  res.sendFile(filePath);
});
router.get('/uploads/certifications/:filename', function (req, res) {
  var filePath = path.join(__dirname, '../uploads/certifications', req.params.filename);
  res.sendFile(filePath);
});
router.post("/forgot-password", function _callee2(req, res) {
  var email, user, token, transporter, mailOptions;
  return regeneratorRuntime.async(function _callee2$(_context2) {
    while (1) {
      switch (_context2.prev = _context2.next) {
        case 0:
          email = req.body.email;
          _context2.prev = 1;
          _context2.next = 4;
          return regeneratorRuntime.awrap(User.findOne({
            email: email
          }));

        case 4:
          user = _context2.sent;

          if (user) {
            _context2.next = 7;
            break;
          }

          return _context2.abrupt("return", res.status(404).json({
            message: "Utilisateur non trouvé"
          }));

        case 7:
          // Générer un token sécurisé
          token = crypto.randomBytes(32).toString("hex"); // Stocker le token et son expiration (1h) dans la base de données

          user.resetPasswordToken = token;
          user.resetPasswordExpires = Date.now() + 3600000; // 1 heure

          _context2.next = 12;
          return regeneratorRuntime.awrap(user.save());

        case 12:
          // Configurer le transporteur d'e-mail
          transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
              user: process.env.EMAIL_USER,
              pass: process.env.EMAIL_PASS
            }
          }); // Contenu de l'email

          mailOptions = {
            to: user.email,
            from: process.env.EMAIL_USER,
            subject: "Réinitialisation du mot de passe",
            text: "Vous recevez cet email parce que vous (ou quelqu'un d'autre) avez demand\xE9 une r\xE9initialisation de mot de passe.\n\n\n          Cliquez sur le lien suivant ou copiez-le dans votre navigateur :\n\n\n          http://localhost:3000/reset-password/".concat(token, "\n\n\n          Si vous n'avez pas fait cette demande, ignorez simplement cet e-mail.")
          };
          _context2.next = 16;
          return regeneratorRuntime.awrap(transporter.sendMail(mailOptions));

        case 16:
          res.json({
            message: "Email envoyé pour réinitialiser le mot de passe"
          });
          _context2.next = 23;
          break;

        case 19:
          _context2.prev = 19;
          _context2.t0 = _context2["catch"](1);
          console.error(_context2.t0);
          res.status(500).json({
            message: "Erreur serveur"
          });

        case 23:
        case "end":
          return _context2.stop();
      }
    }
  }, null, null, [[1, 19]]);
});
router.post("/reset-password/:token", function _callee3(req, res) {
  var token, newPassword, user, salt;
  return regeneratorRuntime.async(function _callee3$(_context3) {
    while (1) {
      switch (_context3.prev = _context3.next) {
        case 0:
          token = req.params.token;
          newPassword = req.body.newPassword;
          _context3.prev = 2;
          _context3.next = 5;
          return regeneratorRuntime.awrap(User.findOne({
            resetPasswordToken: token,
            resetPasswordExpires: {
              $gt: Date.now()
            } // Vérifier si le token n'a pas expiré

          }));

        case 5:
          user = _context3.sent;

          if (user) {
            _context3.next = 8;
            break;
          }

          return _context3.abrupt("return", res.status(400).json({
            message: "Token invalide ou expiré"
          }));

        case 8:
          _context3.next = 10;
          return regeneratorRuntime.awrap(bcrypt.genSalt(10));

        case 10:
          salt = _context3.sent;
          _context3.next = 13;
          return regeneratorRuntime.awrap(bcrypt.hash(newPassword, salt));

        case 13:
          user.password = _context3.sent;
          // Réinitialiser les champs de token
          user.resetPasswordToken = undefined;
          user.resetPasswordExpires = undefined;
          _context3.next = 18;
          return regeneratorRuntime.awrap(user.save());

        case 18:
          res.json({
            message: "Mot de passe réinitialisé avec succès"
          });
          _context3.next = 25;
          break;

        case 21:
          _context3.prev = 21;
          _context3.t0 = _context3["catch"](2);
          console.error(_context3.t0);
          res.status(500).json({
            message: "Erreur serveur"
          });

        case 25:
        case "end":
          return _context3.stop();
      }
    }
  }, null, null, [[2, 21]]);
});
module.exports = router;