const { PrismaClient } = require('@prisma/client');
const axios = require('axios');
const prisma = new PrismaClient();

async function testCreativeCreation() {
  const config = await prisma.metaAdConfig.findFirst({ where: { organizationId: 'demo-org-123' } });
  const accountId = 'act_1454270479625110';
  const pageId = '1062234726963242';

  console.log('Testing Creative Formats on Page:', pageId);

  // FORMAT 1: Direct Click-to-WhatsApp (WHATSAPP_MESSAGE with app_destination WHATSAPP)
  try {
    const res1 = await axios.post(`https://graph.facebook.com/v26.0/${accountId}/adcreatives`, {
      name: 'Test Creative 1 - WhatsApp Message',
      object_story_spec: {
        page_id: pageId,
        link_data: {
          message: 'Contact us on WhatsApp for special discounts and offers!',
          name: 'Book Your Service Today',
          link: 'https://api.whatsapp.com/send',
          call_to_action: {
            type: 'WHATSAPP_MESSAGE',
            value: {
              link: 'https://api.whatsapp.com/send',
              app_destination: 'WHATSAPP'
            }
          }
        }
      },
      access_token: config.accessToken
    });
    console.log('SUCCESS Format 1 (Direct Click-to-WhatsApp):', res1.data.id);
  } catch (e) {
    console.log('FAILED Format 1:', e.response?.data?.error || e.message);
  }

  // FORMAT 2: Direct Click-to-WhatsApp with phone number in link
  try {
    const res2 = await axios.post(`https://graph.facebook.com/v26.0/${accountId}/adcreatives`, {
      name: 'Test Creative 2 - WhatsApp Message with Phone',
      object_story_spec: {
        page_id: pageId,
        link_data: {
          message: 'Contact us on WhatsApp for special discounts and offers!',
          name: 'Book Your Service Today',
          link: 'https://wa.me/919999999999',
          call_to_action: {
            type: 'WHATSAPP_MESSAGE',
            value: {
              link: 'https://wa.me/919999999999',
              app_destination: 'WHATSAPP'
            }
          }
        }
      },
      access_token: config.accessToken
    });
    console.log('SUCCESS Format 2 (WhatsApp with wa.me):', res2.data.id);
  } catch (e) {
    console.log('FAILED Format 2:', e.response?.data?.error || e.message);
  }

  // FORMAT 3: Standard Link Ad with WhatsApp destination (LEARN_MORE -> WhatsApp)
  try {
    const res3 = await axios.post(`https://graph.facebook.com/v26.0/${accountId}/adcreatives`, {
      name: 'Test Creative 3 - Link to WhatsApp',
      object_story_spec: {
        page_id: pageId,
        link_data: {
          message: 'Contact us on WhatsApp for special discounts and offers!',
          name: 'Book Your Service Today',
          link: 'https://wa.me/919999999999',
          call_to_action: {
            type: 'LEARN_MORE',
            value: {
              link: 'https://wa.me/919999999999'
            }
          }
        }
      },
      access_token: config.accessToken
    });
    console.log('SUCCESS Format 3 (Standard Link to WhatsApp):', res3.data.id);
  } catch (e) {
    console.log('FAILED Format 3:', e.response?.data?.error || e.message);
  }

  // FORMAT 4: Standard Website Ad (LEARN_MORE -> Website)
  try {
    const res4 = await axios.post(`https://graph.facebook.com/v26.0/${accountId}/adcreatives`, {
      name: 'Test Creative 4 - Standard Website',
      object_story_spec: {
        page_id: pageId,
        link_data: {
          message: 'Visit our store for special discounts and offers!',
          name: 'Book Your Service Today',
          link: 'https://example.com',
          call_to_action: {
            type: 'LEARN_MORE',
            value: {
              link: 'https://example.com'
            }
          }
        }
      },
      access_token: config.accessToken
    });
    console.log('SUCCESS Format 4 (Standard Website):', res4.data.id);
  } catch (e) {
    console.log('FAILED Format 4:', e.response?.data?.error || e.message);
  }
}

testCreativeCreation().catch(console.error).finally(() => prisma.$disconnect());
