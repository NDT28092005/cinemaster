import React from 'react'
import { useState } from 'react';
import Carousel from 'react-bootstrap/Carousel';
import img1 from "../../../goal1.jpeg"
import { ChevronLeft, ChevronRight } from 'lucide-react';
const Content = () => {
    const [index, setIndex] = useState(0);

    const handleSelect = (selectedIndex) => {
        setIndex(selectedIndex);
    };
    return (
        <div className='container'>

            <Carousel activeIndex={index}
                onSelect={handleSelect}
                prevIcon={<ChevronLeft size={40} color="white" />}
                nextIcon={<ChevronRight size={40} color="white" />}>
                <Carousel.Item>
                    <img className="d-block w-100 carousel-img" src={img1} alt="First slide" />
                </Carousel.Item>

                <Carousel.Item>
                    <img className="d-block w-100 carousel-img" src={img1} alt="Second slide" />
                </Carousel.Item>

                <Carousel.Item>
                    <img className="d-block w-100 carousel-img" src={img1} alt="Third slide" />
                </Carousel.Item>
            </Carousel>
        </div>
    );
}

export default Content
