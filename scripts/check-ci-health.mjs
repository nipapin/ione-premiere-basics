let input = "";
for await (const chunk of process.stdin) input += chunk;
try {
  const data = JSON.parse(input);
  if (data.release !== process.argv[2] || !data.database) throw new Error();
} catch { console.error("New release, PostgreSQL is not ready"); process.exitCode = 1; }
