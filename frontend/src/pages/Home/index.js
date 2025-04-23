import React from 'react';
import classNames from 'classnames/bind';
import * as styles from './Home.module.scss';
import { useSlider } from './home.js';

const cx = classNames.bind(styles);

function Home() {
    const { currentSlide, slides, goToSlide, goToPrevSlide, goToNextSlide } = useSlider();

    return (
        <div className={cx('wrapper')}>
            <div className={styles.slider}>
                <div 
                    className={styles.slides}
                    style={{ transform: `translateX(-${currentSlide * 100}%)` }}
                >
                    {slides.map((slide, index) => (
                        <div key={index} className={styles.slide}>
                            <img src={slide.image} alt={`Slide ${index + 1}`} />
                            <div className={styles.slideContent}>
                                <h2>{slide.title}</h2>
                                <p>{slide.description}</p>
                                <button>{slide.buttonText}</button>
                            </div>
                        </div>
                    ))}
                </div>

                <div className={styles.controls}>
                    <div className={styles.control} onClick={goToPrevSlide}>
                        &lt;
                    </div>
                    <div className={styles.control} onClick={goToNextSlide}>
                        &gt;
                    </div>
                </div>

                <div className={styles.dots}>
                    {slides.map((_, index) => (
                        <div
                            key={index}
                            className={`${styles.dot} ${currentSlide === index ? styles.active : ''}`}
                            onClick={() => goToSlide(index)}
                        />
                    ))}
                </div>
            </div>
            <div className={cx('container')}>
                <h1>Trang chủ</h1>
            </div>
        </div>
    );
}

export default Home;

