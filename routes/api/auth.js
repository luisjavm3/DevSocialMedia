const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const config = require('config');
const auth = require('../../middlewares/auth');
const { check, validationResult } = require('express-validator');

const User = require('../../models/User');

// @route       GET api/auth
// @desc        Test route
// @access      Public
router.route('/').get(auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.status(200).json(user);
  } catch (error) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route       POST api/auth
// @desc        Authenticate user & get token
// @access      Public
router
  .route('/')
  .post(
    [
      check('email', 'Please include a valid email').isEmail(),
      check('password', 'password is required.').exists(),
    ],
    async (req, res) => {
      const errors = validationResult(req);

      if (!errors.isEmpty()) {
        return res.status(400).json({
          errors: errors.array(),
        });
      }

      const { email, password } = req.body;

      try {
        let user = await User.findOne({ email });

        if (!user) {
          return res
            .status(400)
            .json({ errors: [{ msg: 'Invalid credentials.' }] });
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
          return res
            .status(400)
            .json({ errors: [{ msg: 'Invalid credentials.' }] });
        }

        const payload = {
          user: {
            id: user.id,
          },
        };

        jwt.sign(
          payload,
          config.get('jwtSecret'),
          { expiresIn: 360000 },
          (err, token) => {
            if (err) throw err;
            res.json({ token });
          }
        );
      } catch (error) {
        console.error(err.message);
        res.status(500).send('Server error.');
      }
    }
  );

module.exports = router;
