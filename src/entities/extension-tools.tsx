import { ClosedCaptionOutlined, MenuBookOutlined, ContentCutOutlined, FolderOpenOutlined } from "@mui/icons-material";
import type { ReactNode } from "react";

type ExtensionTool = {
 id: string;
 label: string;
 description: string;
 poster: string;
 alt: string;
 video?: string;
 icon: ReactNode;
};

export const extensionTools: ExtensionTool[] = [
 {
  id: "captions", label: "Captions",
  video: "/videos/tools/captions.mp4",
  description: "Auto-generate subtitles and make every word easier to follow.",
  poster: "/images/tools/captions-first-frame.jpg", alt: "Captions tool demo",
  icon: <ClosedCaptionOutlined />,
 },
 {
  id: "chapters", label: "Chapters",
  video: "/videos/tools/chapters.mp4",
  description: "Split your video into chapters and give your story a clear structure.",
  poster: "/images/tools/chapters-first-frame.jpg", alt: "Chapters tool demo",
  icon: <MenuBookOutlined />,
 },
 {
  id: "silence-remover", label: "Silence Remover",
  video: "/videos/tools/silence-remover.mp4",
  description: "Cut pauses between words and keep your edit moving.",
  poster: "/images/tools/silence-remover-first-frame.jpg", alt: "Silence Remover tool demo",
  icon: <ContentCutOutlined />,
 },
 {
  id: "observer", label: "Observer",
  video: "/videos/tools/observer.mp4",
  description: "Keep your local folders within reach, right inside your workflow.",
  poster: "/images/tools/observer-first-frame.jpg", alt: "Observer tool demo",
  icon: <FolderOpenOutlined />,
 },
];
