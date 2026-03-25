import { NextRequest, NextResponse } from "next/server";
import speech from "@google-cloud/speech";

const speechClient = new speech.SpeechClient();

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const audioFile = formData.get("audio") as Blob | null;

    if (!audioFile) {
      return NextResponse.json({ error: "No audio file provided" }, { status: 400 });
    }

    const buffer = Buffer.from(await audioFile.arrayBuffer());

    const audio = {
      content: buffer.toString("base64"),
    };

    const config = {
      encoding: "WEBM_OPUS" as const,
      // Chrome typically records WEBM at 48000Hz.
      sampleRateHertz: 48000,
      languageCode: "en-US",
    };

    const request = {
      audio: audio,
      config: config,
    };

    const [response] = await speechClient.recognize(request);
    const transcription = response.results
      ?.map((result) => result.alternatives?.[0]?.transcript)
      .join("\\n");

    return NextResponse.json({ transcription: transcription || "" });
  } catch (error) {
    console.error("Transcription error:", error);
    const err = error as Error;
    return NextResponse.json({ error: err.message || "Failed to transcribe audio" }, { status: 500 });
  }
}
