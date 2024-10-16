import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import AudioPlayer from "@/app/components/AudioPlayer";
import prisma from "@/lib/prisma";
import { supabase } from "@/app/supabase";

export async function getServerSideProps(context: { params: { id: string } }) {
  const { id } = context.params;
  const audioPost = await prisma.audioPost.findUnique({
    where: { shortId: id },
    select: { audioUrl: true },
  });

  if (!audioPost) {
    return { notFound: true };
  }

  return { props: { audioUrl: audioPost.audioUrl } };
}

export default function AudioPost() {
  const router = useRouter();
  const { id } = router.query;
  const [audioUrlState, setAudioUrlState] = useState<string | null>(null);

  useEffect(() => {
    async function fetchAudioUrl() {
      if (typeof id === "string") {
        const { data } = await supabase
          .from("audio_links")
          .select("audio_url")
          .eq("short_id", id)
          .single();

        if (data) {
          setAudioUrlState(data.audio_url);
        }
      }
    }

    fetchAudioUrl();
  }, [id]);

  useEffect(() => {
    if (typeof window !== "undefined" && audioUrlState) {
      const audioPlayerElement = document.createElement("div");
      audioPlayerElement.id = "custom-audio-player";
      document.body.appendChild(audioPlayerElement);

      const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          if (mutation.type === "childList") {
            const tweetElement = document.querySelector(
              '[data-testid="tweet"]'
            );
            if (tweetElement) {
              tweetElement.appendChild(audioPlayerElement);
              observer.disconnect();
            }
          }
        });
      });

      observer.observe(document.body, { childList: true, subtree: true });

      return () => {
        observer.disconnect();
        audioPlayerElement.remove();
      };
    }
  }, [audioUrlState]);

  if (!audioUrlState) {
    return null;
  }

  return <AudioPlayer src={audioUrlState} />;
}
