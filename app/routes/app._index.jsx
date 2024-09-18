import { useCallback, useEffect, useState } from "react";
import { json } from "@remix-run/node";
import {
  Link,
  redirect,
  useActionData,
  useLoaderData,
  useNavigation,
  useSubmit,
} from "@remix-run/react";
import {
  ClipboardIcon,
  CodeIcon,
  EditIcon,
  DeleteIcon,
  NoteIcon,
} from "@shopify/polaris-icons";
import {
  Page,
  Layout,
  Text,
  Card,
  Button,
  BlockStack,
  Box,
  List,
  InlineStack,
  LegacyCard,
  DataTable,
  Frame,
  Modal,
  DropZone,
  LegacyStack,
  Thumbnail,
  TextField,
  Popover,
  ActionList,
  EmptyState,
  Toast,
} from "@shopify/polaris";
import { authenticate } from "../shopify.server";
import { PrismaClient } from "@prisma/client";
import Loader from "../components/Loader/Loader";
import axios from "axios";

const prisma = new PrismaClient();

export const loader = async ({ request }) => {
  const { admin } = await authenticate.admin(request);

  const charge = await prisma.Charges.findMany({
    where: { shop: admin?.rest?.session?.shop },
  });
  const user = await prisma.Users.findMany({
    where: { shop: admin?.rest?.session?.shop },
  });

  const audio = await prisma.audio.findMany({
    where: {
      shop: admin?.rest?.session?.shop,
    },
    select: {
      id: true,
      title: true,
      url: true,
      shop: true,
    },
  });

  return json({ audio, user: user[0] });
};

export const action = async ({ request }) => {
  const { admin } = await authenticate.admin(request);

  const body = await request.formData();

  const data = body.get("data");

  const screens = await prisma.screen.findMany({});

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

  if (!admin.rest.session.shop) {
    new Error("Shop not found");
  }
  let createAudio;
  if (request.method === "POST") {
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

    const screen = {};

    const { responseAudioUrlJson } = await getUrlPromise;
    createAudio = await prisma.audio.create({
      data: {
        shop: admin?.rest?.session?.shop,
        title: data.split(",")[1],
        url: responseAudioUrlJson.data.node.url,
        mainColor: "#00b3ff",
        screenOne: screens[0],
        screenTwo: screens[1],
        screenDefault: screens[2],
        selectedScreen: "screenDefault",
      },
    });
    return redirect(`/app/customize/${createAudio?.id}?fullscreen=true`);
  } else if (request.method === "DELETE") {
    const result = await prisma.audio.delete({
      where: { id: body.get("data") },
    });
    return json({ result, responseAudioUrlJson });
  }
};

export default function Index() {
  const nav = useNavigation();
  const actionData = useActionData();


  const loaderData = useLoaderData();
  const submit = useSubmit();
  const isLoading =
    (["loading", "submitting"].includes(nav.state) &&
      nav.formMethod === "POST") ||
    nav.formMethod === "PUT" ||
    nav.formMethod === "DELETE";
  const [active, setActive] = useState(false);
  const handleModalChange = useCallback(() => setActive(!active), [active]);
  const handleClose = () => {
    handleModalChange();
  };

  const [files, setFiles] = useState([]);
  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(false);

  const handleTitleChange = useCallback((newValue) => setTitle(newValue), []);

  const handleDropZoneDrop = useCallback(
    (_dropFiles, acceptedFiles, _rejectedFiles) =>
      setFiles((files) => [...files, ...acceptedFiles]),
    [],
  );

  const validImageTypes = ["image/gif", "image/jpeg", "image/png"];

  const fileUpload = !files.length && (
    <DropZone.FileUpload actionHint="Accepts .mp3, .mp4" />
  );
  function bytesToSize(bytes) {
    const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
    if (bytes === 0) return "n/a";
    const i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)), 10);
    if (i === 0) return `${bytes} ${sizes[i]}`;
    return `${(bytes / 1024 ** i).toFixed(1)} ${sizes[i]}`;
  }

  const uploadedFiles = files.length > 0 && (
    <LegacyStack vertical>
      {files.map((file, index) => (
        <LegacyStack alignment="center" key={index}>
          <Thumbnail
            size="small"
            alt={file.name}
            source={
              validImageTypes.includes(file.type)
                ? window.URL.createObjectURL(file)
                : NoteIcon
            }
          />
          <div>
            {file.name}{" "}
            <Text variant="bodySm" as="p">
              {bytesToSize(file.size)}
            </Text>
          </div>
        </LegacyStack>
      ))}
    </LegacyStack>
  );

  const uploadAudio = useCallback(() => {
    handleModalChange();
  });
  const handleSubmitAudioFile = useCallback(() => {
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
          submit({ data: [imageData.data.url, title] }, { method: "POST" });
          setFiles([]);
          setTitle("");
          setLoading(true);
        }
      });
    handleModalChange();
  });

  const [activeToasts, setActiveToasts] = useState([]);
  const toggleActive = (id) =>
    setActiveToasts((activeToasts) => {
      const isToastActive = activeToasts.includes(id);
      return isToastActive
        ? activeToasts.filter((activeToast) => activeToast !== id)
        : [...activeToasts, id];
    });

  const toggleActiveOne = useCallback(() => toggleActive(1), []);

  const toggleActiveTwo = useCallback(() => toggleActive(2), []);
  const toggleActiveThree = useCallback(() => toggleActive(3), []);
  const toggleActiveFour = useCallback(() => toggleActive(4), []);

  const [popoverActive, setPopoverActive] = useState(0);

  const togglePopoverActive = useCallback((id) => setPopoverActive(id), []);
  const toastDuration = 5000;

  const toastMarkup1 = activeToasts.includes(1) ? (
    <Toast
      content="Deleted successfully"
      onDismiss={toggleActiveOne}
      duration={toastDuration}
    />
  ) : null;
  const toastMarkup2 = activeToasts.includes(2) ? (
    <Toast
      content="Successfully Uploaded"
      onDismiss={toggleActiveTwo}
      duration={toastDuration}
    />
  ) : null;
  const toastMarkup3 = activeToasts.includes(3) ? (
    <Toast
      content="Successfully Copy Embed"
      onDismiss={toggleActiveThree}
      duration={toastDuration}
    />
  ) : null;
  const toastMarkup4 = activeToasts.includes(4) ? (
    <Toast
      content="Successfully Copy Id"
      onDismiss={toggleActiveFour}
      duration={toastDuration}
    />
  ) : null;

  const copyId = (id) => {
    navigator.clipboard.writeText(id);
    toggleActiveFour();
  };
  const copyEmbed = (id, title) => {
    const embedCode = `<div class="html5-audio-plyr" data-id="${id}"></div>`;

    navigator.clipboard.writeText(embedCode);
    toggleActiveThree();
  };

  const rows = [];

  loaderData?.audio?.map((audio, index) =>
    rows.push([
      index + 1,
      audio?.title,

      <div style={{ display: "inline-flex", gap: "10px" }}>
        <Button
          variant="primary"
          icon={CodeIcon}
          onClick={() => copyEmbed(audio.id, audio.title)}
        >
          Copy Embed Code
        </Button>
        <Button
          variant="primary"
          icon={ClipboardIcon}
          onClick={() => copyId(audio.id)}
        >
          Copy ID
        </Button>
      </div>,
      <div style={{ display: "inline-flex", gap: "10px" }}>
        {/*
         */}
        <Link to={`/app/customize/${audio.id}`}>
          <Button variant="primary" icon={EditIcon} tone="success">
            Edit
          </Button>
        </Link>
        <Button
          variant="primary"
          tone="critical"
          icon={DeleteIcon}
          onClick={() => {
            submit({ data: audio.id }, { method: "DELETE" });
            toggleActiveOne();
          }}
        >
          Delete
        </Button>
      </div>,
    ]),
  );

  // useEffect(() => {
  //   if (isLoading) {
  //     setFiles([]);
  //     setTitle("");
  //   }
  // }, [isLoading]);

  if (isLoading) {
    return <Loader />;
  }

  return (
    <Page>
      <ui-title-bar title="HTML5 Audio Player">
        <button variant="primary" onClick={uploadAudio}>
          Upload Audio
        </button>
      </ui-title-bar>
      {loaderData?.audio?.length > 0 ? (
        <LegacyCard>
          <DataTable
            columnContentTypes={["text", "text", "text", "numeric"]}
            headings={["id", "Title", "Copy", "Actions"]}
            rows={rows}
          />
        </LegacyCard>
      ) : (
        <LegacyCard sectioned>
          <EmptyState
            heading="Upload a file to get started"
            action={{ content: "Upload files", onAction: uploadAudio }}
            image="https://cdn.shopify.com/s/files/1/0262/4071/2726/files/emptystate-files.png"
            fullWidth
          >
            <p>
              You can use the Files section to upload images, videos, and other
              documents. This example shows the content with a centered layout
              and full width.
            </p>
          </EmptyState>
        </LegacyCard>
      )}

      <Frame>
        <Modal
          open={active}
          onClose={handleClose}
          title="Upload Audio File"
          primaryAction={{
            content: "Submit",
            onAction: handleSubmitAudioFile,
            loading: isLoading,
            disabled: (!title && files) || !files.length,
          }}
          secondaryActions={[
            {
              content: "Cancel",
              onAction: handleClose,
            },
          ]}
        >
          <Modal.Section>
            {loaderData?.audio?.length == loaderData?.user?.cardits ? (
              <div
                style={{
                  width: "100%",
                  height: "100%",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  flexDirection: "column",
                  marginTop: "20px",
                  marginBottom: "20px",
                }}
              >
                <h2
                  style={{
                    fontSize: "18px",
                    color: "red",
                    marginBottom: "10px",
                  }}
                >
                  Your Maximum Limit {loaderData?.user?.cardits}
                </h2>
                <Link to={`/app/pricing`}>
                  <Button variant="primary">Upgrade</Button>
                </Link>
              </div>
            ) : (
              <>
                <div style={{ marginBottom: "10px" }}>
                  <TextField
                    label="Title"
                    value={title}
                    onChange={handleTitleChange}
                    autoComplete="off"
                  />
                </div>
                <DropZone onDrop={handleDropZoneDrop} variableHeight>
                  {uploadedFiles}
                  {fileUpload}
                </DropZone>
              </>
            )}
          </Modal.Section>
        </Modal>
        {toastMarkup1}
        {toastMarkup2}
        {toastMarkup3}
        {toastMarkup4}
      </Frame>
    </Page>
  );
}
