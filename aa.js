const { Routeros } = require("routeros-node");

async function run() {
  const routeros = new Routeros({
    host: "192.168.0.1",
    port: 9999,
    user: "admin",
    password: "5243",
  });

  try {
    // connect to RouterOS
    const conn = await routeros.connect();

    // if connected successfully will return the connected instance/socket,
   /*  console.log("conn===>", conn); */

    // after that we can write the query
    const usersHotspot =await conn.write(["/interface/print"]);
    console.log(usersHotspot);
  } catch (error) {
    // if it fails will return an error here
    console.log("error===>", error);
  } finally {
    // dont forget to close connection
    routeros.destroy();
  }
}

run();