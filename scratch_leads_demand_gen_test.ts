import { LeadsDemandGenService } from "../../../backend/src/services/googleAds/leads/LeadsDemandGenService";
import { GoogleAdsCampaignValidator } from "../../../backend/src/services/googleAds/shared/GoogleAdsCampaignValidator";

async function runLeadsDemandGenTests() {
  console.log("Starting Leads Demand Gen Unit & Validation Tests...\n");
  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string) {
    if (condition) {
      console.log(`PASS: ${testName}`);
      passed++;
    } else {
      console.error(`FAIL: ${testName}`);
      failed++;
    }
  }

  // 1. Fake customer ID rejection
  try {
    await LeadsDemandGenService.createCampaign("org-1", "0000000000", {
      isAiGuided: true,
      campaignName: "Test DG",
      finalUrl: "https://realbusiness.com",
      dailyBudget: 1000,
      businessName: "Biz",
      headlines: ["Headline 1"],
      descriptions: ["Description 1"],
      images: ["https://ik.imagekit.io/img1.png"],
      logos: ["https://ik.imagekit.io/logo.png"]
    });
    assert(false, "Should reject dummy customer ID 0000000000");
  } catch (err: any) {
    assert(err.message.includes("Invalid or dummy customer ID"), "Reject dummy customer ID 0000000000");
  }

  // 2. Missing customer ID
  try {
    await LeadsDemandGenService.createCampaign("org-1", "", {
      isAiGuided: true,
      campaignName: "Test DG",
      finalUrl: "https://realbusiness.com"
    });
    assert(false, "Should reject missing customer ID");
  } catch (err: any) {
    assert(err.message.includes("Customer ID is required"), "Reject missing customer ID");
  }

  // 3. Reject example.com in AI Guided
  try {
    await LeadsDemandGenService.createCampaign("org-1", "6587355041", {
      isAiGuided: true,
      campaignName: "Test DG",
      finalUrl: "https://example.com/leads",
      dailyBudget: 1000,
      businessName: "Biz",
      headlines: ["Headline 1"],
      descriptions: ["Description 1"]
    });
    assert(false, "Should reject example.com");
  } catch (err: any) {
    assert(err.message.includes("dummy or restricted domains"), "Reject example.com in AI Guided");
  }

  // 4. Reject localhost
  try {
    await LeadsDemandGenService.createCampaign("org-1", "6587355041", {
      isAiGuided: true,
      campaignName: "Test DG",
      finalUrl: "http://localhost:3000",
      dailyBudget: 1000,
      businessName: "Biz",
      headlines: ["Headline 1"],
      descriptions: ["Description 1"]
    });
    assert(false, "Should reject localhost");
  } catch (err: any) {
    assert(err.message.includes("dummy or restricted domains"), "Reject localhost in AI Guided");
  }

  // 5. Reject missing URL
  try {
    await LeadsDemandGenService.createCampaign("org-1", "6587355041", {
      isAiGuided: true,
      campaignName: "Test DG",
      finalUrl: "",
      dailyBudget: 1000,
      businessName: "Biz"
    });
    assert(false, "Should reject missing URL");
  } catch (err: any) {
    assert(err.message.includes("Final URL is required"), "Reject missing URL in AI Guided");
  }

  // 6. Reject missing budget
  try {
    await LeadsDemandGenService.createCampaign("org-1", "6587355041", {
      isAiGuided: true,
      campaignName: "Test DG",
      finalUrl: "https://realbusiness.com",
      dailyBudget: "",
      businessName: "Biz",
      headlines: ["Headline 1"],
      descriptions: ["Description 1"]
    });
    assert(false, "Should reject missing budget");
  } catch (err: any) {
    assert(err.message.includes("Campaign budget is required"), "Reject missing budget in AI Guided");
  }

  // 7. Reject budget <= 0
  try {
    await LeadsDemandGenService.createCampaign("org-1", "6587355041", {
      isAiGuided: true,
      campaignName: "Test DG",
      finalUrl: "https://realbusiness.com",
      dailyBudget: 0,
      businessName: "Biz",
      headlines: ["Headline 1"],
      descriptions: ["Description 1"]
    });
    assert(false, "Should reject budget <= 0");
  } catch (err: any) {
    assert(err.message.includes("Campaign budget must be greater than 0"), "Reject budget <= 0");
  }

  // 8. Missing business name
  try {
    await LeadsDemandGenService.createCampaign("org-1", "6587355041", {
      isAiGuided: true,
      campaignName: "Test DG",
      finalUrl: "https://realbusiness.com",
      dailyBudget: 1000,
      businessName: "",
      headlines: ["Headline 1"],
      descriptions: ["Description 1"]
    });
    assert(false, "Should reject missing business name");
  } catch (err: any) {
    assert(err.message.includes("Business name is required"), "Reject missing business name");
  }

  // 9. Business name > 25 chars
  try {
    await LeadsDemandGenService.createCampaign("org-1", "6587355041", {
      isAiGuided: true,
      campaignName: "Test DG",
      finalUrl: "https://realbusiness.com",
      dailyBudget: 1000,
      businessName: "Super Long Business Name That Exceeds 25 Chars",
      headlines: ["Headline 1"],
      descriptions: ["Description 1"]
    });
    assert(false, "Should reject business name > 25 chars");
  } catch (err: any) {
    assert(err.message.includes("exceeds the Google Ads limit of 25 characters"), "Reject business name > 25 chars");
  }

  // 10. Missing headlines
  try {
    await LeadsDemandGenService.createCampaign("org-1", "6587355041", {
      isAiGuided: true,
      campaignName: "Test DG",
      finalUrl: "https://realbusiness.com",
      dailyBudget: 1000,
      businessName: "Biz",
      headlines: [],
      descriptions: ["Description 1"]
    });
    assert(false, "Should reject missing headlines");
  } catch (err: any) {
    assert(err.message.includes("At least 1 headline is required"), "Reject missing headlines");
  }

  // 11. Headline > 40 chars
  try {
    await LeadsDemandGenService.createCampaign("org-1", "6587355041", {
      isAiGuided: true,
      campaignName: "Test DG",
      finalUrl: "https://realbusiness.com",
      dailyBudget: 1000,
      businessName: "Biz",
      headlines: ["This headline is way too long and definitely exceeds 40 characters limit"],
      descriptions: ["Description 1"]
    });
    assert(false, "Should reject headline > 40 chars");
  } catch (err: any) {
    assert(err.message.includes("exceeds the Google Ads limit of 40 characters"), "Reject headline > 40 chars");
  }

  // 12. Missing descriptions
  try {
    await LeadsDemandGenService.createCampaign("org-1", "6587355041", {
      isAiGuided: true,
      campaignName: "Test DG",
      finalUrl: "https://realbusiness.com",
      dailyBudget: 1000,
      businessName: "Biz",
      headlines: ["Headline 1"],
      descriptions: []
    });
    assert(false, "Should reject missing descriptions");
  } catch (err: any) {
    assert(err.message.includes("At least 1 description is required"), "Reject missing descriptions");
  }

  // 13. Description > 90 chars
  try {
    await LeadsDemandGenService.createCampaign("org-1", "6587355041", {
      isAiGuided: true,
      campaignName: "Test DG",
      finalUrl: "https://realbusiness.com",
      dailyBudget: 1000,
      businessName: "Biz",
      headlines: ["Headline 1"],
      descriptions: ["This is an extremely long description that has been intentionally crafted so that it goes way past ninety characters limit in Google Ads API."]
    });
    assert(false, "Should reject description > 90 chars");
  } catch (err: any) {
    assert(err.message.includes("exceeds the Google Ads limit of 90 characters"), "Reject description > 90 chars");
  }

  // 14. Single Image: missing marketing image
  try {
    await LeadsDemandGenService.createCampaign("org-1", "6587355041", {
      isAiGuided: true,
      adFormat: "SINGLE_IMAGE",
      campaignName: "Test DG",
      finalUrl: "https://realbusiness.com",
      dailyBudget: 1000,
      businessName: "Biz",
      headlines: ["Headline 1"],
      descriptions: ["Description 1"],
      images: [],
      logos: ["https://ik.imagekit.io/logo.png"]
    });
    assert(false, "Should reject Single Image missing image");
  } catch (err: any) {
    assert(err.message.includes("marketing image is required"), "Reject Single Image missing marketing image");
  }

  // 15. Single Image: missing logo
  try {
    await LeadsDemandGenService.createCampaign("org-1", "6587355041", {
      isAiGuided: true,
      adFormat: "SINGLE_IMAGE",
      campaignName: "Test DG",
      finalUrl: "https://realbusiness.com",
      dailyBudget: 1000,
      businessName: "Biz",
      headlines: ["Headline 1"],
      descriptions: ["Description 1"],
      images: ["https://ik.imagekit.io/img.png"],
      logos: []
    });
    assert(false, "Should reject Single Image missing logo");
  } catch (err: any) {
    assert(err.message.includes("logo is required"), "Reject Single Image missing logo");
  }

  // 16. Video: missing video asset
  try {
    await LeadsDemandGenService.createCampaign("org-1", "6587355041", {
      isAiGuided: true,
      adFormat: "VIDEO",
      campaignName: "Test DG",
      finalUrl: "https://realbusiness.com",
      dailyBudget: 1000,
      businessName: "Biz",
      headlines: ["Headline 1"],
      descriptions: ["Description 1"],
      videos: [],
      logos: ["https://ik.imagekit.io/logo.png"]
    });
    assert(false, "Should reject Video missing video");
  } catch (err: any) {
    assert(err.message.includes("video is required"), "Reject Video missing video asset");
  }

  // 17. Video: missing logo
  try {
    await LeadsDemandGenService.createCampaign("org-1", "6587355041", {
      isAiGuided: true,
      adFormat: "VIDEO",
      campaignName: "Test DG",
      finalUrl: "https://realbusiness.com",
      dailyBudget: 1000,
      businessName: "Biz",
      headlines: ["Headline 1"],
      descriptions: ["Description 1"],
      videos: ["customers/6587355041/assets/309915762708"],
      logos: []
    });
    assert(false, "Should reject Video missing logo");
  } catch (err: any) {
    assert(err.message.includes("logo is required"), "Reject Video missing logo");
  }

  // 18. Carousel: fewer than 2 cards
  try {
    await LeadsDemandGenService.createCampaign("org-1", "6587355041", {
      isAiGuided: true,
      adFormat: "CAROUSEL",
      campaignName: "Test DG",
      finalUrl: "https://realbusiness.com",
      dailyBudget: 1000,
      businessName: "Biz",
      headlines: ["Headline 1"],
      descriptions: ["Description 1"],
      carouselCards: [{ image: "https://ik.imagekit.io/card1.png", headline: "Card 1" }],
      logos: ["https://ik.imagekit.io/logo.png"]
    });
    assert(false, "Should reject Carousel with < 2 cards");
  } catch (err: any) {
    assert(err.message.includes("At least 2 carousel cards"), "Reject Carousel with fewer than 2 cards");
  }

  // 19. Start date in past
  try {
    await LeadsDemandGenService.createCampaign("org-1", "6587355041", {
      isAiGuided: true,
      campaignName: "Test DG",
      finalUrl: "https://realbusiness.com",
      dailyBudget: 1000,
      businessName: "Biz",
      headlines: ["Headline 1"],
      descriptions: ["Description 1"],
      images: ["https://ik.imagekit.io/img.png"],
      logos: ["https://ik.imagekit.io/logo.png"],
      startDate: "2020-01-01"
    });
    assert(false, "Should reject past start date");
  } catch (err: any) {
    assert(err.message.includes("Start date cannot be in the past"), "Reject start date in past");
  }

  // 20. End date <= start date
  try {
    await LeadsDemandGenService.createCampaign("org-1", "6587355041", {
      isAiGuided: true,
      campaignName: "Test DG",
      finalUrl: "https://realbusiness.com",
      dailyBudget: 1000,
      businessName: "Biz",
      headlines: ["Headline 1"],
      descriptions: ["Description 1"],
      images: ["https://ik.imagekit.io/img.png"],
      logos: ["https://ik.imagekit.io/logo.png"],
      startDate: "2026-10-10",
      endDate: "2026-10-09"
    });
    assert(false, "Should reject end date <= start date");
  } catch (err: any) {
    assert(err.message.includes("must be after start date"), "Reject end date <= start date");
  }

  // 21. Reject YouTube engagements bidding
  try {
    await LeadsDemandGenService.createCampaign("org-1", "6587355041", {
      isAiGuided: true,
      campaignName: "Test DG",
      finalUrl: "https://realbusiness.com",
      dailyBudget: 1000,
      businessName: "Biz",
      headlines: ["Headline 1"],
      descriptions: ["Description 1"],
      images: ["https://ik.imagekit.io/img.png"],
      logos: ["https://ik.imagekit.io/logo.png"],
      biddingStrategy: "YOUTUBE_ENGAGEMENTS"
    });
    assert(false, "Should reject YouTube engagements bidding");
  } catch (err: any) {
    assert(err.message.includes("YouTube engagements bidding is not supported"), "Reject YouTube engagements bidding");
  }

  // 22. Target CPA invalid/negative
  try {
    await LeadsDemandGenService.createCampaign("org-1", "6587355041", {
      isAiGuided: true,
      campaignName: "Test DG",
      finalUrl: "https://realbusiness.com",
      dailyBudget: 1000,
      businessName: "Biz",
      headlines: ["Headline 1"],
      descriptions: ["Description 1"],
      images: ["https://ik.imagekit.io/img.png"],
      logos: ["https://ik.imagekit.io/logo.png"],
      biddingStrategy: "TARGET_CPA",
      targetCpa: -10
    });
    assert(false, "Should reject invalid target CPA");
  } catch (err: any) {
    assert(err.message.includes("positive Target CPA amount is required"), "Reject invalid target CPA");
  }

  // 23. Target ROAS invalid/negative
  try {
    await LeadsDemandGenService.createCampaign("org-1", "6587355041", {
      isAiGuided: true,
      campaignName: "Test DG",
      finalUrl: "https://realbusiness.com",
      dailyBudget: 1000,
      businessName: "Biz",
      headlines: ["Headline 1"],
      descriptions: ["Description 1"],
      images: ["https://ik.imagekit.io/img.png"],
      logos: ["https://ik.imagekit.io/logo.png"],
      biddingStrategy: "TARGET_ROAS",
      targetRoas: 0
    });
    assert(false, "Should reject invalid target ROAS");
  } catch (err: any) {
    assert(err.message.includes("positive Target ROAS is required"), "Reject invalid target ROAS");
  }

  // 24. Language resolver: English -> 1000
  const langEn = LeadsDemandGenService.resolveLanguageConstant("English", true);
  assert(langEn === "1000", "Resolve English to language constant 1000");

  // 25. Language resolver: Unknown throws in AI Guided
  try {
    LeadsDemandGenService.resolveLanguageConstant("AtlantianLanguage", true);
    assert(false, "Should reject unknown language in AI Guided");
  } catch (err: any) {
    assert(err.message.includes("could not be resolved"), "Reject unknown language in AI Guided");
  }

  // 26. Location resolver: India -> 2356
  const locIndia = LeadsDemandGenService.GEO_TARGET_CONSTANT_MAP["india"];
  assert(locIndia === "2356", "Resolve India to geo target 2356");

  // 27. GoogleAdsCampaignValidator: Valid Single Image state passes
  const validSingleState: any = {
    campaignType: "DEMAND_GEN",
    businessName: "Valid Business",
    website: "https://validbusiness.com",
    dailyBudget: "500",
    headlines: ["Quality Service"],
    descriptions: ["Get in touch with us today for more details."],
    adFormat: "SINGLE_IMAGE",
    images: ["https://ik.imagekit.io/img.png"],
    logos: ["https://ik.imagekit.io/logo.png"]
  };
  const valSingle = GoogleAdsCampaignValidator.validate(validSingleState);
  assert(valSingle.isValid, "GoogleAdsCampaignValidator passes valid Single Image Demand Gen state");

  // 28. GoogleAdsCampaignValidator: Valid Video state passes
  const validVideoState: any = {
    campaignType: "DEMAND_GEN",
    businessName: "Valid Business",
    website: "https://validbusiness.com",
    dailyBudget: "500",
    headlines: ["Quality Service"],
    descriptions: ["Get in touch with us today for more details."],
    adFormat: "VIDEO",
    videos: ["customers/6587355041/assets/309915762708"],
    logos: ["https://ik.imagekit.io/logo.png"]
  };
  const valVideo = GoogleAdsCampaignValidator.validate(validVideoState);
  assert(valVideo.isValid, "GoogleAdsCampaignValidator passes valid Video Demand Gen state");

  // 29. GoogleAdsCampaignValidator: Valid Carousel state passes
  const validCarouselState: any = {
    campaignType: "DEMAND_GEN",
    businessName: "Valid Business",
    website: "https://validbusiness.com",
    dailyBudget: "500",
    headlines: ["Quality Service"],
    descriptions: ["Get in touch with us today for more details."],
    adFormat: "CAROUSEL",
    carouselCards: [
      { image: "https://ik.imagekit.io/card1.png", headline: "Card 1" },
      { image: "https://ik.imagekit.io/card2.png", headline: "Card 2" }
    ],
    logos: ["https://ik.imagekit.io/logo.png"]
  };
  const valCarousel = GoogleAdsCampaignValidator.validate(validCarouselState);
  assert(valCarousel.isValid, "GoogleAdsCampaignValidator passes valid Carousel Demand Gen state");

  // 30. GoogleAdsCampaignValidator: Invalid Carousel (1 card) fails
  const invalidCarouselState: any = {
    ...validCarouselState,
    carouselCards: [{ image: "https://ik.imagekit.io/card1.png", headline: "Card 1" }]
  };
  const valInvCarousel = GoogleAdsCampaignValidator.validate(invalidCarouselState);
  assert(!valInvCarousel.isValid, "GoogleAdsCampaignValidator fails Carousel Demand Gen with 1 card");

  console.log(`\nTests Completed: ${passed} passed, ${failed} failed.\n`);
  if (failed > 0) process.exit(1);
}

runLeadsDemandGenTests();
