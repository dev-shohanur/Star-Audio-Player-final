import {
  Link,
  useLoaderData,
  useNavigate,
  useParams,
  useSearchParams,
} from "@remix-run/react";
import { Button } from "@shopify/polaris";
import React from "react";
import { authenticate } from "../shopify.server";

export const loader = async ({ request }) => {
  const { admin, session } = await authenticate.admin(request);

  const url = new URL(request.url);
  const charge_id = url.searchParams.get("charge_id");

  const appCharge = await admin.rest.resources.ApplicationCharge.find({
    session: session,
    id: charge_id,
  });

  const charge = await prisma.Charges.findMany({
    where: { chargeId: charge_id },
  });

  let createCharge = [];

  if (!charge[0]) {
    createCharge = await prisma.Charges.create({
      data: {
        shop: admin?.rest?.session?.shop,
        name: appCharge.name,
        price: appCharge.price,
        status: appCharge.status,
        cradit: 0,
        activated_on: appCharge?.created_at,
        trial_days: appCharge?.trial_days,
        cancelled_on: appCharge?.updated_at,
        billing_on: appCharge?.created_at,
        planId: "",
        chargeId: charge_id,
      },
    });
    const user = await prisma.Users.findMany({
      where: { shop: admin?.rest?.session?.shop },
    });
    const plan = await prisma.Plans.findUnique({
      where: { id: user[0]?.planId },
    });
    await prisma.Users.update({
      where: { id: user[0]?.id },
      data: { chargeId: charge_id, cardits: Number(plan?.cradit) },
    });
  }

  return { createCharge, shop: admin?.rest?.session?.shop };
};

const SuccessBilling = () => {
  const loaderData = useLoaderData();
  const navigate = useNavigate();

  return (
    <div
      style={{
        height: "80vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "column",
      }}
    >
      <h2
        style={{
          fontSize: "40px",
          fontWeight: "700",
          color: "green",
          marginBottom: "50px",
        }}
      >
        Successfully Purchase
      </h2>
      <div onClick={() => navigate("/app")}>
        <Button size="large" variant="primary">
          Go to Dashboard
        </Button>
      </div>
    </div>
  );
};

export default SuccessBilling;
