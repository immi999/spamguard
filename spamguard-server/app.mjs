async function getAnalysesId(url) {
  const response = await fetch("http://localhost:3000/submit-url", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ url }),
  });

  if (!response.ok) {
    throw new Error("Something happend in client-side for posting data");
  }

  const { id } = await response.json();
  return id;
}

async function getAnalysesResult(url) {
  const analysesId = await getAnalysesId(url);

  const response = await fetch(
    `http://localhost:3000/scan-results/${analysesId}`
  );
  if (!response.ok) {
    throw new Error("Error happened in client-side for get analyses data");
  }

  const { stats } = await response.json();
  console.log(stats);
  return stats;
}
getAnalysesResult("https://google.com");
