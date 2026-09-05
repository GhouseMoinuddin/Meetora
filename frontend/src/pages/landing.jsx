import React from 'react'
import {Link} from 'react-router-dom';
import "../App.css"

export default function LandingPage() {
    return (
        <div className='landingPageContainer'>
            <nav>
                <div className='navHeader'>
                    <h2>Meetora</h2>
                </div>
                <div className='navlist'>
                    <p>Join as Guest</p>
                    <p>Register</p>
                    {/* <button>Login</button> */}
                    <div role='button'>
                        <p>Login</p>
                    </div>
                </div>
            </nav>

            <div className="landingMainContainer">
                <div>
                    <h1><span style = {{color:"#FF9839"}}>Connect with Your Loved ones</span></h1>
                    <p>Cover a distance by Meetora</p>
                    <div role='button'>
                        <Link to={"/auth"}>Get Started</Link>
                    </div>
                </div>
                <div>
                    <img src='./mobile.png' alt='random_image'/>
                </div>
            </div>
        </div>
    )
}