import {
  useActionData,
  useLoaderData,
  useNavigation,
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
    const charge = await prisma.Charges.findMany({
      where: { shop: admin?.rest?.session?.shop },
    });
    const allPlans = await prisma.plans.findMany({
      orderBy: {
        price: "asc",
      },
    });

    let subscription = [];

    if (user[0]?.chargeId) {
      try {
        const response = await axios.get(
          `https://${admin?.rest?.session?.shop}/admin/api/2024-01/recurring_application_charges/${user[0]?.chargeId}.json`,
          {
            headers: {
              "X-Shopify-Access-Token": admin?.rest?.session?.accessToken,
              "Content-Type": "application/json",
            },
          },
        );
        subscription = response.data;
      } catch (error) {
        console.error(error);
      }
    }

    return { allPlans, user, plan: subscription, charge };
  } catch (error) {
    console.error("Error fetching plans:", error);
    throw error;
  }
};

export const action = async ({ request }) => {
  const { admin } = await authenticate.admin(request);
  const body = await request.formData();
  try {
    const user = await prisma.Users.findMany({
      where: { shop: admin?.rest?.session?.shop },
    });
    const charge = await prisma.Charges.findMany({
      where: { shop: admin?.rest?.session?.shop },
    });
  
    if (user.length === 0) {
      return { error: "User not found" };
    }
  
    // Update user planId
    await prisma.Users.update({
      where: { id: user[0]?.id },
      data: { planId: body.get("id") },
    });
  
    let response;
  
    if (request.method === "POST") {
      console.log('sending')
      // Create new subscription
      response = await admin.graphql(
        `#graphql
        mutation AppSubscriptionCreate($name: String!, $lineItems: [AppSubscriptionLineItemInput!]!, $returnUrl: URL!, $trialDays: Int, $test: Boolean) {
          appSubscriptionCreate(name: $name, returnUrl: $returnUrl, lineItems: $lineItems, trialDays: $trialDays, test: $test) {
            userErrors {
              field
              message
            }
            appSubscription {
              id
            }
            confirmationUrl
          }
        }`,
        {
          variables: {
            name: body.get("name"),
            returnUrl: `https://admin.shopify.com/store/${admin?.rest?.session?.shop.split(".")[0]}/apps/audio-player-by-bplugins/app/SuccessBilling`,
            lineItems: [
              {
                plan: {
                  appRecurringPricingDetails: {
                    price: {
                      amount: Number(body.get("price")),
                      currencyCode: body.get("currencyCode"),
                    },
                    interval: "EVERY_30_DAYS",
                  },
                },
              },
            ],
            trialDays: 7,
            test:true, // Set this to false in production
          },
        },
      );

      const data = await response.json();
  
      return { data, charges: charge, user: user };
    } else if (request.method === "PUT") {
  
      // Cancel existing subscription
      const appSubscriptionResponse = await admin.graphql(
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
      const appSubscription = await appSubscriptionResponse.json(); // Single json call
  
      await prisma.Charges.update({
        where: { id: charge[0]?.id },
        data: {
          status:
            appSubscription?.data?.appSubscriptionCancel?.appSubscription?.status,
        },
      });
  
      // Error Handling
      if (
        appSubscription?.errors ||
        (appSubscription?.data &&
          appSubscription?.data?.appSubscriptionCancel?.userErrors?.length > 0)
      ) {
        return {
          error: "Operation failed",
          details: appSubscription.errors || appSubscription.data.userErrors,
        };
      }
  
      return { data: appSubscription };
    }
    // console.log(response,"=================================================")
  
    const data = await response.json();
  
    return { data, charges: charge, user: user };
  } catch (error) {
    console.error("Error fetching:", error);
    throw error;
  }
  // Authentication
  

  
};

const SubscriptionBtn = (props) => {
  const submit = useSubmit();
  const nav = useNavigation();
  const actionData = useActionData();
  const loaderData = useLoaderData();
  const [loading, setLoading] = useState(false);

  const isLoading =
  (["loading", "submitting"].includes(nav.state) &&
    nav.formMethod === "POST") ||
  nav.formMethod === "PUT" ||
  nav.formMethod === "DELETE";

  const plan = loaderData.plan;
  const plans = loaderData.allPlans;

  if (actionData?.data?.data?.appSubscriptionCreate?.confirmationUrl) {
    window.top.location =
      actionData?.data?.data?.appSubscriptionCreate?.confirmationUrl;
  }

  console.log({actionData})

  const startSub = (plan) => {

    return submit(plan, { replace: true, method: "POST" });
  };

  const cancelSubscription = () => {
    if (plan?.recurring_application_charge?.price > 0) {
      submit(
        { name: "Md Shohanur Rahman" },
        { replace: true, method: "PUT" }, // optional: verify how encoding is being handled
      );
    }
  };



  // if (isLoading) {
  //   return <Loader />;
  // }

  const user = loaderData?.user[0];
  const charge = loaderData?.charge[0];


  return (
    <Page>
      <ui-title-bar title="Pricing" />
      <CalloutCard
        title="Change your plan"
        illustration="https://cdn.shopify.com/s/files/1/0583/6465/7734/files/tag.png?v=1705280535"
        primaryAction={{
          content: "Cancel Plan",
          onAction: () => cancelSubscription(),
          loading:isLoading
        }}
      >
        {plan?.recurring_application_charge?.name == "Pro" &&
        plan?.recurring_application_charge?.status == "ACTIVE" ? (
          <p>
            You're currently on pro plan. Audio Limit 10 unlocked. Upgrade to
            Pro Plus to unlock more features.
          </p>
        ) : plan?.recurring_application_charge?.name == "Pro Plus" &&
          plan?.recurring_application_charge?.status == "ACTIVE" ? (
          <p>You're currently Pro Plus plan. All features are unlocked.</p>
        ) : (
          <p>
            You're currently on free plan. Upgrade to pro to unlock more
            features.
          </p>
        )}
      </CalloutCard>

      <div style={{ margin: "0.5rem 0" }}>
        <Divider />
      </div>

      <Grid>
        {plans?.map((plan_item, index) => (
          <Grid.Cell
            key={index}
            columnSpan={{ xs: 6, sm: 3, md: 3, lg: 4, xl: 4 }}
          >
            <Card
              background={
                plan?.recurring_application_charge?.status == "active" &&
                plan_item?.name == plan?.recurring_application_charge?.name
                  ? "bg-surface-success"
                  : "bg-surface"
              }
              sectioned
            >
              <Box padding="400">
                <Text as="h3" variant="headingMd">
                  {plan_item?.name}
                </Text>
                <Box as="p" variant="bodyMd">
                  {plan_item?.description}
                  {/* If plan_item is 0, display nothing */}
                  <br />
                  <Text as="p" variant="headingLg" fontWeight="bold">
                    {"$" + plan_item?.price}
                  </Text>
                </Box>

                <div style={{ margin: "0.5rem 0" }}>
                  <Divider />
                </div>

                <BlockStack gap={100}>
                  {plan_item?.features?.map((feature, index) => (
                    <ExceptionList
                      key={index}
                      items={[
                        {
                          icon: CheckIcon,
                          description: feature,
                        },
                      ]}
                    />
                  ))}
                </BlockStack>
                <div style={{ margin: "0.5rem 0" }}>
                  <Divider />
                </div>

                {plan?.recurring_application_charge?.status == "active" ? (
                  plan_item?.price > 0 ? (
                    plan?.recurring_application_charge?.name !==
                    plan_item?.name ? (
                      <Button
                        primary
                        onClick={() => {
                          startSub(plan_item);
                        }}
                        loading={isLoading}
                      >
                        Upgrade Now
                      </Button>
                    ) : (
                      <Text as="p" variant="bodyMd">
                        You're currently on this plan
                      </Text>
                    )
                  ) : null
                ) : plan_item?.price > 0 ? (
                  <Button
                    primary
                    onClick={() => {
                      startSub(plan_item);
                    }}
                    loading={isLoading}
                  >
                    Upgrade Now
                  </Button>
                ) : null}
              </Box>
            </Card>
          </Grid.Cell>
        ))}
      </Grid>
    </Page>
  );
};

export default SubscriptionBtn;
