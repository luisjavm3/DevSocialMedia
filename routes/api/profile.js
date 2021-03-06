const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');

const auth = require('../../middlewares/auth');
const Profile = require('../../models/Profile');
const User = require('../../models/User');
const Post = require('../../models/Post');

// @route       GET api/profile/me
// @desc        Get current users profile
// @access      Private
router.route('/me').get(auth, async (req, res) => {
  try {
    const profile = await Profile.findOne({ user: req.user.id }).populate(
      'user',
      ['name', 'avatar']
    );

    if (!profile) {
      return res
        .status(400)
        .json({ msg: 'There is no profile for this user.' });
    }

    res.json(profile);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server error.');
  }
});

// @route       POST api/profile
// @desc        Create or update user profile
// @access      Private
router
  .route('/')
  .post(
    [
      auth,
      [
        check('status', 'Status is required.').not().isEmpty(),
        check('skills', 'Skills is required.').not().isEmpty(),
      ],
    ],
    async (req, res) => {
      const errors = validationResult(req);

      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const {
        company,
        website,
        location,
        bio,
        status,
        githubusername,
        skills,
        youtube,
        facebook,
        twitter,
        instagram,
        linkedin,
      } = req.body;

      //   Build profile object
      const profileFields = {};
      profileFields.user = req.user.id;
      if (company) profileFields.company = company;
      if (website) profileFields.website = website;
      if (location) profileFields.location = location;
      if (bio) profileFields.bio = bio;
      if (status) profileFields.status = status;
      if (githubusername) profileFields.githubusername = githubusername;
      if (skills) {
        profileFields.skills = String(skills)
          .split(',')
          .map((skill) => skill.trim());
      }
      //   Build social object
      profileFields.social = {};
      if (youtube) profileFields.social.youtube = youtube;
      if (twitter) profileFields.social.twitter = twitter;
      if (facebook) profileFields.social.facebook = facebook;
      if (linkedin) profileFields.social.linkedin = linkedin;
      if (instagram) profileFields.social.instagram = instagram;

      try {
        // Using upsert option (creates new doc if no match is found):
        let profile = await Profile.findOneAndUpdate(
          { user: req.user.id },
          { $set: profileFields },
          { new: true, upsert: true, setDefaultsOnInsert: true }
        );
        return res.json(profile);
      } catch (err) {
        console.error(err.message);
        return res.status(500).send('Server Error');
      }
    }
  );

// @route       GET api/profile
// @desc        Get all profiles
// @access      Public
router.route('/').get(async (req, res) => {
  try {
    const profiles = await Profile.find().populate('user', ['name', 'avatar']);
    res.json(profiles);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server error.');
  }
});

// @route       GET api/profile/user/:user_id
// @desc        Get profile by user ID
// @access      Public
router.route('/user/:user_id').get(async (req, res) => {
  try {
    const profile = await Profile.findOne({
      user: req.params.user_id,
    }).populate('user', ['name', 'avatar']);

    if (!profile)
      return res
        .status(400)
        .json({ msg: 'There is no profile for this user.' });

    res.json(profile);
  } catch (error) {
    console.error(error.message);

    if (error.kind == 'ObjectId')
      return res
        .status(400)
        .json({ msg: 'There is no profile for this user.' });

    res.status(500).send('Server error.');
  }
});

// @route       DELETE api/profile
// @desc        Delete profile, user & post
// @access      Private
router.route('/').delete(auth, async (req, res) => {
  try {
    // Remote user posts
    await Post.deleteMany({ user: req.user.id });
    // Remove profile
    await Profile.findOneAndRemove({ user: req.user.id });
    // Remove User
    await User.findOneAndRemove({ _id: req.user.id });
    res.json({ msg: 'User deleted.' });
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server error.');
  }
});

// @route       PUT api/profile/experience
// @desc        Add profile experience
// @access      Private
router
  .route('/experience')
  .put(
    [
      auth,
      [
        check('title', 'Title is required.').not().isEmpty(),
        check('company', 'Company is required').not().isEmpty(),
        check('from', 'From date is required').not().isEmpty(),
      ],
    ],
    async (req, res) => {
      const errors = validationResult(req);

      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { title, company, location, from, to, current, description } =
        req.body;

      const newExp = {
        title,
        company,
        location,
        from,
        to,
        current,
        description,
      };

      try {
        const profile = await Profile.findOne({ user: req.user.id });

        profile.experience.unshift(newExp);

        await profile.save();

        res.json(profile);
      } catch (error) {
        console.error(error.message);
        res.status(500).send('Server error.');
      }
    }
  );

// @route       DELETE api/profile/experience/:exp_id
// @desc        Delete experience from profile
// @access      Private
router.route('/experience/:exp_id').delete(auth, async (req, res) => {
  try {
    const profile = await Profile.findOne({ user: req.user.id });

    //Get remove index
    const removeIndex = profile.experience
      .map((item) => item.id)
      .indexOf(req.params.exp_id);

    profile.experience.splice(removeIndex, 1);

    await profile.save();

    res.json(profile);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server error.');
  }
});

// @route       PUT api/profile/education
// @desc        Add profile education
// @access      Private
router
  .route('/education')
  .put(
    [
      auth,
      [
        check('school', 'School is required.').not().isEmpty(),
        check('degree', 'Degree is required').not().isEmpty(),
        check('fieldofstudy', 'Field of study is required').not().isEmpty(),
        check('from', 'From of study is required').not().isEmpty(),
      ],
    ],
    async (req, res) => {
      const errors = validationResult(req);

      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { school, degree, fieldofstudy, from, to, current, description } =
        req.body;

      const newEdu = {
        school,
        degree,
        fieldofstudy,
        from,
        to,
        current,
        description,
      };

      try {
        const profile = await Profile.findOne({ user: req.user.id });

        profile.education.unshift(newEdu);

        await profile.save();

        res.json(profile);
      } catch (error) {
        console.error(error.message);
        res.status(500).send('Server error.');
      }
    }
  );

// @route       DELETE api/profile/education/:edu_id
// @desc        Delete education from profile
// @access      Private
router.route('/education/:edu_id').delete(auth, async (req, res) => {
  try {
    const profile = await Profile.findOne({ user: req.user.id });

    //Get remove index
    const removeIndex = profile.education
      .map((item) => item.id)
      .indexOf(req.params.edu_id);

    profile.education.splice(removeIndex, 1);

    await profile.save();

    res.json(profile);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server error.');
  }
});

module.exports = router;
