import React from "react"
import Header from "../../common/Header"
import Content from "../../common/Content";
import Footer from "../../common/Footer";
import FloatingChatButton from "../../Chat/FloatingChatButton";
const Home = () => {
    return (
        <div className="home-page">
            <Header />
            <main className="main-content">
                <Content />
            </main>
            <FloatingChatButton />
            <Footer />
        </div>
    );
}

export default Home
