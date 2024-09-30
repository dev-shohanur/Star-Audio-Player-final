import { useCallback, useState } from "react";
import { json } from "@remix-run/node";
import {
  redirect,
  useActionData,
  useLoaderData,
  useNavigation,
  useSubmit,
  Link
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
  Text,
  Button,
  LegacyCard,
  DataTable,
  Frame,
  Modal,
  DropZone,
  LegacyStack,
  Thumbnail,
  TextField,
  EmptyState,
  Spinner
} from "@shopify/polaris";
import { authenticate } from "../shopify.server";
import { PrismaClient } from "@prisma/client";
import { useAppBridge } from "@shopify/app-bridge-react";

const prisma = new PrismaClient();

export const loader = async ({ request }) => {
  const { admin } = await authenticate.admin(request);
  try {
    
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
    
      return json({ audio, user: user[0],shop: admin?.rest?.session?.shop });
    
  } catch (error) {
    console.error("Error fetching Audios Loading:", error);
    throw error;
  }
};

export const action = async ({ request }) => {
  const { admin } = await authenticate.admin(request);

  const body = await request.formData();

  const data = body.get("data");


  try {
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
      return redirect(`/app/customize/${createAudio?.id}`);
    } else if (request.method === "DELETE") {
      const result = await prisma.audio.delete({
        where: { id: body.get("data") },
      });
      return json({ result });
    }
  } catch (error) {
    console.error("Error fetching plans:", error);
    throw error;
  }

 
};

export default function Index() {
  const nav = useNavigation();
  const actionData = useActionData();
	const shopify = useAppBridge();

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
      setFiles(() => [ ...acceptedFiles]),
    [],
  );

  const validAudioTypes = [
    "audio/mpeg",   // MP3
    "audio/wav",    // WAV
    "audio/ogg",    // OGG
    "audio/aac",    // AAC
    "audio/flac",   // FLAC
    "audio/x-wav",  // WAV (alternative MIME type)
    "audio/x-aiff", // AIFF
    "audio/x-m4a",  // M4A (used in Apple devices)
    "audio/webm",   // WebM Audio
    "audio/x-ms-wma", // WMA
    "audio/mp4",    // MP4 audio
    "audio/3gpp",   // 3GP audio
    "audio/opus",   // Opus audio
    "audio/amr",    // AMR (Adaptive Multi-Rate audio codec)
    "audio/x-realaudio" // RealAudio
  ];

  const fileUpload = !files.length && (
    <DropZone.FileUpload actionHint="Accepts .mp3, .mp4, .webm" />
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
              validAudioTypes.includes(file.type)
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
    setLoading(true);

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
        }
      });
    // handleModalChange();
  });



  const [popoverActive, setPopoverActive] = useState(0);


  const copyId = (id) => {
    navigator.clipboard.writeText(id);
    shopify.toast.show("I'd Copied Successfully");
  };
  const copyEmbed = (id, title) => {
    const embedCode = `<div class="html5-audio-plyr" data-id="${id}"></div>`;

    navigator.clipboard.writeText(embedCode);
    shopify.toast.show("Embed Code Successfully Copied ");
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
          loading={isLoading}
          onClick={() => {
            submit({ data: audio.id }, { method: "DELETE" });
            shopify.toast.show("Successfully Deleted!!");
          }}
        >
          Delete
        </Button>
      </div>,
    ]),
  );

    if (isLoading) {
      return <div style={{display:"flex",justifyContent:"center",alignItems:"center",width:"100%",height:"100%"}}><Spinner accessibilityLabel="Spinner example" size="large" /></div>
    }



  return (
    <Page>
      <ui-title-bar title="Audio Player by bPlugins">
        <button variant="primary" onClick={uploadAudio}>
          Upload Audio
        </button>
        {/* <button onClick={()=>{
           window.top.location = `https://admin.shopify.com/store/${loaderData?.shop?.split(".")[0]}/charges/html5-audio-player/pricing_plans`
        }}>Pricing</button> */}
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
            action={{ content: "Upload Audio", onAction: uploadAudio }}
            image="https://cdn.shopify.com/s/files/1/0262/4071/2726/files/emptystate-files.png"
            fullWidth
          >
            <p>
              You can use the Files section to upload Audio. This example shows the content with a centered layout
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
            loading: loading,
            disabled: (!title && files) || !files.length,
          }}
          secondaryActions={[
            {
              content: "Cancel",
              onAction: handleClose,
              disabled: loading,
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
      </Frame>
    </Page>
  );
}
