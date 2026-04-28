import { CreateInventoryLevelInput, ExecArgs } from "@medusajs/framework/types";
import {
  ContainerRegistrationKeys,
  Modules,
  ProductStatus,
} from "@medusajs/framework/utils";
import {
  createWorkflow,
  transform,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk";
import {
  createApiKeysWorkflow,
  createCollectionsWorkflow,
  createInventoryLevelsWorkflow,
  createProductCategoriesWorkflow,
  createProductsWorkflow,
  createRegionsWorkflow,
  createSalesChannelsWorkflow,
  createShippingOptionsWorkflow,
  createShippingProfilesWorkflow,
  createStockLocationsWorkflow,
  createTaxRegionsWorkflow,
  linkSalesChannelsToApiKeyWorkflow,
  linkSalesChannelsToStockLocationWorkflow,
  updateStoresStep,
  updateStoresWorkflow,
} from "@medusajs/medusa/core-flows";
import { ApiKey } from "../../.medusa/types/query-entry-points";

const updateStoreCurrencies = createWorkflow(
  "update-store-currencies",
  (input: {
    supported_currencies: { currency_code: string; is_default?: boolean }[];
    store_id: string;
  }) => {
    const normalizedInput = transform({ input }, (data) => {
      return {
        selector: { id: data.input.store_id },
        update: {
          supported_currencies: data.input.supported_currencies.map(
            (currency) => {
              return {
                currency_code: currency.currency_code,
                is_default: currency.is_default ?? false,
              };
            },
          ),
        },
      };
    });

    const stores = updateStoresStep(normalizedInput);

    return new WorkflowResponse(stores);
  },
);

export default async function seedDemoData({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER);
  const link = container.resolve(ContainerRegistrationKeys.LINK);
  const query = container.resolve(ContainerRegistrationKeys.QUERY);
  const fulfillmentModuleService = container.resolve(Modules.FULFILLMENT);
  const salesChannelModuleService = container.resolve(Modules.SALES_CHANNEL);
  const storeModuleService = container.resolve(Modules.STORE);

  const countries = ["gb", "de", "dk", "se", "fr", "es", "it"];

  logger.info("Seeding store data...");
  const [store] = await storeModuleService.listStores();
  let defaultSalesChannel = await salesChannelModuleService.listSalesChannels({
    name: "Default Sales Channel",
  });

  if (!defaultSalesChannel.length) {
    // create the default sales channel
    const { result: salesChannelResult } = await createSalesChannelsWorkflow(
      container,
    ).run({
      input: {
        salesChannelsData: [
          {
            name: "Default Sales Channel",
          },
        ],
      },
    });
    defaultSalesChannel = salesChannelResult;
  }

  await updateStoreCurrencies(container).run({
    input: {
      store_id: store.id,
      supported_currencies: [
        {
          currency_code: "eur",
          is_default: true,
        },
        {
          currency_code: "usd",
        },
      ],
    },
  });

  await updateStoresWorkflow(container).run({
    input: {
      selector: { id: store.id },
      update: {
        default_sales_channel_id: defaultSalesChannel[0].id,
      },
    },
  });
  logger.info("Seeding region data...");
  const { result: regionResult } = await createRegionsWorkflow(container).run({
    input: {
      regions: [
        {
          name: "Europe",
          currency_code: "eur",
          countries,
          payment_providers: ["pp_system_default"],
        },
      ],
    },
  });
  const region = regionResult[0];
  logger.info("Finished seeding regions.");

  logger.info("Seeding tax regions...");
  await createTaxRegionsWorkflow(container).run({
    input: countries.map((country_code) => ({
      country_code,
      provider_id: "tp_system",
    })),
  });
  logger.info("Finished seeding tax regions.");

  logger.info("Seeding stock location data...");
  const { result: stockLocationResult } = await createStockLocationsWorkflow(
    container,
  ).run({
    input: {
      locations: [
        {
          name: "European Warehouse",
          address: {
            city: "Copenhagen",
            country_code: "DK",
            address_1: "",
          },
        },
      ],
    },
  });
  const stockLocation = stockLocationResult[0];

  await updateStoresWorkflow(container).run({
    input: {
      selector: { id: store.id },
      update: {
        default_location_id: stockLocation.id,
      },
    },
  });

  await link.create({
    [Modules.STOCK_LOCATION]: {
      stock_location_id: stockLocation.id,
    },
    [Modules.FULFILLMENT]: {
      fulfillment_provider_id: "manual_manual",
    },
  });

  logger.info("Seeding fulfillment data...");
  const shippingProfiles = await fulfillmentModuleService.listShippingProfiles({
    type: "default",
  });
  let shippingProfile = shippingProfiles.length ? shippingProfiles[0] : null;

  if (!shippingProfile) {
    const { result: shippingProfileResult } =
      await createShippingProfilesWorkflow(container).run({
        input: {
          data: [
            {
              name: "Default Shipping Profile",
              type: "default",
            },
          ],
        },
      });
    shippingProfile = shippingProfileResult[0];
  }

  const fulfillmentSet = await fulfillmentModuleService.createFulfillmentSets({
    name: "European Warehouse delivery",
    type: "shipping",
    service_zones: [
      {
        name: "Europe",
        geo_zones: [
          {
            country_code: "gb",
            type: "country",
          },
          {
            country_code: "de",
            type: "country",
          },
          {
            country_code: "dk",
            type: "country",
          },
          {
            country_code: "se",
            type: "country",
          },
          {
            country_code: "fr",
            type: "country",
          },
          {
            country_code: "es",
            type: "country",
          },
          {
            country_code: "it",
            type: "country",
          },
        ],
      },
    ],
  });

  await link.create({
    [Modules.STOCK_LOCATION]: {
      stock_location_id: stockLocation.id,
    },
    [Modules.FULFILLMENT]: {
      fulfillment_set_id: fulfillmentSet.id,
    },
  });

  await createShippingOptionsWorkflow(container).run({
    input: [
      {
        name: "Standard Shipping",
        price_type: "flat",
        provider_id: "manual_manual",
        service_zone_id: fulfillmentSet.service_zones[0].id,
        shipping_profile_id: shippingProfile.id,
        type: {
          label: "Standard",
          description: "Ship in 2-3 days.",
          code: "standard",
        },
        prices: [
          {
            currency_code: "usd",
            amount: 10,
          },
          {
            currency_code: "eur",
            amount: 10,
          },
          {
            region_id: region.id,
            amount: 10,
          },
        ],
        rules: [
          {
            attribute: "enabled_in_store",
            value: "true",
            operator: "eq",
          },
          {
            attribute: "is_return",
            value: "false",
            operator: "eq",
          },
        ],
      },
      {
        name: "Express Shipping",
        price_type: "flat",
        provider_id: "manual_manual",
        service_zone_id: fulfillmentSet.service_zones[0].id,
        shipping_profile_id: shippingProfile.id,
        type: {
          label: "Express",
          description: "Ship in 24 hours.",
          code: "express",
        },
        prices: [
          {
            currency_code: "usd",
            amount: 10,
          },
          {
            currency_code: "eur",
            amount: 10,
          },
          {
            region_id: region.id,
            amount: 10,
          },
        ],
        rules: [
          {
            attribute: "enabled_in_store",
            value: "true",
            operator: "eq",
          },
          {
            attribute: "is_return",
            value: "false",
            operator: "eq",
          },
        ],
      },
    ],
  });
  logger.info("Finished seeding fulfillment data.");

  await linkSalesChannelsToStockLocationWorkflow(container).run({
    input: {
      id: stockLocation.id,
      add: [defaultSalesChannel[0].id],
    },
  });
  logger.info("Finished seeding stock location data.");

  logger.info("Seeding publishable API key data...");
  let publishableApiKey: ApiKey | null = null;
  const { data } = await query.graph({
    entity: "api_key",
    fields: ["id"],
    filters: {
      type: "publishable",
    },
  });

  publishableApiKey = data?.[0];

  if (!publishableApiKey) {
    const {
      result: [publishableApiKeyResult],
    } = await createApiKeysWorkflow(container).run({
      input: {
        api_keys: [
          {
            title: "Webshop",
            type: "publishable",
            created_by: "",
          },
        ],
      },
    });

    publishableApiKey = publishableApiKeyResult as ApiKey;
  }

  await linkSalesChannelsToApiKeyWorkflow(container).run({
    input: {
      id: publishableApiKey.id,
      add: [defaultSalesChannel[0].id],
    },
  });
  logger.info("Finished seeding publishable API key data.");

  logger.info("Seeding product data...");

  const { result: categoryResult } = await createProductCategoriesWorkflow(
    container,
  ).run({
    input: {
      product_categories: [
        { name: "Digestive Health", is_active: true },
        { name: "Immunity & Wellness", is_active: true },
        { name: "Skin & Hair Care", is_active: true },
        { name: "Stress & Sleep", is_active: true },
        { name: "Pain Relief", is_active: true },
        { name: "Women's Health", is_active: true },
        { name: "General Health", is_active: true },
      ],
    },
  });

  const { result: collectionResult } = await createCollectionsWorkflow(
    container,
  ).run({
    input: {
      collections: [
        { title: "Best Sellers", handle: "best-sellers" },
        { title: "New Arrivals", handle: "new-arrivals" },
        { title: "Ayurvedic Classics", handle: "ayurvedic-classics" },
        { title: "Herbal Supplements", handle: "herbal-supplements" },
      ],
    },
  });

  const ayurvedicProducts = [
    {
      title: "Organic Ashwagandha Powder",
      category: "Stress & Sleep",
      collection: "Best Sellers",
      description: "Premium Ashwagandha powder for stress relief and vitality.",
    },
    {
      title: "Triphala Tablets",
      category: "Digestive Health",
      collection: "Best Sellers",
      description: "Natural digestive support and detox.",
    },
    {
      title: "Chyawanprash Special",
      category: "Immunity & Wellness",
      collection: "Best Sellers",
      description: "Traditional immunity booster with over 40 herbs.",
    },
    {
      title: "Brahmi Capsules",
      category: "Stress & Sleep",
      collection: "Ayurvedic Classics",
      description: "Enhances memory and cognitive function.",
    },
    {
      title: "Shatavari Powder",
      category: "Women's Health",
      collection: "Ayurvedic Classics",
      description: "Natural hormone balance for women.",
    },
    {
      title: "Turmeric (Curcumin) Capsules",
      category: "Immunity & Wellness",
      collection: "Best Sellers",
      description: "Anti-inflammatory and antioxidants support.",
    },
    {
      title: "Neem Purifying Tablets",
      category: "Skin & Hair Care",
      collection: "Best Sellers",
      description: "Blood purifier and skin salud support.",
    },
    {
      title: "Amla Juice",
      category: "Immunity & Wellness",
      collection: "New Arrivals",
      description: "Rich in Vitamin C and antioxidant properties.",
    },
    {
      title: "Aloe Vera Gel (Pure)",
      category: "Skin & Hair Care",
      collection: "Best Sellers",
      description: "Soothing gel for skin and hair hydration.",
    },
    {
      title: "Kumkumadi Face Oil",
      category: "Skin & Hair Care",
      collection: "Best Sellers",
      description: "Ancient beauty oil for glowing skin.",
    },
    {
      title: "Bhringraj Hair Oil",
      category: "Skin & Hair Care",
      collection: "Ayurvedic Classics",
      description: "Rejuvenates hair and prevents hair loss.",
    },
    {
      title: "Dashmularishta",
      category: "Women's Health",
      collection: "Ayurvedic Classics",
      description: "Post-delivery tonic and general health for women.",
    },
    {
      title: "Abhayarishta",
      category: "Digestive Health",
      collection: "Ayurvedic Classics",
      description: "Effective for constipation and hemorrhoids.",
    },
    {
      title: "Arjunarishta",
      category: "General Health",
      collection: "Ayurvedic Classics",
      description: "Cardiac tonic for heart health.",
    },
    {
      title: "Lohasava",
      category: "General Health",
      collection: "Ayurvedic Classics",
      description: "Rich in iron, helps with anemia.",
    },
    {
      title: "Chandanasava",
      category: "General Health",
      collection: "Ayurvedic Classics",
      description: "Cooling tonic for urinary health.",
    },
    {
      title: "Giloy Tablets",
      category: "Immunity & Wellness",
      collection: "Best Sellers",
      description: "Effective for fever and immunity support.",
    },
    {
      title: "Tulsi Drops",
      category: "Immunity & Wellness",
      collection: "Best Sellers",
      description: "Concentrated Tulsi for respiratory health.",
    },
    {
      title: "Mulethi Powder",
      category: "General Health",
      collection: "Herbal Supplements",
      description: "Supports throat health and digestion.",
    },
    {
      title: "Kaunch Beej Powder",
      category: "General Health",
      collection: "Herbal Supplements",
      description: "Supports vitality and nervous system.",
    },
    {
      title: "Safed Musli Capsules",
      category: "General Health",
      collection: "Herbal Supplements",
      description: "Natural vitality and vigor booster.",
    },
    {
      title: "Shilajit Resin",
      category: "General Health",
      collection: "Best Sellers",
      description: "Pure Himalayan Shilajit for energy and stamina.",
    },
    {
      title: "Guggul Tablets",
      category: "Pain Relief",
      collection: "Ayurvedic Classics",
      description: "Supports joint health and weight management.",
    },
    {
      title: "Kanchanar Guggulu",
      category: "Pain Relief",
      collection: "Ayurvedic Classics",
      description: "Supports thyroid and lymphatic health.",
    },
    {
      title: "Yograj Guggulu",
      category: "Pain Relief",
      collection: "Ayurvedic Classics",
      description: "Traditional formula for joint and muscle health.",
    },
    {
      title: "Punarnava Capsules",
      category: "General Health",
      collection: "Herbal Supplements",
      description: "Supports kidney and urinary health.",
    },
    {
      title: "Varunadi Vati",
      category: "General Health",
      collection: "Herbal Supplements",
      description: "Effective for kidney stones and urinary issues.",
    },
    {
      title: "Liv-52 Inspired Syrup",
      category: "Digestive Health",
      collection: "Best Sellers",
      description: "Comprehensive liver protection and support.",
    },
    {
      title: "Hingwashtak Churna",
      category: "Digestive Health",
      collection: "Ayurvedic Classics",
      description: "Classic digestive aid for gas and bloating.",
    },
    {
      title: "Avipattikar Churna",
      category: "Digestive Health",
      collection: "Ayurvedic Classics",
      description: "Helpful for acidity and indigestion.",
    },
    {
      title: "Sitopaladi Churna",
      category: "General Health",
      collection: "Ayurvedic Classics",
      description: "Support for cough, cold, and respiratory health.",
    },
    {
      title: "Trikatu Powder",
      category: "Digestive Health",
      collection: "Herbal Supplements",
      description: "Improves metabolism and digestion.",
    },
    {
      title: "Karela Jamun Juice",
      category: "General Health",
      collection: "Best Sellers",
      description: "Natural support for blood sugar management.",
    },
    {
      title: "Wheatgrass Powder",
      category: "Immunity & Wellness",
      collection: "Herbal Supplements",
      description: "Superfood for detox and immunity.",
    },
    {
      title: "Moringa Tablets",
      category: "Immunity & Wellness",
      collection: "New Arrivals",
      description: "Nutrient-dense superfood supplements.",
    },
    {
      title: "Spirulina Capsules",
      category: "Immunity & Wellness",
      collection: "New Arrivals",
      description: "Rich in protein and multivitamins.",
    },
    {
      title: "Jatamansi Oil",
      category: "Stress & Sleep",
      collection: "Ayurvedic Classics",
      description: "Promotes sleep and reduces anxiety.",
    },
    {
      title: "Shankhpushpi Syrup",
      category: "Stress & Sleep",
      collection: "Best Sellers",
      description: "Brain tonic for better focus and memory.",
    },
    {
      title: "Manjistha Tablets",
      category: "Skin & Hair Care",
      collection: "Herbal Supplements",
      description: "Supports blood purification and skin health.",
    },
    {
      title: "Haridra Khanda",
      category: "General Health",
      collection: "Ayurvedic Classics",
      description: "Effective for skin allergies and hives.",
    },
    {
      title: "Khadiradi Vati",
      category: "General Health",
      collection: "Ayurvedic Classics",
      description: "Support for mouth ulcers and throat issues.",
    },
    {
      title: "Ayurvedic Neem & Tulsi Soap",
      category: "Skin & Hair Care",
      collection: "New Arrivals",
      description: "Handmade soap with neem and tulsi extracts.",
    },
    {
      title: "Sandalwood Face Pack",
      category: "Skin & Hair Care",
      collection: "New Arrivals",
      description: "Nourishes and brightens the skin naturally.",
    },
    {
      title: "Rose Water (Ayurvedic Distilled)",
      category: "Skin & Hair Care",
      collection: "New Arrivals",
      description: "Natural toner and skin refresher.",
    },
    {
      title: "Nasya Oil",
      category: "General Health",
      collection: "Ayurvedic Classics",
      description: "Supports sinus health and mental clarity.",
    },
    {
      title: "Anu Taila",
      category: "General Health",
      collection: "Ayurvedic Classics",
      description: "Traditional nasal drops for various head conditions.",
    },
    {
      title: "Gandhak Rasayan",
      category: "General Health",
      collection: "Ayurvedic Classics",
      description: "Supports skin health and blood purification.",
    },
    {
      title: "Maharasnadi Kwath",
      category: "Pain Relief",
      collection: "Ayurvedic Classics",
      description: "Excellent support for chronic joint pain.",
    },
    {
      title: "Chandraprabha Vati",
      category: "General Health",
      collection: "Ayurvedic Classics",
      description: "Supports urinary tract and reproductive system health.",
    },
    {
      title: "Pushyanug Churna",
      category: "Women's Health",
      collection: "Ayurvedic Classics",
      description: "Support for menstrual regularity and health.",
    },
  ];

  const ayurvedicProductsData = ayurvedicProducts.map((p, index) => ({
    title: p.title,
    handle: p.title
      .toLowerCase()
      .replace(/ /g, "-")
      .replace(/[^\w-]/g, ""),
    description: p.description,
    category_ids: [categoryResult.find((cat) => cat.name === p.category)!.id],
    collection_id: collectionResult.find((col) => col.title === p.collection)
      ?.id,
    status: ProductStatus.PUBLISHED,
    shipping_profile_id: shippingProfile.id,
    weight: 200,
    images: [
      {
        url: `https://placehold.co/600x400?text=${encodeURIComponent(p.title)}`,
      },
    ],
    options: [{ title: "Format", values: ["Standard"] }],
    variants: [
      {
        title: "Standard",
        sku: `AYUR-${index + 1}`,
        options: { Format: "Standard" },
        prices: [
          { amount: 15 + (index % 10), currency_code: "eur" },
          { amount: 18 + (index % 10), currency_code: "usd" },
        ],
      },
    ],
    sales_channels: [{ id: defaultSalesChannel[0].id }],
  }));

  await createProductsWorkflow(container).run({
    input: {
      products: ayurvedicProductsData,
    },
  });

  logger.info("Finished seeding product data.");

  logger.info("Seeding inventory levels.");

  const { data: inventoryItems } = await query.graph({
    entity: "inventory_item",
    fields: ["id"],
  });

  const inventoryLevels: CreateInventoryLevelInput[] = [];
  for (const inventoryItem of inventoryItems) {
    const inventoryLevel = {
      location_id: stockLocation.id,
      stocked_quantity: 1000000,
      inventory_item_id: inventoryItem.id,
    };
    inventoryLevels.push(inventoryLevel);
  }

  await createInventoryLevelsWorkflow(container).run({
    input: {
      inventory_levels: inventoryLevels,
    },
  });

  logger.info("Finished seeding inventory levels data.");
}
