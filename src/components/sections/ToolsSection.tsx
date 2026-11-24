"use client";

import { useRef, useState, type KeyboardEvent } from "react";
import { Box, Button, Stack, Typography } from "@mui/material";
import Image from "next/image";
import { styles } from "@/entities/toggles";
import { extensionTools } from "@/entities/extension-tools";
import { Wrapper } from "../layout/Wrapper";

export default function ToolsSection() {
 const [active, setActive] = useState(0);
 const tabs = useRef<(HTMLButtonElement | null)[]>([]);
 const tool = extensionTools[active];

 function navigate(event: KeyboardEvent<HTMLButtonElement>, index: number) {
  let next: number;
  if (event.key === "ArrowDown" || event.key === "ArrowRight") next = (index + 1) % extensionTools.length;
  else if (event.key === "ArrowUp" || event.key === "ArrowLeft") next = (index - 1 + extensionTools.length) % extensionTools.length;
  else if (event.key === "Home") next = 0;
  else if (event.key === "End") next = extensionTools.length - 1;
  else return;
  event.preventDefault();
  setActive(next);
  tabs.current[next]?.focus();
 }

 return (
  <Box component="section" id="tools" aria-labelledby="tools-heading" sx={{
   ...styles.section, width: "100%", minWidth: 0,
   gridTemplateColumns: { xl: "minmax(0, 1.95fr) minmax(0, 1fr)", xs: "1fr" },
   alignItems: "center",
  }}>
   <Wrapper variant="animated" fullWidth sx={{ width: "100%", minWidth: 0 }}>
    <Box role="tabpanel" id={`tool-panel-${tool.id}`} aria-labelledby={`tool-tab-${tool.id}`} sx={{
     position: "relative", width: "100%", flexShrink: 0, aspectRatio: "16/9", overflow: "hidden", borderRadius: "8px", backgroundColor: "#141618",
    }}>
     {tool.video ? <Box component="video" key={tool.id} src={tool.video} poster={tool.poster} autoPlay muted loop playsInline width={1280} height={720} sx={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} /> :
      <Image key={tool.id} src={tool.poster} alt={tool.alt} fill sizes="(min-width: 1536px) 800px, (min-width: 768px) 90vw, 100vw" style={{ objectFit: "cover" }} />}
    </Box>
   </Wrapper>
   <Box sx={{ display: "flex", flexDirection: "column", width: "100%", minWidth: 0, order: { xs: -1, xl: 0 } }}>
    <Typography id="tools-heading" variant="h2" sx={{ ...styles.heading, whiteSpace: "normal", textAlign: { xs: "center", sm: "left" } }}>
     {"Less busywork.\nMore creating.".split("\n").map(line => <Box component="span" key={line} sx={{ display: "block" }}>{line}</Box>)}
    </Typography>
    <Typography sx={{ ...styles.subheading, whiteSpace: "normal", textAlign: { xs: "center", sm: "left" } }}>
     Meet Tools, your everyday editing essentials. Add captions, create chapters, remove pauses and access your local folders — all inside Odin Pro.
    </Typography>
    <Stack role="tablist" aria-label="Tools" aria-orientation="vertical" spacing={2} sx={styles.buttonStack}>
     {extensionTools.map((item, index) => <Button
      key={item.id} ref={element => { tabs.current[index] = element; }}
      id={`tool-tab-${item.id}`} role="tab" aria-selected={active === index} aria-controls={active === index ? `tool-panel-${item.id}` : undefined}
      tabIndex={active === index ? 0 : -1} variant="outlined" fullWidth startIcon={item.icon}
      onClick={() => setActive(index)} onKeyDown={event => navigate(event, index)}
      sx={{ ...styles.button, color: active === index ? "var(--primary)" : "currentColor", borderColor: active === index ? "var(--primary)" : "currentColor", borderWidth: "1px", justifyContent: "flex-start", "&:focus-visible": { outline: "2px solid var(--primary)", outlineOffset: "4px" } }}
     ><Typography fontWeight={active === index ? 400 : 300}>{item.label}</Typography></Button>)}
    </Stack>
    <Typography aria-live="polite" sx={{ fontSize: "0.875rem", fontWeight: 300, opacity: 0.7, mt: 2, minHeight: "2.6em" }}>{tool.description}</Typography>
   </Box>
  </Box>
 );
}
