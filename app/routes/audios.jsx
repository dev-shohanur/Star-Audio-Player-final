import { json } from "@remix-run/node";
import { PrismaClient } from "@prisma/client";
// import { cors } from "remix-utils/cors";

const prisma = new PrismaClient();
       
export async function loader({request}) {
 
  let data  = [];
    try {
      const url = new URL(request.url);
      const ids = JSON.parse(url.searchParams.get("ids"), '[]');

      const filteredIds = ids.filter(id => id.length === 24);
  
          data = await prisma.audio.findMany({
            where: { id: {in: filteredIds} },
            select: {
              id: true,
              title: true,
              url: true,
              mainColor: true,
              shop: true,
              screenDefault: true,
              screenOne: true,
              screenTwo: true,
              selectedScreen: true,
            },
          });
          return json({audio: data });
    } catch (error) {
      return json({error: error, audio: data})
    }

  

    return json({
      message: '403 forbidden',
      audio: []
    });
}

export async function action({ request }) {
  const origin = request.headers.get('origin') || '';

  const ids = await request.json();
  if((origin?.includes('.myshopify.com') || origin?.includes('.shopify.com')) && ids?.length){
      const myPromise = new Promise((resolve, reject) => {
        let audio = [];
        ids.map(async (id, index) => {
          const data = await prisma.audio.findUnique({
            where: { id: id },
            select: {
              id: true,
              title: true,
              url: true,
              mainColor: true,
              shop: true,
              screenDefault: true,
              screenOne: true,
              screenTwo: true,
              selectedScreen: true,
            },
          });
          audio.push(data);
          if (ids.length - 1 === index) {
            resolve({ audio });
          }
        });
      });
    
      const { audio } = await myPromise;
    
      return json({audio });
    }

  

    return json({
      message: '403 forbidden',
      audio: []
    });
}
