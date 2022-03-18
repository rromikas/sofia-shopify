import {
  Form,
  FormLayout,
  TextField,
  Frame,
  Loading,
  Toast,
} from "@shopify/polaris";
import { useEffect, useState } from "react";
import authProvider from "../data/authProvider";
import Button from "../components/Button";

const Login = ({ setLoggedIn }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
      if (await authProvider.checkAuth()) {
        setLoggedIn(true);
      }
    })();
    // eslint-disable-next-line
  }, []);

  return (
    <div>
      <Frame>
        <div
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            padding: 20,
          }}
        >
          <div style={{ margin: "auto", maxWidth: 480, width: "100%" }}>
            <div
              style={{
                fontSize: 30,
                fontWeight: 600,
                marginBottom: 30,
                textAlign: "center",
              }}
            >
              Login to Sofia
            </div>
            <div
              style={{
                fontSize: 18,
                fontWeight: 400,
                textAlign: "center",
                marginBottom: 45,
                lineHeight: "30px",
                opacity: 0.6,
              }}
            >
              Once logged in, you will be able to import products and use them
              in Sofia flows
            </div>
            <Form
              onSubmit={async () => {
                setLoading(true);
                const res = await authProvider
                  .login({ username, password })
                  .catch((er) => {
                    setError("Wrong email or password");
                  });
                setLoading(false);
                if (res) {
                  setLoggedIn(true);
                }
              }}
            >
              <FormLayout>
                <TextField
                  value={username}
                  onChange={setUsername}
                  label="Username"
                  type="text"
                />
                <TextField
                  value={password}
                  onChange={setPassword}
                  label="Password"
                  type="password"
                />
                <div
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    paddingTop: 20,
                  }}
                >
                  <Button style={{ width: 172 }}>Login</Button>
                </div>
              </FormLayout>
            </Form>
          </div>
        </div>
        {loading && <Loading />}

        {error && (
          <Toast content={error} error onDismiss={() => setError("")} />
        )}
      </Frame>
    </div>
  );
};

export default Login;
