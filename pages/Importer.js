import { Frame, Loading, Button as DefaultButton } from "@shopify/polaris";
import authProvider from "../data/authProvider";
import { addUserProducts } from "../data/firebase";
import { gql } from "apollo-boost";
import { useApolloClient } from "react-apollo";
import { useEffect, useState } from "react";
import Button from "../components/Button";
import Check from "../components/Check";
import HelloIcon from "../components/HelloIcon";

const Importer = () => {
  const GET_ALL_PRODUCTS = gql`
    mutation {
      bulkOperationRunQuery(
        query: """
        {
          products {
            edges {
              node {
                id
                title
                description
                images {
                  edges {
                    node {
                      originalSrc
                    }
                  }
                }
                priceRangeV2{
                  minVariantPrice{
                    amount
                    currencyCode
                  }
                  maxVariantPrice{
                    amount
                    currencyCode
                  }
                }
              }
            }
          }
        }
        """
      ) {
        bulkOperation {
          id
          status
          url
          objectCount
        }
        userErrors {
          field
          message
        }
      }
    }
  `;

  const GET_CURRNET_OPERATION = gql`
    {
      currentBulkOperation {
        id
        status
        errorCode
        createdAt
        completedAt
        objectCount
        fileSize
        url
        partialDataUrl
      }
    }
  `;

  const [loading, setLoading] = useState(false);
  const apoloClient = useApolloClient();
  const [user, setUser] = useState();
  const [done, setDone] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const identity = await authProvider.getIdentity();
        setUser(identity);
      } catch (er) {
        console.log(er);
      }
    })();
  }, []);

  const startImporting = async () => {
    setLoading(true);
    setDone(false);
    const res = await apoloClient
      .mutate({ mutation: GET_ALL_PRODUCTS })
      .then((x) => console.log({ x }));
    console.log("query", GET_ALL_PRODUCTS);
    console.log("mutate repsonse", res);
    const interval = setInterval(async () => {
      const { data } = await apoloClient.query({
        query: GET_CURRNET_OPERATION,
      });

      // console.log({ data });
      if (data?.currentBulkOperation?.status === "COMPLETED") {
        clearInterval(interval);
        try {
          const res = await fetch(data.currentBulkOperation.url).then((x) =>
            x.text()
          );

          const jsonString = "[" + res.replace(/\n/gm, ",").slice(0, -1) + "]";
          const productsJson = JSON.parse(jsonString);
          let products = [];
          productsJson.forEach((x) => {
            if (x.originalSrc) {
              products[products.length - 1].images = [
                ...products[products.length - 1].images,
                x.originalSrc,
              ];
            } else {
              products.push({ ...x, images: [] });
            }
          });
          await addUserProducts(user.id, products);

          console.log({ user, productsJson });
        } catch (er) {
          console.log(er);
        } finally {
          setLoading(false);
          setDone(true);
        }
      }
    }, 500);
  };

  return (
    <Frame>
      {loading && <Loading></Loading>}
      <div
        style={{ width: "100%", height: "100%", display: "flex", padding: 20 }}
      >
        {!user ? null : !loading && !done ? (
          <div
            style={{
              margin: "auto",
              maxWidth: 456,
              width: "100%",
              textAlign: "center",
            }}
          >
            <div
              style={{
                fontSize: 30,
                fontWeight: 700,
                marginBottom: 40,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                textTransform: "capitalize",
              }}
            >
              <HelloIcon
                style={{ marginRight: 30, marginLeft: -20 }}
              ></HelloIcon>
              Hi, {user.username}
            </div>
            <div style={{ fontSize: 18, lineHeight: "30px", marginBottom: 30 }}>
              Import products to your Sofia account and start using them in your
              flows!
            </div>
            <Button
              onClick={() => {
                startImporting();
              }}
              style={{ width: 172, marginBottom: 20 }}
            >
              Import Products
            </Button>
            <div style={{ opacity: 0.6 }}>
              Already imported products will be updated
            </div>
          </div>
        ) : !done ? (
          <div
            style={{
              margin: "auto",
              maxWidth: 456,
              width: "100%",
              textAlign: "center",
            }}
          >
            <div
              style={{
                fontSize: 30,
                fontWeight: 600,
                marginBottom: 30,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              Importing products...
            </div>
          </div>
        ) : (
          <div
            style={{
              margin: "auto",
              maxWidth: 456,
              width: "100%",
              textAlign: "center",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                marginBottom: 20,
              }}
            >
              <Check></Check>
            </div>
            <div
              style={{
                fontSize: 30,
                fontWeight: 600,
                marginBottom: 25,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                lineHeight: "30px",
              }}
            >
              Products are imported!
            </div>
            <div style={{ fontSize: 18, marginBottom: 40 }}>
              Now you can add products to your Sofia flows
            </div>
            <DefaultButton
              onClick={() => {
                setDone(false);
                setLoading(false);
              }}
            >
              {`That's great`}
            </DefaultButton>
          </div>
        )}
      </div>
    </Frame>
  );
};

export default Importer;
