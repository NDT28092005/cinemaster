import React from "react"
import Header from "../../common/Header"
import Content from "../Content";
const Home = () => {
    return (
        <div className="home-page">
            <Header />
            <main className="main-content">
                <Content />
            </main>
        </div>
    );
}

export default Home
