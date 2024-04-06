import React from 'react'
import profilePic from '../assets/images/profilePic.jpg'

function ProfileDets() {
    return (
        <>
            <li>
                <div className="profile-details">
                    <div className="profile-content">
                        <img src={profilePic} alt="profileImg" />
                    </div>
                    <div className="name-job">
                        <div className="profile_name">Name Name</div>
                        <div className="job">Web Designer</div>
                    </div>
                    <i className="ri-logout-circle-line"></i>
                </div>
            </li>
        </>
    )
}

export default ProfileDets