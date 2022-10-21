export const hello = async (data: any, client: any) => {
  console.log(client);

  const r = new Promise((resolve) => {
    resolve("world");
  });

  return await r;
};

export const test = async (data, client) => {
  console.log(client);

  return await "test";
};

// export const hello = async () => "world";
