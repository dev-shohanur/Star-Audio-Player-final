import {
  redirect,
  useActionData,
  useLoaderData,
  useSubmit,
} from "@remix-run/react";
import {
  Button,
  LegacyCard,
  List,
  Page,
  Grid,
  Divider,
  ExceptionList,
  CalloutCard,
  Card,
  Box,
  Text,
  BlockStack,
} from "@shopify/polaris";
import { CheckIcon } from "@shopify/polaris-icons";
import React, { useEffect, useState } from "react";
import { authenticate } from "../shopify.server";
import prisma from "../db.server";
import Loader from "../components/Loader/Loader";
import axios from "axios";

export const loader = async ({ request }) => {
  const { admin } = await authenticate.admin(request);
  try {
    const user = await prisma.Users.findMany({
      where: { shop: admin?.rest?.session?.shop },
    });

    const response = await admin.graphql(
      `#graphql
  mutation AppSubscriptionCancel($id: ID!) {
    appSubscriptionCancel(id: $id) {
      userErrors {
        field
        message
      }
      appSubscription {
        id
        status
      }
    }
  }`,
      {
        variables: {
          id: `gid://shopify/AppSubscription/${user[0]?.chargeId}`,
        },
      },
    );

    const data = await response.json();

    if (
      data?.data?.appSubscriptionCancel?.appSubscription?.status == "CANCELLED"
    ) {
      return redirect("/app/pricing");
    }

    return { data };
  } catch (error) {
    console.error("Error fetching plans:", error);
    throw error;
  }
};

export const action = async ({ request }) => {
  // Authentication
  const { admin } = await authenticate.admin(request);

  return { admin: admin };
};

const SubscriptionBtn = (props) => {
  const submit = useSubmit();
  const actionData = useActionData();
  const loaderData = useLoaderData();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (actionData) {
      setLoading(false);
    }
  }, [actionData]);

  if (loading) {
    return <Loader />;
  }

  console.log(loaderData);

  return (
    <Page>
      <ui-title-bar title="Pricing" />
    </Page>
  );
};

export default SubscriptionBtn;
