
const key = 'AIzaSyDerDFrMpFEW7_vsq2_SJOMra1AK9NVp1k';
const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${key}`;

console.log('Fetching models from:', url);

try {
  const response = await fetch(url);
  if (!response.ok) {
    console.error('Error fetching models:', response.status, response.statusText);
    const text = await response.text();
    console.error(text);
  } else {
    const data = await response.json();
    console.log(JSON.stringify(data, null, 2));
  }
} catch (error) {
  console.error('Fetch error:', error);
}
