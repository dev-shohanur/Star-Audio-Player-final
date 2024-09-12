import { useActionData, useLoaderData, useSubmit } from "@remix-run/react";
import { Button, LegacyCard, List, Page, Grid } from "@shopify/polaris";
import React, { useEffect, useState } from "react";
import { authenticate } from "../shopify.server";
import prisma from "../db.server";
import Loader from "../components/Loader/Loader";

export const loader = async ({ request }) => {
  const { admin } = await authenticate.admin(request);
  try {
    const user = await prisma.Users.findMany({
      where: { shop: admin?.rest?.session?.shop },
    });
    let charge = [];

    if (user[0]?.chargeId) {
      charge = await prisma.Charges.findMany({
        where: { chargeId: user[0]?.chargeId },
      });
    }
    const allPlans = await prisma.plans.findMany({});

    return { allPlans, user, charge };
  } catch (error) {
    console.error("Error fetching plans:", error);
    throw error;
  }
};

export const action = async ({ request }) => {
  // Authentication
  const { admin } = await authenticate.admin(request);
  const body = await request.formData();


  const user = await prisma.Users.findMany({
    where: { shop: admin?.rest?.session?.shop },
  });
  await prisma.Users.update({
    where: { id: user[0]?.id },
    data: { planId: body.get("id") },
  });

  const response = await admin.graphql(
    `#graphql
  mutation AppPurchaseOneTimeCreate($name: String!, $price: MoneyInput!, $returnUrl: URL!,$test: Boolean) {
    appPurchaseOneTimeCreate(name: $name, returnUrl: $returnUrl, price: $price,test: $test) {
      userErrors {
        field
        message
      }
      appPurchaseOneTime {
        createdAt
        id
      }
      confirmationUrl
    }
  }`,
    {
      variables: {
        name: body.get("name"),
        returnUrl: `https://admin.shopify.com/store/${admin?.rest?.session?.shop.split(".")[0]}/apps/star-audio-player/app/SuccessBilling`,
        price: {
          amount: Number(body.get("price")),
          currencyCode: body.get("currencyCode"),
        },
        test: true,
      },
    },
  );

  const data = await response.json();

  return { data };
};

const SubscriptionBtn = (props) => {
  const submit = useSubmit();
  const actionData = useActionData();
  const loaderData = useLoaderData();
  const [loading, setLoading] = useState(false);


  const plans = loaderData.allPlans;
  if (actionData?.data?.data?.appPurchaseOneTimeCreate?.confirmationUrl) {
    window.top.location =
      actionData?.data?.data?.appPurchaseOneTimeCreate?.confirmationUrl;
  }

  const startSub = (plan) => {
    if (actionData?.appPurchaseOneTimeCreate?.confirmationUrl) {
      window.top.location.hash =
        actionData?.appPurchaseOneTimeCreate?.confirmationUrl;
    }

    return submit(plan, { replace: true, method: "POST" });
  };

  useEffect(() => {
    if (actionData) {
      setLoading(false);
    }
  }, [actionData]);

  if (loading) {
    return <Loader />;
  }

  

  const user = loaderData?.user[0];
  const charge = loaderData?.charge[0];

  return (
    <Page fullWidth>
      <Grid>
        {plans?.map((plan) => (
          <Grid.Cell columnSpan={{ xs: 6, sm: 3, md: 3, lg: 4, xl: 4 }}>
            <LegacyCard
              title={plan?.name}
              primaryFooterAction={
                charge?.price !== "undefined" ||
                parseInt(charge?.price) <= parseInt(plan?.price)
                  ? {
                      content:
                        (user?.planId === plan?.id &&
                          charge?.chargeId === user?.chargeId) ||
                        false
                          ? "Current Plan"
                          : parseInt(plan?.price) === 0
                            ? "Current Plan"
                            : "Upgrade",
                      onClick: () => {
                        user?.planId === plan?.id &&
                        charge?.chargeId === user?.chargeId
                          ? null
                          : startSub(plan);
                        user?.planId === plan?.id &&
                        charge?.chargeId === user?.chargeId
                          ? null
                          : setLoading(true);
                      },
                    }
                  : null
              }
            >
              <LegacyCard.Section
                title={"$" + plan?.price + " " + plan?.currencyCode}
              >
                {/* <List>
                  <List.Item>{plan?.options[1]}</List.Item>
                  <List.Item>{plan?.options[2]}</List.Item>
                </List> */}
              </LegacyCard.Section>
            </LegacyCard>
          </Grid.Cell>
        ))}
      </Grid>
    </Page>
  );
};

export default SubscriptionBtn;
