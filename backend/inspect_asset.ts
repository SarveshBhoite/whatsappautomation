import { GoogleAdsBaseService } from "./src/services/googleAds/shared/GoogleAdsBaseService";
import axios from "axios";

class InspectAsset extends GoogleAdsBaseService {
  public static async run() {
    const orgId = "81f4041e-1171-4472-8565-44ddc2b20bf1";
    const customerId = "6587355041";
    const { headers } = await this.getAdsHeaders(orgId, customerId);
    const res = await axios.post(`https://googleads.googleapis.com/v24/customers/${customerId}/googleAds:search`, {
      query: `SELECT asset.id, asset.name, asset.type, asset.image_asset.file_size, asset.image_asset.full_size.width_pixels, asset.image_asset.full_size.height_pixels, asset.image_asset.mime_type FROM asset WHERE asset.id = 418790381354`
    }, { headers });
    console.log(JSON.stringify(res.data, null, 2));
  }
}

InspectAsset.run();
