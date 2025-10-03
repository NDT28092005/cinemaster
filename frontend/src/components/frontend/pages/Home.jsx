import React from "react"
import Header from "../../common/Header"
import Content from "../Content";
import Footer from "../../common/Footer";
const Home = () => {
    return (
        <div className="home-page">
            <Header />
            <main className="main-content">
                <Content />
            </main>
            <Footer />
        </div>
    );
}

export default Home
