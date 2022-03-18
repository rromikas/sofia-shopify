import { useState } from "react";
import Login from "./Login";
import Importer from "./Importer";

export default function Index() {
  const [loggedIn, setLoggedIn] = useState(false);

  return loggedIn ? (
    <Importer></Importer>
  ) : (
    <Login setLoggedIn={setLoggedIn}></Login>
  );
}
