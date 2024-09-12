export async function loader() {
  const data = "Md Shohanur Rahman";

  return { name: data };
}

export async function action({ request }) {
  const body = await request.json();
  const myPromise = new Promise((resolve, reject) => {
    let audio = [];
    body.map(async (id, index) => {
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
      if (body.length - 1 === index) {
        resolve({ audio });
      }
    });
  });

  const { audio } = await myPromise;

  return { audio };
}
