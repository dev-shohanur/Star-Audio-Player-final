import {
  json,
  useActionData,
  useLoaderData,
  useLocation,
  useNavigate,
  useSearchParams,
  useSubmit,
} from "@remix-run/react";
import { UploadIcon } from "@shopify/polaris-icons";
import {
  Badge,
  Button,
  ButtonGroup,
  FullscreenBar,
  Page,
  TextField,
  Text,
  DropZone,
  Select,
  FormLayout,
  Tooltip,
  Popover,
  ActionList,
} from "@shopify/polaris";
import React, { useCallback, useEffect, useRef, useState } from "react";
import prisma from "../db.server";
import "../styles/plyr.css";
import Plyr from "plyr";
import "../styles/style.css";
import { authenticate } from "../shopify.server";
import { HexColorPicker } from "react-colorful";

export async function loader({ params }) {
  // await authenticate.admin(request);
  const audio = await prisma.audio.findUnique({ where: { id: params.id } });

  return { audio };
}

export async function action({ request }) {
  const { admin } = await authenticate.admin(request);
  const body = await request.formData();

  const data = body.get("data");

  let createAudio = "";
  if (request.method === "PUT") {
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
            originalSource: data.split(",")[0],
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
        id: data.split(",")[2],
      },
      data: {
        title: data.split(",")[1],
        url: responseAudioUrlJson.data.node.url,
      },
    });

    return json({ createAudio });
  } else if (request.method === "POST") {
    createAudio = await prisma.audio.update({
      where: {
        id: data.split(",")[2],
      },
      data: {
        title: data.split(",")[1],
        url: data.split(",")[0],
      },
    });

    return json({ createAudio });
  }
  return data;
}

const Shohan = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const submit = useSubmit();
  const action = useActionData();
  const loaderData = useLoaderData({ data: location.pathname.split("/")[3] });
  const [player, setPlayer] = useState(null);

  // const [isFullscreen, setFullscreen] = useState(true);
  const [title, setTitle] = useState(loaderData?.audio?.title);
  const [url, setUrl] = useState(loaderData?.audio?.url);
  const [screen, setScreen] = useState(0);
  const [borderRadius, setBorderRadius] = useState("24");
  const [borderRadiusUnit, setBorderRadiusUnit] = useState("px");
  const [playButtonBackground, setPlayButtonBackground] = useState("#ffffff");
  const [color, setColor] = useState("#ffffff");

  const handleScreenChange = useCallback((value) => setScreen(value), []);
  const handleChangeTitle = useCallback((newValue) => setTitle(newValue), []);
  const handleChangeUrl = useCallback((newValue) => setUrl(newValue), []);
  const handleBorderRadiusChange = useCallback(
    (newValue) => setBorderRadius(newValue),
    [],
  );
  const handleBorderRadiusUnitChange = useCallback(
    (newValue) => setBorderRadiusUnit(newValue),
    [],
  );

  const screens = [
    { label: "Default", value: 0 },
    { label: "Screen One", value: 1 },
    { label: "Screen Two", value: 2 },
    { label: "Screen Three", value: 3 },
  ];

  const [, setSearchParams] = useSearchParams();

  useEffect(() => {
    setSearchParams({ fullscreen: true });
  }, []);
  useEffect(() => {
    if (action?.createAudio?.url) {
      setUrl(action?.createAudio?.url);
    }
  }, [action]);

  const handleFullScreen = useCallback(() => {
    setSearchParams({});
    navigate("/app");
    //   // setFullscreen(false);
  }, []);

  const handleDropZoneDrop = (event) => {
    const formData = new FormData();

    formData.append("async-upload", event[0]);
    const url = `https://files.bplugins.com/wp-json/media-upload/v1/image-upload`;
    fetch(url, {
      method: "POST",
      body: formData,
    })
      .then((res) => res.json())
      .then((imageData) => {
        if (imageData?.success) {
          submit(
            {
              data: [
                imageData.data.url,
                title,
                loaderData?.audio?.id,
                { update: false },
              ],
            },
            { method: "PUT" },
          );
        }
      });
  };

  const handleUpdate = () => {
    submit(
      { data: [url, title, loaderData?.audio?.id, { update: true }] },
      { method: "POST" },
    );
  };

  const playerRef = useRef();


  useEffect(() => {
    if (playerRef.current) {
      setPlayer(
        new Plyr(playerRef.current, {
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
            <span role="tooltip" class="plyr__tooltip">00:00</span>
     
              </div>
             
              <div class="progress-time-current milli plyr__time plyr__time--current" aria-label="Current time">15:23</div>
              <div class="progress-time-total milli plyr__time plyr__time--duration" aria-label="Duration">34:40</div>
            </div>
          </div>
          `,
        }),
      );
    }
    return () => {
      player?.destroy();
    };
  }, []);

  useEffect(() => {
    if (playerRef.current) {
      playerRef.current.src = url;
    }
  }, [url]);

  const [popoverActive, setPopoverActive] = useState(true);
  const [playButtonBackgroundActive, setPlayButtonBackgroundActive] =
    useState(true);

  const togglePopoverActive = useCallback(
    () => setPopoverActive((popoverActive) => !popoverActive),
    [],
  );
  const handlePlayButtonBackgroundActive = useCallback(
    () =>
      setPlayButtonBackgroundActive(
        (playButtonBackgroundActive) => !playButtonBackgroundActive,
      ),
    [],
  );

  const playButtonBackgroundActivator = (
    <Button onClick={togglePopoverActive} disclosure>
      <span style={{ backgroundColor: color }}>Color</span>
    </Button>
  );
  const activator = (
    <Button onClick={handlePlayButtonBackgroundActive} disclosure>
      <span style={{ backgroundColor: playButtonBackground }}>Color</span>
    </Button>
  );


  return (
    <Page fullWidth>
      <FullscreenBar onAction={handleFullScreen}>
        <div
          style={{
            display: "flex",
            flexGrow: 1,
            justifyContent: "space-between",
            alignItems: "center",
            paddingLeft: "1rem",
            paddingRight: "1rem",
          }}
        >
          <Badge tone="info">Draft</Badge>
          <div style={{ marginLeft: "1rem", flexGrow: 1 }}>
            <Text variant="headingLg" as="p">
              {title} Customize
            </Text>
          </div>
          <ButtonGroup>
            <Button variant="primary" onClick={() => handleUpdate()}>
              Update
            </Button>
          </ButtonGroup>
        </div>
      </FullscreenBar>
      <div className="customize-container">
        <div className="sidebar">
          <TextField
            type="text"
            label="Title"
            value={title}
            onChange={handleChangeTitle}
            autoComplete="off"
          />
          <div className="upload-container">
            <TextField
              type="url"
              label="Audio Url"
              value={url}
              onChange={handleChangeUrl}
              autoComplete="off"
            />
            <div style={{ width: 40, height: 40 }}>
              <DropZone allowMultiple={false} onDrop={handleDropZoneDrop}>
                <DropZone.FileUpload />
              </DropZone>
            </div>
          </div>
          <Select
            label="Select Screen"
            options={screens}
            onChange={handleScreenChange}
            value={screen}
          />
          <div style={{ marginTop: "20px" }}>
            <FormLayout>
              <FormLayout.Group>
                <TextField
                  type="number"
                  label="Border Radius"
                  value={borderRadius}
                  onChange={handleBorderRadiusChange}
                  autoComplete="off"
                />
                <Select
                  type="select"
                  options={[
                    { label: "PX", value: "px" },
                    { label: "%", value: "%" },
                    { label: "REM", value: "rem" },
                    { label: "EM", value: "em" },
                  ]}
                  value={borderRadiusUnit}
                  label="Unit"
                  onChange={handleBorderRadiusUnitChange}
                  autoComplete="off"
                />
              </FormLayout.Group>
            </FormLayout>
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginTop: "15px",
              marginBottom: "15px",
            }}
          >
            <h2>Play Button Background</h2>
            <Popover
              active={playButtonBackgroundActive}
              activator={playButtonBackgroundActivator}
              autofocusTarget="first-node"
              onClose={handlePlayButtonBackgroundActive}
            >
              <Popover.Pane fixed>
                <Popover.Section>
                  <p>Background Color</p>
                </Popover.Section>
              </Popover.Pane>
              <Popover.Pane>
                {/* <ColorPicker
                  color={playButtonBackground}
                  onChange={setPlayButtonBackground}
                /> */}
              </Popover.Pane>
            </Popover>
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginTop: "15px",
              marginBottom: "15px",
            }}
          >
            <h2>Background Color</h2>
            <Popover
              active={popoverActive}
              activator={activator}
              autofocusTarget="first-node"
              onClose={togglePopoverActive}
            >
              <Popover.Pane fixed>
                <Popover.Section>
                  <p>Background Color</p>
                </Popover.Section>
              </Popover.Pane>
              <Popover.Pane>
                <HexColorPicker color={color} onChange={setColor} />
              </Popover.Pane>
            </Popover>
          </div>
        </div>
        <div className="content-section">
          <div
            dangerouslySetInnerHTML={{
              __html: `<style>

           .plyr .media-controls {
                align-items: center;
                background: ${color};
                border: 1px solid #fff3eb;
                border-radius: ${borderRadius + borderRadiusUnit};
                color: #565656;
                display: flex;
                flex-direction: column;
                justify-content: center;
                margin: 24px;
                max-width: calc(100% - 24px * 2);
                padding: 24px;
                position: relative;
            }

            .play-button .back-button__icon {
              background: linear-gradient(to bottom left, #ffffff, #fff8e7);
              border: 1px solid #fff3eb;
              box-shadow: -1px 1px 1px rgba(255, 195, 153, 0.25), 1px -1px 1px rgba(255, 255, 255, 0.25), -2px 2px 2px rgba(255, 195, 153, 0.2), 2px -2px 2px rgba(255, 255, 255, 0.2), -4px 4px 4px rgba(255, 195, 153, 0.15), 4px -4px 4px rgba(255, 255, 255, 0.15), -8px 8px 8px rgba(255, 195, 153, 0.1), 8px -8px 8px rgba(255, 255, 255, 0.1), -16px 16px 16px rgba(255, 195, 153, 0.05), 16px -16px 16px rgba(255, 255, 255, 0.05);
              color: #f26600;
              width: 60px;
              height: 60px;
              display: flex;
              justify-content: center;
              align-items: center;
              border-radius: 100%;
              cursor: pointer;
            }

            @media (min-width: 768px) {
              .play-button .back-button__icon .icon {
                font-size: 24px;
              }
            }

            
          </style>`,
            }}
          ></div>
          <audio ref={playerRef} id="player" controls>
            <source src={url} type="audio/mp3" />
          </audio>
        </div>
      </div>
    </Page>
  );
};

export default Shohan;
