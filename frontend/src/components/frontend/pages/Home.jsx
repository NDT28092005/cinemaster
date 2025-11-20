import React, { useEffect } from "react"
import Header from "../../common/Header"
import Content from "../../common/Content";
import Footer from "../../common/Footer";

const Home = () => {
    // SEO Meta Tags
    useEffect(() => {
        document.title = "Trang chủ - Cửa hàng quà tặng";
        const metaDescription = document.querySelector('meta[name="description"]');
        if (metaDescription) {
            metaDescription.setAttribute('content', 'Cửa hàng quà tặng chuyên nghiệp với hàng ngàn sản phẩm đa dạng. Tìm món quà hoàn hảo cho mọi dịp đặc biệt.');
        } else {
            const meta = document.createElement('meta');
            meta.name = 'description';
            meta.content = 'Cửa hàng quà tặng chuyên nghiệp với hàng ngàn sản phẩm đa dạng. Tìm món quà hoàn hảo cho mọi dịp đặc biệt.';
            document.getElementsByTagName('head')[0].appendChild(meta);
        }
        
        // Add keywords
        let metaKeywords = document.querySelector('meta[name="keywords"]');
        if (!metaKeywords) {
            metaKeywords = document.createElement('meta');
            metaKeywords.name = 'keywords';
            metaKeywords.content = 'quà tặng, cửa hàng quà tặng, quà tặng sinh nhật, quà tặng kỷ niệm, quà tặng đặc biệt';
            document.getElementsByTagName('head')[0].appendChild(metaKeywords);
        }
    }, []);

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
