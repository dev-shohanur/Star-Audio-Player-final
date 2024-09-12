import React, { useCallback, useEffect, useRef, useState } from "react";
import { ArrowLeftIcon, CheckSmallIcon } from "@shopify/polaris-icons";
import {
  Button,
  ButtonGroup,
  ContextualSaveBar,
  DropZone,
  Frame,
  Icon,
  Spinner,
  Toast,
} from "@shopify/polaris";
import {
  Link,
  useActionData,
  useLoaderData,
  useLocation,
  useNavigate,
  useNavigation,
  useSearchParams,
  useSubmit,
} from "@remix-run/react";
import "../styles/plyr.css";
import "../styles/style.css";
import TextInput from "../components/TextInput/TextInput";
import SelectInput from "../components/SelectInput/SelectInput";
import { authenticate } from "../shopify.server";
import { json } from "@remix-run/node";
import Plyr from "plyr";
import NumberUnit from "../components/NumberUnit/NumberUnit";
import FileUploadWithLink from "../components/FileUploadWithLink/FileUploadWithLink";
import prisma from "../db.server";
import Collapse from "../components/Collapse/Collapse";
// import { ColorPicker } from "remix-panel";
import { ToggleControl } from "../components/ToggleControl/ToggleControl";
import ColorController from "../components/ColorController/ColorController";
// import ColorPicker from "../components/ColorPicker/ColorPicker";

export async function loader({ params }) {
  const audio = await prisma.audio.findUnique({ where: { id: params.id } });

  return { audio };
}

export async function action({ request }) {
  const { admin } = await authenticate.admin(request);
  const body = await request.formData();

  const data = body.get("data");

  let createAudio = "";
  let updateScreen = "";
  if (request.method === "PATCH") {
    const response = await admin.graphql(
      `#graphql
mutation fileCreate($files: [FileCreateInput!]!) {
  fileCreate(files: $files) {
    files {
      id
      alt
      createdAt
    }
  }
}`,
      {
        variables: {
          files: {
            alt: "fallback text for an File",
            contentType: "FILE",
            originalSource: body.get("url"),
          },
        },
      },
    );
    const responseJson = await response.json();
    const getUrlPromise = new Promise((resolve, reject) => {
      setTimeout(async () => {
        const responseAudioUrl = await admin.graphql(
          `#graphql
    query {
    node(id: "${responseJson?.data?.fileCreate?.files[0]?.id}") {
        ... on GenericFile {
            id
            url
        }
    }
}
    `,
        );
        const responseAudioUrlJson = await responseAudioUrl.json();
        resolve({ responseAudioUrlJson });
      }, [1000]);
    });
    const { responseAudioUrlJson } = await getUrlPromise;
    createAudio = await prisma.audio.update({
      where: {
        id: body.get("id"),
      },
      data: {
        title: body.get("title"),
        url: responseAudioUrlJson.data.node.url,
        mainColor: body.get("mainColor"),
      },
    });

    return json({ createAudio, updateScreen });
  } else if (request.method === "POST") {
    createAudio = await prisma.audio.update({
      where: {
        id: body.get("id"),
      },
      data: {
        title: body.get("title"),
        url: body.get("url"),
        mainColor: body.get("mainColor"),
        [body.get("screen")]: JSON.parse(body.get("screenData")),
        selectedScreen: body.get("screen"),
      },
    });
    return json({ createAudio, updateScreen });
  }

  return data;
}

const Customize = () => {
  const location = useLocation();
  const nav = useNavigation();
  const navigate = useNavigate();
  const submit = useSubmit();
  const action = useActionData();
  const loaderData = useLoaderData({ data: location.pathname.split("/")[3] });
  const [active, setActive] = useState(false);
  const toggleActive = useCallback(() => setActive((active) => !active), []);
  const toastMarkup = active ? (
    <Toast content="Successfully Saved!" onDismiss={toggleActive} />
  ) : null;

  const [loading, setLoading] = useState(false);
  const [files, setFiles] = useState([]);

  const [player, setPlayer] = useState(null);

  const [title, setTitle] = useState(loaderData?.audio?.title);
  const [url, setUrl] = useState(loaderData?.audio?.url);
  const [mainColor, setMainColor] = useState(loaderData?.audio?.mainColor);

  const [screen, setScreen] = useState(loaderData?.audio?.selectedScreen);

  const screens = [
    { label: "screenDefault", value: "screenDefault" },
    { label: "screenOne", value: "screenOne" },
    { label: "screenTwo", value: "screenTwo" },
  ];

  loaderData?.audio?.screen?.map((item) =>
    screens.push({ label: item?.title, value: item?.id }),
  );

  const selectedScreen = loaderData?.audio[screen];

  const [width, setWidth] = useState(selectedScreen?.width);
  const [height, setHeight] = useState(selectedScreen?.height);
  const [borderRadius, setBorderRadius] = useState(
    selectedScreen?.borderRadius,
  );
  const [borderWidth, setBorderWidth] = useState(selectedScreen?.borderWidth);
  const [borderStyle, setBorderStyle] = useState(selectedScreen?.borderStyle);
  const [borderColor, setBorderColor] = useState(selectedScreen?.borderColor);
  const [iconSize, setIconSize] = useState(selectedScreen?.iconSize);
  const [iconColor, setIconColor] = useState(selectedScreen?.iconColor);
  const [background, setBackground] = useState(selectedScreen?.background);
  const [backgroundImage, setBackgroundImage] = useState(
    selectedScreen?.backgroundImage,
  );
  const [image, setImage] = useState(selectedScreen?.image);
  const [margin, setMargin] = useState(selectedScreen?.margin);
  const [padding, setPadding] = useState(selectedScreen?.padding);
  const [play, setPlay] = useState(
    selectedScreen?.controls?.play === undefined
      ? true
      : selectedScreen?.controls?.play,
  );
  const [progress, setProgress] = useState(selectedScreen?.controls?.progress);
  const [currentTime, setCurrentTime] = useState(
    selectedScreen?.controls?.currentTime,
  );
  const [mute, setMute] = useState(selectedScreen?.controls?.mute);
  const [volume, setVolume] = useState(selectedScreen?.controls?.volume);
  const [settings, setSettings] = useState(selectedScreen?.controls?.settings);

  const [colors, setColors] = useState("#000000");

  useEffect(() => {
    setWidth(selectedScreen?.width);
    setHeight(selectedScreen?.height);
    setBorderRadius(selectedScreen?.borderRadius);
    setBorderWidth(selectedScreen?.borderWidth);
    setBorderStyle(selectedScreen?.borderStyle);
    setBorderColor(selectedScreen?.borderColor);
    setIconSize(selectedScreen?.iconSize);
    setIconColor(selectedScreen?.iconColor);
    setBackground(selectedScreen?.background);
    setBackgroundImage(selectedScreen?.backgroundImage);
    setImage(selectedScreen?.image);
    setMargin(selectedScreen?.margin);
    setPadding(selectedScreen?.padding);
  }, [selectedScreen]);

  const isLoading =
    ["loading", "submitting"]?.includes(nav.state) && nav.formMethod === "POST";

  const [, setSearchParams] = useSearchParams();

  const playerRef = useRef();

  let controls = {
    controls: [
      play & "play",
      "progress",
      "current-time",
      "mute",
      "volume",
      "settings",
    ],
  };
  if (screen === "screenOne") {
    controls = {
      controls: `
          <div class="media-controls plyr__controls">
            <div class="media-buttons">
              <button class="back-button media-button" label="back">
                <span class="back-button__icon">
                  <svg
                    stroke="currentColor"
                    fill="currentColor"
                    strokeWidth={0}
                    viewBox="0 0 448 512"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M64 468V44c0-6.6 5.4-12 12-12h48c6.6 0 12 5.4 12 12v176.4l195.5-181C352.1 22.3 384 36.6 384 64v384c0 27.4-31.9 41.7-52.5 24.6L136 292.7V468c0 6.6-5.4 12-12 12H76c-6.6 0-12-5.4-12-12z" />
                  </svg>
                </span>
                <span class="button-text milli">Back</span>
              </button>

              <button
                class="fast-forward-button media-button"
                label="fast forward"
                data-plyr="rewind"
              >
                <span class="back-button__icon">
                  <svg
                    stroke="currentColor"
                    fill="currentColor"
                    strokeWidth={0}
                    viewBox="0 0 1024 1024"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M825.8 498L538.4 249.9c-10.7-9.2-26.4-.9-26.4 14v496.3c0 14.9 15.7 23.2 26.4 14L825.8 526c8.3-7.2 8.3-20.8 0-28zm-320 0L218.4 249.9c-10.7-9.2-26.4-.9-26.4 14v496.3c0 14.9 15.7 23.2 26.4 14L505.8 526c4.1-3.6 6.2-8.8 6.2-14 0-5.2-2.1-10.4-6.2-14z" />
                  </svg>
                </span>
                <span class="button-text milli">Backward</span>
              </button>

             <button class="play-button media-button" label="play" aria-label="Play, {title}"
                data-plyr="play">
          <span class="back-button__icon play-button__icon">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" class="pause icon w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25v13.5m-7.5-13.5v13.5" />
              </svg>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" class="play icon w-6 h-6" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.347a1.125 1.125 0 0 1 0 1.972l-11.54 6.347a1.125 1.125 0 0 1-1.667-.986V5.653Z" />
            </svg>
 
          </span>
                 
          <span class="button-text milli">Play</span>
        </button>

              <button
                class="fast-forward-button media-button"
                label="fast forward"
                data-plyr="fast-forward"
              >
                <span class="back-button__icon">
                  <svg
                    stroke="currentColor"
                    fill="currentColor"
                    strokeWidth={0}
                    viewBox="0 0 1024 1024"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M825.8 498L538.4 249.9c-10.7-9.2-26.4-.9-26.4 14v496.3c0 14.9 15.7 23.2 26.4 14L825.8 526c8.3-7.2 8.3-20.8 0-28zm-320 0L218.4 249.9c-10.7-9.2-26.4-.9-26.4 14v496.3c0 14.9 15.7 23.2 26.4 14L505.8 526c4.1-3.6 6.2-8.8 6.2-14 0-5.2-2.1-10.4-6.2-14z" />
                  </svg>
                </span>
                <span class="button-text milli">Forward</span>
              </button>

              <button class="skip-button media-button" label="skip">
                <span class="back-button__icon">
                  <svg
                    stroke="currentColor"
                    fill="currentColor"
                    strokeWidth={0}
                    viewBox="0 0 1024 1024"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M676.4 528.95L293.2 829.97c-14.25 11.2-35.2 1.1-35.2-16.95V210.97c0-18.05 20.95-28.14 35.2-16.94l383.2 301.02a21.53 21.53 0 0 1 0 33.9M694 864h64a8 8 0 0 0 8-8V168a8 8 0 0 0-8-8h-64a8 8 0 0 0-8 8v688a8 8 0 0 0 8 8" />
                  </svg>
                </span>
                <span class="button-text milli">Skip</span>
              </button>
            </div>
            <div class="media-progress">
            <div class="progress-bar-wrapper progress">
            <input data-plyr="seek"  type="range" min="0" max="100" step="0.01" value="0" aria-label="Seek" />
            
     
              </div>
             
              <div class="progress-time-current milli plyr__time plyr__time--current" aria-label="Current time">15:23</div>
              <div class="progress-time-total milli plyr__time plyr__time--duration" aria-label="Duration">34:40</div>
            </div>
          </div>
          `,
    };
  } else if (screen == "screenTwo") {
    controls = {
      controls: `<div class="demo-1">
      <div class="container">
        <div class="image-box">
          <div class="content">
            <div class="cover">
              <img src="${image || "https://files.bplugins.com/wp-content/uploads/2024/04/429550502_25614821214771859_729153743743869927_n-1.jpg"}" alt="${title}" srcSet="" />
            </div>
            <div>
              <h2 class="title">${title}</h2>
              <div class="total-time">
                <span class="icon"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" class="w-6 h-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" /></svg></span>
                <span>Total Time :</span>
                <span class="progress-time-current plyr__time plyr__time--current" aria-label="Current time">03:03</span>
              </div>
            </div>
          </div>
          </div>
          <div class="progressbar">
            <input data-plyr="seek"  type="range" min="0" max="100" step="0.01" value="0" aria-label="Seek" />
          </div>
        <div class="controls">
          <button class="backward" data-plyr="rewind">
            <svg stroke="currentColor" fill="currentColor" strokeWidth={0} viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg">
              <path d="M485.6 249.9L198.2 498c-8.3 7.1-8.3 20.8 0 27.9l287.4 248.2c10.7 9.2 26.4.9 26.4-14V263.8c0-14.8-15.7-23.2-26.4-13.9zm320 0L518.2 498a18.6 18.6 0 0 0-6.2 14c0 5.2 2.1 10.4 6.2 14l287.4 248.2c10.7 9.2 26.4.9 26.4-14V263.8c0-14.8-15.7-23.2-26.4-13.9z" />
            </svg>
          </button>
          <button class="play" aria-label="Play, {title}"
                data-plyr="play">
            <svg stroke="currentColor" class="play-icon" fill="currentColor" strokeWidth={0} viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg">
              <path d="M11.596 8.697l-6.363 3.692c-.54.313-1.233-.066-1.233-.697V4.308c0-.63.692-1.01 1.233-.696l6.363 3.692a.802.802 0 010 1.393z" />
            </svg>
            <svg xmlns="http://www.w3.org/2000/svg" class="pause-icon" viewBox="0 0 320 512">{ /*!Font Awesome Free 6.5.1 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2024 Fonticons, Inc.*/ }<path d="M48 64C21.5 64 0 85.5 0 112V400c0 26.5 21.5 48 48 48H80c26.5 0 48-21.5 48-48V112c0-26.5-21.5-48-48-48H48zm192 0c-26.5 0-48 21.5-48 48V400c0 26.5 21.5 48 48 48h32c26.5 0 48-21.5 48-48V112c0-26.5-21.5-48-48-48H240z" /></svg>
          </button>
          <button class="forward"  data-plyr="fast-forward">
            <svg stroke="currentColor" fill="currentColor" strokeWidth={0} viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg">
              <path d="M825.8 498L538.4 249.9c-10.7-9.2-26.4-.9-26.4 14v496.3c0 14.9 15.7 23.2 26.4 14L825.8 526c8.3-7.2 8.3-20.8 0-28zm-320 0L218.4 249.9c-10.7-9.2-26.4-.9-26.4 14v496.3c0 14.9 15.7 23.2 26.4 14L505.8 526c4.1-3.6 6.2-8.8 6.2-14 0-5.2-2.1-10.4-6.2-14z" />
            </svg>
          </button>
        </div>
      </div>
    </div>`,
    };
  } else if (screen == "screenDefault") {
    controls = {
      controls: [
        play && "play",
        progress && "progress",
        currentTime && "current-time",
        mute && "mute",
        volume && "volume",
        settings && "settings",
      ],
    };
  }
  useEffect(() => {
    const play = new Plyr("#player", controls);
    // if (playerRef.current) {
    //   setPlayer(new Plyr(playerRef.current, controls));
    // }
    return () => {
      play?.destroy();
    };
  }, [screen, controls]);

  useEffect(() => {
    if (playerRef.current) {
      playerRef.current.src = url;
    }
  }, [url]);

  useEffect(() => {
    setSearchParams({ fullscreen: true });
  }, []);

  useEffect(() => {
    if (action?.createAudio?.url) {
      setUrl(action?.createAudio?.url);
    }
  }, [action]);

  const handleBack = useCallback(() => {
    setSearchParams({});
    navigate("/app");
  }, []);

  const handleUpdateCSS = () => {
    // submit(
    //   {
    //     data: [
    //       selectedScreen.id,
    //       width,
    //       height,
    //       borderRadius,
    //       borderWidth,
    //       borderStyle,
    //       borderColor,
    //       iconSize,
    //       background,
    //       backgroundImage,
    //       image,
    //       margin,
    //       padding,
    //     ],
    //   },
    //   { method: "POST" },
    // );
  };

  const handleUpdate = () => {
    handleUpdateCSS();
    const controls = {
      currentTime,
      mute,
      play,
      progress,
      settings,
      volume,
    };
    const screenData = {
      ...selectedScreen,
      width: width,
      height: height,
      borderRadius: borderRadius,
      borderWidth: borderWidth,
      borderStyle: borderStyle,
      borderColor: borderColor,
      iconSize: iconSize,
      iconColor: iconColor,
      background: background,
      backgroundImage: backgroundImage,
      image: image,
      margin: margin,
      padding: padding,
      controls,
    };
    submit(
      {
        url: url,
        title: title,
        mainColor: mainColor,
        id: loaderData?.audio?.id,
        screen: screen,
        screenData: JSON.stringify(screenData),
      },
      { method: "POST" },
    );
    toggleActive();
  };

  const handleSubmitFile = () => {
    setLoading(true);
    const formData = new FormData();

    formData.append("async-upload", files[0]);
    const url = `https://files.bplugins.com/wp-json/media-upload/v1/image-upload`;
    fetch(url, {
      method: "POST",
      body: formData,
    })
      .then((res) => res.json())
      .then((imageData) => {
        if (imageData?.success) {
          const controls = {
            currentTime,
            mute,
            play,
            progress,
            settings,
            volume,
          };
          const screenData = {
            ...selectedScreen,
            width: width,
            height: height,
            borderRadius: borderRadius,
            borderWidth: borderWidth,
            borderStyle: borderStyle,
            borderColor: borderColor,
            iconSize: iconSize,
            iconColor: iconColor,
            background: background,
            backgroundImage: backgroundImage,
            image: image,
            margin: margin,
            padding: padding,
            controls,
          };
          submit(
            {
              url: imageData.data.url,
              title: title,
              mainColor: mainColor,
              id: loaderData?.audio?.id,
              screen: screen,
              screenData: JSON.stringify(screenData),
            },
            { method: "PATCH" },
          );
          setFiles([]);
          setLoading(false);
        } else {
          setLoading(false);
        }
      });
  };

  useEffect(() => {
    setFiles([]);
  }, [url]);

  const handleDropZoneDrop = useCallback(
    (_dropFiles, acceptedFiles, _rejectedFiles) =>
      setFiles((files) => [...files, ...acceptedFiles]),
    [],
  );

  return (
    <div>
      <Frame>
        <div className="header">
          <div className="headBarLeft">
            <Button
              icon={ArrowLeftIcon}
              accessibilityLabel="Back"
              onClick={handleBack}
            />
          </div>
          <ButtonGroup>
            {/* <Button size="large" disabled>
            Cancel
          </Button> */}
            <Button
              variant="primary"
              tone="success"
              size="large"
              onClick={() => {
                handleUpdate();
              }}
              loading={isLoading}
            >
              Save
            </Button>
          </ButtonGroup>
        </div>
        <div className="main-container">
          <div className="sidebar">
            <h2 className="title">Audio Player</h2>
            <Collapse
              title="Content"
              height={screen == "screenTwo" ? 500 : 400}
            >
              <TextInput
                type="text"
                label="Title"
                value={title}
                onChange={setTitle}
              />
              {/* <TextInput type="url" label="Url" value={url} onChange={setUrl} /> */}
              <div className="FileUpload">
                <label htmlFor={`FileUpload`}>Audio</label>
                <div className="filed">
                  {loading && (
                    <Spinner
                      accessibilityLabel="Small spinner example"
                      size="small"
                    />
                  )}
                  <input
                    type="url"
                    value={url}
                    onChange={setUrl}
                    id={`FileUpload`}
                    disabled={isLoading}
                  />
                  <div style={{ width: 40, height: 40 }}>
                    <DropZone onDrop={handleDropZoneDrop}>
                      <DropZone.FileUpload />
                    </DropZone>
                    {files?.length > 0 ? (
                      <Button
                        icon={CheckSmallIcon}
                        accessibilityLabel="Save"
                        onClick={handleSubmitFile}
                      />
                    ) : null}
                  </div>
                </div>
              </div>
              <SelectInput
                label="Screens"
                options={screens}
                value={screen}
                onChange={setScreen}
              />
              {screen == "screenTwo" ? (
                <>
                  <FileUploadWithLink
                    label="image"
                    value={image || selectedScreen?.image}
                    onChange={setImage}
                  />
                  <FileUploadWithLink
                    label="Background Image"
                    value={backgroundImage || selectedScreen?.backgroundImage}
                    onChange={setBackgroundImage}
                  />
                </>
              ) : null}
            </Collapse>

            <Collapse title="Colors" height={600}>
              <ColorController
                label={"Icons Color"}
                value={iconColor}
                onChange={setIconColor}
              />
              <ColorController
                label={"Main Color"}
                value={mainColor}
                onChange={setMainColor}
              />
              <ColorController
                label={"Background Color"}
                value={background}
                onChange={setBackground}
              />
            </Collapse>

            <Collapse title="Size" height={300}>
              <NumberUnit
                type="number"
                label="Width"
                options={[
                  { label: "PX", value: "px" },
                  { label: "%", value: "%" },
                  { label: "VW", value: "vw" },
                  { label: "REM", value: "rem" },
                ]}
                value={width}
                onChange={setWidth}
              />
              <NumberUnit
                type="number"
                label="Height"
                options={[
                  { label: "PX", value: "px" },
                  { label: "%", value: "%" },
                  { label: "VH", value: "vh" },
                  { label: "REM", value: "rem" },
                ]}
                value={height}
                onChange={setHeight}
              />
              <NumberUnit
                type="number"
                label="Icon Size"
                options={[
                  { label: "PX", value: "px" },
                  { label: "%", value: "%" },
                  { label: "REM", value: "rem" },
                ]}
                value={iconSize}
                onChange={setIconSize}
              />
            </Collapse>
            <Collapse title="Border" height={600}>
              <NumberUnit
                type="number"
                label="Border Radius"
                options={[
                  { label: "PX", value: "px" },
                  { label: "%", value: "%" },
                  { label: "REM", value: "rem" },
                ]}
                value={borderRadius}
                onChange={setBorderRadius}
              />
              <NumberUnit
                type="number"
                label="Border Width"
                options={[
                  { label: "PX", value: "px" },
                  { label: "%", value: "%" },
                  { label: "REM", value: "rem" },
                ]}
                value={borderWidth}
                onChange={setBorderWidth}
              />
              {/* <ColorPicker value={borderColor} onChange={setBorderColor} /> */}
              <SelectInput
                label="Border Style"
                options={[
                  { label: "SOLID", value: "solid" },
                  { label: "DOTTED", value: "dotted" },
                  { label: "DASHED", value: "dashed" },
                  { label: "DOUBLE", value: "double" },
                  { label: "HIDDEN", value: "hidden" },
                ]}
                value={borderStyle}
                onChange={setBorderStyle}
              />
              <ColorController
                label={"Border Color"}
                value={borderColor}
                onChange={setBorderColor}
              />
              {/* <ColorPicker
              label="Border Color"
              value={borderColor}
              onChange={setBorderColor}
            /> */}
            </Collapse>

            {/* <ColorPicker
            label="Background"
            value={background}
            onChange={setBackground}
          /> */}

            {screen == "screenDefault" && (
              <Collapse title="Controls" height={600}>
                <ToggleControl label="Play" value={play} onChange={setPlay} />
                <ToggleControl
                  label="Progress"
                  value={progress}
                  onChange={setProgress}
                />
                <ToggleControl
                  label="Current Time"
                  value={currentTime}
                  onChange={setCurrentTime}
                />
                <ToggleControl label="Mute" value={mute} onChange={setMute} />
                <ToggleControl
                  label="Volume"
                  value={volume}
                  onChange={setVolume}
                />
                <ToggleControl
                  label="Settings"
                  value={settings}
                  onChange={setSettings}
                />
              </Collapse>
            )}

            <Collapse title="Styles" height={500}>
              <NumberUnit
                type="number"
                label="Padding"
                options={[
                  { label: "PX", value: "px" },
                  { label: "%", value: "%" },
                  { label: "REM", value: "rem" },
                ]}
                value={padding}
                onChange={setPadding}
              />
              <NumberUnit
                type="number"
                label="Margin"
                options={[
                  { label: "PX", value: "px" },
                  { label: "%", value: "%" },
                  { label: "REM", value: "rem" },
                ]}
                value={margin}
                onChange={setMargin}
              />
            </Collapse>
          </div>
          <div className="content">
            <div
              dangerouslySetInnerHTML={{
                __html: `<style>


              ${
                screen === "screenDefault" &&
                `
                
              .plyr {
                --plyr-control-icon-size:${iconSize};
                --plyr-audio-control-color:${iconColor};
                --plyr-audio-controls-background:${background};
                --plyr-menu-border-color:${borderColor};
                --plyr-range-thumb-height:15px;
                --plyr-menu-color:${iconColor};

              }
              .plyr--audio .plyr__controls {
                  border-radius:${borderRadius};
                  background-color: ${background};
              }
                .plyr.plyr--full-ui.plyr--audio.plyr--html5.plyr--paused ,
                .plyr.plyr--full-ui.plyr--audio.plyr--html5.plyr--playing {
                  display: flex;
                  justify-content: center;
                  align-items: center;
                  width:${width};
                height:${height};
              }`
              }

              

           .plyr .media-controls {
                background:${background};
                border-radius: ${borderRadius};
                width:${width};
                height:${height};
                border:${borderWidth + " " + borderStyle + " " + borderColor}
              }
              .demo-1 .container {
                background:${background};
                border-radius: ${borderRadius};
                width:${width};
                height:${height};
                border:${borderWidth + " " + borderStyle + " " + borderColor};
                }
                .plyr .media-controls {
                background:${background};
                border:${borderWidth + " " + borderStyle + " " + borderColor};
                }
              .demo-1 .container .controls{
                background:${background};
              }
            
              .plyr .media-controls svg,
              .plyr .controls svg {
                width: ${parseInt(iconSize) + 10 + iconSize?.match(/[a-z%]+/i)[0]};
                height: ${parseInt(iconSize) + 10 + iconSize?.match(/[a-z%]+/i)[0]};
                color: ${iconColor};
                }
                .demo-1 button.play.plyr__control--pressed .pause-icon{
                  color: ${iconColor} !important;
                }
              .demo-1 .container .image-box {
                background-image: url("${backgroundImage ? backgroundImage : "https://img.freepik.com/free-photo/painting-mountain-lake-with-mountain-background_188544-9126.jpg"}")
              }
              .plyr {
                --plyr-color-main:${mainColor};
              }
            
          </style>`,
              }}
            />
            <audio ref={playerRef} id="player" controls>
              <source src={url} type="audio/mp3" />
            </audio>
          </div>
          {toastMarkup}
        </div>
      </Frame>
    </div>
  );
};

export default Customize;
