import React, { useEffect } from 'react';
import Header from '../../common/Header';
import Footer from '../../common/Footer';
import { FaGift, FaHeart, FaUsers, FaAward, FaShippingFast, FaShieldAlt, FaHeadset } from 'react-icons/fa';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Card from 'react-bootstrap/Card';

const About = () => {
  // SEO Meta Tags
  useEffect(() => {
    document.title = "Về chúng tôi - Cửa hàng quà tặng";
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', 'Tìm hiểu về cửa hàng quà tặng của chúng tôi. Chúng tôi chuyên cung cấp những món quà ý nghĩa và chất lượng cao cho mọi dịp đặc biệt.');
    } else {
      const meta = document.createElement('meta');
      meta.name = 'description';
      meta.content = 'Tìm hiểu về cửa hàng quà tặng của chúng tôi. Chúng tôi chuyên cung cấp những món quà ý nghĩa và chất lượng cao cho mọi dịp đặc biệt.';
      document.getElementsByTagName('head')[0].appendChild(meta);
    }
  }, []);

  const features = [
    {
      icon: <FaGift />,
      title: 'Quà tặng đa dạng',
      description: 'Hàng ngàn sản phẩm quà tặng độc đáo cho mọi dịp đặc biệt'
    },
    {
      icon: <FaHeart />,
      title: 'Chất lượng cao',
      description: 'Cam kết chất lượng sản phẩm tốt nhất, được tuyển chọn kỹ lưỡng'
    },
    {
      icon: <FaShippingFast />,
      title: 'Giao hàng nhanh',
      description: 'Giao hàng toàn quốc nhanh chóng, đảm bảo đúng hẹn'
    },
    {
      icon: <FaShieldAlt />,
      title: 'Bảo hành uy tín',
      description: 'Chính sách bảo hành và đổi trả linh hoạt, đảm bảo quyền lợi khách hàng'
    },
    {
      icon: <FaUsers />,
      title: 'Đội ngũ chuyên nghiệp',
      description: 'Nhân viên tư vấn nhiệt tình, chuyên nghiệp và giàu kinh nghiệm'
    },
    {
      icon: <FaHeadset />,
      title: 'Hỗ trợ 24/7',
      description: 'Hỗ trợ khách hàng 24/7, sẵn sàng giải đáp mọi thắc mắc'
    }
  ];

  return (
    <div>
      <Header />
      <div style={{ paddingTop: '120px', minHeight: '100vh', position: 'relative' }}>
        {/* Hero Section */}
        <section style={{
          background: 'linear-gradient(135deg, rgba(255, 249, 236, 0.8), rgba(255, 220, 204, 0.6))',
          padding: '4rem 0',
          marginBottom: '4rem',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            background: 'radial-gradient(circle at 30% 50%, rgba(251, 99, 118, 0.1) 0%, transparent 50%)',
            pointerEvents: 'none'
          }}></div>
          <Container style={{ position: 'relative', zIndex: 1 }}>
            <div style={{ textAlign: 'center', animation: 'fadeInUp 0.8s ease-out' }}>
              <h1 style={{
                fontSize: '3.5rem',
                fontWeight: 700,
                background: 'linear-gradient(135deg, #5D2A42, #FB6376, #FCB1A6)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                marginBottom: '1.5rem',
                letterSpacing: '-1px'
              }}>
                Về chúng tôi
              </h1>
              <p style={{
                fontSize: '1.2rem',
                color: '#666',
                maxWidth: '700px',
                margin: '0 auto',
                lineHeight: '1.8'
              }}>
                Chúng tôi là cửa hàng quà tặng chuyên nghiệp, mang đến những món quà ý nghĩa và chất lượng cao 
                cho mọi dịp đặc biệt trong cuộc sống của bạn.
              </p>
            </div>
          </Container>
        </section>

        {/* Mission Section */}
        <Container style={{ marginBottom: '4rem' }}>
          <Row>
            <Col md={6} style={{ animation: 'fadeInUp 0.6s ease-out' }}>
              <Card style={{
                border: 'none',
                borderRadius: '20px',
                padding: '2.5rem',
                background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95), rgba(255, 249, 236, 0.9))',
                boxShadow: '0 10px 40px rgba(93, 42, 66, 0.1)',
                height: '100%'
              }}>
                <h2 style={{
                  color: '#5D2A42',
                  fontSize: '2rem',
                  fontWeight: 700,
                  marginBottom: '1.5rem',
                  position: 'relative',
                  paddingBottom: '1rem'
                }}>
                  Sứ mệnh của chúng tôi
                  <span style={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    width: '60px',
                    height: '3px',
                    background: 'linear-gradient(90deg, #FB6376, #FCB1A6)',
                    borderRadius: '2px'
                  }}></span>
                </h2>
                <p style={{
                  color: '#666',
                  fontSize: '1.1rem',
                  lineHeight: '1.8',
                  marginBottom: '1rem'
                }}>
                  Chúng tôi tin rằng mỗi món quà đều mang trong mình một câu chuyện, một tình cảm và một ý nghĩa đặc biệt. 
                  Sứ mệnh của chúng tôi là giúp bạn tìm được món quà hoàn hảo để thể hiện tình cảm của mình.
                </p>
                <p style={{
                  color: '#666',
                  fontSize: '1.1rem',
                  lineHeight: '1.8'
                }}>
                  Với đội ngũ chuyên nghiệp và đam mê, chúng tôi cam kết mang đến những sản phẩm chất lượng cao, 
                  dịch vụ tận tâm và trải nghiệm mua sắm tuyệt vời nhất.
                </p>
              </Card>
            </Col>
            <Col md={6} style={{ animation: 'fadeInUp 0.6s ease-out 0.2s both' }}>
              <Card style={{
                border: 'none',
                borderRadius: '20px',
                padding: '2.5rem',
                background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95), rgba(255, 249, 236, 0.9))',
                boxShadow: '0 10px 40px rgba(93, 42, 66, 0.1)',
                height: '100%'
              }}>
                <h2 style={{
                  color: '#5D2A42',
                  fontSize: '2rem',
                  fontWeight: 700,
                  marginBottom: '1.5rem',
                  position: 'relative',
                  paddingBottom: '1rem'
                }}>
                  Tầm nhìn của chúng tôi
                  <span style={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    width: '60px',
                    height: '3px',
                    background: 'linear-gradient(90deg, #FB6376, #FCB1A6)',
                    borderRadius: '2px'
                  }}></span>
                </h2>
                <p style={{
                  color: '#666',
                  fontSize: '1.1rem',
                  lineHeight: '1.8',
                  marginBottom: '1rem'
                }}>
                  Chúng tôi hướng tới việc trở thành cửa hàng quà tặng hàng đầu, được tin tưởng và yêu mến bởi 
                  khách hàng trên toàn quốc.
                </p>
                <p style={{
                  color: '#666',
                  fontSize: '1.1rem',
                  lineHeight: '1.8'
                }}>
                  Luôn đổi mới, sáng tạo và không ngừng nâng cao chất lượng dịch vụ để mang đến những trải nghiệm 
                  mua sắm tốt nhất cho khách hàng.
                </p>
              </Card>
            </Col>
          </Row>
        </Container>

        {/* Features Section */}
        <section style={{
          background: 'linear-gradient(135deg, rgba(255, 249, 236, 0.5), rgba(255, 220, 204, 0.3))',
          padding: '4rem 0',
          marginBottom: '4rem'
        }}>
          <Container>
            <h2 style={{
              textAlign: 'center',
              color: '#5D2A42',
              fontSize: '2.5rem',
              fontWeight: 700,
              marginBottom: '3rem',
              animation: 'fadeInUp 0.6s ease-out'
            }}>
              Tại sao chọn chúng tôi?
            </h2>
            <Row className="g-4">
              {features.map((feature, index) => (
                <Col key={index} xs={12} sm={6} md={4}>
                  <Card style={{
                    border: 'none',
                    borderRadius: '20px',
                    padding: '2rem',
                    background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95), rgba(255, 249, 236, 0.9))',
                    boxShadow: '0 8px 25px rgba(93, 42, 66, 0.08)',
                    height: '100%',
                    transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
                    animation: `fadeInUp 0.6s ease-out ${0.3 + index * 0.1}s both`,
                    cursor: 'pointer'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-8px)';
                    e.currentTarget.style.boxShadow = '0 15px 40px rgba(251, 99, 118, 0.25)';
                    e.currentTarget.style.borderColor = 'rgba(251, 99, 118, 0.4)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 8px 25px rgba(93, 42, 66, 0.08)';
                    e.currentTarget.style.borderColor = 'transparent';
                  }}
                  >
                    <div style={{
                      fontSize: '3rem',
                      color: '#FB6376',
                      marginBottom: '1.5rem',
                      display: 'flex',
                      justifyContent: 'center',
                      transition: 'all 0.3s ease'
                    }}>
                      {feature.icon}
                    </div>
                    <h3 style={{
                      color: '#5D2A42',
                      fontSize: '1.3rem',
                      fontWeight: 600,
                      marginBottom: '1rem',
                      textAlign: 'center'
                    }}>
                      {feature.title}
                    </h3>
                    <p style={{
                      color: '#666',
                      fontSize: '1rem',
                      lineHeight: '1.6',
                      textAlign: 'center',
                      margin: 0
                    }}>
                      {feature.description}
                    </p>
                  </Card>
                </Col>
              ))}
            </Row>
          </Container>
        </section>

        {/* Stats Section */}
        <Container style={{ marginBottom: '4rem' }}>
          <Row className="g-4">
            {[
              { number: '10,000+', label: 'Sản phẩm đa dạng' },
              { number: '50,000+', label: 'Khách hàng hài lòng' },
              { number: '98%', label: 'Tỷ lệ hài lòng' },
              { number: '24/7', label: 'Hỗ trợ khách hàng' }
            ].map((stat, index) => (
              <Col key={index} xs={6} md={3}>
                <Card style={{
                  border: 'none',
                  borderRadius: '20px',
                  padding: '2rem',
                  background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95), rgba(255, 249, 236, 0.9))',
                  boxShadow: '0 8px 25px rgba(93, 42, 66, 0.08)',
                  textAlign: 'center',
                  animation: `fadeInUp 0.6s ease-out ${0.5 + index * 0.1}s both`,
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-5px) scale(1.05)';
                  e.currentTarget.style.boxShadow = '0 15px 40px rgba(251, 99, 118, 0.25)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0) scale(1)';
                  e.currentTarget.style.boxShadow = '0 8px 25px rgba(93, 42, 66, 0.08)';
                }}
                >
                  <div style={{
                    fontSize: '2.5rem',
                    fontWeight: 700,
                    background: 'linear-gradient(135deg, #FB6376, #FCB1A6)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                    marginBottom: '0.5rem'
                  }}>
                    {stat.number}
                  </div>
                  <div style={{
                    color: '#666',
                    fontSize: '1rem',
                    fontWeight: 500
                  }}>
                    {stat.label}
                  </div>
                </Card>
              </Col>
            ))}
          </Row>
        </Container>
      </div>
      <Footer />
    </div>
  );
};

export default About;
