import { json } from "@remix-run/node";
import { Link, Outlet, useLoaderData, useRouteError } from "@remix-run/react";
import { boundary } from "@shopify/shopify-app-remix/server";
import { AppProvider } from "@shopify/shopify-app-remix/react";
import "@shopify/polaris/build/esm/styles.css";
import { authenticate } from "../shopify.server";
import prisma from "../db.server";

export const loader = async ({ request }) => {
  const { admin, billing } = await authenticate.admin(request);

  // const data = await billing.require({
  //   plans: [MONTHLY_PLAN],
  //   isTest: true,
  //   onFailure: async () =>
  //     billing.request({
  //       plan: MONTHLY_PLAN,
  //       isTest: true,
  //     }),
  // });

  const user = await prisma.Users.findMany({
    where: { shop: admin?.rest?.session?.shop },
  });
  const charge = await prisma.Charges.findMany({
    where: { shop: admin?.rest?.session?.shop },
  });

  if (user[0]?.shop !== admin?.rest?.session?.shop) {
    await prisma.Users.create({
      data: {
        shop: admin?.rest?.session?.shop,
        cardits: 5,
      },
    });
  }
  // else if (!charge) {
  //   const response = await axios.get(
  //     `https://${admin?.rest?.session?.shop}/admin/api/2024-01/recurring_application_charges/${charge[0]?.chargeId}.json`,
  //     {
  //       headers: {
  //         "X-Shopify-Access-Token": admin?.rest?.session?.accessToken,
  //         "Content-Type": "application/json",
  //       },
  //     },
  //   );

  //   const subscription = await response.data;

  //   if (subscription?.status === "ACTIVE") {
  //     if (subscription?.name == "Pro") {
  //       await prisma.Users.update({
  //         where: {
  //           id: user[0].id,
  //         },
  //         data: {
  //           cardits: 10,
  //         },
  //       });
  //     } else if (subscription?.name == "Pro Plus") {
  //       await prisma.Users.update({
  //         where: {
  //           id: user[0].id,
  //         },
  //         data: {
  //           cardits: 100000000000,
  //         },
  //       });
  //     }
  //   }
  // }
  return json({ apiKey: process.env.SHOPIFY_API_KEY || "" });
};

export default function App() {
  const { apiKey } = useLoaderData();

  return (
    <AppProvider isEmbeddedApp apiKey={apiKey}>
      <ui-nav-menu>
        <Link to="/app" rel="home">
          Home
        </Link>
        <Link to="/app/pricing">Pricing</Link>
      </ui-nav-menu>
      <Outlet />
    </AppProvider>
  );
}

// Shopify needs Remix to catch some thrown responses, so that their headers are included in the response.
export function ErrorBoundary() {
  return boundary.error(useRouteError());
}

export const headers = (headersArgs) => {
  return boundary.headers(headersArgs);
};
