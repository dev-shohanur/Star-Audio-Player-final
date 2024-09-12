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


  if (user[0]?.shop !== admin?.rest?.session?.shop) {
    await prisma.Users.create({
      data: {
        shop: admin?.rest?.session?.shop,
        cardits: 10,
      },
    });
  }
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
