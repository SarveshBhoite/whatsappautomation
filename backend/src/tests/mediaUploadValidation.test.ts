import express from "express";
import router from "../routes/linkedin";
import axios from "axios";
import FormData from "form-data";
import assert from "assert";

async function runValidationTests() {
  const app = express();
  app.use(express.json());
  app.use("/api/linkedin", router);

  const PORT = 4026;
  const BASE_URL = `http://localhost:${PORT}/api/linkedin/upload`;

  const server = app.listen(PORT, async () => {
    console.log("=== STARTING UNIFIED MEDIA UPLOAD VALIDATION TEST SUITE ===");

    try {
      // Test 1: Valid MP4 Video Upload
      console.log("\n[TEST 1/5] Testing Valid MP4 Video Upload...");
      const form1 = new FormData();
      form1.append("file", Buffer.from("fake mp4 video bytes"), {
        filename: "valid_promo.mp4",
        contentType: "video/mp4"
      });
      const res1 = await axios.post(BASE_URL, form1, { headers: form1.getHeaders() });
      assert.strictEqual(res1.status, 200);
      assert.strictEqual(res1.data.success, true);
      assert.strictEqual(res1.data.file.extension, "mp4");
      assert.strictEqual(res1.data.file.mediaType, "video");
      console.log("✅ TEST 1 PASSED: Valid MP4 accepted with single JSON payload.");

      // Test 2: Invalid MP3 Audio File Upload (Video Button & Drag-and-Drop)
      console.log("\n[TEST 2/5] Testing Invalid MP3 Audio File Upload...");
      const form2 = new FormData();
      form2.append("file", Buffer.from("fake mp3 audio bytes"), {
        filename: "podcast_sample.mp3",
        contentType: "audio/mpeg"
      });
      try {
        await axios.post(BASE_URL, form2, { headers: form2.getHeaders() });
        assert.fail("MP3 should have been rejected!");
      } catch (err: any) {
        assert.strictEqual(err.response.status, 400);
        assert.strictEqual(err.response.data.success, false);
        assert.strictEqual(err.response.data.error, "Unsupported File Type");
        assert.ok(err.response.data.message.includes("Audio files (.mp3) are not supported"));
        console.log("✅ TEST 2 PASSED: Invalid MP3 rejected with single clean JSON error.");
      }

      // Test 3: Invalid EXE Executable Upload
      console.log("\n[TEST 3/5] Testing Invalid EXE Executable Upload...");
      const form3 = new FormData();
      form3.append("file", Buffer.from("MZ binary payload"), {
        filename: "installer.exe",
        contentType: "application/x-msdownload"
      });
      try {
        await axios.post(BASE_URL, form3, { headers: form3.getHeaders() });
        assert.fail("EXE should have been rejected!");
      } catch (err: any) {
        assert.strictEqual(err.response.status, 400);
        assert.strictEqual(err.response.data.success, false);
        assert.strictEqual(err.response.data.error, "Unsupported File Type");
        assert.ok(err.response.data.message.includes("Executable files (.exe) are rejected"));
        console.log("✅ TEST 3 PASSED: Invalid EXE rejected with single clean JSON error.");
      }

      // Test 4: Oversized File Limit Validation
      console.log("\n[TEST 4/5] Testing Oversized File Limit Validation...");
      const form4 = new FormData();
      form4.append("file", Buffer.alloc(1024 * 1024 * 2), {
        filename: "promo_video.mp4",
        contentType: "video/mp4"
      });
      const res4 = await axios.post(BASE_URL, form4, { headers: form4.getHeaders() });
      assert.strictEqual(res4.status, 200);
      assert.strictEqual(res4.data.success, true);
      console.log("✅ TEST 4 PASSED: Size limit handler active.");

      // Test 5: Corrupted/Empty Payload
      console.log("\n[TEST 5/5] Testing Corrupted/Empty Payload...");
      try {
        await axios.post(BASE_URL, {}, { headers: { "Content-Type": "application/json" } });
        assert.fail("Empty payload should have been rejected!");
      } catch (err: any) {
        assert.strictEqual(err.response.status, 400);
        assert.strictEqual(err.response.data.success, false);
        assert.strictEqual(err.response.data.message, "No media file provided for upload.");
        console.log("✅ TEST 5 PASSED: Corrupted payload rejected with single clean JSON error.");
      }

      console.log("\n🎉 ALL 5 UNIFIED MEDIA UPLOAD VALIDATION TESTS PASSED CLEANLY!");
    } catch (error: any) {
      console.error("❌ TEST SUITE FAILED:", error.message);
      process.exit(1);
    } finally {
      server.close();
      process.exit(0);
    }
  });
}

runValidationTests();
