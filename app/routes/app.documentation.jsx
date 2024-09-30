import React, { useState } from "react";
import { Modal, useAppBridge } from "@shopify/app-bridge-react";

import "./../styles/docs.css";
import { Card, Page } from "@shopify/polaris";

export function Screenshot({ image, text = "Screenshot", setImage }) {
  const shopify = useAppBridge();

  const openModal = () => {
    setImage(image);
    shopify.modal.show("my-modal");
  };

  return (
    <span onClick={openModal} className="link-text">
      {text}{" "}
    </span>
  );
}

export function Step({ children }) {
  return (
    <>
      <div>
        <h2 className="title">{children}</h2>
      </div>
    </>
  );
}

export default function Documentation() {

  const [selectedImage, setSelectedImage] = useState("");

  return (
    <Page>
      <Card>
      <div className="doc-container">
        <h1 className="doc-heading">Documentation</h1>
        <div className="doc-step-items" style={{ margin: "0 auto" }}>
          <Step>
            1. Click 'Upload Audio' to upload audio or create a player{" "}
            <Screenshot
              setImage={setSelectedImage}
              image="https://i.ibb.co.com/HVfktFb/audio-documantion-1.png"
            ></Screenshot>
          </Step>
          <Step>
            2. Write a title and click on 'Add Files' to upload audio{" "}
            <Screenshot
              setImage={setSelectedImage}
              image="https://i.ibb.co.com/N1f7zm3/audio-documantion-2.png"
            ></Screenshot>
          </Step>
          <Step>
            3. Configure player screen you want{" "}
            <Screenshot
              setImage={setSelectedImage}
              image="https://i.ibb.co.com/2vVpBRH/audio-documantion-3.png"
            ></Screenshot>
          </Step>
          <Step>
            4. Change/update color to match with your theme/website{" "}
            <Screenshot
              setImage={setSelectedImage}
              image="https://i.ibb.co.com/wSLLg05/audio-documantion-4.png"
            ></Screenshot>
          </Step>
          <Step>
            5. Change height, width and icon size as your wish{" "}
            <Screenshot
              setImage={setSelectedImage}
              image="https://i.ibb.co.com/pd3SXBR/audio-documantion-5.png"
            ></Screenshot>
          </Step>
          <Step>
            6. Show/hide player controls (available only for default screen) and copy the player ID{" "}
            <Screenshot
              setImage={setSelectedImage}
              image="https://i.ibb.co.com/grxMzpT/audio-documantion-6.png"
            ></Screenshot>
          </Step>
          <Step>
            7. Enable App Embed (Audio Player by bPlugins){" "}
            <Screenshot
              setImage={setSelectedImage}
              image="https://i.ibb.co.com/g6SdDHn/audio-documantion-7.png"
            ></Screenshot>
          </Step>
          <Step>
            8. Add Player block to your website{" "}
            <Screenshot
              setImage={setSelectedImage}
              image="https://i.ibb.co.com/98QcM1T/audio-documantion-8.png"
            ></Screenshot>
          </Step>
          <Step>
            9. Input/paste the Audio ID (copied from step 6) {" "}
            <Screenshot
              setImage={setSelectedImage}
              image="https://i.ibb.co.com/z7Bs0RW/audio-documantion-9.png"
            ></Screenshot>
          </Step>
        </div>
      </div>
      <div
        style={{
          width: "100%",
          marginLeft: "auto",
          marginRight: "auto",
          marginTop: "40px",
          textAlign: "center",
        }}
      ></div>
      <Modal id="my-modal" variant="max">
        <img
          width="100%"
          height="80%"
          alt=""
          src={selectedImage}
          className="Polaris-EmptyState__Image Polaris-EmptyState--loaded"
          role="presentation"
        />
      </Modal>
    </Card>
    </Page>
  );
}
