import { ResourcePicker } from "@shopify/app-bridge-react";
import {
  Card,
  ResourceList,
  ResourceItem,
  Page,
  Thumbnail,
  EmptyState,
} from "@shopify/polaris";
import { useState } from "react";

export default function ProductImporter() {
  const [openPicker, setOpenPicker] = useState(false);
  const [products, setProducts] = useState([]);

  return (
    <Page
      title="Products"
      subtitle="Add shopify products which later could be used in Sofia flows"
      primaryAction={{
        content: "Import Products",
        onAction: () => setOpenPicker(true),
      }}
    >
      <ResourcePicker
        initialSelectionIds={products.map(({ id }) => ({ id }))}
        resourceType="Product"
        open={openPicker}
        onCancel={() => setOpenPicker(false)}
        onSelection={(selection) => {
          setOpenPicker(false);
          setProducts(selection.selection);
        }}
      ></ResourcePicker>
      {!products.length ? (
        <Card sectioned>
          <EmptyState
            heading="There are no products yet."
            action={{
              content: "Add product",
              onClick: () => setOpenPicker(true),
            }}
            image="https://cdn.shopify.com/s/files/1/0262/4071/2726/files/emptystate-files.png"
          ></EmptyState>
        </Card>
      ) : (
        <Card>
          <ResourceList
            resourceName={{ singular: "product", plural: "products" }}
            items={products}
            renderItem={({ id, title, images, variants, ...rest }) => {
              console.log(rest);
              return (
                <ResourceItem
                  verticalAlignment="center"
                  id={id}
                  media={
                    <Thumbnail
                      size="small"
                      source={images[0]?.originalSrc ?? ""}
                    ></Thumbnail>
                  }
                >
                  <div
                    style={{
                      width: "100%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <div style={{ fontWeight: 600 }}>{title}</div>
                    <div>{variants[0]?.price}$</div>
                  </div>
                </ResourceItem>
              );
            }}
          />
        </Card>
      )}
    </Page>
  );
}
