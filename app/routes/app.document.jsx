import React from 'react';

export async function loader () {
    return {name:"Md Shohanur Rahman"}
}

const DocumentationPage = () => {
  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <h1>Shopify Audio Player App Documentation</h1>
      </header>

      <section style={styles.section}>
        <h2>Introduction</h2>
        <p>
          Welcome to the Shopify Audio Player App! This app allows you to easily integrate and manage audio files on your Shopify store, providing your customers with a seamless experience when interacting with your audio content.
        </p>
      </section>

      <section style={styles.section}>
        <h2>Features</h2>
        <ul>
          <li>Embed audio files directly into your Shopify product pages.</li>
          <li>Support for popular audio formats (MP3, WAV, OGG, etc.).</li>
          <li>Customizable audio player design.</li>
          <li>Autoplay and looping options.</li>
          <li>Responsive design compatible with all devices.</li>
        </ul>
      </section>

      <section style={styles.section}>
        <h2>Installation</h2>
        <ol>
          <li>Navigate to the Shopify App Store and search for "Audio Player App."</li>
          <li>Click on "Add app" to install the Audio Player App to your store.</li>
          <li>Once installed, navigate to your Shopify admin dashboard and find the app under "Apps".</li>
        </ol>
      </section>

      <section style={styles.section}>
        <h2>Usage Instructions</h2>
        <h3>1. Upload Audio Files</h3>
        <p>
          To add an audio file to a product page, click on the "Upload Audio" button within the app's interface. You can upload files in MP3, WAV, or other supported formats.
        </p>

        <h3>2. Embedding Audio on Product Pages</h3>
        <p>
          After uploading your audio files, navigate to the product page where you want to embed the audio. Copy the generated embed code from the app and paste it into the product description or theme customizer.
        </p>

        <h3>3. Customizing the Audio Player</h3>
        <p>
          The audio player design is fully customizable. Use the settings in the app to adjust colors, size, and playback options like autoplay or looping.
        </p>
      </section>

      <section style={styles.section}>
        <h2>Troubleshooting</h2>
        <h3>1. Audio not playing</h3>
        <p>
          Ensure that your audio file is in a supported format (MP3, WAV, OGG). Check the file size and make sure it's under the maximum allowed size (50MB).
        </p>

        <h3>2. Player not displaying correctly</h3>
        <p>
          Make sure the embed code is properly inserted into the product page. If you are using a custom theme, ensure that your theme supports embedded media.
        </p>
      </section>

      <section style={styles.section}>
        <h2>Contact & Support</h2>
        <p>
          If you encounter any issues or have further questions, please reach out to our support team at <a href="mailto:support@audioplayerapp.com">support@audioplayerapp.com</a>.
        </p>
      </section>

      <footer style={styles.footer}>
        <p>© 2024 Audio Player App. All rights reserved.</p>
      </footer>
    </div>
  );
};

// Inline styles
const styles = {
  container: {
    fontFamily: "'Arial', sans-serif",
    margin: '20px',
    padding: '20px',
    maxWidth: '800px',
    backgroundColor: '#f9f9f9',
    borderRadius: '8px',
    boxShadow: '0 0 10px rgba(0, 0, 0, 0.1)',
  },
  header: {
    backgroundColor: '#4CAF50',
    color: 'white',
    padding: '10px',
    borderRadius: '8px',
    textAlign: 'center',
  },
  section: {
    marginBottom: '20px',
  },
  footer: {
    marginTop: '30px',
    textAlign: 'center',
    fontSize: '14px',
    color: '#888',
  }
};

export default DocumentationPage;
