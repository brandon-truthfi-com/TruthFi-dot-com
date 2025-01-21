import React from 'react';
import Image from 'next/image';
import styles from './LoadingBanner.module.css'; // CSS module for animation styling

interface LoadingBannerProps {
  message?: string; // Optional custom loading message
}

const LoadingBanner: React.FC<LoadingBannerProps> = ({ message = 'Loading, please wait...' }) => {
  return (
    <div className={styles.loadingContainer}>
      <Image
        src="/trump_truthfi_default.jpeg" // Path relative to the public folder
        alt="Loading animation"
        className={styles.loadingImage}
        width={150}
        height={150} // Adjust dimensions as needed
        priority // Ensures the image is loaded quickly
      />
      <p className={styles.loadingText}>{message}</p>
    </div>
  );
};

export default LoadingBanner;
