import React from 'react';
import PropTypes from 'prop-types';

const ProfileTop = ({ profile }) => {
  let {
    status,
    company,
    location,
    website,
    social,
    user: { name, avatar },
  } = profile;

  return (
    <div className="profile-top bg-primary p-2">
      <img className="round-img my-1" src={avatar} alt="" />
      <h1 className="large">{name}</h1>
      <p className="lead">
        {status} {company && <span>at {company}</span>}
      </p>
      <p>{location && <span>at {location}</span>}</p>
      <div className="icons my-1">
        {website && (
          <a href="#" target="_blank" rel="noopener noreferrer">
            <i className="fas fa-globe fa-2x"></i>
          </a>
        )}

        {social.twitter && (
          <a href="#" target="_blank" rel="noopener noreferrer">
            <i className="fab fa-twitter fa-2x"></i>
          </a>
        )}

        {social.facebook && (
          <a href="#" target="_blank" rel="noopener noreferrer">
            <i className="fab fa-facebook fa-2x"></i>
          </a>
        )}

        {social.linkedin && (
          <a href="#" target="_blank" rel="noopener noreferrer">
            <i className="fab fa-linkedin fa-2x"></i>
          </a>
        )}

        {social.youtube && (
          <a href="#" target="_blank" rel="noopener noreferrer">
            <i className="fab fa-youtube fa-2x"></i>
          </a>
        )}

        {social.instagram && (
          <a href="#" target="_blank" rel="noopener noreferrer">
            <i className="fab fa-instagram fa-2x"></i>
          </a>
        )}
      </div>
    </div>
  );
};

ProfileTop.propTypes = {
  profile: PropTypes.object.isRequired,
};

export default ProfileTop;
